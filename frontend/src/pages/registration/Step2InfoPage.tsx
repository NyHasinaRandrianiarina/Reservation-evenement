import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft } from 'lucide-react';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import type { ContactInfo } from '@/stores/useRegistrationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrderSummary from './components/OrderSummary';

const infoSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});

export default function Step2InfoPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { contact, updateContact } = useRegistrationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof infoSchema>>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
    },
  });

  const onSubmit = (data: z.infer<typeof infoSchema>) => {
    updateContact(data as ContactInfo);
    navigate(`/events/${slug}/register/payment`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 xl:col-span-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/events/${slug}/register/tickets`)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux billets
        </Button>

        <h2 className="text-3xl font-serif italic mb-8">Vos coordonnées</h2>

        <form id="info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Prénom *</label>
              <Input 
                {...register('firstName')} 
                className="h-12 rounded-2xl bg-muted/50 border-border focus-visible:ring-primary"
                placeholder="Votre prénom"
              />
              {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Nom *</label>
              <Input 
                {...register('lastName')} 
                className="h-12 rounded-2xl bg-muted/50 border-border focus-visible:ring-primary"
                placeholder="Votre nom"
              />
              {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Email *</label>
            <Input 
              {...register('email')} 
              type="email"
              className="h-12 rounded-2xl bg-muted/50 border-border focus-visible:ring-primary"
              placeholder="votre.email@exemple.com"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Téléphone (Optionnel)</label>
            <Input 
              {...register('phone')} 
              type="tel"
              className="h-12 rounded-2xl bg-muted/50 border-border focus-visible:ring-primary"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <OrderSummary 
          onContinue={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
}
