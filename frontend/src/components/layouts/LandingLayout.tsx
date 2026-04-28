import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Menu,
  X,
  ArrowRight,
  Zap,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Button from "@/components/reusable/Button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  return name.charAt(0).toUpperCase();
};

/* ──────────────────────────────────────────────
   LandingLayout — Public layout for landing page
   Navbar sticky + Footer + children slot
   ────────────────────────────────────────────── */

// ─── Navbar Links (smooth scroll anchors) ───
const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "Tracking", href: "/track", isRoute: true },
];

// ═══════════════════════════════════════════════
//  NAVBAR — Public sticky navbar
// ═══════════════════════════════════════════════
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSmoothScroll = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const getDashboardRoute = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "ORGANIZER") return "/organizer/dashboard";
    return "/account/registrations";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-md border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleSmoothScroll("#hero"); }}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Package size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-black text-foreground">
            Track<span className="text-primary">IT</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 mx-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.href}
                onClick={() => handleSmoothScroll(link.href)}
                className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            )
          ))}
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-5"
                onClick={() => navigate("/login")}
              >
                Se connecter
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="rounded-full px-5 shadow-lg shadow-primary/20"
                rightIcon={<ArrowRight size={14} />}
                onClick={() => navigate("/register")}
              >
                S'inscrire
              </Button>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 ml-2 rounded-full overflow-hidden border-2 border-border/40 hover:border-primary transition-all flex items-center justify-center bg-linear-to-br from-primary to-primary/80 shadow-sm cursor-pointer p-0.5"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profil" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-wide uppercase text-primary-foreground drop-shadow-sm">
                      {getInitials(user?.full_name)}
                    </span>
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-background rounded-3xl border border-border/40 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right whitespace-nowrap">
                  <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                    <p className="text-[15px] font-bold text-foreground truncate">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="flex flex-col py-2">
                    <button onClick={() => { setUserMenuOpen(false); navigate(getDashboardRoute()); }} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-muted/50 transition-colors w-full text-left font-medium cursor-pointer">
                      <LayoutDashboard size={18} className="text-muted-foreground" />
                      Mon Espace
                    </button>
                  </div>
                  <div className="border-t border-border/40 p-2">
                    <Button variant="destructive"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        try {
                          await logout();
                          navigate("/");
                        } catch {
                          // error handled in store
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors w-full"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-2xl flex flex-col px-8 py-10"
          >
            <nav className="flex flex-col gap-6 mb-10">
              {navLinks.map((link, idx) => (
                link.isRoute ? (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-lg font-bold text-foreground hover:text-primary transition-colors text-left"
                    >
                      <ChevronRight size={16} className="text-primary" />
                      {link.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => handleSmoothScroll(link.href)}
                    className="flex items-center gap-3 text-lg font-bold text-foreground hover:text-primary transition-colors text-left"
                  >
                    <ChevronRight size={16} className="text-primary" />
                    {link.label}
                  </motion.button>
                )
              ))}
            </nav>

            <div className="flex flex-col gap-3 mt-auto">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-2xl">
                      Se connecter
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20" rightIcon={<ArrowRight size={16} />}>
                      S'inscrire
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 mb-2">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-border/50" alt="Profil" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary">
                        <span className="text-[12px] font-bold text-primary-foreground">
                          {getInitials(user?.full_name)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate text-foreground">{user?.full_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20" 
                    rightIcon={<ArrowRight size={16} />}
                    onClick={() => { setMobileOpen(false); navigate(getDashboardRoute()); }}
                  >
                    Mon Espace
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={async () => {
                      setMobileOpen(false);
                      try { await logout(); navigate("/"); } catch {
                        toast.error("Erreur de déconnexion");
                      }
                    }}
                  >
                    Déconnexion
                  </Button>
                </div>
              )}
            </div>

            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50 mt-8 text-center">
              EventNest — Plateforme de réservation
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ═══════════════════════════════════════════════
//  FOOTER — Public footer
// ═══════════════════════════════════════════════
function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    plateforme: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Comment ça marche ?", href: "#how-it-works" },
      { label: "Tracking", href: "/track" },
    ],
    compte: [
      { label: "S'inscrire", href: "/register" },
      { label: "Se connecter", href: "/login" },
    ],
    legal: [
      { label: "Mentions légales", href: "#" },
      { label: "Confidentialité", href: "#" },
    ],
  };

  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border/40 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Package size={18} className="text-primary" />
              </div>
              <span className="text-2xl font-black text-foreground">
                Track<span className="text-primary">IT</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[300px] font-medium">
              La plateforme de réservation d'événements pour tous vos besoins.
            </p>
          </div>

          {/* Links columns */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Plateforme</h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.plateforme.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Compte</h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.compte.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Légal</h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.legal.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            © {currentYear} EventNest - Tous droits réservés
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
//  LAYOUT — Main export
// ═══════════════════════════════════════════════
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
