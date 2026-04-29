import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getAdminEvents,
  adminUpdateEventStatus,
  adminDeleteEvent,
  type AdminEvent,
  type AdminEventStatus,
} from "@/api/admin";
import {
  Search, Filter, ChevronDown, Loader2, Calendar,
  Eye, Trash2, CheckCircle, XCircle, FileEdit, MoreVertical
} from "lucide-react";
import Button from "@/components/reusable/Button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<AdminEventStatus, { label: string; className: string }> = {
  published: { label: "Publié", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Annulé", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const CATEGORIES = ["concert", "workshop", "conference", "networking", "sport", "art", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  concert: "Concert", workshop: "Workshop", conference: "Conférence",
  networking: "Networking", sport: "Sport", art: "Art", other: "Autre",
};

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "events", { search, filterStatus, filterCategory, page }],
    queryFn: () =>
      getAdminEvents({
        search: search || undefined,
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        page,
        limit: 20,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminEventStatus }) =>
      adminUpdateEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setEventToDelete(null);
      toast.success("Événement supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des Événements</h1>
          <p className="text-muted-foreground mt-1">Supervisez et moderez tous les événements de la plateforme.</p>
        </div>
        {data && (
          <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {data.total} événement{data.total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 pl-9 pr-8 rounded-xl border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>

        <div className="relative">
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-10 pl-4 pr-8 rounded-xl border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <Calendar size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-bold text-foreground">Aucun événement trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Essayez un autre terme de recherche." : "Les événements apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Événement</th>
                  <th className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Organisateur</th>
                  <th className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Catégorie</th>
                  <th className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                  <th className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Inscriptions</th>
                  <th className="text-left px-4 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const statusCfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr key={event.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {event.cover_image_url ? (
                            <img src={event.cover_image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-border/50 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              <Calendar size={16} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-[200px]">{event.title}</p>
                            {event.is_private && (
                              <span className="text-[10px] text-muted-foreground">Privé</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                            {event.organizer.full_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs truncate max-w-[120px]">{event.organizer.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                          {CATEGORY_LABELS[event.category] ?? event.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border",
                          statusCfg.className
                        )}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-foreground">{event._count.registrations}</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(event.start_date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical size={16} className="text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem
                              className="cursor-pointer font-medium"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              <Eye size={14} className="mr-2" /> Voir l'événement
                            </DropdownMenuItem>
                            {event.status !== "published" && (
                              <DropdownMenuItem
                                className="cursor-pointer font-medium text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                                onClick={() => statusMutation.mutate({ id: event.id, status: "published" })}
                              >
                                <CheckCircle size={14} className="mr-2" /> Publier
                              </DropdownMenuItem>
                            )}
                            {event.status === "published" && (
                              <DropdownMenuItem
                                className="cursor-pointer font-medium text-muted-foreground"
                                onClick={() => statusMutation.mutate({ id: event.id, status: "draft" })}
                              >
                                <FileEdit size={14} className="mr-2" /> Mettre en brouillon
                              </DropdownMenuItem>
                            )}
                            {event.status !== "cancelled" && (
                              <DropdownMenuItem
                                className="cursor-pointer font-medium text-amber-600 focus:bg-amber-50 focus:text-amber-700"
                                onClick={() => statusMutation.mutate({ id: event.id, status: "cancelled" })}
                              >
                                <XCircle size={14} className="mr-2" /> Annuler l'événement
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => setEventToDelete(event)}
                            >
                              <Trash2 size={14} className="mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-xl"
          >
            Précédent
          </Button>
          <span className="text-sm font-bold text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-xl"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Trash2 className="text-destructive" /> Supprimer l'événement
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium pt-2">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-bold text-foreground">"{eventToDelete?.title}"</span> ?{" "}
              Cette action est irréversible et supprimera toutes les inscriptions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <Button
              onClick={() => eventToDelete && deleteMutation.mutate(eventToDelete.id)}
              variant="destructive"
              className="rounded-xl font-bold"
              isLoading={deleteMutation.isPending}
            >
              Supprimer définitivement
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
