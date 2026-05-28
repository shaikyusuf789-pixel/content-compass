import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/annotations")({
  component: AnnotationsPage,
});

function AnnotationsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Annotations</h1>
      <p className="text-muted-foreground">Managing B-roll, overlays, and metadata.</p>
    </div>
  );
}
