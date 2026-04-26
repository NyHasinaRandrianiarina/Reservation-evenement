import { Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarHeart,
  Zap,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Navbar from './Navbar';



// ═══════════════════════════════════════════════
//  FOOTER — Public footer
// ═══════════════════════════════════════════════
function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plateforme: [
      { label: 'Événements', to: '/events' },
    ],
    compte: [
      { label: 'Connexion', to: '/auth/login' },
      { label: 'S\'inscrire', to: '/auth/signup' },
    ],
    legal: [
      { label: 'Mentions légales', to: '#' },
      { label: 'Confidentialité', to: '#' },
      { label: 'CGU', to: '#' },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t border-border/40 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <CalendarHeart size={18} className="text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Event<span className="text-primary">Nest</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[300px] font-medium">
              Découvrez et inscrivez-vous aux meilleurs événements près de chez vous. Conférences, concerts, formations et plus encore.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">
              Plateforme
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.plateforme.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">
              Compte
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.compte.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">
              Légal
            </h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.legal.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            © {currentYear} EventNest — Tous droits réservés
          </span>
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-primary" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
              Propulsé par la passion
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════
//  PUBLIC LAYOUT — Main export
// ═══════════════════════════════════════════════
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <PublicFooter />
    </div>
  );
}
