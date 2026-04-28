import React from "react";
import { useEventWizardStore } from "@/store/useEventWizardStore";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { uploadEventCover } from "@/api/events";
import toast from "react-hot-toast";

interface Props {
  onNext: () => void;
}

export default function Step1GeneralInfo({ onNext }: Props) {
  const { draft, updateDraft } = useEventWizardStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Informations générales</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Commencez par les détails de base de votre événement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Titre de l'événement"
            placeholder="Ex: Conférence Tech 2025"
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Catégorie
          </label>
          <Select
            value={draft.category}
            onValueChange={(val: string) => updateDraft({ category: val as any })}
          >
            <SelectTrigger className="w-full h-11 bg-background">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conference">Conférence</SelectItem>
              <SelectItem value="concert">Concert</SelectItem>
              <SelectItem value="formation">Formation</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Lieu de l'événement
          </label>
          <Select
            value={draft.location.type}
            onValueChange={(val: string) => updateDraft({ location: { ...draft.location, type: val as any } })}
          >
            <SelectTrigger className="w-full h-11 bg-background">
              <SelectValue placeholder="Où se déroule l'événement ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_person">En présentiel</SelectItem>
              <SelectItem value="online">En ligne</SelectItem>
              <SelectItem value="hybrid">Hybride</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(draft.location.type === "in_person" || draft.location.type === "hybrid") && (
          <div className="md:col-span-2">
            <Input
              label="Adresse complète"
              placeholder="Ex: 123 Rue de la République, 75001 Paris"
              value={draft.location.address}
              onChange={(e) => updateDraft({ location: { ...draft.location, address: e.target.value } })}
            />
          </div>
        )}

        {(draft.location.type === "online" || draft.location.type === "hybrid") && (
          <div className="md:col-span-2">
            <Input
              label="Lien de la visioconférence (optionnel)"
              placeholder="Ex: https://zoom.us/j/123456789"
              value={draft.location.onlineUrl}
              onChange={(e) => updateDraft({ location: { ...draft.location, onlineUrl: e.target.value } })}
            />
          </div>
        )}

        <div>
          <Input
            label="Date de début"
            type="datetime-local"
            value={draft.startDate}
            onChange={(e) => updateDraft({ startDate: e.target.value })}
            required
          />
        </div>

        <div>
          <Input
            label="Date de fin"
            type="datetime-local"
            value={draft.endDate}
            onChange={(e) => updateDraft({ endDate: e.target.value })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Description
          </label>
          <textarea
            className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Décrivez votre événement en quelques lignes..."
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Image de couverture
          </label>
          <div className="mt-2">
            {draft.coverImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-border h-[240px] group">
                <img
                  src={draft.coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-full shadow-lg"
                    onClick={() => updateDraft({ coverImageUrl: undefined })}
                  >
                    <X className="w-4 h-4 mr-2" /> Supprimer l'image
                  </Button>
                </div>
              </div>
            ) : (
              <DropzoneArea
                onFileAccepted={(file) => {
                  (async () => {
                    try {
                      const { url } = await uploadEventCover(file);
                      updateDraft({ coverImageUrl: url });
                    } catch (err) {
                      console.error(err);
                      toast.error("Erreur lors de l'upload de l'image");
                    }
                  })();
                }}
              />
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-6 border-t border-border mt-8">
        <Button type="submit" variant="primary" className="px-8">
          Continuer
        </Button>
      </div>
    </form>
  );
}

function DropzoneArea({ onFileAccepted }: { onFileAccepted: (file: File) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-300 flex flex-col items-center justify-center min-h-[200px] ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <ImagePlus className="w-8 h-8" />
      </div>
      <p className="text-foreground font-medium mb-1">
        {isDragActive ? "Relâchez l'image ici..." : "Cliquez ou glissez une image ici"}
      </p>
      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WEBP. Max 5MB. Format recommandé 16:9.
      </p>
    </div>
  );
}
