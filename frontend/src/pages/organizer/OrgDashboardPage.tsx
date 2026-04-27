import { Users, Euro, Ticket, Calendar, MoreHorizontal, Edit, Share2, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { getOrganizerDashboardKpis, getOrganizerEvents } from '@/api/events';

function formatDateFr(dateIso: string) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export default function OrgDashboardPage() {
  const { data: kpisData } = useQuery({
    queryKey: ['organizer', 'dashboard', 'kpis'],
    queryFn: getOrganizerDashboardKpis,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: getOrganizerEvents,
  });

  const kpis = [
    {
      label: "Inscrits aujourd'hui",
      value: String(kpisData?.registrationsToday ?? 0),
      trend: '',
      isPositive: null,
      icon: Users,
    },
    {
      label: 'CA du mois',
      value: `${(kpisData?.revenueMonth ?? 0).toLocaleString('fr-FR')} €`,
      trend: '',
      isPositive: null,
      icon: Euro,
    },
    {
      label: 'Billets restants',
      value: kpisData?.remainingTickets === null ? '∞' : String(kpisData?.remainingTickets ?? 0),
      trend: '',
      isPositive: null,
      icon: Ticket,
    },
    {
      label: 'Événements actifs',
      value: String(kpisData?.activeEvents ?? 0),
      trend: kpisData ? `${kpisData.draftEvents} en brouillon` : '',
      isPositive: null,
      icon: Calendar,
    },
  ];

  const activeEvents = (eventsData ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    date: formatDateFr(e.start_date),
    status: e.status,
    registered: 0,
    capacity: e.capacity,
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-light tracking-tight mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue ! Voici un aperçu de votre activité.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="border-none shadow-lg bg-card/50 backdrop-blur-xs">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold font-serif mb-1">{kpi.value}</p>
              <h3 className="text-sm font-medium text-foreground/80 mb-4">{kpi.label}</h3>
              <p className={cn(
                "text-xs font-semibold",
                kpi.isPositive === true ? "text-emerald-500" :
                  kpi.isPositive === false ? "text-destructive" : "text-muted-foreground"
              )}>
                {kpi.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Events List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif italic text-foreground/90">Vos événements</h2>

        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="p-4 px-6 font-semibold text-sm text-muted-foreground">Événement</th>
                  <th className="p-4 font-semibold text-sm text-muted-foreground">Statut</th>
                  <th className="p-4 font-semibold text-sm text-muted-foreground">Remplissage</th>
                  <th className="p-4 px-6 font-semibold text-sm text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {activeEvents.map((event) => {
                  const fillPercentage = event.capacity ? (event.registered / event.capacity) * 100 : 0;

                  return (
                    <tr key={event.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 px-6">
                        <div className="font-bold text-foreground mb-1">{event.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {event.date}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={event.status === 'published' ? 'default' : event.status === 'sold_out' ? 'destructive' : 'secondary'}
                          className="uppercase tracking-widest text-[10px]"
                        >
                          {event.status === 'published' ? 'Publié' : event.status === 'sold_out' ? 'Complet' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium">{event.registered} inscrits</span>
                          <span className="text-muted-foreground">/ {event.capacity}</span>
                        </div>
                        <Progress value={fillPercentage} className="h-2" />
                      </td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Modifier">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Participants">
                            <UsersIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Partager">
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {activeEvents.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Vous n'avez pas encore d'événement.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
