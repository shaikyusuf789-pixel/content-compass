import { createFileRoute } from "@tanstack/react-router";
import { Mic2, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_dashboard/audio")({
  component: AudioEngine,
});

function AudioEngine() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <Mic2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Audio Engine</h1>
          <p className="text-slate-500">Text-to-speech generation with AI voice cloning.</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold">Current Project</h3>
          <p className="text-sm text-slate-500">Ready for TTS processing.</p>
        </div>
        <Button className="bg-blue-600">
          <PlayCircle className="mr-2 h-4 w-4" />
          Generate Audio
        </Button>
      </div>
    </div>
  );
}