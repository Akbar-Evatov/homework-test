"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { ImageProcessingError, resizeImageToDataUrl } from "@/lib/resize-image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t("tests.testTitleLabel")}
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tests.testTitlePlaceholder")}
          className="w-full max-w-md px-3 py-2"
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-medium text-slate-900">{t("tests.questionsTitle")}</h2>
        {questions.map((q, qIndex) => (
          <Card key={q.key} className="p-4">
            <div className="mb-2 flex items-start gap-2">
              <span className="mt-2 text-sm text-slate-500">{qIndex + 1}.</span>
              <Textarea
                value={q.text}
                onChange={(e) =>
                  updateQuestion(qIndex, (qq) => ({ ...qq, text: e.target.value }))
                }
                placeholder={t("tests.questionTextPlaceholder")}
                rows={2}
                className="flex-1 px-3 py-2"
              />
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveQuestion(qIndex, -1)}
                  disabled={qIndex === 0}
                  title={t("tests.moveUp")}
                  className="px-2 py-1 text-xs"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveQuestion(qIndex, 1)}
                  disabled={qIndex === questions.length - 1}
                  title={t("tests.moveDown")}
                  className="px-2 py-1 text-xs"
                >
                  ↓
                </Button>
              </div>
            </div>

            <div className="ml-6 mb-3 flex items-center gap-3">
              {q.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.imageUrl}
                    alt=""
                    className="max-h-32 rounded-lg border border-slate-200 object-contain"
                  />
                  <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    {t("tests.changeImageButton")}
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
                    onClick={() => removeImage(qIndex)}
                    className="text-xs"
                  >
                    {t("tests.removeImageButton")}
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  {t("tests.addImageButton")}
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

            <div className="ml-6 space-y-2">
              {q.choices.map((c, cIndex) => (
                <div key={c.key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.key}`}
                    checked={c.isCorrect}
                    onChange={() => setCorrectChoice(qIndex, cIndex)}
                    title={t("tests.markCorrectLabel")}
                    className="accent-indigo-600"
                  />
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
                    placeholder={t("tests.choicePlaceholder")}
                    className="flex-1 px-3 py-1.5 text-sm"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeChoice(qIndex, cIndex)}
                    disabled={q.choices.length <= 2}
                    className="text-xs"
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => addChoice(qIndex)}
                className="text-sm"
              >
                + {t("tests.addChoiceButton")}
              </Button>
            </div>

            <Button
              type="button"
              variant="danger"
              onClick={() => removeQuestion(qIndex)}
              className="mt-3 text-sm"
            >
              {t("tests.removeQuestionButton")}
            </Button>
          </Card>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
        >
          + {t("tests.addQuestionButton")}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}

      <Button
        type="button"
        variant="primary"
        onClick={handleSave}
        disabled={pending}
        className="px-5 py-2"
      >
        {t("tests.saveTestButton")}
      </Button>
    </div>
  );
}
