import { Package, MapPin, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/reusable/Button';

export default function DeliveryDashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Missions en attente", value: "4", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Livrées aujourd'hui", value: "8", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Espace Livreur</h1>
        <p className="text-muted-foreground mt-1">Gérez vos missions de livraison, {user?.full_name?.split(" ")[0]}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Mission Actuelle */}
          <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Mission en cours</h2>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-border/50">
                  <Package size={24} className="text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Colis</p>
                  <p className="text-lg font-black font-mono">TRK-A83KZ1</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Collecte</p>
                    <p className="text-sm text-muted-foreground">Agence Principale, Centre-ville</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Navigation size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Destination</p>
                    <p className="text-sm text-muted-foreground">Jean Rakoto - Antananarivo</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="primary" className="flex-1 shadow-lg shadow-primary/20 rounded-xl h-12">
                  Déclarer livré
                </Button>
                <Button variant="outline" className="rounded-xl px-6 bg-background">
                  Détails
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-muted/30 border border-border/40 rounded-[2rem] p-6 text-center">
             <p className="text-sm font-medium text-muted-foreground">N'oubliez pas d'indiquer votre disponibilité en fin de service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
