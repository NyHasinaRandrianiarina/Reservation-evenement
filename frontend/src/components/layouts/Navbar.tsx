"use client";
import {
  Navbar as ResizableNavbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Button from "@/components/reusable/Button";
import { Search, ShoppingBag, User, LogOut, Package, Store, ChevronDown, PlusCircle } from "lucide-react";
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

export default function Navbar() {
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
  ];

  return (
    <div className="fixed top-0 z-50 w-full flex justify-center px-0 lg:px-8">
      <ResizableNavbar isHomePage={isHomePage}>
        {/* Desktop Navigation */}
        <NavBody className="max-w-[1400px]">
          <div className="flex items-center gap-12 flex-1">
            <NavbarLogo />
            
            {/* Main Nav Items with refined spacing */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.link)}
                  className={cn(
                    "px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer relative group",
                    location.pathname === item.link ? "text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  {item.name}
                  {location.pathname === item.link && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-5 right-5 h-[1px] bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 z-50">
            {/* Utility Icons Section */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-6 mr-2">
              <ThemeToggle variant="homeNav" />
              
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-all duration-500 cursor-pointer hover:bg-white/5"
                aria-label="Rechercher"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              {isAuthenticated && (
                <button
                  onClick={toggleCart}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-all duration-500 cursor-pointer hover:bg-white/5"
                  aria-label="Panier"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {totalItems > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-white text-black text-[9px] font-bold flex items-center justify-center rounded-full shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Target Audience Logic: Organizer CTA */}
            <div className="hidden xl:flex items-center gap-3">
              <button
                onClick={() => navigate(isAuthenticated && user?.is_seller ? "/creer-evenement" : "/devenir-vendeur")}
                className="flex items-center gap-2.5 px-6 py-2.5 border border-white/20 hover:border-white rounded-full bg-transparent text-white hover:bg-white hover:text-black transition-all duration-700 group cursor-pointer shadow-none"
              >
                <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-700" strokeWidth={1.5} />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
                  {isAuthenticated && user?.is_seller ? "Créer un événement" : "Publier"}
                </span>
              </button>
              
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/devenir-vendeur")}
                  className="px-4 py-2 text-[9px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Espace Organisateur
                </button>
              )}
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={() => navigate("/connexion")}
                  className="px-5 py-2.5 text-[9px] font-bold tracking-[0.2em] uppercase text-white hover:text-white/70 transition-colors cursor-pointer"
                >
                  Connexion
                </button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 h-10 bg-white text-black border-none hover:bg-white/90 font-bold shadow-lg transition-all text-[10px] uppercase tracking-[0.2em]"
                  onClick={() => navigate("/inscription")}
                >
                  S'inscrire
                </Button>
              </div>
            ) : (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-white/20 hover:border-white/50 transition-all bg-black/40 backdrop-blur-md cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-white/40 transition-all">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">
                          {getInitials(user?.first_name, user?.last_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold text-white">
                      {user?.first_name}
                    </span>
                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em]">
                      {user?.is_seller ? "Organisateur" : "Client"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={cn("text-white/40 transition-transform duration-500", isUserMenuOpen && "rotate-180")} />
                </button>

                {/* Dropdown User Menu — Refined for MasterClass feel */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-4 w-72 bg-black/80 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden origin-top-right z-[100]"
                    >
                      <div className="px-8 py-8 border-b border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20">
                              <img src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`} alt="avatar" className="w-full h-full object-cover grayscale opacity-80" />
                           </div>
                           <div className="flex flex-col">
                              <p className="text-base font-serif font-light text-white leading-tight">{user?.first_name} {user?.last_name}</p>
                              <div className={cn(
                                "inline-flex px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-[0.2em] mt-2 border",
                                user?.is_seller ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/20"
                              )}>
                                {user?.is_seller ? "Organisateur" : "Membre"}
                              </div>
                           </div>
                        </div>
                        <p className="text-[10px] text-white/40 truncate tracking-widest">{user?.email}</p>
                      </div>

                      <div className="p-4 flex flex-col gap-1">
                        {user?.is_seller && (
                          <button onClick={() => { setIsUserMenuOpen(false); navigate("/espace-vendeur"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-white/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-white">
                            <Store size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-white transition-colors" />
                            <span className="tracking-wide">Dashboard Organisateur</span>
                          </button>
                        )}
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/commandes"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-white/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-white">
                          <Package size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-white transition-colors" />
                          <span className="tracking-wide">Mes réservations</span>
                        </button>
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/profil"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-white/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-white">
                          <User size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-white transition-colors" />
                          <span className="tracking-wide">Mon Profil</span>
                        </button>
                      </div>

                      <div className="p-6 pt-2">
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            try {
                              await logout();
                              navigate("/");
                            } catch {
                              // ignore error or handle
                             }
                          }}
                          className="flex items-center justify-center gap-2 h-12 text-[9px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all w-full uppercase tracking-[0.2em]"
                        >
                          <LogOut size={14} strokeWidth={1.5} />
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

        {/* Mobile Navigation — Improved for dual targets */}
        <MobileNav>
          <MobileNavHeader className="px-6 py-4">
            <NavbarLogo />
            <div className="flex items-center gap-4">
               <ThemeToggle />
               <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            <nav className="flex flex-col gap-8 mb-12">
              {navItems.map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => { navigate(item.link); setIsMobileMenuOpen(false); }}
                  className="group flex items-center gap-6 text-left"
                >
                  <span className="text-5xl font-light tracking-tighter text-primary/10 font-serif italic">
                    0{idx + 1}
                  </span>
                  <span className="text-3xl font-bold tracking-tight text-foreground uppercase">
                    {item.name}
                  </span>
                </motion.button>
              ))}
            </nav>

            <div className="flex flex-col gap-4">
              <Button
                className="w-full h-16 rounded-[2rem] bg-foreground text-background font-bold text-sm uppercase tracking-widest"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(isAuthenticated && user?.is_seller ? "/creer-evenement" : "/devenir-vendeur");
                }}
              >
                {isAuthenticated && user?.is_seller ? "Créer un événement" : "Publier un événement"}
              </Button>
              
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 rounded-[2rem] font-bold text-xs uppercase tracking-widest"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/connexion"); }}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="primary"
                    className="h-16 rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/inscription"); }}
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}