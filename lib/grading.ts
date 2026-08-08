type GradableQuestion = {
  id: string;
  choices: { id: string; isCorrect: boolean }[];
};

export function gradeAttempt(
  questions: GradableQuestion[],
  answers: Record<string, string>
): { score: number; totalQuestions: number } {
  let score = 0;
  for (const q of questions) {
    const chosenChoiceId = answers[q.id];
    const correctChoice = q.choices.find((c) => c.isCorrect);
    if (chosenChoiceId && correctChoice && chosenChoiceId === correctChoice.id) {
      score++;
    }
  }
  return { score, totalQuestions: questions.length };
}
