"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { ImageProcessingError, resizeImageToDataUrl } from "@/lib/resize-image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ImageIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CheckIcon,
  ClockIcon,
} from "@/components/ui/Icons";

type ChoiceState = { key: string; text: string; isCorrect: boolean };
type QuestionState = {
  key: string;
  text: string;
  imageUrl: string | null;
  choices: ChoiceState[];
};

function newChoice(): ChoiceState {
  return { key: crypto.randomUUID(), text: "", isCorrect: false };
}

function newQuestion(): QuestionState {
  return {
    key: crypto.randomUUID(),
    text: "",
    imageUrl: null,
    choices: [newChoice(), newChoice()],
  };
}

export type InitialTest = {
  title: string;
  timeLimitMinutes?: number | null;
  questions: {
    text: string;
    imageUrl: string | null;
    choices: { text: string; isCorrect: boolean }[];
  }[];
};

export default function TestEditor({
  testId,
  initialTest,
}: {
  testId?: string;
  initialTest?: InitialTest;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTest?.title ?? "");
  const [questions, setQuestions] = useState<QuestionState[]>(
    initialTest?.questions.length
      ? initialTest.questions.map((q) => ({
          key: crypto.randomUUID(),
          text: q.text,
          imageUrl: q.imageUrl,
          choices: q.choices.map((c) => ({
            key: crypto.randomUUID(),
            text: c.text,
            isCorrect: c.isCorrect,
          })),
        }))
      : [newQuestion()]
  );
  const [hasTimer, setHasTimer] = useState<boolean>(
    Boolean(initialTest?.timeLimitMinutes && initialTest.timeLimitMinutes > 0)
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(
    initialTest?.timeLimitMinutes && initialTest.timeLimitMinutes > 0
      ? initialTest.timeLimitMinutes
      : 30
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateQuestion(index: number, updater: (q: QuestionState) => QuestionState) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? updater(q) : q)));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, newQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((qs) => {
      const target = index + direction;
      if (target < 0 || target >= qs.length) return qs;
      const copy = [...qs];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function addChoice(qIndex: number) {
    updateQuestion(qIndex, (q) => ({ ...q, choices: [...q.choices, newChoice()] }));
  }

  function removeChoice(qIndex: number, cIndex: number) {
    updateQuestion(qIndex, (q) => ({
      ...q,
      choices: q.choices.filter((_, i) => i !== cIndex),
    }));
  }

  function setCorrectChoice(qIndex: number, cIndex: number) {
    updateQuestion(qIndex, (q) => ({
      ...q,
      choices: q.choices.map((c, i) => ({ ...c, isCorrect: i === cIndex })),
    }));
  }

  async function handleImageSelect(qIndex: number, file: File) {
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      updateQuestion(qIndex, (q) => ({ ...q, imageUrl: dataUrl }));
    } catch (err) {
      if (err instanceof ImageProcessingError && err.reason === "too_large") {
        setError(t("tests.imageTooLarge"));
      } else {
        setError(t("tests.imageInvalidType"));
      }
    }
  }

  function removeImage(qIndex: number) {
    updateQuestion(qIndex, (q) => ({ ...q, imageUrl: null }));
  }

  function validate(): string | null {
    if (!title.trim()) return t("tests.validationTitleRequired");
    if (questions.length === 0) return t("tests.validationNeedQuestion");
    for (const q of questions) {
      if (!q.text.trim() || q.choices.some((c) => !c.text.trim())) {
        return t("tests.validationNeedQuestion");
      }
      if (q.choices.length < 2) return t("tests.validationNeedChoices");
      if (!q.choices.some((c) => c.isCorrect)) {
        return t("tests.validationNeedCorrect");
      }
    }
    if (hasTimer && (!timeLimitMinutes || timeLimitMinutes < 1 || timeLimitMinutes > 1440)) {
      return "Test vaqti 1 dan 1440 daqiqagacha bo'lishi kerak";
    }
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setMessage(null);
      return;
    }

    setError(null);
    setPending(true);

    const payload = {
      title: title.trim(),
      timeLimitMinutes: hasTimer ? timeLimitMinutes : null,
      questions: questions.map((q) => ({
        text: q.text.trim(),
        imageUrl: q.imageUrl,
        choices: q.choices.map((c) => ({
          text: c.text.trim(),
          isCorrect: c.isCorrect,
        })),
      })),
    };

    try {
      const res = await fetch(testId ? `/api/tests/${testId}` : "/api/tests", {
        method: testId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError(t("common.error"));
        return;
      }

      if (testId) {
        setMessage(t("tests.savedMessage"));
        router.refresh();
      } else {
        const data = await res.json();
        router.push(`/dashboard/tests/${data.test.id}`);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Test Title Section */}
      <Card className="p-4 sm:p-6">
        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {t("tests.testTitleLabel")}
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tests.testTitlePlaceholder")}
          className="w-full max-w-xl text-sm sm:text-base px-3.5 py-2.5 font-medium"
        />
      </Card>

      {/* 2. Questions List */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
              {t("tests.questionsTitle")}
            </h2>
            <Badge variant="indigo">{questions.length}</Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            icon={<PlusIcon className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {t("tests.addQuestionButton")}
          </Button>
        </div>

        {questions.map((q, qIndex) => (
          <Card key={q.key} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 border-zinc-200/90 dark:border-zinc-800/90">
            {/* Question Card Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-2xs shrink-0">
                  {qIndex + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {qIndex + 1}-Savol
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => moveQuestion(qIndex, -1)}
                  disabled={qIndex === 0}
                  title={t("tests.moveUp")}
                  className="p-1 sm:px-2 sm:py-1 h-7 w-7 sm:h-auto sm:w-auto"
                >
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => moveQuestion(qIndex, 1)}
                  disabled={qIndex === questions.length - 1}
                  title={t("tests.moveDown")}
                  className="p-1 sm:px-2 sm:py-1 h-7 w-7 sm:h-auto sm:w-auto"
                >
                  <ArrowDownIcon className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length <= 1}
                  title={t("tests.removeQuestionButton")}
                  className="p-1 sm:px-2 sm:py-1 h-7 w-7 sm:h-auto sm:w-auto ml-0.5"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <Textarea
                value={q.text}
                onChange={(e) =>
                  updateQuestion(qIndex, (qq) => ({ ...qq, text: e.target.value }))
                }
                placeholder={t("tests.questionTextPlaceholder")}
                rows={2}
                className="w-full px-3 py-2 text-xs sm:text-sm"
              />
            </div>

            {/* Image Attachment */}
            <div className="pt-0.5">
              {q.imageUrl ? (
                <div className="inline-flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.imageUrl}
                    alt=""
                    className="max-h-36 max-w-full sm:max-w-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 object-contain shadow-2xs"
                  />
                  <div className="flex sm:flex-col gap-2">
                    <label className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer shadow-2xs">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{t("tests.changeImageButton")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect(qIndex, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeImage(qIndex)}
                      icon={<TrashIcon className="w-3 h-3" />}
                      className="text-xs"
                    >
                      {t("tests.removeImageButton")}
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <span>{t("tests.addImageButton")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(qIndex, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {/* Answer Choices */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("tests.choiceLabel")}lar (To&apos;g&apos;ri javobni belgilang):
              </p>
              <div className="space-y-2">
                {q.choices.map((c, cIndex) => (
                  <div
                    key={c.key}
                    className={`flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl border transition-all ${
                      c.isCorrect
                        ? "bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/10 dark:ring-emerald-500/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectChoice(qIndex, cIndex)}
                      title={t("tests.markCorrectLabel")}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        c.isCorrect
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "border-2 border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 bg-white dark:bg-zinc-800"
                      }`}
                    >
                      {c.isCorrect && <CheckIcon className="w-3.5 h-3.5" />}
                    </button>

                    <Input
                      value={c.text}
                      onChange={(e) =>
                        updateQuestion(qIndex, (qq) => ({
                          ...qq,
                          choices: qq.choices.map((cc, i) =>
                            i === cIndex ? { ...cc, text: e.target.value } : cc
                          ),
                        }))
                      }
                      placeholder={`${String.fromCharCode(65 + cIndex)}) ${t("tests.choicePlaceholder")}`}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs sm:text-sm border-0 focus:ring-0 shadow-none bg-transparent"
                    />

                    {c.isCorrect && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                        {t("tests.markCorrectLabel")}
                      </span>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChoice(qIndex, cIndex)}
                      disabled={q.choices.length <= 2}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 sm:px-2 shrink-0"
                      title={t("common.delete")}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addChoice(qIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>{t("tests.addChoiceButton")}</span>
              </button>
            </div>
          </Card>
        ))}

        {/* Big Add Question Button */}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3.5 sm:py-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/30 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/60 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span>{t("tests.addQuestionButton")}</span>
        </button>
      </div>

      {/* 3. Timer Configuration Section */}
      <Card className="p-4 sm:p-6 space-y-4 border-zinc-200/90 dark:border-zinc-800/90">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/60">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              {t("tests.timerTitle")}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              {t("tests.timerSubtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHasTimer(false)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              !hasTimer
                ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !hasTimer ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 dark:border-zinc-600"
              }`}
            >
              {!hasTimer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("tests.noTimerOption")}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                O&apos;quvchilar vaqt cheklovisiz javob berishadi
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHasTimer(true)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              hasTimer
                ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                hasTimer ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 dark:border-zinc-600"
              }`}
            >
              {hasTimer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("tests.setTimerOption")}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Har bir o&apos;quvchi uchun alohida teskari vaqt
              </p>
            </div>
          </button>
        </div>

        {hasTimer && (
          <div className="pt-2 p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mr-1">
                Tezkor tanlov:
              </span>
              {[10, 15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeLimitMinutes === mins
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300"
                  }`}
                >
                  {mins} {t("tests.timeMinutes")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Maxsus vaqt:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  value={timeLimitMinutes || ""}
                  onChange={(e) => setTimeLimitMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-24 text-center font-mono font-bold text-sm px-2 py-1.5"
                />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t("tests.timeMinutes")}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
              💡 {t("tests.timerExplanation")}
            </p>
          </div>
        )}
      </Card>

      {/* 3. Feedback and Save Action Bar */}
      <div className="sticky bottom-3 sm:bottom-6 z-40 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          {error && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-700 dark:text-rose-400 font-medium">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{message}</span>
            </div>
          )}
          {!error && !message && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Jami {questions.length} ta savol tayyorlandi
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={pending}
          icon={<CheckIcon className="w-4 h-4" />}
          className="w-full sm:w-auto px-8 font-bold"
        >
          {t("tests.saveTestButton")}
        </Button>
      </div>
    </div>
  );
}
