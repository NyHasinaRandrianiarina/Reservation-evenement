import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Phone, MessageSquare, CheckCircle2, Navigation, 
  Package, Store, User, ShieldCheck, AlertCircle, HelpCircle,
  Check, DollarSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MOCK_ORDERS } from "@/data/mockData";
import type { OrderStatus } from "@/types";

import Button from "@/components/reusable/Button";
import { Badge } from "@/components/ui/badge";
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
    case 'ASSIGNED': return { label: 'À récupérer', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', step: 1 };
    case 'IN_TRANSIT': return { label: 'En livraison', color: 'bg-primary/10 text-primary border-primary/20', step: 2 };
    case 'DELIVERED': return { label: 'Livrée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', step: 3 };
    case 'COMPLETED': return { label: 'Terminée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', step: 3 };
    case 'CANCELLED': return { label: 'Annulée', color: 'bg-destructive/10 text-destructive border-destructive/20', step: 0 };
    default: return { label: status, color: 'bg-muted text-muted-foreground border-border/40', step: 0 };
  }
};

export default function DeliveryMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(() => MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const config = getStatusConfig(order.status);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const statusMessages = {
      'IN_TRANSIT': "Colis récupéré ! Bonne route pour la livraison.",
      'DELIVERED': "Félicitations ! Livraison confirmée avec succès."
    };

    setOrder({
      ...order,
      status: newStatus,
      timeline: [
        ...order.timeline,
        { 
          status: newStatus, 
          timestamp: new Date().toISOString(), 
          note: newStatus === 'IN_TRANSIT' ? 'Colis récupéré par le livreur.' : 'Colis livré au client.' 
        }
      ]
    });
    
    setIsLoading(false);
    toast.success(statusMessages[newStatus as keyof typeof statusMessages] || "Statut mis à jour");
    
    if (newStatus === 'DELIVERED') {
       setTimeout(() => navigate('/delivery/dashboard'), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/delivery/missions">Mes Missions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mission #{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            Mission <span className="text-primary font-mono">#{order.id}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${config.color} border font-bold uppercase tracking-widest px-4 py-1.5 text-xs rounded-lg shadow-sm`}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
         <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
            <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: `${(config.step - 1) * 50}%` }} />
            
            {[
              { step: 1, label: 'Assigné', icon: ShieldCheck },
              { step: 2, label: 'En transit', icon: Navigation },
              { step: 3, label: 'Livré', icon: CheckCircle2 }
            ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-card transition-colors duration-500 ${config.step >= s.step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                   <s.icon size={18} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.step >= s.step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Route Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/40 bg-muted/20">
               <h2 className="text-lg font-bold tracking-tight text-foreground">Itinéraire de livraison</h2>
            </div>
            
            <div className="p-8 space-y-12 relative before:absolute before:inset-y-12 before:left-[47px] before:w-[2px] before:bg-border before:border-dashed">
              
              {/* Pickup Point */}
              <div className="flex gap-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center ring-8 ring-amber-500/10 shrink-0">
                   <Store size={22} className="text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">Point de retrait</span>
                    <h3 className="text-lg font-bold text-foreground mt-1">{order.seller.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1">
                       <MapPin size={14} className="text-amber-500" /> {order.seller.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9 border-border/40 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/30">
                       <Phone size={14} className="mr-2" /> Appeler
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl h-9 border-border/40 hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/30">
                       <MessageSquare size={14} className="mr-2" /> Message
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delivery Point */}
              <div className="flex gap-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center ring-8 ring-primary/10 shrink-0">
                   <User size={22} className="text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Client final</span>
                    <h3 className="text-lg font-bold text-foreground mt-1">Sarah M.</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1">
                       <MapPin size={14} className="text-primary" /> {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                    {order.shippingAddress.instructions && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                         <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                         <p className="text-xs text-foreground italic font-medium">"{order.shippingAddress.instructions}"</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9 border-border/40 hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/30">
                       <Phone size={14} className="mr-2" /> Appeler
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl h-9 border-border/40 hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/30">
                       <MessageSquare size={14} className="mr-2" /> Message
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Articles to Check */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase flex items-center gap-2 mb-4">
              <Package size={16} /> Articles à vérifier au pick-up
            </h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-muted/10">
                   <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">x{item.quantity}</span>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-foreground line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">{item.product.category}</p>
                   </div>
                   <div className="w-6 h-6 rounded-md border border-border flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-muted-foreground/30" />
                   </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-lg sticky top-24">
             <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-6">Actions de mission</h2>
             
             <div className="space-y-4">
                {order.status === 'ASSIGNED' && (
                  <Button 
                    onClick={() => handleUpdateStatus('IN_TRANSIT')}
                    variant="primary" 
                    className="w-full rounded-xl shadow-md font-bold h-14 text-md"
                    isLoading={isLoading}
                  >
                    <CheckCircle2 size={20} className="mr-2" /> Confirmer récupération
                  </Button>
                )}

                {order.status === 'IN_TRANSIT' && (
                  <Button 
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    variant="primary" 
                    className="w-full rounded-xl shadow-md font-bold h-14 text-md bg-emerald-500 hover:bg-emerald-600"
                    isLoading={isLoading}
                  >
                    <CheckCircle2 size={20} className="mr-2" /> Confirmer livraison
                  </Button>
                )}

                {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                     <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-md ring-4 ring-emerald-500/10">
                        <Check size={24} className="text-white" strokeWidth={3} />
                     </div>
                     <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Mission Terminée</p>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl border-border/40 text-muted-foreground hover:bg-muted/50 h-12">
                    <Navigation size={18} className="mr-2" /> Lancer l'itinéraire
                  </Button>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-border/40">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground text-xs rounded-lg">
                   <HelpCircle size={14} className="mr-2" /> Un problème ? Contacter le support
                </Button>
             </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
             <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <DollarSign size={16} />
                </div>
                <div className="flex-1">
                   <p className="text-muted-foreground font-medium">Récompense de course</p>
                   <p className="text-lg font-black text-foreground">5 000 Ar</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
