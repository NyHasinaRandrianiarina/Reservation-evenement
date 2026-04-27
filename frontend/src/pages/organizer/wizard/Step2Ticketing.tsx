import React, { useState } from "react";
import { useEventWizardStore } from "@/store/useEventWizardStore";
import type { TicketType } from "@/store/useEventWizardStore";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Ticketing({ onNext, onPrev }: Props) {
  const { draft, updateDraft } = useEventWizardStore();
  const [showAddForm, setShowAddForm] = useState(draft.tickets.length === 0);
  
  // Local state for the new ticket form
  const [newTicket, setNewTicket] = useState<Partial<TicketType>>({
    name: "",
    type: "paid",
    price: 0,
    quota: null,
    limitPerOrder: 10,
    description: "",
  });

  const handleAddTicket = () => {
    if (!newTicket.name) return;
    
    const ticket: TicketType = {
      id: Math.random().toString(36).substring(7),
      name: newTicket.name,
      type: newTicket.type as "free" | "paid",
      price: newTicket.type === "free" ? 0 : (newTicket.price || 0),
      quota: newTicket.quota ? Number(newTicket.quota) : null,
      description: newTicket.description || "",
      limitPerOrder: Number(newTicket.limitPerOrder) || 10,
    };

    updateDraft({ tickets: [...draft.tickets, ticket] });
    
    setNewTicket({
      name: "",
      type: "paid",
      price: 0,
      quota: null,
      limitPerOrder: 10,
      description: "",
    });
    setShowAddForm(false);
  };

  const handleRemoveTicket = (id: string) => {
    updateDraft({ tickets: draft.tickets.filter((t) => t.id !== id) });
  };

  const handleNext = () => {
    if (draft.tickets.length === 0) {
      alert("Veuillez créer au moins un type de billet.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Billetterie</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez les différents types de billets pour votre événement.
        </p>
      </div>

      <div className="space-y-4">
        {draft.tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
            <div>
              <h4 className="font-semibold">{ticket.name}</h4>
              <p className="text-sm text-muted-foreground">
                {ticket.type === "free" ? "Gratuit" : `${ticket.price} €`} • 
                {ticket.quota ? ` Limite : ${ticket.quota} places` : " Places illimitées"}
              </p>
            </div>
            <button 
              onClick={() => handleRemoveTicket(ticket.id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {!showAddForm && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-dashed"
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus size={16} />}
        >
          Ajouter un type de billet
        </Button>
      )}

      {showAddForm && (
        <div className="p-5 border border-border rounded-xl bg-muted/30 space-y-4">
          <h3 className="font-semibold text-sm">Nouveau type de billet</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du billet"
              placeholder="Ex: Early Bird"
              value={newTicket.name}
              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
            />
            
            <div>
              <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                Type
              </label>
              <Select 
                value={newTicket.type} 
                onValueChange={(val: string) => setNewTicket({ ...newTicket, type: val as any })}
              >
                <SelectTrigger className="w-full h-11 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Payant</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newTicket.type === "paid" && (
              <Input
                label="Prix (€)"
                type="number"
                min="0"
                step="0.01"
                value={newTicket.price}
                onChange={(e) => setNewTicket({ ...newTicket, price: Number(e.target.value) })}
              />
            )}

            <Input
              label="Quota total (optionnel)"
              type="number"
              placeholder="Laissez vide pour illimité"
              min="1"
              value={newTicket.quota || ""}
              onChange={(e) => setNewTicket({ ...newTicket, quota: e.target.value ? Number(e.target.value) : null })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {draft.tickets.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            )}
            <Button type="button" variant="primary" onClick={handleAddTicket}>
              Enregistrer ce billet
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" variant="primary" className="px-8" onClick={handleNext}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
