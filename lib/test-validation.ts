export const MAX_IMAGE_DATA_URL_LENGTH = 2_000_000; // ~1.5MB of binary image data, base64-encoded

export type ChoiceInput = { text: string; isCorrect: boolean };
export type QuestionInput = { text: string; imageUrl: string | null; choices: ChoiceInput[] };
export type TestInput = { title: string; questions: QuestionInput[] };

function validateImageUrl(value: unknown): { ok: true; imageUrl: string | null } | { ok: false } {
  if (value === undefined || value === null) return { ok: true, imageUrl: null };
  if (typeof value !== "string") return { ok: false };
  if (!value.startsWith("data:image/")) return { ok: false };
  if (value.length > MAX_IMAGE_DATA_URL_LENGTH) return { ok: false };
  return { ok: true, imageUrl: value };
}

export function validateTestInput(body: unknown): TestInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return null;

  if (!Array.isArray(b.questions) || b.questions.length === 0) return null;

  const questions: QuestionInput[] = [];
  for (const rawQ of b.questions) {
    if (typeof rawQ !== "object" || rawQ === null) return null;
    const q = rawQ as Record<string, unknown>;
    const text = typeof q.text === "string" ? q.text.trim() : "";
    if (!text) return null;
    if (!Array.isArray(q.choices) || q.choices.length < 2) return null;

    const imageResult = validateImageUrl(q.imageUrl);
    if (!imageResult.ok) return null;

    const choices: ChoiceInput[] = [];
    let correctCount = 0;
    for (const rawC of q.choices) {
      if (typeof rawC !== "object" || rawC === null) return null;
      const c = rawC as Record<string, unknown>;
      const cText = typeof c.text === "string" ? c.text.trim() : "";
      if (!cText) return null;
      const isCorrect = c.isCorrect === true;
      if (isCorrect) correctCount++;
      choices.push({ text: cText, isCorrect });
    }
    if (correctCount !== 1) return null;

    questions.push({ text, imageUrl: imageResult.imageUrl, choices });
  }

  return { title, questions };
}
