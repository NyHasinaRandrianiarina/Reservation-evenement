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
import { Search, User, LogOut, Package, Store, ChevronDown, PlusCircle, Shield, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/api/notifications";

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  return name.charAt(0).toUpperCase();
};

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 100);
  });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();


  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }
      try {
        const res = await getMyNotifications();
        setNotifications(res.data ?? []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const navItems = [
    { name: "Événements", link: "/" },
    { name: "Organisateurs", link: "/organisateurs" },
  ];

  return (
    <div className="fixed top-0 z-50 w-full flex justify-center px-0 lg:px-8">
      <ResizableNavbar isHomePage={isHomePage}>
        {/* Desktop Navigation */}
        <NavBody className="max-w-[1400px]">
          <div className="flex items-center gap-12 flex-1">
            <Link to="/" className="flex items-center gap-3 group/logo py-2 shrink-0">
              <div className="flex flex-col -gap-1">
                <span className={cn(
                  "font-serif text-2xl font-light tracking-tight transition-colors leading-none",
                  scrolled ? "text-foreground" : "text-white"
                )}>
                  EventNest
                </span>
                <span className={cn(
                  "text-[7px] font-bold tracking-[0.4em] uppercase opacity-60 transition-colors pl-0.5",
                  scrolled ? "text-foreground/60" : "text-white/60"
                )}>
                  Collection Privée
                </span>
              </div>
            </Link>

            {/* Main Nav Items with refined spacing */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.link)}
                  className={cn(
                    "px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer relative group",
                    location.pathname === item.link
                      ? (scrolled ? "text-foreground" : "text-white")
                      : (scrolled ? "text-foreground/50 hover:text-foreground" : "text-white/50 hover:text-white")
                  )}
                >
                  {item.name}
                  {location.pathname === item.link && (
                    <motion.div layoutId="nav-underline" className={cn(
                      "absolute bottom-0 left-5 right-5 h-px",
                      scrolled ? "bg-foreground" : "bg-white"
                    )} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 z-50">
            {/* Utility Icons Section */}
            <div className={cn(
              "flex items-center gap-1 border-r pr-6 mr-2 transition-colors",
              scrolled ? "border-border" : "border-white/20"
            )}>
              <ThemeToggle variant="homeNav" />

              <button
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer",
                  scrolled ? "text-foreground/60 hover:text-foreground hover:bg-foreground/5" : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                aria-label="Rechercher"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              {isAuthenticated && (
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setIsNotifMenuOpen((prev) => !prev)}
                    className={cn(
                      "relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-500 cursor-pointer",
                      scrolled
                        ? "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    aria-label="Notifications"
                  >
                    <Bell size={18} strokeWidth={1.5} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-2xl shadow-2xl p-3 z-120">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-sm font-bold">Notifications</p>
                        <button
                          onClick={async () => {
                            await markAllNotificationsRead();
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
                            );
                          }}
                          className="text-xs text-primary font-semibold"
                        >
                          Tout marquer comme lu
                        </button>
                      </div>
                      <div className="max-h-80 overflow-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-muted-foreground px-1 py-2">Aucune notification.</p>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={async () => {
                                if (!notif.read_at) {
                                  await markNotificationRead(notif.id);
                                  setNotifications((prev) =>
                                    prev.map((n) =>
                                      n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
                                    )
                                  );
                                }
                              }}
                              className={cn(
                                "w-full text-left rounded-xl border p-3 transition hover:bg-muted/40",
                                notif.read_at ? "border-border/40 opacity-80" : "border-primary/40 bg-primary/5"
                              )}
                            >
                              <p className="text-xs font-bold">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Target Audience Logic: Organizer CTA */}
            <div className="hidden xl:flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    isAuthenticated && user?.role === "ORGANIZER"
                      ? "/organizer/events/new"
                      : "/register"
                  )
                }
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-transparent transition-all duration-700 group cursor-pointer shadow-none border",
                  scrolled
                    ? "border-border hover:border-foreground text-foreground hover:bg-foreground hover:text-background"
                    : "border-white/30 hover:border-white text-white hover:bg-white hover:text-black"
                )}
              >
                <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-700" strokeWidth={1.5} />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
                  {isAuthenticated && user?.role === "ORGANIZER" ? "Créer un événement" : "Publier"}
                </span>
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/organizer/dashboard")}
                  className={cn(
                    "px-4 py-2 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer",
                    scrolled ? "text-foreground/50 hover:text-foreground" : "text-white/70 hover:text-white"
                  )}
                >
                  Espace Organisateur
                </button>
              )}
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => navigate("/login")}
                  className={cn(
                    "px-5 py-2.5 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer",
                    scrolled ? "text-foreground hover:text-foreground/70" : "text-white hover:text-white/80"
                  )}
                >
                  Connexion
                </button>
                <Button
                  className={cn(
                    "rounded-full px-6 h-10 border-none font-bold shadow-lg transition-all text-[10px] uppercase tracking-[0.2em]",
                    scrolled || !isHomePage
                      ? "bg-primary text-primary-foreground hover:opacity-90" 
                      : "bg-white text-black hover:bg-white/90"
                  )}
                  onClick={() => navigate("/register")}
                >
                  S'inscrire
                </Button>
              </div>
            ) : (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all backdrop-blur-md cursor-pointer group",
                    scrolled
                      ? "border-border hover:border-foreground/50 bg-background/40"
                      : "border-white/20 hover:border-white/50 bg-black/40"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full overflow-hidden border transition-all",
                    scrolled ? "border-border group-hover:border-foreground/40" : "border-white/20 group-hover:border-white/50"
                  )}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        scrolled ? "bg-primary" : "bg-white"
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold",
                          scrolled ? "text-primary-foreground" : "text-black"
                        )}>
                          {getInitials(user?.full_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className={cn("text-[10px] font-bold", scrolled ? "text-foreground" : "text-white")}>
                      {user?.full_name?.split(" ")[0]}
                    </span>
                    <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em]", scrolled ? "text-foreground/50" : "text-white/60")}>
                      {user?.role === "ADMIN" ? "Admin" : user?.role === "ORGANIZER" ? "Organisateur" : "Membre"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={cn("transition-transform duration-500", scrolled ? "text-foreground/40" : "text-white/60", isUserMenuOpen && "rotate-180")} />
                </button>

                {/* Dropdown User Menu — Refined for MasterClass feel */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-4 w-72 bg-background/80 backdrop-blur-3xl rounded-4xl border border-border shadow-2xl overflow-hidden origin-top-right z-100"
                    >
                      <div className="px-8 py-8 border-b border-border">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden border border-border">
                            <img src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}`} alt="avatar" className="w-full h-full object-cover grayscale opacity-80" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-base font-serif font-light text-foreground leading-tight">{user?.full_name}</p>
                            <div className={cn(
                              "inline-flex px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-[0.2em] mt-2 border",
                              user?.role === "ADMIN" ? "bg-primary text-primary-foreground border-primary" :
                              user?.role === "ORGANIZER" ? "bg-foreground text-background border-foreground" : 
                              "bg-transparent text-foreground/60 border-border"
                            )}>
                              {user?.role === "ADMIN" ? "Admin" : user?.role === "ORGANIZER" ? "Organisateur" : "Membre"}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-foreground/40 truncate tracking-widest">{user?.email}</p>
                      </div>

                      <div className="p-4 flex flex-col gap-1">
                        {user?.role === "ADMIN" && (
                          <button onClick={() => { setIsUserMenuOpen(false); navigate("/admin/dashboard"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-foreground/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-foreground">
                            <Shield size={16} strokeWidth={1.5} className="text-foreground/60 group-hover:text-foreground transition-colors" />
                            <span className="tracking-wide">Panel d'admin</span>
                          </button>
                        )}
                        {user?.role === "ORGANIZER" && (
                          <button onClick={() => { setIsUserMenuOpen(false); navigate("/organizer/dashboard"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-foreground/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-foreground">
                            <Store size={16} strokeWidth={1.5} className="text-foreground/60 group-hover:text-foreground transition-colors" />
                            <span className="tracking-wide">Dashboard Organisateur</span>
                          </button>
                        )}
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/account/registrations"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-foreground/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-foreground">
                          <Package size={16} strokeWidth={1.5} className="text-foreground/60 group-hover:text-foreground transition-colors" />
                          <span className="tracking-wide">Mes inscriptions</span>
                        </button>
                        <button onClick={() => { setIsUserMenuOpen(false); navigate("/account/profile"); }} className="flex items-center gap-4 px-5 py-4 text-xs hover:bg-foreground/5 rounded-2xl transition-all w-full text-left font-light group cursor-pointer text-foreground">
                          <User size={16} strokeWidth={1.5} className="text-foreground/60 group-hover:text-foreground transition-colors" />
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
                          className="flex items-center justify-center gap-2 h-12 text-[9px] font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all w-full uppercase tracking-[0.2em]"
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
                className="w-full h-16 rounded-4xl bg-foreground text-background font-bold text-sm uppercase tracking-widest"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(
                    isAuthenticated && user?.role === "ORGANIZER"
                      ? "/organizer/events/new"
                      : "/register"
                  );
                }}
              >
                {isAuthenticated && user?.role === "ORGANIZER" ? "Créer un événement" : "Publier un événement"}
              </Button>

              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 rounded-4xl font-bold text-xs uppercase tracking-widest"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="primary"
                    className="h-16 rounded-4xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                    onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }}
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