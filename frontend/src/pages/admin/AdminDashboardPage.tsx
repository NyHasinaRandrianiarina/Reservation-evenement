import { Package, Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/reusable/Button';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Total Livraisons", value: "1,248", trend: "+12%", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Livreurs Actifs", value: "24", trend: "+2", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "En cours", value: "18", trend: "-4", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Litiges", value: "3", trend: "+1", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Supervision Globale</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de l'agence, {user?.full_name?.split(" ")[0]}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-foreground">Demandes Récentes</h2>
            <Button variant="outline" size="sm" className="rounded-xl">Voir tout</Button>
          </div>
          <div className="text-center py-16">
             <Activity size={48} className="mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="text-base font-bold text-foreground">Aucune donnée</h3>
             <p className="text-sm text-muted-foreground mt-1">Connectez l'API pour voir les demandes.</p>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-lg font-black text-foreground mb-6">Actions Requises</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Demande en attente</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">La demande TRK-00{i} nécessite l'assignation d'un livreur.</p>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs rounded-lg">Assigner</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
