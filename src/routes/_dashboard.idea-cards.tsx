import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  X,
  Star,
  Loader2,
  GraduationCap,
  Inbox,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getIdeas, updateIdeaStatus } from "@/lib/engine.functions";
import { IdeaCardView, type ActionKey, type IdeaCard } from "@/components/IdeaCardView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/idea-cards")({
  component: RawContentPage,
  head: () => ({ meta: [{ title: "Idea Reels — Sky Intel" }] }),
});

const TABS: {
  key: string;
  label: string;
  icon: typeof Inbox;
  actions: ActionKey[];
}[] = [
  { key: "Pending", label: "Pending", icon: Inbox, actions: ["approve", "reject"] },
  { key: "Approved", label: "Approved", icon: Check, actions: ["priority", "generate", "done", "reject"] },
  { key: "Priority", label: "Priority", icon: Star, actions: ["generate", "done", "reject"] },
  { key: "Done", label: "Done", icon: CheckCircle2, actions: [] },
  { key: "Rejected", label: "Rejected", icon: X, actions: [] },
];

const PAGE_SIZE = 12;

const ACTION_TO_STATUS: Record<ActionKey, string> = {
  approve: "Approved",
  reject: "Rejected",
  priority: "Priority",
  done: "Done",
};

function RawContentPage() {
  const navigate = useNavigate();
  const fetchFn = useServerFn(getIdeas);
  const updateFn = useServerFn(updateIdeaStatus);
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("Pending");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["ideas"],
    queryFn: () => fetchFn({ data: { status: undefined } }), // Fetch all and filter locally for smoother tab switching
  });

  const ideas = (data?.ideas || []) as IdeaCard[];

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      Pending: 0,
      Approved: 0,
      Priority: 0,
      Rejected: 0,
      Done: 0,
    };
    for (const i of ideas) {
      if (c[i.status] !== undefined) c[i.status]++;
    }
    return c;
  }, [ideas]);

  const filtered = useMemo(
    () => ideas.filter((i) => i.status === activeTab),
    [ideas, activeTab]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) =>
            c < filtered.length ? Math.min(c + PAGE_SIZE, filtered.length) : c
          );
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const mutate = useMutation({
    mutationFn: (vars: { idea: IdeaCard; status: string }) =>
      updateFn({ data: { id: vars.idea.id, status: vars.status } }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["ideas"] });
      const prev = qc.getQueryData(["ideas"]);
      qc.setQueryData(["ideas"], (old: any) => ({
        ideas: old.ideas.map((i: any) =>
          i.id === vars.idea.id ? { ...i, status: vars.status } : i
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["ideas"], ctx.prev);
      toast.error("Failed to update status");
    },
    onSuccess: (_d, vars) => {
      toast.success(`Marked as ${vars.status}`);
    },
  });

  const handleAction = (action: ActionKey, idea: IdeaCard) => {
    if (action === "generate") {
      navigate({
        to: "/script-generator",
        search: {
          transcript: idea.original_summary || "",
          topic: idea.proposed_title || idea.original_title || "",
        },
      });
      return;
    }
    const status = ACTION_TO_STATUS[action];
    mutate.mutate({ idea, status });
  };

  const visibleItems = filtered.slice(0, visibleCount);
  const tabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen w-full bg-muted/10">
      <div className="mx-auto w-full max-w-xl px-3 sm:px-4 pt-6 pb-20">
        <div className="sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 pt-2 pb-3 glass border-b border-border/40 mb-4">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
                <GraduationCap className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none text-gradient tracking-tight">
                  SKY Academy
                </h1>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.14em] font-medium">
                  AI Content Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-full bg-card/60 border border-border inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isFetching ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </button>
          </header>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition shrink-0",
                    active
                      ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                      : "bg-card/60 border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                  <span className={cn("min-w-[18px] text-center px-1 rounded-full text-[10px]", active ? "bg-black/20" : "bg-background/60")}>
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video w-full rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl gradient-card border border-border/40 px-6 py-16 text-center">
              <div className="size-14 mx-auto rounded-full bg-card grid place-items-center mb-3 border border-border">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">No {activeTab.toLowerCase()} ideas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "Pending" ? "You're all caught up." : "Nothing here yet."}
              </p>
            </div>
          ) : (
            <>
              {visibleItems.map((idea) => (
                <IdeaCardView
                  key={idea.id}
                  idea={idea}
                  actions={tabConfig.actions}
                  onAction={handleAction}
                  pending={mutate.isPending}
                />
              ))}
              {visibleCount < filtered.length && (
                <div ref={sentinelRef} className="py-8 grid place-items-center text-muted-foreground text-xs">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}