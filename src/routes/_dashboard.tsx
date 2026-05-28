import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { LayoutDashboard, ListVideo, Radio, Star, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/sources", label: "Sources", icon: Radio },
    { to: "/content-preview", label: "Content Preview", icon: ListVideo },
    { to: "/idea-cards", label: "Idea Cards", icon: Star },
    { to: "/script-generator", label: "Script Generator", icon: ListVideo },
    { to: "/uploads", label: "Uploads", icon: Upload },
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
