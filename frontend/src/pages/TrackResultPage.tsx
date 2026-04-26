import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, User, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
// import { cn } from '@/lib/utils';
import LandingLayout from '@/components/layouts/LandingLayout';
import { DeliveryStatusBadge } from '@/components/shared/DeliveryStatusBadge';
import { DeliveryTimeline } from '@/components/shared/DeliveryTimeline';
import type { DeliveryStatus } from '@/components/shared/DeliveryStatusBadge';
import type { TimelineEvent } from '@/components/shared/DeliveryTimeline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Button from '@/components/reusable/Button';

// Mock data fetcher
const fetchTrackingData = async (trackingNumber: string) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (trackingNumber === 'TRK-ERROR') {
    throw new Error('NOT_FOUND');
  }

  // Mock successful response
  return {
    trackingNumber,
    status: 'IN_TRANSIT' as DeliveryStatus,
    recipientName: 'Jean Rakoto',
    recipientCity: 'Antananarivo',
    events: [
      { status: 'PENDING' as DeliveryStatus, date: '12 avr. 2026 · 09:14' },
      { status: 'CONFIRMED' as DeliveryStatus, date: '12 avr. 2026 · 10:30' },
      { status: 'ASSIGNED' as DeliveryStatus, date: '13 avr. 2026 · 08:00', actor: 'Marc' },
      { status: 'IN_TRANSIT' as DeliveryStatus, date: '13 avr. 2026 · 09:45' }
    ] as TimelineEvent[]
  };
};

export default function TrackResultPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!trackingNumber) return;
    
    let isMounted = true;
    
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetchTrackingData(trackingNumber);
        if (isMounted) setData(res);
      } catch (err) {
        if (isMounted) setError(true);
        console.log(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    load();
    
    return () => {
      isMounted = false;
    };
  }, [trackingNumber]);

  if (!trackingNumber) {
    return <Navigate to="/track" replace />;
  }

  return (
    <LandingLayout>
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-muted/10 pb-20">
        {/* Subtle Background */}
        <div className="absolute inset-0 -z-10 bg-background flex items-center justify-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="max-w-4xl mx-auto w-full px-6 pt-12 md:pt-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/track" className="inline-flex items-center text-[13px] font-bold tracking-wide text-muted-foreground hover:text-foreground transition-all mb-10 group bg-background/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-border/50 shadow-sm hover:shadow-md">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Nouvelle recherche
            </Link>
          </motion.div>

          {loading && (
            <div className="space-y-6">
              <div className="h-32 bg-card/60 backdrop-blur-md animate-pulse rounded-[2rem] border border-border/50 shadow-sm" />
              <div className="h-20 bg-card/60 backdrop-blur-md animate-pulse rounded-[2rem] border border-border/50 shadow-sm" />
              <div className="h-[500px] bg-card/60 backdrop-blur-md animate-pulse rounded-[2rem] border border-border/50 shadow-sm" />
            </div>
          )}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-md text-red-900 border-red-200 rounded-[2rem] p-6 shadow-sm">
                <AlertDescription className="font-semibold text-base flex flex-col items-center justify-center text-center py-6 gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Package size={28} className="text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg">Numéro de suivi introuvable</p>
                    <p className="text-red-700/80 text-sm font-medium">Veuillez vérifier votre saisie (Ex: TRK-XXXXXX) et réessayer.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              {/* Header Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-[2rem] p-8 shadow-xl shadow-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                    <Package size={28} className="text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em]">Colis Suivi</p>
                      <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black font-mono tracking-tight text-foreground">
                      {data.trackingNumber}
                    </h2>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Statut actuel</p>
                  <DeliveryStatusBadge status={data.status} className="text-sm px-4 py-1.5 shadow-sm" />
                </div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Timeline */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="md:col-span-2 bg-background/80 backdrop-blur-xl border border-border/60 rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border/40">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-foreground tracking-tight">Historique du colis</h3>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Détail des étapes</p>
                    </div>
                  </div>
                  <DeliveryTimeline currentStatus={data.status} events={data.events} />
                </motion.div>

                {/* Right Column: Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-[2rem] p-8 shadow-xl shadow-black/5">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Informations de livraison</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                          <User size={18} className="text-foreground/70" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Destinataire</p>
                          <p className="text-sm font-bold text-foreground">{data.recipientName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-foreground/70" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Destination</p>
                          <p className="text-sm font-bold text-foreground">{data.recipientCity}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
                    <h4 className="text-sm font-bold text-primary mb-2">Besoin d'aide ?</h4>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-4">
                      Si vous rencontrez un problème avec cette livraison, veuillez contacter le support de l'agence.
                    </p>
                    <Link to="/contact">
                      <Button variant="outline" size="sm" className="w-full bg-background/50 hover:bg-background">
                        Contacter le support
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
}
