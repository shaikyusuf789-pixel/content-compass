import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">Global configuration for the Magic Mirror system.</p>
    </div>
  );
}
