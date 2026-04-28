import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Ticket, User, LogOut, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export default function AccountLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Mon calendrier', path: '/account/calendar', icon: CalendarDays },
    { label: 'Mes inscriptions', path: '/account/registrations', icon: Ticket },
    { label: 'Mon profil', path: '/account/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col md:flex-row max-w-[1400px] mx-auto">
      {/* Mobile Tabs */}
      <div className="md:hidden px-6 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 border-b border-border min-w-max pb-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 pb-2 px-2 text-sm font-bold uppercase tracking-widest transition-colors relative",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-foreground" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 px-8 py-6 border-r border-border min-h-[60vh] sticky top-24 h-fit">
        <div className="mb-12">
          <h2 className="text-2xl font-serif italic mb-2">Mon Espace</h2>
          <p className="text-sm text-muted-foreground">{user?.email || 'utilisateur@exemple.com'}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                  isActive 
                    ? "bg-foreground text-background shadow-lg" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="uppercase tracking-widest text-xs">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-12 pt-6 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="uppercase tracking-widest text-xs">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 md:px-12 w-full max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
