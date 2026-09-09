"use client";

import { useState, useEffect, useRef } from "react";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  LogoIcon,
  UsersIcon,
  CheckIcon,
  CheckCircleIcon,
  TrophyIcon,
  AlertCircleIcon,
  ClockIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

type Choice = { id: string; text: string };
type Question = { id: string; text: string; imageUrl: string | null; choices: Choice[] };
type TestData = {
  id: string;
  title: string;
  timeLimitMinutes?: number | null;
  remainingSeconds?: number | null;
  startedAt?: string | null;
  questions: Question[];
};

type Phase =
  | { name: "id-entry" }
  | { name: "already-submitted"; score: number; totalQuestions: number }
  | { name: "already-submitted-pending" }
  | { name: "not-assigned" }
  | { name: "not-found" }
  | { name: "taking-test"; test: TestData; studentId: string; studentName: string }
  | { name: "submitted"; score: number; totalQuestions: number }
  | { name: "submitted-pending" };

export default function StudentFlow({ testId }: { testId: string }) {
  const [phase, setPhase] = useState<Phase>({ name: "id-entry" });
  const [studentIdInput, setStudentIdInput] = useState("");
  const [pending, setPending] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const autoSubmittedRef = useRef(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const studentId = studentIdInput.trim().toUpperCase();
    if (!studentId) return;

    setPending(true);
    try {
      const res = await fetch("/api/student/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, testId }),
      });
      const data = await res.json();

      if (data.status === "already_submitted") {
        setPhase({ name: "already-submitted", score: data.score, totalQuestions: data.totalQuestions });
      } else if (data.status === "already_submitted_pending") {
        setPhase({ name: "already-submitted-pending" });
      } else if (data.status === "not_assigned") {
        setPhase({ name: "not-assigned" });
      } else if (data.status === "ok") {
        setPhase({ name: "taking-test", test: data.test, studentId, studentName: data.studentName });
        setAnswers({});
        if (typeof data.test.remainingSeconds === "number") {
          setTimeLeft(data.test.remainingSeconds);
        } else {
          setTimeLeft(null);
        }
        setIsTimeUp(false);
        autoSubmittedRef.current = false;
      } else {
        setPhase({ name: "not-found" });
      }
    } catch {
      setPhase({ name: "not-found" });
    } finally {
      setPending(false);
    }
  }

  function handleRequestSubmit() {
    if (phase.name !== "taking-test") return;
    const unanswered = phase.test.questions.some((q) => !answers[q.id]);
    if (unanswered) {
      setShowUnansweredWarning(true);
      setConfirmingSubmit(false);
      return;
    }
    setShowUnansweredWarning(false);
    setConfirmingSubmit(true);
  }

  async function handleConfirmSubmit() {
    if (phase.name !== "taking-test") return;
    setConfirmingSubmit(false);
    setPending(true);
    try {
      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: phase.studentId, testId, answers }),
      });
      const data = await res.json();
      if (data.status === "pending_release") {
        setPhase({ name: "submitted-pending" });
      } else {
        setPhase({ name: "submitted", score: data.score, totalQuestions: data.totalQuestions });
      }
    } finally {
      setPending(false);
    }
  }

  // Timer Countdown Effect
  useEffect(() => {
    if (phase.name !== "taking-test" || timeLeft === null) return;

    if (timeLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        setIsTimeUp(true);
        // Automatically submit with latest answers (unanswered questions receive 0)
        setPending(true);
        fetch("/api/student/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: phase.studentId,
            testId,
            answers: answersRef.current,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "pending_release") {
              setPhase({ name: "submitted-pending" });
            } else {
              setPhase({ name: "submitted", score: data.score, totalQuestions: data.totalQuestions });
            }
          })
          .finally(() => {
            setPending(false);
          });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft, testId]);

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Phase 1: Student ID Entry
  if (phase.name === "id-entry" || phase.name === "not-found" || phase.name === "not-assigned") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative px-2 sm:px-0">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md relative mt-6 sm:mt-4">
          <Card className="p-6 sm:p-10 shadow-lg border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                <LogoIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("student.enterIdTitle")}
              </h1>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                O&apos;qituvchingiz taqdim etgan shaxsiy ID kodingizni kiriting
              </p>
            </div>

            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {t("student.studentIdLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <Input
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value.toUpperCase())}
                    placeholder={t("student.studentIdPlaceholder")}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 font-mono font-bold tracking-wider text-base sm:text-lg uppercase text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/15"
                  />
                </div>
              </div>

              {phase.name === "not-found" && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-medium">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{t("student.idNotFound")}</span>
                </div>
              )}

              {phase.name === "not-assigned" && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{t("student.notAssigned")}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={pending}
                disabled={!studentIdInput.trim()}
                className="w-full py-3 font-bold shadow-md"
              >
                {t("student.checkButton")}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 2: Pending Release
  if (phase.name === "already-submitted-pending" || phase.name === "submitted-pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative px-2 sm:px-0">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <Card className="max-w-md w-full p-6 sm:p-10 text-center shadow-lg border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 mt-6 sm:mt-0">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900">
            <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("student.pendingReleaseTitle")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t("student.pendingReleaseMessage")}
          </p>
        </Card>
      </div>
    );
  }

  // Phase 3: Test Result Submitted
  if (phase.name === "already-submitted" || phase.name === "submitted") {
    const percent =
      phase.totalQuestions > 0 ? Math.round((phase.score / phase.totalQuestions) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] relative px-2 sm:px-0">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md relative mt-6 sm:mt-4">
          <Card className="p-6 sm:p-10 text-center shadow-lg border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
              <TrophyIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {phase.name === "already-submitted"
                  ? t("student.alreadySubmittedTitle")
                  : t("student.submittedTitle")}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {t("student.yourScoreLabel")}
              </p>
            </div>

            {/* Score Display */}
            <div className="py-3 sm:py-4 px-5 sm:px-6 rounded-2xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 inline-block font-mono">
              <div className="text-3xl sm:text-5xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {phase.score}{" "}
                <span className="text-lg sm:text-xl font-normal text-zinc-400 dark:text-zinc-500">
                  / {phase.totalQuestions}
                </span>
              </div>
              <div className="mt-2">
                <Badge
                  variant={percent >= 80 ? "emerald" : percent >= 60 ? "indigo" : "amber"}
                  className="text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold"
                >
                  {percent}% muvaffaqiyat
                </Badge>
              </div>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Natijangiz saqlandi va o&apos;qituvchingizga yuborildi.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Phase 4: Taking Test Flow
  const { test, studentName } = phase;
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    test.questions.length > 0
      ? Math.round((answeredCount / test.questions.length) * 100)
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Test Taking Sticky Header */}
      <div className="sticky top-2 sm:top-4 z-40 p-3.5 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-md space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {test.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
              <SparklesIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>{t("student.welcomeName")}, </span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">{studentName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {timeLeft !== null && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl font-mono font-bold text-xs sm:text-sm border transition-all ${
                  timeLeft <= 60
                    ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/20"
                    : timeLeft <= 300
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60"
                }`}
                title={t("student.timeRemaining")}
              >
                <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <Badge variant="indigo" className="font-semibold text-[11px] sm:text-xs font-mono">
              {answeredCount}/{test.questions.length}
            </Badge>
            <ThemeToggle />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Time is Up Alert Banner */}
      {isTimeUp && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg animate-pulse">
          <ClockIcon className="w-5 h-5 shrink-0" />
          <span>{t("student.timeUpSubmitting")}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4 sm:space-y-5">
        {test.questions.map((q, index) => {
          const isAnswered = !!answers[q.id];

          return (
            <Card
              key={q.id}
              className={`p-4 sm:p-6 space-y-3 sm:space-y-4 border transition-all ${
                isAnswered
                  ? "border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900"
                  : "border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span
                  className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    isAnswered
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug pt-0.5">
                  {q.text}
                </p>
              </div>

              {q.imageUrl && (
                <div className="ml-0 sm:ml-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.imageUrl}
                    alt=""
                    className="max-h-64 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 object-contain shadow-2xs w-full sm:w-auto"
                  />
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="ml-0 sm:ml-10 space-y-2 sm:space-y-2.5 pt-1">
                {q.choices.map((c, cIndex) => {
                  const isSelected = answers[q.id] === c.id;

                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none min-h-[46px] ${
                        isSelected
                          ? "bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-100 shadow-xs font-semibold ring-2 ring-indigo-500/15 dark:ring-indigo-500/30"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={isSelected}
                        onChange={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: c.id }));
                          setShowUnansweredWarning(false);
                        }}
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-mono text-xs font-bold opacity-60 shrink-0">
                        {String.fromCharCode(65 + cIndex)})
                      </span>
                      <span className="text-xs sm:text-sm flex-1">{c.text}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Warning Alert */}
      {showUnansweredWarning && (
        <div className="flex items-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium">
          <AlertCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{t("student.unansweredWarning")} ({test.questions.length - answeredCount} ta qoldi)</span>
        </div>
      )}

      {/* Submit Action or Confirmation Box */}
      <div className="pt-2">
        {confirmingSubmit ? (
          <Card className="border-indigo-300 dark:border-indigo-800 bg-indigo-50/90 dark:bg-indigo-950/90 p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  Testni yakunlash
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {t("student.confirmSubmit")}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmSubmit}
                loading={pending}
                icon={<CheckIcon className="w-4 h-4" />}
                className="w-full sm:w-auto px-6 font-bold"
              >
                {t("common.yes")}, topshirish
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setConfirmingSubmit(false)}
                disabled={pending}
                className="w-full sm:w-auto px-5 font-semibold"
              >
                {t("common.no")}, qaytish
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleRequestSubmit}
            loading={pending}
            className="w-full py-3.5 text-sm sm:text-base font-bold shadow-md"
          >
            {t("student.submitTestButton")}
          </Button>
        )}
      </div>
    </div>
  );
}
