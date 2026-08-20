import StudentFlow from "./student-flow";

export default async function StudentTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10">
      <StudentFlow testId={testId} />
    </div>
  );
}
