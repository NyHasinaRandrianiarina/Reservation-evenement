import { useState } from "react";
import { useEventWizardStore } from "@/store/useEventWizardStore";
import type { CustomField } from "@/store/useEventWizardStore";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3FormBuilder({ onNext, onPrev }: Props) {
  const { draft, updateDraft } = useEventWizardStore();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newField, setNewField] = useState<Partial<CustomField>>({
    label: "",
    type: "text",
    required: false,
  });

  const handleAddField = () => {
    if (!newField.label) return;
    
    const field: CustomField = {
      id: Math.random().toString(36).substring(7),
      label: newField.label,
      type: newField.type as CustomField["type"],
      required: newField.required || false,
    };

    updateDraft({ customFields: [...draft.customFields, field] });
    
    setNewField({
      label: "",
      type: "text",
      required: false,
    });
    setShowAddForm(false);
  };

  const handleRemoveField = (id: string) => {
    updateDraft({ customFields: draft.customFields.filter((f) => f.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Formulaire personnalisé</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quelles informations souhaitez-vous demander aux participants lors de l'inscription ?
        </p>
      </div>

      {/* Champs standards obligatoires */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm border-b border-border pb-2">Champs standards (inclus par défaut)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70 pointer-events-none">
          <Input label="Prénom" value="" readOnly placeholder="Prénom du participant" />
          <Input label="Nom" value="" readOnly placeholder="Nom du participant" />
          <div className="sm:col-span-2">
            <Input label="Adresse e-mail" value="" readOnly placeholder="E-mail du participant" />
          </div>
        </div>
      </div>

      {/* Champs personnalisés */}
      <div className="space-y-4 pt-6">
        <h3 className="font-semibold text-sm border-b border-border pb-2">Questions personnalisées</h3>
        
        {draft.customFields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
            <div>
              <h4 className="font-semibold">{field.label}</h4>
              <p className="text-sm text-muted-foreground">
                Type : {field.type} • {field.required ? "Obligatoire" : "Facultatif"}
              </p>
            </div>
            <button 
              onClick={() => handleRemoveField(field.id)}
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
          Ajouter une question
        </Button>
      )}

      {showAddForm && (
        <div className="p-5 border border-border rounded-xl bg-muted/30 space-y-4">
          <h3 className="font-semibold text-sm">Nouvelle question</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Intitulé de la question"
              placeholder="Ex: Entreprise, Restrictions alimentaires..."
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                  Type de réponse
                </label>
                <Select 
                  value={newField.type} 
                  onValueChange={(val: string) => setNewField({ ...newField, type: val as any })}
                >
                  <SelectTrigger className="w-full h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte court</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Téléphone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 h-11 mt-6">
                <Switch 
                  checked={newField.required} 
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                />
                <label className="text-sm font-medium">Réponse obligatoire</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
            <Button type="button" variant="primary" onClick={handleAddField}>
              Ajouter la question
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button type="button" variant="outline" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" variant="primary" className="px-8" onClick={onNext}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
