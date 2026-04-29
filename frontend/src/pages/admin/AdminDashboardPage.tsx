import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getAdminStats } from "@/api/admin";
import { getPendingOrganizers, approveOrganizer } from "@/api/organizers";
import { useState } from "react";
import {
  Calendar, Users, Ticket, AlertTriangle, TrendingUp,
  Loader2, CheckCircle, Clock, ArrowRight
} from "lucide-react";
import Button from "@/components/reusable/Button";
import toast from "react-hot-toast";

const EVENT_CATEGORY_LABELS: Record<string, string> = {
  concert: "Concert",
  workshop: "Workshop",
  conference: "Conférence",
  networking: "Networking",
  sport: "Sport",
  art: "Art",
  other: "Autre",
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
  });

  const { data: pendingOrganizers = [], refetch: refetchPending } = useQuery({
    queryKey: ["admin", "pending-organizers"],
    queryFn: getPendingOrganizers,
  });

  const handleApprove = async (organizerId: string) => {
    setApprovingId(organizerId);
    try {
      await approveOrganizer(organizerId);
      await refetchPending();
      toast.success("Organisateur validé !");
    } catch {
      toast.error("Impossible de valider l'organisateur");
    } finally {
      setApprovingId(null);
    }
  };

  const kpis = stats
    ? [
        {
          label: "Événements",
          value: stats.totalEvents,
          icon: Calendar,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          trend: `${stats.eventsByStatus["published"] ?? 0} publiés`,
        },
        {
          label: "Utilisateurs",
          value: stats.totalUsers,
          icon: Users,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          trend: "Total inscrits",
        },
        {
          label: "Inscriptions",
          value: stats.totalRegistrations,
          icon: Ticket,
          color: "text-primary",
          bg: "bg-primary/10",
          trend: "Total billets",
        },
        {
          label: "Organisateurs en attente",
          value: stats.pendingOrganizers,
          icon: AlertTriangle,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          trend: "À valider",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {user?.full_name?.split(" ")[0]}. Voici la synthèse de la plateforme.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-3xl p-6 animate-pulse h-28" />
            ))
          : kpis.map((kpi, i) => (
              <div
                key={i}
                className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg}`}>
                    <kpi.icon size={24} className={kpi.color} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-3xl font-black text-foreground">{kpi.value.toLocaleString("fr-FR")}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                  {kpi.label}
                </p>
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event Status Summary */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-foreground">Statuts des événements</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate("/admin/evenements")}
            >
              Voir tous <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "published", label: "Publiés", color: "bg-emerald-500", textColor: "text-emerald-600" },
                { key: "draft", label: "Brouillons", color: "bg-muted-foreground", textColor: "text-muted-foreground" },
                { key: "cancelled", label: "Annulés", color: "bg-destructive", textColor: "text-destructive" },
              ].map(({ key, label, color, textColor }) => {
                const count = stats.eventsByStatus[key] ?? 0;
                const pct = stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0;
                return (
                  <div key={key} className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className={`text-2xl font-black ${textColor}`}>{count}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 mb-3">{label}</p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{pct}%</p>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Top categories */}
          {stats && stats.eventsByCategory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/40">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Top catégories</p>
              <div className="flex flex-wrap gap-2">
                {stats.eventsByCategory
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(({ category, count }) => (
                    <span
                      key={category}
                      className="px-3 py-1.5 rounded-full border border-border bg-muted/30 text-xs font-bold"
                    >
                      {EVENT_CATEGORY_LABELS[category] ?? category} · {count}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending Organizers Panel */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-foreground">Organisateurs en attente</h2>
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">
              {pendingOrganizers.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {pendingOrganizers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle className="text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-bold text-foreground">Tout est à jour</p>
                <p className="text-xs text-muted-foreground mt-1">Aucun organisateur en attente</p>
              </div>
            ) : (
              pendingOrganizers.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5"
                >
                  <div className="flex flex-col min-w-0 mr-3">
                    <span className="font-bold text-sm text-foreground truncate">{org.full_name}</span>
                    <span className="text-xs text-muted-foreground truncate">{org.email}</span>
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(org.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(org.id)}
                    disabled={approvingId === org.id}
                    className="rounded-xl shrink-0 text-xs"
                  >
                    {approvingId === org.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Valider"
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 rounded-xl"
            onClick={() => navigate("/admin/utilisateurs")}
          >
            Gérer les utilisateurs <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Top Organizers */}
      {stats && stats.topOrganizers.length > 0 && (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-foreground">Top Organisateurs</h2>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topOrganizers.map((org, i) => (
              <div key={org.id} className="p-4 rounded-2xl border border-border/40 bg-muted/20 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {org.avatar_url ? (
                    <img src={org.avatar_url} alt={org.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-muted-foreground">
                      {org.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm text-foreground truncate">{org.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {org.eventsCount} événement{org.eventsCount > 1 ? "s" : ""}
                </p>
                <p className="text-xs font-bold text-primary mt-0.5">
                  {org.registrationsCount} inscriptions
                </p>
                {i === 0 && (
                  <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    #1
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
