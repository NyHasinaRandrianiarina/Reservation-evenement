import { useState } from "react";
import { 
  History, Calendar, Search, DollarSign, PackageCheck, 
  CheckCircle2, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/reusable/Button";
import Input from "@/components/reusable/Input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_ORDERS } from "@/data/mockData";

export default function DeliveryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Derive history from mocks (delivered or completed)
  const deliveryHistory = MOCK_ORDERS.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED');
  
  const totalGains = deliveryHistory.length * 5000; // Flat mock rate

  const filteredHistory = deliveryHistory.filter(o => {
     if (searchTerm) {
        return o.id.toLowerCase().includes(searchTerm.toLowerCase());
     }
     return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/delivery/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Historique</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Mon Historique
        </h1>
        <p className="text-muted-foreground">Retrouvez toutes vos courses terminées et vos revenus cumulés.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <PackageCheck size={24} />
           </div>
           <div>
              <p className="text-sm font-medium text-muted-foreground">Courses livrées</p>
              <h3 className="text-2xl font-black text-foreground">{deliveryHistory.length}</h3>
           </div>
        </div>
        <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign size={24} />
           </div>
           <div>
              <p className="text-sm font-medium text-muted-foreground">Total des gains</p>
              <h3 className="text-2xl font-black text-foreground">{totalGains.toLocaleString('fr-FR')} Ar</h3>
           </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-2xl border border-border/40 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1">
          <Input 
            placeholder="Rechercher par n° de mission..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} className="text-muted-foreground" />}
            className="bg-muted/50 border-transparent focus:border-primary/50"
          />
        </div>
        <div className="w-full md:w-[250px]">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full rounded-xl bg-muted/50 border-transparent h-12">
              <Calendar size={16} className="mr-2 opacity-50" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tout l'historique</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-border/40">
           {filteredHistory.length === 0 ? (
             <div className="py-20 text-center flex flex-col items-center justify-center">
                <History size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Aucun historique disponible.</p>
             </div>
           ) : (
             filteredHistory.map((order) => (
               <div key={order.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={20} />
                     </div>
                     <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-foreground">#{order.id}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex-1 px-0 sm:px-6">
                     <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span>{order.seller.name}</span>
                        <ChevronRight size={14} className="text-muted-foreground" />
                        <span>Sarah M.</span>
                     </div>
                     <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">Course réussie</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                     <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-foreground">5 000 Ar</span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] h-5 py-0 px-2 uppercase tracking-widest font-black">LIVRÉ</Badge>
                     </div>
                     <Link to={`/delivery/missions/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-border/40 text-muted-foreground hover:bg-muted/50">
                           <ChevronRight size={18} />
                        </Button>
                     </Link>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl rotate-0 uppercase tracking-widest">Premium</div>
         <div className="flex flex-col items-center sm:items-start gap-1">
            <h4 className="text-lg font-bold text-foreground">Besoin d'aide sur une mission passée ?</h4>
            <p className="text-sm text-muted-foreground">Notre support est disponible 24/7 pour les livreurs.</p>
         </div>
         <Button variant="primary" className="rounded-xl shadow-md font-bold px-8">
            Contacter le support
         </Button>
      </div>

    </div>
  );
}
