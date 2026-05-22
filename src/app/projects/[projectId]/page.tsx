export default async function ProjectByIdPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <h1 className="text-4xl">Project: {projectId}</h1>
      </main>
    </div>
  );
}
