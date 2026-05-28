import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { LayoutDashboard, ListVideo, Radio, Star, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/pipeline", label: "Pipeline", icon: LayoutDashboard },
    { to: "/scripting", label: "Scripting", icon: ListVideo },
    { to: "/chunks", label: "Chunks", icon: Radio },
    { to: "/audio", label: "Audio", icon: Radio },
    { to: "/slides", label: "Slides", icon: ListVideo },
    { to: "/annotations", label: "Annotations", icon: ListVideo },
    { to: "/master-video", label: "Master Video", icon: ListVideo },
    { to: "/youtube", label: "YouTube", icon: ListVideo },
    { to: "/gamma-player", label: "Gamma Player", icon: ListVideo },
    { to: "/history", label: "History", icon: ListVideo },
    { to: "/storage", label: "Storage", icon: ListVideo },
    { to: "/settings", label: "Settings", icon: ListVideo },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="px-5 py-5">
          <h1 className="text-lg font-semibold">Sky Intel</h1>
          <p className="text-xs text-muted-foreground">Idea engine</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
