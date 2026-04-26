"use client";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Button from "@/components/reusable/Button";
import { Search, ShoppingBag, User, LogOut, Package, Store, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "U";
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

export function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Découvrir", link: "/catalogue" },
    { name: "Organisateurs", link: "/vendeurs" },
    { name: "À Propos", link: "/about" },
  ];

  return (
    <div className="fixed top-0 z-50 w-full flex justify-center p-4">
      <ResizableNavbar isHomePage={isHomePage}>
        {/* Desktop Navigation */}
        <NavBody className="max-w-6xl">
          <NavbarLogo />

          <NavItems items={navItems} activePath={location.pathname} />

          <div className="flex items-center gap-4 ml-auto z-50">
            {/* Utilitaires Group (Recherche + Panier) */}
            <div className="flex items-center gap-1 border-r border-border/10 pr-4 mr-2">
              <ThemeToggle variant="homeNav" />
              
              {/* Search Icon */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-primary group-[.not-home]/nav:text-muted-foreground transition-all duration-300 cursor-pointer hover:bg-primary/5"
                aria-label="Rechercher"
              >
                <Search size={18} />
              </button>

              {/* Cart Icon */}
              {isAuthenticated && (
                <button
                  onClick={toggleCart}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-primary group-[.not-home]/nav:text-muted-foreground transition-all duration-300 cursor-pointer hover:bg-primary/5"
                  aria-label="Panier"
                >
                  <ShoppingBag size={18} />
                  {totalItems > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center rounded-full shadow-lg border border-background animate-in zoom-in">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Seller CTA */}
            <button
              onClick={() => navigate(user?.is_seller ? "/espace-vendeur" : "/devenir-vendeur")}
              className="hidden xl:flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <Store size={14} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  {user?.is_seller ? "Espace" : "Publier"}
                </span>
                <span className="text-[10px] font-serif italic text-foreground leading-none">
                   {user?.is_seller ? "Organisateur" : "Un événement"}
                </span>
              </div>
            </button>

            {/* Main Action (Auth or Profile) */}
            {!isAuthenticated ? (
              <Button
                variant="primary"
                className="ml-2 rounded-full px-6 h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all"
                onClick={() => navigate("/connexion")}
              >
                Se connecter
              </Button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border/40 hover:border-primary/50 transition-all bg-background/50 backdrop-blur-sm cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border/50 group-hover:border-primary transition-all shadow-sm">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                        <span className="text-[10px] font-black text-primary-foreground">
                          {getInitials(user?.first_name, user?.last_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", isUserMenuOpen && "rotate-180")} />
                </button>

                {/* Dropdown User Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-4 w-72 bg-background/95 backdrop-blur-2xl rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden origin-top-right z-[100]"
                    >
                      <div className="px-6 py-6 border-b border-border/40 bg-primary/5">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-background shadow-md">
                              <img src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`} alt="avatar" />
                           </div>
                           <div className="flex flex-col">
                              <p className="text-sm font-bold text-foreground leading-none">{user?.first_name} {user?.last_name}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">Membre Privilège</p>
                           </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate opacity-70">{user?.email}</p>
                      </div>

                      <div className="flex flex-col p-3">
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/commandes"); }} className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-primary/5 rounded-2xl transition-all w-full text-left font-medium group cursor-pointer">
                          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Package size={16} />
                          </div>
                          <span>Mes réservations</span>
                        </button>
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/profil"); }} className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-primary/5 rounded-2xl transition-all w-full text-left font-medium group cursor-pointer">
                          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User size={16} />
                          </div>
                          <span>Mon Profil</span>
                        </button>
                      </div>

                      <div className="p-4 pt-2 flex flex-col gap-2">
                        <Button 
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate(user?.is_seller ? "/espace-vendeur" : "/devenir-vendeur");
                          }}
                          className="w-full h-12 rounded-2xl text-xs font-bold uppercase tracking-widest"
                        >
                          {user?.is_seller ? "Dashboard Organisateur" : "Devenir Organisateur"}
                        </Button>
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            try {
                              await logout();
                              navigate("/");
                            } catch {
                              // toast handled in store
                            }
                          }}
                          className="flex items-center justify-center gap-2 h-12 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-2xl transition-all w-full uppercase tracking-widest"
                        >
                          <LogOut size={14} />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader className="px-4 py-2">
            <NavbarLogo />
            <div className="flex items-center gap-2">
               <ThemeToggle />
               <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {/* Navigation Principale */}
            <nav className="flex flex-col gap-6 mb-12">
              {navItems.map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => { navigate(item.link); setIsMobileMenuOpen(false); }}
                  className="group flex items-end gap-6 text-left"
                >
                  <span className="text-5xl font-light tracking-tighter text-primary/20 group-hover:text-primary transition-colors font-serif italic">
                    0{idx + 1}
                  </span>
                  <span className="text-3xl font-bold tracking-tight text-foreground uppercase group-hover:translate-x-2 transition-transform duration-300">
                    {item.name}
                  </span>
                </motion.button>
              ))}
            </nav>

            {/* Actions Utilisateur */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {isAuthenticated && (
                  <button
                    onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                    className="flex flex-col gap-4 p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 items-start hover:bg-primary/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">
                      Panier ({totalItems})
                    </span>
                  </button>
                )}

                <button
                  onClick={() => { navigate("/commandes"); setIsMobileMenuOpen(false); }}
                  className="flex flex-col gap-4 p-6 rounded-[2.5rem] bg-muted/30 border border-border/40 items-start hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Package size={20} />
                  </div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">
                    Réservations
                  </span>
                </button>
              </div>

              {/* Profil / Actions */}
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-5 rounded-[2.5rem] bg-card border border-border/40 mt-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-background shadow-md">
                      <img
                        src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`}
                        className="w-full h-full object-cover"
                        alt="Profil"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-foreground leading-tight">
                        {user?.first_name}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">Membre Privilège</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      try {
                        await logout();
                        navigate("/");
                      } catch {
                        // ignore error or handle
                      }
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    className="w-full h-16 rounded-[2.5rem] bg-primary text-primary-foreground flex items-center justify-center gap-3 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/connexion"); }}
                  >
                    <User size={20} />
                    Se connecter
                  </button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-16 rounded-[2.5rem] mt-2 border-primary/20 text-primary font-bold text-base hover:bg-primary/5 transition-all"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated && user?.is_seller) {
                    navigate("/espace-vendeur");
                  } else {
                    navigate("/devenir-vendeur");
                  }
                }}
              >
                {isAuthenticated && user?.is_seller ? "Mon espace vendeur" : "Mode Organisateur"}
              </Button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}