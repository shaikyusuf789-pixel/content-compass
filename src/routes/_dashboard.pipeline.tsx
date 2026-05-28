import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Play, 
  Settings, 
  Clock, 
  ChevronRight, 
  Activity, 
  Zap, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const [autoRun, setAutoRun] = useState(false);
  const [frequency, setFrequency] = useState("1hr");

  const stages = [
    { id: "1", name: "Scripting", status: "completed", time: "2m ago" },
    { id: "2", name: "Chunking", status: "completed", time: "1m ago" },
    { id: "3", name: "Audio", status: "active", time: "Just now" },
    { id: "4", name: "Slides", status: "pending", time: "-" },
    { id: "5", name: "Annotations", status: "pending", time: "-" },
    { id: "6", name: "Rendering", status: "pending", time: "-" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Control Center</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">• WATCHDOG ACTIVE</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline Engine</h1>
          <p className="text-slate-500 mt-1">Automated competitor monitoring and content generation.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auto Run</span>
              <Slider 
                value={[autoRun ? 1 : 0]} 
                max={1} 
                step={1} 
                className="w-12"
                onValueChange={(val) => setAutoRun(val[0] === 1)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold text-slate-500 hover:text-indigo-600 px-0">
                    Every {frequency} <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFrequency("1hr")}>Every 1 hr</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFrequency("2hr")}>Every 2 hr</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFrequency("6hr")}>Every 6 hr</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFrequency("12hr")}>Every 12 hr</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFrequency("24hr")}>Every 24 hr</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-100 mx-2" />
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6 gap-2">
            <Play className="h-4 w-4 fill-current" />
            Manual Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Live Pipeline Status
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Engine Running</span>
              </div>
            </div>
            <div className="p-0">
              {stages.map((stage, idx) => (
                <div key={stage.id} className={cn(
                  "flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors border-b last:border-0",
                  stage.status === "active" && "bg-indigo-50/30"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      stage.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                      stage.status === "active" ? "bg-indigo-600 text-white animate-pulse" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {stage.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : stage.id}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{stage.name} Engine</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stage.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {stage.status === "active" && (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Watchdog Status</h3>
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                Currently monitoring 12 competitor channels for new uploads. No duplicates found in last run.
              </p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 border border-white/10">
                <RefreshCw className="h-4 w-4 text-indigo-200" />
                <span className="text-xs font-bold tracking-wide">Last check: 14 mins ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Videos Found Today</span>
                <span className="text-sm font-bold text-slate-900">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Scripts Generated</span>
                <span className="text-sm font-bold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Storage Used</span>
                <span className="text-sm font-bold text-slate-900">4.2 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

