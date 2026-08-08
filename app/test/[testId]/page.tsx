import StudentFlow from "./student-flow";

export default async function StudentTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StudentFlow testId={testId} />
    </div>
  );
}
