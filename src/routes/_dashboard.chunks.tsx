import { createFileRoute } from "@tanstack/react-router";
import { Layers, Scissors, CheckCircle2, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/chunks")({
  component: ChunksPage,
});

function ChunksPage() {
  const chunks = [
    { id: 1, text: "Welcome to the SKY Academy DNA tutorial.", duration: "5s", status: "Done" },
    { id: 2, text: "Today we explore the power of AI in content creation.", duration: "12s", status: "Done" },
    { id: 3, text: "Let's dive into the core principles of viral hooks.", duration: "8s", status: "Processing" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Phase 2</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">• SEGMENTATION ENGINE</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Chunking Engine</h1>
          <p className="text-slate-500 mt-1">Smart script segmentation for optimized visual matching.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-6 gap-2">
          <Scissors className="h-4 w-4" />
          Auto Chunk Script
        </Button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Script Segments
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase">3 Chunks Generated</span>
        </div>
        <div className="divide-y">
          {chunks.map((chunk) => (
            <div key={chunk.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {chunk.id}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-slate-900 font-medium leading-relaxed">{chunk.text}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{chunk.duration}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    chunk.status === "Done" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600 animate-pulse"
                  )}>
                    {chunk.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600">
                  <Play className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}