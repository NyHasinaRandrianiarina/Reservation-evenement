import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizerEventById, updateEventStatus, deleteEvent } from '@/api/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Users, Ticket, Eye, EyeOff, Ban, Edit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';

interface RawEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date: string;
  location: { address?: string };
  capacity: number | null;
  is_private: boolean;
  cover_image_url: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'sold_out';
  tickets: any[];
}

export default function OrgEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['organizer', 'event', id],
    queryFn: () => getOrganizerEventById(id!),
    enabled: !!id,
  });

  const event = rawData as unknown as RawEvent;

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'draft' | 'published' | 'cancelled') => updateEventStatus(id!, newStatus),
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['organizer', 'event', id] });
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id!),
    onSuccess: () => {
      toast.success("Événement supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] });
      navigate('/organizer/events');
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'événement");
    }
  });

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Chargement de l'événement...</div>;
  }

  if (!event) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-serif mb-4">Événement introuvable</h2>
        <Button variant="outline" onClick={() => navigate('/organizer/events')}>Retour à la liste</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/organizer/events')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Retour aux événements
      </button>

      {/* Header & Status Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-lg relative overflow-hidden">
        {/* Background Blur Effect if image exists */}
        {event?.cover_image_url && (
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url(${event.cover_image_url.startsWith('http') ? event.cover_image_url : (import.meta.env.VITE_API_URL || 'http://localhost:8000') + event.cover_image_url})` }}
          />
        )}
        
        <div className="relative z-10 space-y-4">
          <Badge
            variant={event.status === 'published' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'}
            className="uppercase tracking-widest px-3 py-1"
          >
            {event.status === 'published' ? 'En ligne' : event.status === 'cancelled' ? 'Annulé' : 'Brouillon'}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event.start_date).toLocaleDateString('fr-FR')}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location?.address || 'Lieu non spécifié'}</span>
            <span className="flex items-center gap-2 capitalize"><Badge variant="outline">{event.category}</Badge></span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="rounded-full flex-1 md:flex-none"
            onClick={() => navigate(`/organizer/events/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" /> Modifier
          </Button>

          {event.status === 'draft' && (
            <Button 
              variant="default" 
              className="rounded-full flex-1 md:flex-none"
              onClick={() => updateStatusMutation.mutate('published')}
              disabled={updateStatusMutation.isPending}
            >
              <Eye className="w-4 h-4 mr-2" /> Publier
            </Button>
          )}
          {event.status === 'published' && (
            <Button 
              variant="outline" 
              className="rounded-full flex-1 md:flex-none"
              onClick={() => updateStatusMutation.mutate('draft')}
              disabled={updateStatusMutation.isPending}
            >
              <EyeOff className="w-4 h-4 mr-2" /> Retirer du catalogue
            </Button>
          )}
          {event.status !== 'cancelled' && (
            <Button 
              variant="destructive" 
              className="rounded-full flex-1 md:flex-none"
              onClick={() => {
                if(window.confirm("Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible.")) {
                  updateStatusMutation.mutate('cancelled');
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              <Ban className="w-4 h-4 mr-2" /> Annuler l'événement
            </Button>
          )}

          <Button 
            variant="destructive" 
            className="rounded-full flex-1 md:flex-none bg-red-600 hover:bg-red-700"
            onClick={() => {
              if(window.confirm("Êtes-vous sûr de vouloir SUPPRIMER cet événement définitivement ?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            Supprimer définitivement
          </Button>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-serif italic mb-4 text-foreground/80">Description</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {event.description || "Aucune description fournie."}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Billetterie
              </h3>
              <div className="space-y-3">
                {event.tickets?.length > 0 ? (
                  event.tickets.map((ticket: any) => (
                    <div key={ticket.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{ticket.name}</span>
                      <div className="text-right">
                        <span className="block font-bold">{ticket.price === 0 ? 'Gratuit' : `${ticket.price} €`}</span>
                        <span className="text-xs text-muted-foreground">{ticket.quota ? `0/${ticket.quota} vendus` : 'Illimité'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun billet défini.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Remplissage
              </h3>
              <div className="text-center">
                <p className="text-3xl font-serif font-light mb-1">0</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Inscrits</p>
                {event.capacity && (
                  <div className="mt-4 space-y-2">
                    <Progress value={0} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground text-right">{event.capacity} places max</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
