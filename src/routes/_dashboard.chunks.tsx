import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getScripts, getChunks, generateChunks, generateAudioForChunk, generateSlideImage } from "@/lib/engine.functions";
import { Layers, Scissors, CheckCircle2, ChevronRight, Play, Loader2, Music, Image as ImageIcon, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const chunksSearchSchema = z.object({
  scriptId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/_dashboard/chunks")({
  validateSearch: chunksSearchSchema,
  component: ChunksPage,
});

function ChunksPage() {
  const search = useSearch({ from: "/_dashboard/chunks" });
  const qc = useQueryClient();
  const [selectedScriptId, setSelectedScriptId] = useState<string>(search.scriptId || "");

  const getScriptsFn = useServerFn(getScripts);
  const getChunksFn = useServerFn(getChunks);
  const generateChunksFn = useServerFn(generateChunks);
  const genAudioFn = useServerFn(generateAudioForChunk);
  const genSlideFn = useServerFn(generateSlideImage);


  const { data: scriptsData } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => getScriptsFn(),
  });

  const { data: chunksData, isLoading: isLoadingChunks } = useQuery({
    queryKey: ["chunks", selectedScriptId],
    queryFn: () => getChunksFn({ data: { scriptId: selectedScriptId } }),
    enabled: !!selectedScriptId,
  });

  const chunkMutation = useMutation({
    mutationFn: () => generateChunksFn({ data: { scriptId: selectedScriptId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chunks", selectedScriptId] });
      toast.success("Script chunked successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const audioMutation = useMutation({
    mutationFn: (chunkId: string) => genAudioFn({ data: { chunkId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chunks", selectedScriptId] });
      toast.success("Audio generated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const slideMutation = useMutation({
    mutationFn: (chunkId: string) => genSlideFn({ data: { chunkId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chunks", selectedScriptId] });
      toast.success("Slide image generated!");
    },
    onError: (err: any) => toast.error(err.message),
  });


  const scripts = scriptsData?.scripts || [];
  const chunks = chunksData?.chunks || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Phase 2</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">• SEGMENTATION & VOICEOVER</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Chunking Engine</h1>
          <p className="text-slate-500 mt-1">Break scripts into chunks and generate AI voiceovers.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="border rounded-xl px-4 py-2 text-sm bg-white min-w-[200px]"
            value={selectedScriptId}
            onChange={(e) => setSelectedScriptId(e.target.value)}
          >
            <option value="">Select a script...</option>
            {scripts.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <Button 
            disabled={!selectedScriptId || chunkMutation.isPending || chunks.length > 0}
            onClick={() => chunkMutation.mutate()}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-6 gap-2 rounded-xl"
          >
            {chunkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
            Auto Chunk Script
          </Button>
        </div>
      </div>

      {!selectedScriptId ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-slate-50/50 text-slate-400">
          <Layers className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">Please select a script from the dropdown to start chunking.</p>
        </div>
      ) : isLoadingChunks ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : chunks.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-slate-50/50 text-slate-400">
          <Scissors className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">Script selected. Click "Auto Chunk" to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Script Segments
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase">{chunks.length} Chunks Generated</span>
                <Button variant="outline" size="sm" className="text-xs font-bold h-8 rounded-lg border-indigo-100 text-indigo-600">
                   Generate All Audio
                </Button>
              </div>
            </div>
            <div className="divide-y">
              {chunks.map((chunk: any) => {
                const hasAudio = chunk.audio_assets && chunk.audio_assets.length > 0;
                const audioUrl = hasAudio ? chunk.audio_assets[0].public_url : null;
                
                return (
                  <div key={chunk.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 transition-colors group">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors shrink-0",
                      chunk.status === "Done" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                    )}>
                      {chunk.segment_number}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-slate-900 font-medium leading-relaxed">{chunk.telugu_text}</p>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          chunk.status === "Done" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                        )}>
                          {chunk.status}
                        </span>
                        {hasAudio && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            <Music className="h-3 w-3" />
                            Audio Ready
                          </div>
                        )}
                        {chunk.slides && chunk.slides.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            <ImageIcon className="h-3 w-3" />
                            Slide Ready
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAudio ? (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                          onClick={() => {
                            const audio = new Audio(audioUrl);
                            audio.play();
                          }}
                        >
                          <Play className="h-5 w-5 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-slate-400 hover:text-indigo-600"
                          onClick={() => audioMutation.mutate(chunk.id)}
                          disabled={audioMutation.isPending}
                        >
                          {audioMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-5 w-5" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
