import { createFileRoute, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ListVideo, 
  Radio, 
  Settings, 
  History, 
  Database, 
  Youtube, 
  PlayCircle,
  FileVideo,
  Mic2,
  Layers,
  StickyNote,
  Trash2,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

interface NavItem {
  to: string;
  label: string;
  icon: any;
  number?: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const navGroups: NavGroup[] = [
    {
      label: "PIPELINE",
      items: [
        { to: "/dashboard", label: "Idea Engine", icon: Radio, number: "0" },
        { to: "/pipeline", label: "Pipeline", icon: LayoutDashboard },
        { to: "/idea-cards", label: "Idea Cards", icon: Inbox, badge: "NEW" },
        { to: "/script-generator", label: "Scripting", icon: StickyNote, number: "1" },
        { to: "/chunks", label: "Chunks", icon: Layers, number: "2" },
        { to: "/audio", label: "Audio", icon: Mic2, number: "3" },
        { to: "/slides", label: "Slides", icon: FileVideo, number: "4" },
        { to: "/annotations", label: "Annotations", icon: ListVideo, number: "5" },
        { to: "/master-video", label: "Master Video", icon: FileVideo, number: "6" },
        { to: "/youtube", label: "YouTube", icon: Youtube, number: "7" },
        { to: "/gamma-player", label: "Gamma Player", icon: PlayCircle, number: "9" },
      ]
    },
    {
      label: "UTILITIES",
      items: [
        { to: "/history", label: "History", icon: History },
        { to: "/storage", label: "Storage", icon: Database, badge: "24H" },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <aside className="hidden w-64 shrink-0 border-r bg-white md:flex md:flex-col shadow-sm">
        <div className="px-6 py-6 flex items-center gap-3 border-b mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">SKY</div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">SKY Studio</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Video Bot v4.2</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div className="px-3 mb-4">
            <Button variant="outline" className="w-full justify-between text-rose-500 border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-600 group">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase">A. Delete All</div>
                  <div className="text-[9px] text-slate-400 group-hover:text-rose-400 font-normal">Audio · Slides · Clips</div>
                </div>
              </div>
              <span className="text-[10px] bg-rose-100 px-1 rounded font-bold">DEL</span>
            </Button>
          </div>

          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{group.label}</h3>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = path === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all duration-200 group relative",
                      active 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.number && (
                        <span className={cn(
                          "text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border",
                          active ? "border-white/30" : "border-slate-200 text-slate-400"
                        )}>
                          {item.number}
                        </span>
                      )}
                      {!item.number && <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded uppercase">
                        {item.badge}
                      </span>
                    )}
                    {active && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full my-auto inset-y-0" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">TELUGU · POE · DNA</span>
                <span className="text-[9px] font-bold text-slate-400">V4.2</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-1">
                <div className="bg-indigo-500 h-1 rounded-full w-2/3"></div>
             </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="max-w-[1600px] mx-auto min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
