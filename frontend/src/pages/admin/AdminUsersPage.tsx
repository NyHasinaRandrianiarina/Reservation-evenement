import { useEffect, useState } from "react";
import { 
  Search, MoreVertical, ShieldAlert,
  UserCheck, UserX, User
} from "lucide-react";
import Button from "@/components/reusable/Button";
import Input from "@/components/reusable/Input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { toast } from "react-hot-toast";
import { approveOrganizer, getPendingOrganizers, type PendingOrganizer } from "@/api/organizers";

// Mock Users
const MOCK_USERS = [
  { id: "usr-1", name: "Sarah M.", email: "sarah@email.com", role: "CLIENT", status: "ACTIVE", avatar: "", joinedAt: "2026-01-15T10:00:00Z" },
  { id: "usr-2", name: "Jean B.", email: "jean@mada-creation.mg", role: "VENDOR", status: "ACTIVE", avatar: "", joinedAt: "2025-11-20T14:30:00Z" },
  { id: "usr-3", name: "Marc Dupont", email: "marc.d@delivery.mg", role: "DELIVERY", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=marc", joinedAt: "2026-02-05T09:15:00Z" },
  { id: "usr-4", name: "Paul Randria", email: "paul.r@delivery.mg", role: "DELIVERY", status: "INACTIVE", avatar: "", joinedAt: "2026-03-10T11:45:00Z" },
  { id: "usr-5", name: "Admin Principal", email: "admin@trackit.mg", role: "ADMIN", status: "ACTIVE", avatar: "", joinedAt: "2025-01-01T00:00:00Z" },
  { id: "usr-6", name: "Saveurs Locales", email: "contact@saveurs-locales.mg", role: "VENDOR", status: "SUSPENDED", avatar: "", joinedAt: "2026-01-25T16:20:00Z" },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'CLIENT': return 'bg-blue-500/10 text-blue-600';
    case 'VENDOR': return 'bg-amber-500/10 text-amber-600';
    case 'DELIVERY': return 'bg-purple-500/10 text-purple-600';
    case 'ADMIN': return 'bg-rose-500/10 text-rose-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE': return { label: 'Actif', dot: 'bg-emerald-500', color: 'text-emerald-600 bg-emerald-500/10' };
    case 'INACTIVE': return { label: 'Inactif', dot: 'bg-muted-foreground', color: 'text-muted-foreground bg-muted' };
    case 'SUSPENDED': return { label: 'Suspendu', dot: 'bg-destructive', color: 'text-destructive bg-destructive/10' };
    default: return { label: status, dot: 'bg-muted-foreground', color: 'text-muted-foreground bg-muted' };
  }
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [users, setUsers] = useState(MOCK_USERS);
  const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Alert Dialog State
  const [userToSuspend, setUserToSuspend] = useState<typeof MOCK_USERS[0] | null>(null);

  const filteredUsers = users.filter(user => {
    // Tab Filter
    if (activeTab !== "ALL" && activeTab !== "SUSPENDED" && user.role !== activeTab) return false;
    if (activeTab === "SUSPENDED" && user.status !== "SUSPENDED") return false;

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    }
    return true;
  });

  const handleToggleSuspend = () => {
    if (!userToSuspend) return;
    
    const newStatus = userToSuspend.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    
    setUsers(users.map(u => 
      u.id === userToSuspend.id ? { ...u, status: newStatus } : u
    ));
    
    toast.success(`Compte ${newStatus === 'ACTIVE' ? 'réactivé' : 'suspendu'} avec succès`);
    setUserToSuspend(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const loadPending = async () => {
      setIsLoadingPending(true);
      try {
        const data = await getPendingOrganizers();
        setPendingOrganizers(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur de chargement des organisateurs";
        toast.error(message);
      } finally {
        setIsLoadingPending(false);
      }
    };

    loadPending();
  }, []);

  const handleApproveOrganizer = async (organizerId: string) => {
    setApprovingId(organizerId);
    try {
      await approveOrganizer(organizerId);
      setPendingOrganizers((prev) => prev.filter((o) => o.id !== organizerId));
      toast.success("Organisateur validé avec succès");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de valider l'organisateur";
      toast.error(message);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Utilisateurs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Gestion des Utilisateurs
          </h1>
          <Badge variant="secondary" className="text-sm font-bold h-7 px-3 bg-primary/10 text-primary">
            {users.length}
          </Badge>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Organisateurs en attente de validation</h2>
          <Badge variant="secondary" className="font-bold">{pendingOrganizers.length}</Badge>
        </div>

        {isLoadingPending ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : pendingOrganizers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun organisateur en attente.</p>
        ) : (
          <div className="space-y-3">
            {pendingOrganizers.map((organizer) => (
              <div key={organizer.id} className="flex items-center justify-between rounded-xl border border-border/40 p-3">
                <div className="flex flex-col">
                  <span className="font-semibold">{organizer.full_name}</span>
                  <span className="text-xs text-muted-foreground">{organizer.email}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApproveOrganizer(organizer.id)}
                  disabled={approvingId === organizer.id}
                >
                  {approvingId === organizer.id ? "Validation..." : "Valider"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
           <Input 
            placeholder="Rechercher par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} className="text-muted-foreground" />}
            className="bg-card border-border/40 focus:border-primary/50 h-12"
          />
        </div>
        
        {/* Custom Tabs */}
        <div className="bg-card border border-border/40 p-1 rounded-xl flex gap-1 w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "Tous" },
            { id: "CLIENT", label: "Clients" },
            { id: "VENDOR", label: "Vendeurs" },
            { id: "DELIVERY", label: "Livreurs" },
            { id: "SUSPENDED", label: "Suspendus" }
          ].map(tab => {
            const count = users.filter(u => 
              tab.id === "ALL" ? true : 
              tab.id === "SUSPENDED" ? u.status === "SUSPENDED" : 
              u.role === tab.id
            ).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:w-auto px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
                <Badge variant="secondary" className={`ml-1 ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted"}`}>
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left py-3.5 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider">Utilisateur</th>
                <th className="text-left py-3.5 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Rôle</th>
                <th className="text-left py-3.5 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Statut</th>
                <th className="text-left py-3.5 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Inscription</th>
                <th className="text-right py-3.5 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground font-medium">
                    Aucun utilisateur ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const statusConfig = getStatusBadge(user.status);
                  return (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={`${getRoleBadge(user.role)} font-bold text-xs`}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{user.name}</span>
                            <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`${getRoleBadge(user.role)} border-none font-bold uppercase tracking-widest text-[10px]`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`${statusConfig.color} border-none font-bold text-[11px] flex w-fit items-center gap-1.5`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs font-medium">
                        {new Date(user.joinedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical size={16} className="text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem className="cursor-pointer font-medium">
                              <User size={14} className="mr-2" /> Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer font-medium">
                              <Search size={14} className="mr-2" /> Voir les commandes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className={`cursor-pointer font-medium ${user.status === 'SUSPENDED' ? 'text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700' : 'text-destructive focus:bg-destructive/10 focus:text-destructive'}`}
                              onClick={() => setUserToSuspend(user)}
                            >
                              {user.status === 'SUSPENDED' ? (
                                <><UserCheck size={14} className="mr-2" /> Réactiver le compte</>
                              ) : (
                                <><UserX size={14} className="mr-2" /> Suspendre le compte</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={!!userToSuspend} onOpenChange={() => setUserToSuspend(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold">
              {userToSuspend?.status === 'SUSPENDED' ? (
                 <><UserCheck className="text-emerald-500" /> Réactiver l'utilisateur</>
              ) : (
                 <><ShieldAlert className="text-destructive" /> Suspendre l'utilisateur</>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium pt-2">
              {userToSuspend?.status === 'SUSPENDED' ? (
                 <>Êtes-vous sûr de vouloir réactiver le compte de <span className="font-bold text-foreground">{userToSuspend?.name}</span> ? Il pourra à nouveau utiliser la plateforme.</>
              ) : (
                 <>Êtes-vous sûr de vouloir suspendre le compte de <span className="font-bold text-foreground">{userToSuspend?.name}</span> ? Il ne pourra plus se connecter ni utiliser la plateforme jusqu'à sa réactivation.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <Button 
              onClick={handleToggleSuspend} 
              variant={userToSuspend?.status === 'SUSPENDED' ? 'primary' : 'destructive'} 
              className="rounded-xl font-bold"
            >
              {userToSuspend?.status === 'SUSPENDED' ? 'Oui, réactiver' : 'Oui, suspendre'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
