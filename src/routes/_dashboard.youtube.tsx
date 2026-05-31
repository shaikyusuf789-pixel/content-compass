import { createFileRoute } from "@tanstack/react-router";
import { Youtube, Search, Plus, Filter, Trash2, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addSource, deleteSource } from "@/lib/engine.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_dashboard/youtube")({
  component: YoutubePage,
});

function YoutubePage() {
  const qc = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  
  const addFn = useServerFn(addSource);
  const delFn = useServerFn(deleteSource);

  const { data: sources, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sources_master").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: () => addFn({ data: { type: 'youtube', channel_name: newName, source_url: newUrl } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources"] });
      setNewUrl("");
      setNewName("");
      toast.success("Source added!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source removed");
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Distribution</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">• CHANNEL MANAGER</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Competitor Watchlist</h1>
          <p className="text-slate-500 mt-1">Monitoring industry leaders for trending content patterns.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Add New Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Channel Name (e.g. SKY Academy)" 
            className="rounded-xl h-11"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input 
            placeholder="YouTube URL (Channel or Playlist)" 
            className="rounded-xl h-11"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Button 
            onClick={() => add.mutate()} 
            disabled={add.isPending || !newUrl || !newName}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 gap-2"
          >
            {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Channel
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-900">Monitored Channels</h3>
           <span className="text-xs font-bold text-slate-400 uppercase">{sources?.length || 0} Sources</span>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
          ) : sources?.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic">No sources configured yet.</div>
          ) : (
            sources?.map((ch) => (
              <div key={ch.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                    <Youtube className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{ch.channel_name}</h4>
                    <a href={ch.source_url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      View Channel
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right mr-4 hidden sm:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</div>
                      <div className="text-xs font-bold text-slate-600 uppercase">{ch.type}</div>
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    onClick={() => del.mutate(ch.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
