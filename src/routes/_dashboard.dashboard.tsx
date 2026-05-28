import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { runIdeaEngine } from "@/lib/engine.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Radio, ListVideo, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Sky Intel" }] }),
});

function Dashboard() {
  const qc = useQueryClient();
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
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cards = [
    { label: "Sources", value: stats.data?.sources, icon: Radio },
    { label: "Total Ideas", value: stats.data?.total, icon: ListVideo },
    { label: "Pending Approval", value: stats.data?.pending, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Phase 1 — Idea Engine</h1>
          <p className="text-sm text-muted-foreground">Scrape competitor YouTube channels and generate fresh video ideas.</p>
        </div>
        <Button onClick={() => run.mutate()} disabled={run.isPending}>
          {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Run engine
        </Button>
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