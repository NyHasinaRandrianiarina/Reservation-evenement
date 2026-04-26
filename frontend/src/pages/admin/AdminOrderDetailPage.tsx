import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, Truck, User, MapPin, Phone, Mail, 
  PackageX, Check, Clock, ShieldCheck, AlertTriangle, Store
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'CONFIRMED': return { label: 'Confirmée', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'ASSIGNED': return { label: 'Assignée', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' };
    case 'IN_TRANSIT': return { label: 'En livraison', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    case 'DELIVERED': return { label: 'Livrée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'COMPLETED': return { label: 'Terminée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'CANCELLED': return { label: 'Annulée', color: 'bg-destructive/10 text-destructive border-destructive/20' };
    default: return { label: status, color: 'bg-muted text-muted-foreground border-border/40' };
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'CLIENT': return 'bg-blue-500/10 text-blue-600';
    case 'VENDOR': return 'bg-amber-500/10 text-amber-600';
    case 'DELIVERY': return 'bg-purple-500/10 text-purple-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

// Enriched audit trail with actors
const getAuditTrail = (order: typeof MOCK_ORDERS[0]) => {
  return order.timeline.map(event => {
    let actor = "Système";
    let role = "SYSTEM";
    switch (event.status) {
      case 'PENDING': actor = "Sarah M."; role = "CLIENT"; break;
      case 'CONFIRMED': actor = order.seller.name; role = "VENDOR"; break;
      case 'ASSIGNED': actor = order.seller.name; role = "VENDOR"; break;
      case 'IN_TRANSIT': actor = order.deliveryPerson?.name || "Livreur"; role = "DELIVERY"; break;
      case 'DELIVERED': actor = order.deliveryPerson?.name || "Livreur"; role = "DELIVERY"; break;
      case 'CANCELLED': actor = "Sarah M."; role = "CLIENT"; break;
    }
    return { ...event, actor, role };
  });
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order] = useState(() => MOCK_ORDERS.find(o => o.id === id));
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeNote, setDisputeNote] = useState("");
  const [isInDispute, setIsInDispute] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <h2 className="text-2xl font-bold text-foreground">Commande introuvable</h2>
        <p className="text-muted-foreground mt-2 mb-6">La commande que vous cherchez n'existe pas.</p>
        <Link to="/admin/commandes">
          <Button variant="primary" className="rounded-full">
            <ArrowLeft size={16} className="mr-2" /> Retour aux commandes
          </Button>
        </Link>
      </div>
    );
  }

  const config = getStatusConfig(order.status);
  const auditTrail = getAuditTrail(order);

  const handleMarkDispute = () => {
    if (!disputeNote.trim()) return;
    setIsInDispute(true);
    setIsDisputeOpen(false);
    toast.success("Commande marquée en litige");
  };

  const handleCloseDispute = () => {
    setIsInDispute(false);
    toast.success("Litige résolu et fermé");
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
            <BreadcrumbLink href="/admin/commandes">Commandes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>#{order.id}</BreadcrumbPage>
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
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={`${config.color} border font-bold uppercase tracking-widest px-4 py-1.5 text-xs rounded-lg shadow-sm`}>
            {config.label}
          </Badge>
          {isInDispute && (
            <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold uppercase tracking-widest px-4 py-1.5 text-xs rounded-lg shadow-sm animate-pulse">
              🚨 LITIGE
            </Badge>
          )}
          
          {!isInDispute ? (
            <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-xl h-9 font-bold">
                  <AlertTriangle size={14} className="mr-2" /> Marquer en litige
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Marquer cette commande en litige</DialogTitle>
                  <DialogDescription>
                    Décrivez le problème. Cette action sera visible par toutes les parties concernées.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <textarea
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    placeholder="Décrivez le motif du litige..."
                    rows={4}
                    className="w-full rounded-xl bg-muted/50 border border-border/40 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDisputeOpen(false)} className="rounded-xl">Annuler</Button>
                  <Button variant="destructive" onClick={handleMarkDispute} disabled={!disputeNote.trim()} className="rounded-xl">Confirmer le litige</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCloseDispute} className="rounded-xl h-9 font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5">
              <CheckCircle2 size={14} className="mr-2" /> Clore le litige
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Articles & Audit Trail */}
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
              <span className="font-medium text-muted-foreground">Total</span>
              <span className="text-2xl font-black text-foreground">
                {order.totalAmount.toLocaleString('fr-FR')} <span className="text-sm text-primary">{order.currency}</span>
              </span>
            </div>
          </div>

          {/* Audit Trail Complet */}
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/40 bg-muted/20">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Audit Trail Complet</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/10">
                    <th className="text-left py-3 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider">Événement</th>
                    <th className="text-left py-3 px-4 font-bold text-muted-foreground text-xs uppercase tracking-wider">Acteur</th>
                    <th className="text-left py-3 px-6 font-bold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {auditTrail.map((event, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${event.status === 'CANCELLED' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
                            {event.status === 'CANCELLED' ? <PackageX size={12} /> : <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-bold text-foreground">{getStatusConfig(event.status).label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{event.actor}</span>
                          <Badge variant="outline" className={`${getRoleBadge(event.role)} border-none font-bold text-[9px] uppercase tracking-widest`}>
                            {event.role}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-muted-foreground font-medium text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(event.timestamp).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Parties */}
        <div className="lg:col-span-1 space-y-6">

          {/* Client */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase flex items-center gap-2">
              <User size={16} /> Client
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-lg">S</div>
              <div>
                <p className="font-bold text-foreground">Sarah M.</p>
                <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail size={12} /> sarah@email.com</span>
                  <span className="flex items-center gap-1.5"><Phone size={12} /> 034 11 222 33</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase flex items-center gap-2">
              <Store size={16} /> Vendeur
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-lg">
                {order.seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-foreground">{order.seller.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {order.seller.address || "Toamasina"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Person */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <Truck size={16} /> Livreur
            </h2>
            {order.deliveryPerson ? (
              <div className="flex items-center gap-3">
                <img src={order.deliveryPerson.avatar} alt={order.deliveryPerson.name} className="w-12 h-12 rounded-full object-cover border border-border/40" />
                <div>
                  <p className="font-bold text-foreground">{order.deliveryPerson.name}</p>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone size={12} /> {order.deliveryPerson.phone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <ShieldCheck size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Aucun livreur assigné.</p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground uppercase mb-4 flex items-center gap-2">
              <MapPin size={16} /> Adresse de livraison
            </h2>
            <div className="space-y-1 text-sm font-medium text-foreground">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}</p>
              {order.shippingAddress.instructions && (
                <p className="mt-4 pt-4 border-t border-border/40 text-muted-foreground italic">
                  "{order.shippingAddress.instructions}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
