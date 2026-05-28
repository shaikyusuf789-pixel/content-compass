import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/storage")({
  component: StoragePage,
});

function StoragePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Storage</h1>
      <p className="text-muted-foreground">Manage your generated assets and files.</p>
    </div>
  );
}
