import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_dashboard/script-generator")({
  component: ScriptGenerator,
});

function ScriptGenerator() {
  const [videoType, setVideoType] = useState<"subjective" | "general">("subjective");
  const [inputMode, setInputMode] = useState<"topic" | "transcript" | "pdf">("topic");
  const [topic, setTopic] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [wordCount, setWordCount] = useState(660);
  const [isGenerating, setIsGenerating] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!topic && inputMode === "topic") {
      toast({ title: "Error", description: "Please enter a topic", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: {
          topic,
          videoType,
          inputMode,
          wordCount,
          specialInstructions,
        },
      });

      if (error) throw error;
      setSegments(data.segments || []);
      toast({ title: "Success", description: "Script generated successfully!" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to generate script", variant: "destructive" });
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
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Script Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="topic" id="mode-topic" />
                    <Label htmlFor="mode-topic" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-sm">Topic Name</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Generate from scratch</div>
                    </Label>
                  </div>
                  {/* Note: Transcript and PDF placeholders for now as they need file upload logic */}
                  <div className="flex items-center space-x-2 border rounded-lg p-3 opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="transcript" id="mode-transcript" disabled />
                    <Label htmlFor="mode-transcript" className="flex-1">
                      <div className="font-semibold text-sm">Competitor Transcripts</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Coming soon</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="pdf" id="mode-pdf" disabled />
                    <Label htmlFor="mode-pdf" className="flex-1">
                      <div className="font-semibold text-sm">Book / PDF Section</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Coming soon</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <CardTitle className="text-lg">Script Preview</CardTitle>
              {segments.length > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {segments.length} Segments
                </Badge>
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
                        <Textarea
                          className="min-h-[300px] font-telugu leading-relaxed text-base"
                          value={seg.telugu_text}
                          onChange={(e) => {
                            const newSegments = [...segments];
                            newSegments[i].telugu_text = e.target.value;
                            setSegments(newSegments);
                          }}
                        />
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground space-y-2 p-8 text-center">
                  <div className="bg-muted p-4 rounded-full">
                    <Wand2 className="h-8 w-8" />
                  </div>
                  <p className="font-medium">No script generated yet</p>
                  <p className="text-sm max-w-[250px]">Configure your topic and settings on the left to start generating content.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
