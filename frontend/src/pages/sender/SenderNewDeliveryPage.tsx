import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, MapPin, User, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { useAuthStore } from '@/store/useAuthStore';
import { createDelivery, type CreateDeliveryInput } from '@/api/deliveries';
import Button from '@/components/reusable/Button';
import Input from '@/components/reusable/Input';

const deliverySchema = z.object({
  description: z.string().min(3, "La description est trop courte"),
  weight: z.string().optional(),
  pickup_address: z.string().min(5, "L'adresse de collecte est requise"),
  delivery_address: z.string().min(5, "L'adresse de livraison est requise"),
  recipient_name: z.string().min(2, "Le nom du destinataire est requis"),
  recipient_phone: z.string().min(8, "Le numéro de téléphone est invalide"),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

export default function SenderNewDeliveryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTrackingNumber, setSuccessTrackingNumber] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      pickup_address: user?.address || "", // Default to user's address if available
    }
  });

  const onSubmit = async (data: DeliveryFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateDeliveryInput = {
        ...data,
        weight: data.weight ? parseFloat(data.weight) : undefined
      };
      
      const res = await createDelivery(payload);
      setSuccessTrackingNumber(res.data?.tracking_number || null);
      toast.success("Demande de livraison créée avec succès !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successTrackingNumber) {
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/50 rounded-4xl p-12 text-center shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Demande Envoyée !</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Votre demande a bien été enregistrée. Voici votre numéro de suivi :
          </p>
          <div className="bg-muted/30 border border-border/50 rounded-2xl py-6 px-8 inline-block mb-10">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Tracking Number</p>
            <p className="text-4xl font-black font-mono tracking-tight text-primary">{successTrackingNumber}</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/sender/dashboard')} className="h-12 px-6 rounded-xl">
              Retour au Dashboard
            </Button>
            <Button variant="primary" onClick={() => navigate(`/track/${successTrackingNumber}`)} className="h-12 px-6 rounded-xl shadow-lg shadow-primary/25">
              Suivre ce colis
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/sender/dashboard">
          <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Nouvelle Livraison</h1>
          <p className="text-muted-foreground mt-1">Saisissez les informations de votre colis.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Colis */}
        <div className="bg-card border border-border/50 rounded-4xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Package size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Informations du colis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Description du contenu"
                placeholder="Ex: Document administratif, Paire de chaussures..."
                {...register("description")}
                error={errors.description?.message}
              />
            </div>
            <div>
              <Input
                label="Poids estimé (kg)"
                placeholder="Ex: 1.5"
                type="number"
                step="0.1"
                {...register("weight")}
                error={errors.weight?.message}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Adresses */}
        <div className="bg-card border border-border/50 rounded-4xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Itinéraire</h2>
          </div>
          <div className="space-y-6">
            <Input
              label="Adresse de collecte (Départ)"
              placeholder="Où devons-nous récupérer le colis ?"
              {...register("pickup_address")}
              error={errors.pickup_address?.message}
            />
            <Input
              label="Adresse de livraison (Destination)"
              placeholder="Où devons-nous livrer le colis ?"
              {...register("delivery_address")}
              error={errors.delivery_address?.message}
            />
          </div>
        </div>

        {/* Section 3: Destinataire */}
        <div className="bg-card border border-border/50 rounded-4xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Destinataire</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom complet du destinataire"
              placeholder="Ex: Jean Dupont"
              {...register("recipient_name")}
              error={errors.recipient_name?.message}
            />
            <Input
              label="Numéro de téléphone"
              placeholder="Ex: +261 34 00 000 00"
              {...register("recipient_phone")}
              error={errors.recipient_phone?.message}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="h-14 px-8 rounded-xl text-lg shadow-xl shadow-primary/25 w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Création en cours...
              </span>
            ) : (
              "Valider la demande de livraison"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
