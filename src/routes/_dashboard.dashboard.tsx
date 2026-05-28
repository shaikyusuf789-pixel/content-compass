import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { runIdeaEngine, getAutoRunSettings, updateAutoRunSettings, updateLastRunTimestamp } from "@/lib/engine.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Radio, ListVideo, CheckCircle2, Clock, Activity } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Sky Intel" }] }),
});

function Dashboard() {
  const qc = useQueryClient();
  
  const autoRun = useQuery({
    queryKey: ["auto-run-settings"],
    queryFn: () => useServerFn(getAutoRunSettings)(),
  });

  const updateAutoRun = useMutation({
    mutationFn: (vars: { enabled: boolean; interval_hrs: number }) => 
      useServerFn(updateAutoRunSettings)({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auto-run-settings"] });
      toast.success("Auto-run settings updated");
    },
  });

  const setLastRun = useServerFn(updateLastRunTimestamp);

  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [s, r, p] = await Promise.all([
        supabase.from("sources_master").select("*", { count: "exact", head: true }),
        supabase.from("raw_content").select("*", { count: "exact", head: true }),
        supabase.from("raw_content").select("*", { count: "exact", head: true }).eq("status", "Pending"),
      ]);
      return { sources: s.count ?? 0, total: r.count ?? 0, pending: p.count ?? 0 };
    },
  });

  const runFn = useServerFn(runIdeaEngine);
  const run = useMutation({
    mutationFn: () => runFn(),
    onSuccess: (res) => {
      toast.success(`Processed ${res.processed} new ideas from ${res.sources ?? 0} sources.`);
      if (res.errors?.length) toast.warning(res.errors.join(" | "));
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["raw_content"] });
      setLastRun();
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Watchdog Timer
  useEffect(() => {
    if (!autoRun.data?.enabled) return;

    const intervalMs = autoRun.data.interval_hrs * 60 * 60 * 1000;
    const lastRun = autoRun.data.last_run ? new Date(autoRun.data.last_run).getTime() : 0;
    const now = Date.now();
    
    const timeSinceLastRun = now - lastRun;
    const nextRunIn = Math.max(0, intervalMs - timeSinceLastRun);

    console.log(`Auto-run scheduled in ${nextRunIn / 1000 / 60} minutes`);

    const timer = setTimeout(() => {
      if (!run.isPending) {
        console.log("Auto-running Phase 1 engine...");
        run.mutate();
      }
    }, nextRunIn);

    return () => clearTimeout(timer);
  }, [autoRun.data, run.isPending]);

  const cards = [
    { label: "Sources", value: stats.data?.sources, icon: Radio },
    { label: "Total Ideas", value: stats.data?.total, icon: ListVideo },
    { label: "Pending Approval", value: stats.data?.pending, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Phase 1 — Idea Engine</h1>
          <p className="text-sm text-muted-foreground">Scrape competitor YouTube channels and generate fresh video ideas.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card p-1 shadow-sm">
            <Select 
              value={autoRun.data?.interval_hrs?.toString() || "1"} 
              onValueChange={(v) => updateAutoRun.mutate({ 
                enabled: autoRun.data?.enabled ?? false, 
                interval_hrs: parseInt(v) 
              })}
            >
              <SelectTrigger className="h-8 w-[120px] border-none bg-transparent shadow-none focus:ring-0">
                <Clock className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 hr</SelectItem>
                <SelectItem value="2">Every 2 hrs</SelectItem>
                <SelectItem value="6">Every 6 hrs</SelectItem>
                <SelectItem value="12">Every 12 hrs</SelectItem>
                <SelectItem value="24">Every 24 hrs</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-border mx-1" />

            <Button 
              variant={autoRun.data?.enabled ? "default" : "outline"}
              size="sm"
              className={`h-8 gap-2 ${autoRun.data?.enabled ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              onClick={() => updateAutoRun.mutate({ 
                enabled: !autoRun.data?.enabled, 
                interval_hrs: autoRun.data?.interval_hrs ?? 1 
              })}
              disabled={updateAutoRun.isPending}
            >
              <Activity className={`h-3.5 w-3.5 ${autoRun.data?.enabled ? "animate-pulse" : ""}`} />
              {autoRun.data?.enabled ? "Auto run: ON" : "Auto run: OFF"}
            </Button>
          </div>

          <Button onClick={() => run.mutate()} disabled={run.isPending} variant="secondary" size="sm" className="h-8">
            {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run manually
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{c.value ?? "—"}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Add competitor YouTube channels under <strong>Sources</strong>.</p>
          <p>2. Click <strong>Run engine</strong>. We fetch the 3 newest videos per channel via Apify.</p>
          <p>3. New videos (not already in the database) get a transcript pulled and analyzed by AI.</p>
          <p>4. Review the structured ideas (titles, hooks, outlines) under <strong>Raw Content</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}