import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, Clock, Truck, Check, Store, MapPin, Phone, User, PackageX, PackageCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MOCK_ORDERS } from "@/data/mockData";
import type { OrderStatus } from "@/types";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClientOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState(() => MOCK_ORDERS.find(o => o.id === id));
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <h2 className="text-2xl font-bold text-foreground">Commande introuvable</h2>
        <p className="text-muted-foreground mt-2 mb-6">La commande que vous cherchez n'existe pas ou a été supprimée.</p>
        <Link to="/client/commandes">
          <Button variant="primary" className="rounded-full">
            <ArrowLeft size={16} className="mr-2" /> Retour à mes commandes
          </Button>
        </Link>
      </div>
    );
  }

  const config = getStatusConfig(order.status);
  
  // Timeline Logic
  const allStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
  
  const handleCancelOrder = () => {
    // In a real app, this would be an API call
    setOrder({ ...order, status: 'CANCELLED', timeline: [...order.timeline, { status: 'CANCELLED', timestamp: new Date().toISOString(), note: 'Annulé par le client' }] });
    toast.success("Commande annulée avec succès");
  };

  const handleConfirmDelivery = () => {
    setOrder({ ...order, status: 'COMPLETED', timeline: [...order.timeline, { status: 'COMPLETED', timestamp: new Date().toISOString(), note: 'Réception confirmée par le client' }] });
    toast.success("Réception confirmée. Merci pour votre achat !");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/client/commandes">Mes Commandes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Commande #{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            Commande <span className="text-primary font-mono">#{order.id}</span>
          </h1>
        </div>
        <Badge className={`${config.color} border font-bold uppercase tracking-widest px-4 py-1.5 text-xs rounded-lg shadow-sm`}>
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Suivi de livraison</h2>
            
            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-border/60">
              
              {order.status === 'CANCELLED' ? (
                // Cancelled Timeline
                order.timeline.map((event, idx) => (
                  <div key={idx} className="relative z-10">
                    <div className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-card ${event.status === 'CANCELLED' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {event.status === 'CANCELLED' ? <PackageX size={12} /> : <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${event.status === 'CANCELLED' ? 'text-destructive' : 'text-foreground'}`}>
                        {getStatusConfig(event.status).label}
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      {event.note && (
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2.5 rounded-lg border border-border/40">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // Normal Timeline
                allStatuses.map((statusStep) => {
                  const event = order.timeline.find(t => t.status === statusStep);
                  const isPast = event !== undefined;
                  const isActive = statusStep === order.status;
                  const isFuture = !isPast;
                  
                  // Icons based on status
                  let Icon = Clock;
                  if (statusStep === 'CONFIRMED') Icon = Store;
                  if (statusStep === 'ASSIGNED') Icon = User;
                  if (statusStep === 'IN_TRANSIT') Icon = Truck;
                  if (statusStep === 'DELIVERED') Icon = PackageCheck;
                  if (statusStep === 'COMPLETED') Icon = CheckCircle2;

                  return (
                    <div key={statusStep} className={`relative z-10 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-card transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground ring-primary/20 shadow-lg shadow-primary/30 animate-pulse' 
                          : isPast 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-muted text-muted-foreground border border-border/60'
                      }`}>
                        {isPast && !isActive ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                      </div>
                      <div className={`${isActive ? 'pt-0.5' : ''}`}>
                        <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {getStatusConfig(statusStep).label}
                        </h4>
                        {isPast && event ? (
                          <>
                            <p className="text-xs font-medium text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                            {event.note && isActive && (
                              <p className="text-sm text-muted-foreground mt-2 bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                                {event.note}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">En attente</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Articles */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">Articles commandés</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-muted/10">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Quantité : {item.quantity}</p>
                    <p className="text-sm font-bold text-foreground mt-2">
                      {(item.priceAtTime * item.quantity).toLocaleString('fr-FR')} {order.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/40 mt-6 pt-4 flex justify-between items-end">
              <span className="font-medium text-muted-foreground">Total payé</span>
              <span className="text-2xl font-black text-foreground">
                {order.totalAmount.toLocaleString('fr-FR')} <span className="text-sm text-primary">{order.currency}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm flex flex-col">
              <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4 flex items-center gap-2">
                <MapPin size={16} /> Adresse de livraison
              </h2>
              <div className="flex-1 space-y-1 text-sm font-medium text-foreground">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}</p>
                {order.shippingAddress.instructions && (
                  <p className="mt-4 pt-4 border-t border-border/40 text-muted-foreground italic">
                    "{order.shippingAddress.instructions}"
                  </p>
                )}
              </div>
            </div>

            {/* People (Seller & Driver) */}
            <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4 flex items-center gap-2">
                  <Store size={16} /> Vendeur
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {order.seller.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{order.seller.name}</p>
                    <Link to={`/vendeurs/${order.seller.id}`} className="text-xs text-primary hover:underline">
                      Voir la boutique
                    </Link>
                  </div>
                </div>
              </div>

              {order.deliveryPerson && (
                <div className="pt-6 border-t border-border/40">
                  <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4 flex items-center gap-2">
                    <Truck size={16} /> Livreur assigné
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={order.deliveryPerson.avatar} alt={order.deliveryPerson.name} className="w-10 h-10 rounded-full object-cover border border-border/40" />
                      <div>
                        <p className="font-bold text-foreground text-sm">{order.deliveryPerson.name}</p>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {order.deliveryPerson.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive">
                    Annuler la commande
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir annuler la commande #{order.id} ? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Ne pas annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelOrder}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    >
                      Oui, annuler
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {order.status === 'DELIVERED' && (
              <Button onClick={handleConfirmDelivery} variant="primary" className="rounded-xl shadow-md hover:scale-105 transition-transform font-bold">
                <CheckCircle2 size={18} className="mr-2" /> Confirmer la bonne réception
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
