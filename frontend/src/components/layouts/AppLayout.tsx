import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, Bell, Package, LayoutDashboard, 
  User, LogOut,
  BarChart3, Settings, ChevronLeft, ChevronRight, type LucideIcon
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

// Sidebar Navigation Items per Role
const getNavItems = (role: string = "ADMIN"): NavItem[] => {
  switch (role) {
    case "ADMIN":
      return [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Toutes les Commandes", href: "/admin/commandes", icon: Package },
        { name: "Utilisateurs", href: "/admin/utilisateurs", icon: User },
        { name: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
        { name: "Paramètres", href: "/admin/parametres", icon: Settings },
      ];
    case "ORGANIZER":
      return [
        { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
        { name: "Mes Événements", href: "/organizer/events", icon: Package },
        { name: "Statistiques", href: "/organizer/statistiques", icon: BarChart3 },
        { name: "Paramètres", href: "/organizer/parametres", icon: Settings },
      ];
    case "PARTICIPANT":
    default:
      return [
        { name: "Mes Réservations", href: "/account/registrations", icon: Package },
        { name: "Découvrir", href: "/", icon: LayoutDashboard },
        { name: "Mon Profil", href: "/account/profile", icon: User },
      ];
  }
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // We fallback to PARTICIPANT if no role is defined
  const navItems = getNavItems(user?.role || "PARTICIPANT");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col gap-4">
      <div className={`flex h-16 items-center px-6 transition-all ${isCollapsed && !isMobile ? "justify-center px-0" : "justify-between"}`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Package size={18} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-2xl font-black text-foreground whitespace-nowrap overflow-hidden">
              Track<span className="text-primary">IT</span>
            </span>
          )}
        </Link>
        
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-muted border border-border/40 text-muted-foreground hover:text-foreground transition-all ${isCollapsed ? "translate-x-0" : "translate-x-2"}`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const content = (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
            >
              <item.icon size={18} className={`${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"} shrink-0`} />
              {(!isCollapsed || isMobile) && <span className="flex-1 truncate">{item.name}</span>}
              {item.badge && (!isCollapsed || isMobile) && (
                <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? "bg-primary-foreground text-primary" : "bg-primary/10 text-primary"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );

          if (isCollapsed && !isMobile) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }
          return content;
        })}
      </nav>

      <div className="border-t border-border/40 p-4 overflow-x-hidden">
        {isCollapsed && !isMobile ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
              >
                <LogOut size={18} className="shrink-0" />
                {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold text-destructive">
              Déconnexion
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />
            {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border/40 shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          {/* Mobile Hamburger & Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {renderSidebarContent(true)}
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive"></span>
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage src={user?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/parametres' : user?.role === 'ORGANIZER' ? '/organizer/settings' : '/account/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Slot */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
