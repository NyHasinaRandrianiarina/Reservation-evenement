import { useState, useEffect, useCallback } from 'react';
import { Package, UserCheck, Search, Filter, X, Loader2, MapPin, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import {
  getAllDeliveries,
  getAvailableDrivers,
  assignDriverToDelivery,
  type Delivery,
  type Driver,
  type DeliveryStatus,
} from '@/api/deliveries';
import Button from '@/components/reusable/Button';

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  ASSIGNED: "Assignée",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ASSIGNED: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  IN_TRANSIT: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminAllOrdersPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState<Delivery | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllDeliveries(filterStatus || undefined);
      setDeliveries(res.data || []);
    } catch {
      toast.error("Impossible de charger les livraisons");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await getAvailableDrivers();
      setDrivers(res.data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
  }, [fetchDeliveries, fetchDrivers]);

  const openAssignModal = (delivery: Delivery) => {
    setAssignModal(delivery);
    setSelectedDriverId("");
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedDriverId) return;
    setAssigning(true);
    try {
      await assignDriverToDelivery(assignModal.id, selectedDriverId);
      toast.success("Livreur assigné avec succès !");
      setAssignModal(null);
      fetchDeliveries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'assignation");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = deliveries.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.tracking_number.toLowerCase().includes(q) ||
      d.recipient_name.toLowerCase().includes(q) ||
      d.sender?.full_name?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des Livraisons</h1>
          <p className="text-muted-foreground mt-1">Supervisez et assignez les livreurs aux demandes.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Package size={16} />
          {deliveries.length} livraison{deliveries.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par tracking, expéditeur, destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 pl-9 pr-8 rounded-xl border border-border bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ASSIGNED">Assignée</option>
            <option value="IN_TRANSIT">En transit</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-4xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-bold text-foreground">Aucune livraison trouvée</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Essayez un autre terme de recherche." : "Les demandes apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Tracking</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Expéditeur</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Destinataire</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Livreur</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-black text-foreground">{delivery.tracking_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {delivery.sender?.full_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{delivery.recipient_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{delivery.delivery_address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={delivery.status} />
                    </td>
                    <td className="px-6 py-4">
                      {delivery.driver ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {delivery.driver.full_name[0]}
                          </div>
                          <span className="font-medium text-foreground">
                            {delivery.driver.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(delivery.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {delivery.status === "PENDING" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-lg h-8 px-4 text-xs shadow-md shadow-primary/20"
                          onClick={() => openAssignModal(delivery)}
                        >
                          <UserCheck size={14} className="mr-1.5" />
                          Assigner
                        </Button>
                      ) : delivery.status === "ASSIGNED" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg h-8 px-4 text-xs"
                          onClick={() => openAssignModal(delivery)}
                        >
                          Réassigner
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border/50 rounded-4xl p-8 shadow-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">Assigner un livreur</h2>
                <button
                  onClick={() => setAssignModal(null)}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Delivery Summary */}
              <div className="bg-muted/30 border border-border/40 rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Colis</span>
                  <span className="font-mono font-black text-foreground">{assignModal.tracking_number}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-foreground">{assignModal.delivery_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground">{assignModal.recipient_name} — {assignModal.recipient_phone}</span>
                </div>
              </div>

              {/* Driver Selection */}
              <div className="mb-8">
                <label className="text-[13px] font-medium text-foreground/80 ml-1 mb-2 block">
                  Sélectionner un livreur
                </label>
                {drivers.length === 0 ? (
                  <div className="text-center py-6 bg-muted/20 rounded-2xl border border-border/30">
                    <p className="text-sm text-muted-foreground">Aucun livreur disponible</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {drivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          selectedDriverId === driver.id
                            ? "bg-primary/5 border-primary/30 ring-2 ring-primary/10"
                            : "bg-background border-border/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          selectedDriverId === driver.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {driver.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">
                            {driver.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {driver.phone || "Pas de téléphone"}{driver.zone ? ` · ${driver.zone}` : ""}
                          </p>
                        </div>
                        {selectedDriverId === driver.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setAssignModal(null)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/25"
                  onClick={handleAssign}
                  disabled={!selectedDriverId || assigning}
                >
                  {assigning ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Assignation...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserCheck size={16} /> Confirmer
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
