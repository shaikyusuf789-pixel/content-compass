import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pipeline</h1>
      <p className="text-muted-foreground">Monitoring and automation for your content pipeline.</p>
    </div>
  );
}
