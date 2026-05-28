import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/audio")({
  component: AudioPage,
});

function AudioPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Audio Engine</h1>
      <p className="text-muted-foreground">Generating voiceovers and audio processing.</p>
    </div>
  );
}
