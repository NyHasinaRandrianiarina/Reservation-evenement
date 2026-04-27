import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventWizardStore } from "@/store/useEventWizardStore";
import Button from "@/components/reusable/Button";
import { createEvent } from "@/api/events";
import toast from "react-hot-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  onPrev: () => void;
}

export default function Step4Publish({ onPrev }: Props) {
  const { draft, resetDraft } = useEventWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Basic validation check before publishing
  const missingFields = [];
  if (!draft.title) missingFields.push("Titre de l'événement");
  if (!draft.startDate) missingFields.push("Date de début");
  if (!draft.endDate) missingFields.push("Date de fin");
  if (draft.tickets.length === 0) missingFields.push("Au moins un type de billet");

  const canPublish = missingFields.length === 0;

  const handlePublish = async () => {
    if (!canPublish) return;
    
    setIsSubmitting(true);
    try {
      await createEvent(draft);
      toast.success("Événement publié avec succès !");
      resetDraft();
      navigate("/organizer/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la publication de l'événement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Récapitulatif & Publication</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vérifiez les informations avant de publier votre événement.
        </p>
      </div>

      {!canPublish && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Il manque des informations obligatoires pour pouvoir publier :
            <ul className="list-disc ml-5 mt-2">
              {missingFields.map((field, i) => (
                <li key={i}>{field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Box */}
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">Général</h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-muted-foreground">Titre</span>
                <span className="font-medium">{draft.title || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Catégorie</span>
                <span className="font-medium capitalize">{draft.category || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-xs text-muted-foreground">Début</span>
                  <span className="font-medium text-sm">
                    {draft.startDate ? new Date(draft.startDate).toLocaleString() : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Fin</span>
                  <span className="font-medium text-sm">
                    {draft.endDate ? new Date(draft.endDate).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Lieu</span>
                <span className="font-medium">
                  {draft.location.type === "in_person" ? draft.location.address || "Présentiel" : 
                   draft.location.type === "online" ? "En ligne" : "Hybride"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Box */}
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              Billetterie ({draft.tickets.length})
            </h3>
            {draft.tickets.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              <ul className="space-y-2">
                {draft.tickets.map((t) => (
                  <li key={t.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">
                      {t.type === "free" ? "Gratuit" : `${t.price} €`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-muted/30 rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              Formulaire ({draft.customFields.length} questions)
            </h3>
            {draft.customFields.length === 0 ? (
              <span className="text-sm text-muted-foreground">Champs standards uniquement</span>
            ) : (
              <ul className="space-y-2">
                {draft.customFields.map((f) => (
                  <li key={f.id} className="text-sm">
                    • {f.label} {f.required && <span className="text-destructive">*</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}>
          Retour
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          className="px-8" 
          onClick={handlePublish}
          disabled={!canPublish || isSubmitting}
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <CheckCircle2 size={16} /> : undefined}
        >
          {isSubmitting ? "Publication en cours..." : "Publier l'événement"}
        </Button>
      </div>
    </div>
  );
}
