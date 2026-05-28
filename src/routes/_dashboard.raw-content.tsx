import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/raw-content")({
  component: RawContentPage,
  head: () => ({ meta: [{ title: "Raw Content — Sky Intel" }] }),
});

function RawContentPage() {
  const items = useQuery({
    queryKey: ["raw_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_content")
        .select("*")
        .order("date_extracted", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold">Raw Content</h1>
        <p className="text-sm text-muted-foreground">AI-generated ideas from scraped videos.</p>
      </div>

      {items.data?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No ideas yet. Add sources and run the engine from the dashboard.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.data?.map((item) => {
          const hooks: string[] = Array.isArray(item.core_hooks) ? (item.core_hooks as string[]) : [];
          const summary: string[] = Array.isArray(item.summary_points) ? (item.summary_points as string[]) : [];
          const outline = (item.video_outline ?? {}) as { hook?: string; intro?: string; body?: string };
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{item.proposed_title ?? item.original_title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Original: {item.original_title} • Views: {item.views?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                  <Badge variant={item.status === "Approved" ? "default" : "secondary"}>{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm">View details</AccordionTrigger>
                    <AccordionContent className="space-y-4 text-sm">
                      <Section title="Target Audience">{item.target_audience}</Section>
                      <Section title="Thumbnail Outline">{item.new_thumbnail_outline}</Section>
                      <Section title="Core Hooks">
                        <ul className="list-disc space-y-1 pl-5">{hooks.map((h, i) => <li key={i}>{h}</li>)}</ul>
                      </Section>
                      <Section title="Summary Points">
                        <ul className="list-disc space-y-1 pl-5">{summary.map((p, i) => <li key={i}>{p}</li>)}</ul>
                      </Section>
                      <Section title="Video Outline">
                        <div className="space-y-2">
                          {outline.hook && <p><strong>Hook:</strong> {outline.hook}</p>}
                          {outline.intro && <p><strong>Intro:</strong> {outline.intro}</p>}
                          {outline.body && <p className="whitespace-pre-wrap"><strong>Body:</strong> {outline.body}</p>}
                        </div>
                      </Section>
                      <a href={item.video_url} target="_blank" rel="noreferrer" className="inline-block text-xs text-primary hover:underline">
                        Source video →
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="text-sm">{children}</div>
    </div>
  );
}