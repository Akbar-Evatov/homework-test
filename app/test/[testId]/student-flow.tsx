"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Choice = { id: string; text: string };
type Question = { id: string; text: string; imageUrl: string | null; choices: Choice[] };
type TestData = { id: string; title: string; questions: Question[] };

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
      } else {
        setPhase({ name: "not-found" });
      }
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

  if (phase.name === "id-entry" || phase.name === "not-found" || phase.name === "not-assigned") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">{t("student.enterIdTitle")}</h1>
        <form onSubmit={handleCheck} className="flex gap-2">
          <Input
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            placeholder={t("student.studentIdPlaceholder")}
            autoFocus
            className="flex-1 px-3 py-2"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={pending || !studentIdInput.trim()}
            className="px-4 py-2"
          >
            {t("student.checkButton")}
          </Button>
        </form>
        {phase.name === "not-found" && (
          <p className="text-sm text-red-600">{t("student.idNotFound")}</p>
        )}
        {phase.name === "not-assigned" && (
          <p className="text-sm text-red-600">{t("student.notAssigned")}</p>
        )}
      </div>
    );
  }

  if (phase.name === "already-submitted-pending" || phase.name === "submitted-pending") {
    return (
      <Card className="p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          {t("student.pendingReleaseTitle")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t("student.pendingReleaseMessage")}</p>
      </Card>
    );
  }

  if (phase.name === "already-submitted" || phase.name === "submitted") {
    return (
      <Card className="p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          {phase.name === "already-submitted"
            ? t("student.alreadySubmittedTitle")
            : t("student.submittedTitle")}
        </h1>
        <p className="mt-4 text-3xl font-bold text-indigo-600">
          {phase.score} / {phase.totalQuestions}
        </p>
        <p className="mt-1 text-sm text-slate-500">{t("student.yourScoreLabel")}</p>
      </Card>
    );
  }

  // taking-test
  const { test, studentName } = phase;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{test.title}</h1>
        <p className="text-sm text-slate-500">
          {t("student.welcomeName")}, {studentName}
        </p>
      </div>

      <div className="space-y-4">
        {test.questions.map((q, index) => (
          <Card key={q.id} className="p-4">
            <p className="mb-3 font-medium text-slate-900">
              {index + 1}. {q.text}
            </p>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={q.imageUrl}
                alt=""
                className="mb-3 max-h-64 rounded-lg border border-slate-200 object-contain"
              />
            )}
            <div className="space-y-2">
              {q.choices.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={answers[q.id] === c.id}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: c.id }))}
                    className="accent-indigo-600"
                  />
                  {c.text}
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {showUnansweredWarning && (
        <p className="text-sm text-red-600">{t("student.unansweredWarning")}</p>
      )}

      {confirmingSubmit ? (
        <Card className="border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-3 text-sm text-slate-800">{t("student.confirmSubmit")}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmSubmit}
              disabled={pending}
              className="px-4 py-2 text-sm"
            >
              {t("common.yes")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmingSubmit(false)}
              disabled={pending}
              className="px-4 py-2 text-sm"
            >
              {t("common.no")}
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={handleRequestSubmit}
          disabled={pending}
          className="px-5 py-2"
        >
          {t("student.submitTestButton")}
        </Button>
      )}
    </div>
  );
}
