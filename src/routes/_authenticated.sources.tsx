import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { addSource, deleteSource } from "@/lib/engine.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sources")({
  component: SourcesPage,
  head: () => ({ meta: [{ title: "Sources — Sky Intel" }] }),
});

function SourcesPage() {
  const qc = useQueryClient();
  const [channelName, setChannelName] = useState("");
  const [url, setUrl] = useState("");

  const sources = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources_master")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addFn = useServerFn(addSource);
  const delFn = useServerFn(deleteSource);

  const add = useMutation({
    mutationFn: () => addFn({ data: { type: "youtube", channel_name: channelName, source_url: url } }),
    onSuccess: () => {
      toast.success("Source added");
      setChannelName("");
      setUrl("");
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold">Sources</h1>
        <p className="text-sm text-muted-foreground">YouTube channels we scrape to generate ideas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a channel</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Channel name</Label>
              <Input id="name" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Gagan Pratap" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="url">Channel URL</Label>
              <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/@MathsByGaganPratap" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={add.isPending}>Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All sources ({sources.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No sources yet.
                  </TableCell>
                </TableRow>
              )}
              {sources.data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.channel_name}</TableCell>
                  <TableCell>
                    <a href={s.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {s.source_url}
                    </a>
                  </TableCell>
                  <TableCell>{s.type}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}