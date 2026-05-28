import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/gamma-player")({
  component: GammaPlayerPage,
});

function GammaPlayerPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gamma Player</h1>
      <p className="text-muted-foreground">Final preview and playback of generated content.</p>
    </div>
  );
}
