import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Wand2, FileText, CheckCircle2, X, Save, Edit3, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIdeas, saveScript } from "@/lib/engine.functions";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";

const scriptSearchSchema = z.object({
  transcript: z.string().optional(),
  topic: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/script-generator")({
  validateSearch: scriptSearchSchema,
  component: ScriptGenerator,
});

function ScriptGenerator() {
  const search = useSearch({ from: "/_dashboard/script-generator" });
  const getIdeasFn = useServerFn(getIdeas);
  const saveScriptFn = useServerFn(saveScript);

  const [videoType, setVideoType] = useState<"subjective" | "general">("subjective");
  const [inputMode, setInputMode] = useState<"topic" | "transcript" | "pdf" | "idea">(
    search.transcript ? "transcript" : "topic"
  );
  const [topic, setTopic] = useState(search.topic || "");
  const [chapterContext, setChapterContext] = useState("");
  const [content, setContent] = useState(search.transcript || "");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [wordCount, setWordCount] = useState(660);
  const [isGenerating, setIsGenerating] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [provider, setProvider] = useState("poe");
  const [model, setModel] = useState("claude-3-5-sonnet");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");

  const { data: approvedIdeasData } = useQuery({
    queryKey: ["approved-ideas"],
    queryFn: () => getIdeasFn({ data: { status: "Approved" } }),
  });

  const approvedIdeas = approvedIdeasData?.ideas || [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file?.name, file?.type);
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      console.log("Processing file type:", fileType);
      
      if (fileType === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
          fullText += pageText + "\n";
        }
        setContent(fullText);
        console.log("PDF text extracted, length:", fullText.length);
      } else if (fileType === 'md' || fileType === 'json' || fileType === 'txt') {
        const text = await file.text();
        setContent(text);
        console.log("Text file content read, length:", text.length);
      } else {
        toast.error("Unsupported file type. Please upload PDF, MD, or JSON.");
        setFileName(null);
      }
      
      toast.success(`${file.name} uploaded and processed!`);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to process file. Check console for details.");
      setFileName(null);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const removeFile = () => {
    setFileName(null);
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleIdeaSelect = (ideaId: string) => {
    const idea = approvedIdeas.find(i => i.id === ideaId);
    if (!idea) return;
    
    setSelectedIdeaId(ideaId);
    setTopic(idea.proposed_title || idea.original_title || "");
    
    // Combine outline and summary points for the Topic/Outline box
    const outline = idea.video_outline;
    const summary = (idea.summary_points || []).map((p: string) => `• ${p}`).join("\n");
    const hooks = (idea.core_hooks || []).map((h: string) => `Hook: ${h}`).join("\n");
    
    const combinedContent = `TITLE: ${idea.proposed_title}\n\nOUTLINE:\n${outline?.hook || ""}\n${outline?.intro || ""}\n${outline?.body || ""}\n\nSUMMARY POINTS:\n${summary}\n\nCORE HOOKS:\n${hooks}`;
    
    setChapterContext(combinedContent);
    // Switch to PDF/Idea mode which uses chapterContext + content
    // Actually, let's make it simple: pre-fill the transcript box if we have it
    if (idea.original_summary) {
      setContent(idea.original_summary);
    }
  };

  const handleSaveScript = async () => {
    if (segments.length === 0) return;
    setIsSaving(true);
    try {
      const fullScript = segments.map(s => s.voiceover).join("\n\n");
      await saveScriptFn({ 
        data: {
          idea_id: selectedIdeaId || undefined,
          title: topic || "Untitled Script",
          content: fullScript,
          word_count: wordCount,
          video_type: videoType,
          model: model,
        } 
      });
      toast.success("Script saved to database!");
    } catch (err: any) {
      toast.error("Failed to save script: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic && inputMode === "topic") {
      toast.error("Please enter a topic");
      return;
    }
    if (!content && (inputMode === "transcript" || inputMode === "pdf")) {
      toast.error(`Please enter the ${inputMode} content`);
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: {
          topic,
          content,
          chapterContext,
          videoType,
          inputMode,
          wordCount,
          specialInstructions,
          provider,
          model,
        },
      });

      if (error) throw error;
      setSegments(data.segments || []);
      toast.success("Script generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate script");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Script Generator</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Phase 3 • SKY Academy Script Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Script Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select 
                      className="w-full border rounded-md p-2 text-sm"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="poe">Poe.com (Multi-Model)</option>
                      <option value="anthropic">Claude (Anthropic)</option>
                      <option value="openai">OpenAI (GPT)</option>
                      <option value="google">Google (Gemini)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <select 
                      className="w-full border rounded-md p-2 text-sm"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Video Type</Label>
                <RadioGroup 
                  value={videoType} 
                  onValueChange={(v: any) => setVideoType(v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="subjective" id="subjective" />
                    <Label htmlFor="subjective" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Subjective</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Deep Teaching</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">General</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Motivation / Strategy</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Input Mode</Label>
                <RadioGroup 
                  value={inputMode} 
                  onValueChange={(v: any) => setInputMode(v)}
                  className="space-y-2"
                >
                  <div 
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setInputMode("idea")}
                  >
                    <RadioGroupItem value="idea" id="mode-idea" />
                    <Label htmlFor="mode-idea" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Approved Ideas</div>
                      <div className="text-[10px] text-muted-foreground uppercase">From Competitor Analysis</div>
                    </Label>
                  </div>
                  <div 
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setInputMode("topic")}
                  >
                    <RadioGroupItem value="topic" id="mode-topic" />
                    <Label htmlFor="mode-topic" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Topic Name</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Generate from scratch</div>
                    </Label>
                  </div>
                  <div 
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setInputMode("transcript")}
                  >
                    <RadioGroupItem value="transcript" id="mode-transcript" />
                    <Label htmlFor="mode-transcript" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Competitor Transcripts</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Reference from transcript</div>
                    </Label>
                  </div>
                  <div 
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setInputMode("pdf")}
                  >
                    <RadioGroupItem value="pdf" id="mode-pdf" />
                    <Label htmlFor="mode-pdf" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Book / PDF Section</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Convert to SKY Style</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {inputMode === "idea" && (
                <div className="space-y-2">
                  <Label htmlFor="idea-select">Select Approved Idea</Label>
                  <select
                    id="idea-select"
                    className="w-full border rounded-md p-2 text-sm bg-white"
                    value={selectedIdeaId}
                    onChange={(e) => handleIdeaSelect(e.target.value)}
                  >
                    <option value="">-- Choose an idea --</option>
                    {approvedIdeas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.proposed_title || idea.original_title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {inputMode === "pdf" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <p className="text-green-800 text-sm font-medium">
                      PDF Mode -- Upload a book chapter or study notes PDF. SKY Engine transforms it into Telugu lipi voiceover.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chapterContext">Topic / Chapter context (optional)</Label>
                    <Input
                      id="chapterContext"
                      placeholder="e.g. Chapter 3: Directive Principles..."
                      value={chapterContext}
                      onChange={(e) => setChapterContext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf-upload" className="cursor-pointer">UPLOAD * (PDF, MD, JSON)</Label>
                    <input
                      id="pdf-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.md,.json,.txt"
                      className="hidden"
                    />
                    <div className="border-2 border-dashed rounded-lg p-6 bg-slate-50 flex flex-col items-center justify-center space-y-3">
                      {fileName ? (
                        <div className="flex flex-col w-full space-y-3">
                          <div className="flex items-center justify-between w-full bg-white p-3 rounded-md border">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium truncate max-w-[150px]">{fileName}</span>
                                <span className="text-[10px] text-green-600 flex items-center">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Ready for generation
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={removeFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {content && (
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase">Content Preview (First 500 chars)</Label>
                              <div className="p-3 bg-white border rounded-md text-[11px] font-mono whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                                {content.substring(0, 500)}
                                {content.length > 500 ? "..." : ""}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant="default" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("Upload button clicked, triggering file input");
                              fileInputRef.current?.click();
                            }}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="mr-2 h-4 w-4" />
                            )}
                            Select File
                          </Button>
                          <span className="text-xs text-muted-foreground">200MB per file • PDF, MD, JSON</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {inputMode === "topic" && (
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Subject *</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g. Panchayati Raj – 73rd Amendment"
                    className="min-h-[100px]"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
              )}

              {inputMode === "transcript" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Competitor Transcript *</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste the transcript here..."
                    className="min-h-[150px]"
                    value={content}
                    onChange={(setContent as any)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="wordCount">Approximate Total Script Words</Label>
                <Input
                  id="wordCount"
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  min={150}
                  step={165}
                />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-1">
                  ~{Math.ceil(wordCount / 165)} segments · 150-180w each
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Focus on memory tricks..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12" 
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">Script Preview</CardTitle>
                {segments.length > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {segments.length} Segments
                  </Badge>
                )}
              </div>
              {segments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "bg-blue-50" : ""}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    {isEditing ? "Stop Editing" : "Edit"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <RotateCcw className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
                    Regenerate
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSaveScript}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save Script
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {segments.length > 0 ? (
                <Tabs defaultValue="seg-0" className="flex flex-col h-full">
                  <div className="border-b px-4 overflow-x-auto">
                    <TabsList className="bg-transparent h-12">
                      {segments.map((_, i) => (
                        <TabsTrigger 
                          key={i} 
                          value={`seg-${i}`}
                          className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12"
                        >
                          Seg {i + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  <div className="p-6 flex-1">
                    {segments.map((seg, i) => (
                      <TabsContent key={i} value={`seg-${i}`} className="mt-0 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{seg.title}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {seg.telugu_text.split(" ").length} words
                          </Badge>
                        </div>
                        {isEditing ? (
                          <Textarea
                            className="p-4 bg-white rounded-lg border leading-relaxed text-lg font-telugu min-h-[300px] whitespace-pre-wrap"
                            value={seg.telugu_text}
                            onChange={(e) => {
                              const newSegments = [...segments];
                              newSegments[i].telugu_text = e.target.value;
                              setSegments(newSegments);
                            }}
                          />
                        ) : (
                          <div className="p-4 bg-muted/30 rounded-lg border leading-relaxed text-lg font-telugu min-h-[300px] whitespace-pre-wrap">
                            {seg.telugu_text}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Wand2 className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">No script generated yet</p>
                    <p className="text-sm">Configure your topic and settings on the left to start generating content.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ScriptGenerator;