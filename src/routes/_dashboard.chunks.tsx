import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/chunks")({
  component: ChunksPage,
});

function ChunksPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chunking Engine</h1>
      <p className="text-muted-foreground">Breaking down scripts into manageable content blocks.</p>
    </div>
  );
}
