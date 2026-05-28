import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <p className="text-muted-foreground">View logs and previous runs.</p>
    </div>
  );
}
