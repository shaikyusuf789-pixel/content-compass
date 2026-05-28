import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/scripting")({
  component: ScriptingPage,
});

function ScriptingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Script Generation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">AI MODEL</h2>
            <div className="p-3 border rounded-md bg-background">
              Claude-Opus-4.7
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">VIDEO TYPE</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-accent/20 border-accent">
                <div className="font-semibold">Subjective</div>
                <div className="text-xs text-muted-foreground">Deep Subject Teaching</div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent/10 cursor-pointer">
                <div className="font-semibold">General</div>
                <div className="text-xs text-muted-foreground">Strategy / Motivation</div>
              </div>
            </div>
          </section>
        </div>
        <div className="border rounded-xl bg-background p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">🪄</span>
          </div>
          <h2 className="text-xl font-semibold">Preview will appear here</h2>
          <p className="text-muted-foreground max-w-sm">
            Choose your video type, input mode, enter content, and click Generate
          </p>
        </div>
      </div>
    </div>
  );
}
