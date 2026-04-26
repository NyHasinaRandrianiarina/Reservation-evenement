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
import { Search, ShoppingBag, User, LogOut, Package, Store } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
    { name: "Accueil", link: "/" },
    { name: "Catalogue", link: "/catalogue" },
    { name: "Annuaire", link: "/vendeurs" },
  ];

  return (
    <div className="fixed top-0 z-50 w-full flex justify-center">
      <ResizableNavbar isHomePage={isHomePage} >
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />

          <NavItems items={navItems} activePath={location.pathname} />

          <div className="flex items-center gap-2 ml-auto z-50">
            {/* Utilitaires Group (Recherche + Panier) */}
            <div className="flex items-center border-r border-white/10 group-[.is-visible]/nav:border-border/10 group-[.not-home]/nav:border-border/10 pr-2 mr-1">
              <ThemeToggle variant="homeNav" />
              {/* Search Icon */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-foreground group-[.not-home]/nav:text-muted-foreground transition-all duration-300 cursor-pointer"
                aria-label="Rechercher"
              >
                <Search size={18} />
              </button>

              {/* Cart Icon */}
              {isAuthenticated && (
                <button
                  onClick={toggleCart}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-foreground group-[.not-home]/nav:text-muted-foreground transition-all duration-300 cursor-pointer"
                  aria-label="Panier"
                >
                  <ShoppingBag size={18} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center rounded-full shadow-sm border border-background scale-100 transition-transform">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Seller CTA — Elegant & Lightweight */}
            <button
              onClick={() => navigate(user?.is_seller ? "/espace-vendeur" : "/devenir-vendeur")}
              className="hidden xl:flex items-center gap-2 px-4 py-2 text-[10px] font-black tracking-widest uppercase text-white/80 hover:text-primary group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-primary group-[.not-home]/nav:text-muted-foreground transition-all group cursor-pointer"
            >
              <Store size={14} className="group-hover:scale-110 transition-transform" />
              <span>{user?.is_seller ? "Mon Espace" : "Vendre"}</span>
            </button>

            {/* Main Action (Auth or Profile) */}
            {!isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                className="ml-1 rounded-full px-5 hidden sm:flex items-center justify-center font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105"
                onClick={() => navigate("/connexion")}
              >
                Se connecter
              </Button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 ml-1 rounded-full overflow-hidden border-2 border-white/20 group-[.is-visible]/nav:border-border/40 group-[.not-home]/nav:border-border/40 hover:border-primary transition-all flex items-center justify-center bg-linear-to-br from-primary to-primary/80 shadow-lg cursor-pointer p-0.5"
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profil" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[11px] font-bold tracking-wide uppercase text-primary-foreground drop-shadow-sm">
                        {getInitials(user?.first_name, user?.last_name)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown User Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-background rounded-3xl border border-border/40 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right whitespace-nowrap">
                    <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                      <p className="text-[15px] font-bold text-foreground truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="flex flex-col py-2">
                      <button onClick={() => { setIsUserMenuOpen(false); navigate("/commandes"); }} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-muted/50 transition-colors w-full text-left font-medium cursor-pointer">
                        <Package size={18} className="text-muted-foreground" />
                        Mes commandes
                      </button>
                      <button onClick={() => { setIsUserMenuOpen(false); navigate("/profil"); }} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-muted/50 transition-colors w-full text-left font-medium cursor-pointer">
                        <User size={18} className="text-muted-foreground" />
                        Mon Profil
                      </button>
                    </div>
                    <div className="border-t border-border/40 p-2 flex flex-col">
                      <Button 
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate(user?.is_seller ? "/espace-vendeur" : "/devenir-vendeur");
                        }}
                        className="flex items-center justify-center w-full px-4 py-2.5 mb-1 text-sm font-semibold rounded-full transition-colors"
                      >
                        {user?.is_seller ? "Mon espace vendeur" : "Passer Vendeur"}
                      </Button>
                      <Button variant="destructive"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          try {
                            await logout();
                            navigate("/");
                          } catch {
                            // toast handled in store
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
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          {/* Dans ton composant Navbar, remplace la partie MobileNavMenu */}
          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {/* Navigation Principale */}
            <nav className="flex flex-col gap-8 mb-16">
              {navItems.map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => { navigate(item.link); setIsMobileMenuOpen(false); }}
                  className="group flex items-end gap-4 text-left"
                >
                  <span className="text-4xl font-light tracking-tighter text-foreground/40 group-hover:text-primary transition-colors font-serif italic">
                    0{idx + 1}
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground uppercase group-hover:translate-x-2 transition-transform duration-300">
                    {item.name}
                  </span>
                </motion.button>
              ))}
            </nav>

            {/* Actions Utilisateur / Utilitaire */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-end mb-6">
                <ThemeToggle />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isAuthenticated && (
                  <button
                    onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }}
                    className="flex flex-col gap-3 p-6 rounded-[2rem] bg-muted/30 border border-border/40 items-start hover:bg-muted/50 transition-colors"
                  >
                    <ShoppingBag size={20} className="text-primary" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-foreground">
                      Panier ({totalItems})
                    </span>
                  </button>
                )}

                <button
                  onClick={() => { navigate("/commandes"); setIsMobileMenuOpen(false); }}
                  className="flex flex-col gap-3 p-6 rounded-[2rem] bg-muted/30 border border-border/40 items-start hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Package size={20} className="text-primary" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-foreground">
                    Commandes
                  </span>
                </button>
              </div>

              {/* Profil / Actions */}
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border/40 mt-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        className="w-11 h-11 rounded-full object-cover border border-border/50"
                        alt="Profil"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex items-center justify-center bg-linear-to-br from-primary to-primary/80 shadow-sm">
                        <span className="text-[14px] font-bold text-primary-foreground leading-none tracking-wide uppercase drop-shadow-sm">
                          {getInitials(user?.first_name, user?.last_name)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-foreground">
                        {user?.first_name} {user?.last_name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">Mon compte</span>
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    className="w-full h-14 rounded-3xl border border-border/40 bg-card text-foreground flex items-center justify-center gap-2 font-bold shadow-sm hover:bg-muted/50 transition-colors"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/connexion"); }}
                  >
                    <User size={18} />
                    Se connecter
                  </button>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full h-14 rounded-[2rem] mt-2 shadow-sm hover:shadow-md transition-all font-bold text-base"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAuthenticated && user?.is_seller) {
                    navigate("/espace-vendeur");
                  } else {
                    navigate("/devenir-vendeur");
                  }
                }}
              >
                {isAuthenticated && user?.is_seller ? "Mon espace vendeur" : "Passer en mode vendeur"}
              </Button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}