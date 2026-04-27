import { Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { getOrganizerEvents } from '@/api/events';
import { useNavigate } from 'react-router-dom';

function formatDateFr(dateIso: string) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export default function OrgEventListPage() {
  const navigate = useNavigate();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: getOrganizerEvents,
  });

  const events = (eventsData ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    date: formatDateFr(e.start_date),
    status: e.status,
    registered: 0, // V1 mock
    capacity: e.capacity,
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-light tracking-tight mb-2">Mes événements</h1>
          <p className="text-muted-foreground">Gérez tous vos événements créés sur la plateforme.</p>
        </div>
        <Button 
          variant="default" 
          className="rounded-full px-6"
          onClick={() => navigate('/organizer/events/new')}
        >
          Créer un événement
        </Button>
      </div>

      {/* Events List */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Chargement des événements...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Vous n'avez pas encore d'événement.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const fillPercentage = event.capacity ? (event.registered / event.capacity) * 100 : 0;

                  return (
                    <tr 
                      key={event.id} 
                      className="hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/organizer/events/${event.id}`)}
                    >
                      <td className="p-4 px-6">
                        <div className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {event.date}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={event.status === 'published' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className="uppercase tracking-widest text-[10px]"
                        >
                          {event.status === 'published' ? 'Publié' : event.status === 'cancelled' ? 'Annulé' : event.status === 'sold_out' ? 'Complet' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium">{event.registered} inscrits</span>
                          <span className="text-muted-foreground">/ {event.capacity ?? '∞'}</span>
                        </div>
                        <Progress value={fillPercentage} className="h-2" />
                      </td>
                      <td className="p-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full" 
                            title="Voir les détails"
                            onClick={(e) => { e.stopPropagation(); navigate(`/organizer/events/${event.id}`); }}
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
