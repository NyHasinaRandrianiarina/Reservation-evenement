import { Package, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/reusable/Button';

export default function SenderDashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Demandes en attente", value: "2", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Colis en transit", value: "3", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Livraisons terminées", value: "14", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Litiges", value: "0", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Bonjour, {user?.full_name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur votre espace expéditeur TrackIt.</p>
        </div>
        <Link to="/sender/demandes/nouvelle">
          <Button variant="primary" className="shadow-lg shadow-primary/25 rounded-xl h-12 px-6" rightIcon={<ArrowRight size={16} />}>
            Nouvelle demande
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-lg font-black text-foreground mb-6">Activité récente</h2>
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-bold text-foreground">Aucune activité</h3>
          <p className="text-sm text-muted-foreground mt-1">Vos demandes récentes apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
}
