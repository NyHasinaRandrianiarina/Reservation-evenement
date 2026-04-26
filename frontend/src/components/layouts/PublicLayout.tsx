import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarHeart,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// ═══════════════════════════════════════════════
//  HEADER — Public sticky navbar
// ═══════════════════════════════════════════════
function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-md border-b border-border/40'
          : 'bg-background/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/events" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <CalendarHeart size={18} className="text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Event<span className="text-primary">Nest</span>
          </span>
        </Link>

        {/* Desktop nav — keep minimal for now */}
        <nav className="hidden md:flex items-center gap-1 mx-8">
          <Link
            to="/events"
            className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Événements
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="rounded-full px-5" asChild>
            <Link to="/auth/login">Connexion</Link>
          </Button>
          <Button size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20" asChild>
            <Link to="/auth/signup">
              S'inscrire
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <div className="flex flex-col h-full px-6 py-8">
                {/* Mobile logo */}
                <div className="flex items-center gap-2.5 mb-10">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <CalendarHeart size={18} className="text-primary" />
                  </div>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    Event<span className="text-primary">Nest</span>
                  </span>
                </div>

                <nav className="flex flex-col gap-4 mb-10">
                  <Link
                    to="/events"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-base font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight size={16} className="text-primary" />
                    Événements
                  </Link>
                </nav>

                <div className="flex flex-col gap-3 mt-auto">
                  <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                    <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20" asChild>
                    <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>
                      S'inscrire
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </Button>
                </div>

                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50 mt-8 text-center">
                  EventNest — Plateforme événements
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

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
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      {/* pt-16 to offset fixed header */}
      <main className="flex-1 pt-16">
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
