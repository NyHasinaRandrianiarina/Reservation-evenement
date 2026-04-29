import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, adminUpdateUserStatus, type AdminUser } from "@/api/admin";
import { getPendingOrganizers, approveOrganizer } from "@/api/organizers";
import {
  Search, ChevronDown, Loader2, Users,
  MoreVertical, UserCheck, UserX, ShieldAlert, Clock
} from "lucide-react";
import Button from "@/components/reusable/Button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  PARTICIPANT: { label: "Participant", className: "bg-blue-500/10 text-blue-600" },
  ORGANIZER: { label: "Organisateur", className: "bg-amber-500/10 text-amber-600" },
  ADMIN: { label: "Admin", className: "bg-rose-500/10 text-rose-600" },
};

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", { search, filterRole, filterStatus, page }],
    queryFn: () =>
      getAdminUsers({
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        page,
        limit: 20,
      }),
  });

  const { data: pendingOrganizers = [], refetch: refetchPending } = useQuery({
    queryKey: ["admin", "pending-organizers"],
    queryFn: getPendingOrganizers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUpdateUserStatus(id, isActive),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(vars.isActive ? "Compte réactivé" : "Compte suspendu");
      setUserToToggle(null);
    },
    onError: () => toast.error("Erreur lors de la modification du statut"),
  });

  const handleApprove = async (organizerId: string) => {
    setApprovingId(organizerId);
    try {
      await approveOrganizer(organizerId);
      await refetchPending();
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Organisateur validé !");
    } catch {
      toast.error("Impossible de valider l'organisateur");
    } finally {
      setApprovingId(null);
    }
  };

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Users className="text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">Gérez les comptes, rôles et validations.</p>
        </div>
        {data && (
          <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {data.total} utilisateur{data.total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Pending Organizers Section */}
      {pendingOrganizers.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" />
              Organisateurs en attente de validation
            </h2>
            <Badge className="bg-amber-500 text-white font-black">{pendingOrganizers.length}</Badge>
          </div>
          <div className="space-y-2">
            {pendingOrganizers.map(org => (
              <div key={org.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{org.full_name}</span>
                  <span className="text-xs text-muted-foreground">{org.email}</span>
                  <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {new Date(org.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(org.id)}
                  disabled={approvingId === org.id}
                  className="rounded-xl"
                >
                  {approvingId === org.id ? <Loader2 size={14} className="animate-spin" /> : "Valider"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="relative">
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="h-10 pl-4 pr-8 rounded-xl border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">Tous les rôles</option>
            <option value="PARTICIPANT">Participants</option>
            <option value="ORGANIZER">Organisateurs</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div className="relative">
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 pl-4 pr-8 rounded-xl border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="SUSPENDED">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-bold text-foreground">Aucun utilisateur trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1">Modifiez vos filtres pour voir plus de résultats.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Utilisateur</th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Rôle</th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Activité</th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Inscrit le</th>
                  <th className="text-right py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map(user => {
                  const roleCfg = ROLE_CONFIG[user.role] ?? { label: user.role, className: "bg-muted text-muted-foreground" };
                  return (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className={`${roleCfg.className} font-bold text-xs`}>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-foreground">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={`${roleCfg.className} border-none font-bold uppercase tracking-widest text-[10px]`}>
                          {roleCfg.label}
                          {user.role === "ORGANIZER" && !user.organizer_approved && (
                            <span className="ml-1 text-amber-500">⚠</span>
                          )}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border
                          ${user.is_active
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-destructive"}`} />
                          {user.is_active ? "Actif" : "Suspendu"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          {user.role === "ORGANIZER" && (
                            <span className="text-muted-foreground">{user._count.events} événement{user._count.events !== 1 ? "s" : ""}</span>
                          )}
                          {user.role === "PARTICIPANT" && (
                            <span className="text-muted-foreground">{user._count.registrations} inscription{user._count.registrations !== 1 ? "s" : ""}</span>
                          )}
                          {user.role === "ADMIN" && (
                            <span className="text-muted-foreground">Administrateur</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {user.role !== "ADMIN" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical size={16} className="text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              {user.role === "ORGANIZER" && !user.organizer_approved && (
                                <DropdownMenuItem
                                  className="cursor-pointer font-medium text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                                  onClick={() => handleApprove(user.id)}
                                >
                                  <UserCheck size={14} className="mr-2" /> Valider organisateur
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={`cursor-pointer font-medium ${user.is_active ? "text-destructive focus:bg-destructive/10 focus:text-destructive" : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"}`}
                                onClick={() => setUserToToggle(user)}
                              >
                                {user.is_active ? (
                                  <><UserX size={14} className="mr-2" /> Suspendre</>
                                ) : (
                                  <><UserCheck size={14} className="mr-2" /> Réactiver</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">
            Précédent
          </Button>
          <span className="text-sm font-bold text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">
            Suivant
          </Button>
        </div>
      )}

      {/* Suspend Confirmation */}
      <AlertDialog open={!!userToToggle} onOpenChange={() => setUserToToggle(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold">
              {userToToggle?.is_active ? (
                <><ShieldAlert className="text-destructive" /> Suspendre le compte</>
              ) : (
                <><UserCheck className="text-emerald-500" /> Réactiver le compte</>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium pt-2">
              {userToToggle?.is_active ? (
                <>Êtes-vous sûr de vouloir suspendre le compte de <span className="font-bold text-foreground">{userToToggle?.full_name}</span> ?</>
              ) : (
                <>Êtes-vous sûr de vouloir réactiver le compte de <span className="font-bold text-foreground">{userToToggle?.full_name}</span> ?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <Button
              onClick={() => userToToggle && statusMutation.mutate({ id: userToToggle.id, isActive: !userToToggle.is_active })}
              variant={userToToggle?.is_active ? "destructive" : "primary"}
              className="rounded-xl font-bold"
              isLoading={statusMutation.isPending}
            >
              {userToToggle?.is_active ? "Oui, suspendre" : "Oui, réactiver"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
