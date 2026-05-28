import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/youtube")({
  component: YoutubePage,
});

function YoutubePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">YouTube Distribution</h1>
      <p className="text-muted-foreground">Manage uploads and channel integration.</p>
    </div>
  );
}
