import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Package, ArrowRight, Store } from "lucide-react";
import { MOCK_ORDERS } from "@/data/mockData";
import type { OrderStatus } from "@/types";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Helper for status formatting
const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'CONFIRMED': return { label: 'Confirmée', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'ASSIGNED': return { label: 'Livreur assigné', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' };
    case 'IN_TRANSIT': return { label: 'En livraison', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    case 'DELIVERED': return { label: 'Livrée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'COMPLETED': return { label: 'Terminée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'CANCELLED': return { label: 'Annulée', color: 'bg-destructive/10 text-destructive border-destructive/20' };
    default: return { label: status, color: 'bg-muted text-muted-foreground border-border/40' };
  }
};

const OrderList = ({ orders }: { orders: typeof MOCK_ORDERS }) => {
  if (orders.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-border/40 border-dashed">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package size={24} className="text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Aucune commande trouvée</h3>
        <p className="text-muted-foreground max-w-sm mt-2">Nous n'avons trouvé aucune commande correspondant à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const config = getStatusConfig(order.status);
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <div key={order.id} className="bg-card border border-border/40 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 md:items-center">
            
            {/* Order Info */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded-md text-foreground">
                  #{order.id}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <Badge variant="outline" className={`${config.color} border font-bold uppercase tracking-wider text-[10px]`}>
                  {config.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm mt-1">
                <Store size={14} className="text-muted-foreground" />
                <span className="font-semibold text-foreground">{order.seller.name}</span>
              </div>
            </div>

            {/* Amount & Items */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:w-32">
              <span className="text-sm font-medium text-muted-foreground">{totalItems} article{totalItems > 1 ? 's' : ''}</span>
              <span className="font-black text-lg text-foreground">{order.totalAmount.toLocaleString('fr-FR')} {order.currency}</span>
            </div>

            {/* Action */}
            <div className="border-t border-border/40 md:border-none pt-4 md:pt-0 mt-2 md:mt-0 md:ml-4">
              <Link to={`/client/commandes/${order.id}`}>
                <Button variant="primary" className="w-full md:w-auto rounded-xl font-bold shadow-sm group">
                  Suivre <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default function ClientOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");

  // Filtering counts
  const inProgressStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT'];
  
  const getFilteredOrders = (filterType: string) => {
    return MOCK_ORDERS.filter(order => {
      // 1. Tab Filter
      if (filterType === 'in-progress' && !inProgressStatuses.includes(order.status)) return false;
      if (filterType === 'delivered' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED') return false;
      if (filterType === 'cancelled' && order.status !== 'CANCELLED') return false;

      // 2. Search Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!order.id.toLowerCase().includes(term) && !order.seller.name.toLowerCase().includes(term)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 3. Sort
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/client/dashboard">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mes Commandes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Mes Commandes
        </h1>
        <p className="text-muted-foreground">Consultez l'historique et suivez l'état de vos commandes en temps réel.</p>
      </div>

      <div className="bg-card p-4 rounded-2xl border border-border/40 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1">
          <Input 
            placeholder="Rechercher par n° de commande ou vendeur..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} className="text-muted-foreground" />}
            className="bg-muted/50 border-transparent focus:border-primary/50"
          />
        </div>
        <div className="w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl bg-muted/50 border-transparent h-12">
              <SlidersHorizontal size={16} className="mr-2 opacity-50" />
              <SelectValue placeholder="Trier par date" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">Plus récentes d'abord</SelectItem>
              <SelectItem value="oldest">Plus anciennes d'abord</SelectItem>
              <SelectItem value="amount-desc">Montant le plus élevé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Manual Tabs Replacement to avoid Tabs component issues */}
      <div className="space-y-6">
        <div className="bg-card border border-border/40 p-1 rounded-xl flex flex-wrap gap-1">
          {[
            { id: "all", label: "Toutes" },
            { id: "in-progress", label: "En cours" },
            { id: "delivered", label: "Livrées" },
            { id: "cancelled", label: "Annulées" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className={`ml-1 ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted"}`}>
                {getFilteredOrders(tab.id).length}
              </Badge>
            </button>
          ))}
        </div>

        <OrderList orders={getFilteredOrders(activeTab)} />
      </div>

    </div>
  );
}
