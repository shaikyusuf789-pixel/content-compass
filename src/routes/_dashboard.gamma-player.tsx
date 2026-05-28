import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle, SkipBack, SkipForward, Volume2, Maximize, Settings } from "lucide-react";

export const Route = createFileRoute("/_dashboard/gamma-player")({
  component: GammaPlayerPage,
});

function GammaPlayerPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Review Mode</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider">• GAMMA V2.1</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Gamma Player</h1>
      </div>

      <div className="flex-1 bg-slate-950 rounded-[3rem] shadow-2xl relative overflow-hidden group border-[12px] border-slate-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/20 font-black text-9xl tracking-tighter italic">GAMMA</div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="space-y-6">
            <div className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative">
              <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
            </div>
            
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                <SkipBack className="h-6 w-6 cursor-pointer hover:text-indigo-400 transition" />
                <PlayCircle className="h-12 w-12 cursor-pointer hover:text-indigo-400 transition fill-current" />
                <SkipForward className="h-6 w-6 cursor-pointer hover:text-indigo-400 transition" />
                <div className="flex items-center gap-2 ml-4">
                  <Volume2 className="h-5 w-5" />
                  <div className="w-20 h-1 bg-white/30 rounded-full">
                    <div className="w-2/3 h-full bg-white rounded-full" />
                  </div>
                </div>
                <span className="text-sm font-bold tracking-wider ml-4">01:24 / 02:45</span>
              </div>
              
              <div className="flex items-center gap-6">
                <Settings className="h-5 w-5 cursor-pointer hover:rotate-90 transition-transform duration-500" />
                <Maximize className="h-5 w-5 cursor-pointer hover:scale-110 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}