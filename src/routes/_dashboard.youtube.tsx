import { createFileRoute } from "@tanstack/react-router";
import { Youtube, Search, Plus, Filter, Play, BarChart3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_dashboard/youtube")({
  component: YoutubePage,
});

function YoutubePage() {
  const channels = [
    { id: 1, name: "Competitor A", subscribers: "1.2M", avgViews: "250K", lastUpload: "2h ago" },
    { id: 2, name: "Competitor B", subscribers: "450K", avgViews: "80K", lastUpload: "1d ago" },
    { id: 3, name: "Industry Leader", subscribers: "5.1M", avgViews: "1.2M", lastUpload: "5h ago" },
  ];

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
        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-6 gap-2 h-11 rounded-2xl">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-rose-500" placeholder="Search channels..." />
          </div>
        </div>
        <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channel</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscribers</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Views</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {channels.map((ch) => (
              <tr key={ch.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Youtube className="h-5 w-5 text-rose-500" />
                    </div>
                    <span className="font-bold text-slate-900">{ch.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{ch.subscribers}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{ch.avgViews}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{ch.lastUpload}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}