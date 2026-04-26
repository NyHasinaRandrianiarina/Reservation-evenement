import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, MapPin, Navigation, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import LandingLayout from '@/components/layouts/LandingLayout';
import Input from '@/components/reusable/Input';
import Button from '@/components/reusable/Button';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Veuillez entrer un numéro de suivi valide');
      return;
    }
    navigate(`/track/${trackingNumber.trim().toUpperCase()}`);
  };

  return (
    <LandingLayout>
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-20 overflow-hidden">
        {/* Background Grid & Blobs matching LandingPage */}
        <div className="absolute inset-0 -z-10 bg-background flex items-center justify-center">
          <div
            className={cn(
              "absolute inset-0 opacity-50",
              "[background-size:40px_40px]",
              "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
              "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
            )}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]"></div>
          
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl px-6 relative z-10"
        >
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-background border border-border/50 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary/5 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl" />
              <Package size={36} className="text-primary relative z-10" strokeWidth={1.5} />
              
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-2 -top-2 w-8 h-8 bg-background border border-border/50 rounded-full flex items-center justify-center shadow-sm"
              >
                <Navigation size={14} className="text-accent" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-tight">
              Où est votre colis ?
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto leading-relaxed">
              Suivez chaque étape de la livraison de votre commande en temps réel.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full">
            <div className="bg-background/80 backdrop-blur-2xl border border-border/60 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5 ring-1 ring-border/20">
              <div className="relative">
                <Input
                  placeholder="Ex: TRK-A83KZ1"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value.toUpperCase());
                    setError('');
                  }}
                  error={error}
                  leftIcon={<Search size={22} className="text-muted-foreground/50" />}
                  className="h-16 pl-12 text-xl font-mono tracking-widest font-bold bg-muted/30 border-border/50 focus:bg-background rounded-2xl transition-all"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full h-14 mt-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 group"
              >
                Rechercher la livraison
                <ArrowRight size={18} className="ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>

              <div className="flex items-center justify-center gap-2 mt-8 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                <MapPin size={14} />
                <span>Mise à jour en temps réel</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </LandingLayout>
  );
}
