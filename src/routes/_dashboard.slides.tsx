import { createFileRoute } from "@tanstack/react-router";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_dashboard/slides")({
  component: SlidesEngine,
});

function SlidesEngine() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
          <FileVideo className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Slides Engine</h1>
          <p className="text-slate-500">Visual slide generation and asset synchronization.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="aspect-video bg-slate-100 rounded-2xl border flex items-center justify-center text-slate-400 font-bold">
            Slide {i}
          </div>
        ))}
      </div>
    </div>
  );
}