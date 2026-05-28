import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/slides")({
  component: SlidesPage,
});

function SlidesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Slides Engine</h1>
      <p className="text-muted-foreground">Creating visual slides and presentations.</p>
    </div>
  );
}
