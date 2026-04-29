import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/api/admin";
import {
  BarChart3, TrendingUp, Calendar, Download, Loader2
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Button from "@/components/reusable/Button";

const PIE_COLORS = ["#10b981", "#94a3b8", "#ef4444", "#f59e0b", "#6366f1", "#8b5cf6"];

const CATEGORY_LABELS: Record<string, string> = {
  concert: "Concert", workshop: "Workshop", conference: "Conférence",
  networking: "Networking", sport: "Sport", art: "Art", other: "Autre",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publiés",
  draft: "Brouillons",
  cancelled: "Annulés",
};

interface TooltipEntry { name: string; color: string; value: number; }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/40 p-3 rounded-xl shadow-lg">
        <p className="font-bold text-foreground mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="text-foreground font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminStatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const eventsByStatusData = Object.entries(stats.eventsByStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key] ?? key,
    count: value,
  }));

  const topOrganizersData = stats.topOrganizers.map(o => ({
    name: o.name.split(" ")[0],
    inscriptions: o.registrationsCount,
    événements: o.eventsCount,
  }));

  const categoryPieData = stats.eventsByCategory
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, i) => ({
      name: CATEGORY_LABELS[item.category] ?? item.category,
      value: item.count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <BarChart3 className="text-primary" /> Statistiques de la plateforme
        </h1>
        <Button variant="outline" className="rounded-xl h-10 gap-2 border-border/40">
          <Download size={16} /> Exporter
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total événements", value: stats.totalEvents, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Total utilisateurs", value: stats.totalUsers, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Total inscriptions", value: stats.totalRegistrations, color: "text-primary", bg: "bg-primary/10" },
          { label: "Organisateurs validés", value: stats.topOrganizers.length, color: "text-amber-600", bg: "bg-amber-500/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm">
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value.toLocaleString("fr-FR")}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations by month */}
        <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Inscriptions par mois
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Volume d'inscriptions sur les 6 derniers mois</p>
          </div>
          {stats.registrationsByMonth.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.registrationsByMonth} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    name="Inscriptions"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Pas encore assez de données</p>
            </div>
          )}
        </div>

        {/* Event status pie */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Statuts des événements</h2>
            <p className="text-sm text-muted-foreground mt-1">Répartition globale</p>
          </div>
          <div className="flex-1 relative min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventsByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  strokeWidth={0}
                >
                  <Cell key="published" fill="#10b981" />
                  <Cell key="draft" fill="#94a3b8" />
                  <Cell key="cancelled" fill="#ef4444" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-foreground">{stats.totalEvents}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {eventsByStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ["#10b981", "#94a3b8", "#ef4444"][i] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organizers */}
        {topOrganizersData.length > 0 && (
          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-500" />
                Top 5 Organisateurs
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Par inscriptions générées</p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOrganizersData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="inscriptions" name="Inscriptions" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Events by category */}
        {categoryPieData.length > 0 && (
          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                Événements par catégorie
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Distribution des événements</p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPieData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="value" name="Événements" radius={[4, 4, 0, 0]} barSize={28}>
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
