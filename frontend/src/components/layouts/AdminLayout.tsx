import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/store/useAuthStore';

const navItems = [
  { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Événements', path: '/admin/evenements', icon: CalendarRange },
  { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
  { label: 'Statistiques', path: '/admin/statistiques', icon: BarChart3 },
];

const SidebarContent = ({
  user,
  handleLogout,
  setIsMobileOpen,
}: {
  user: User | null;
  handleLogout: () => void;
  setIsMobileOpen: (val: boolean) => void;
}) => (
  <>
    <div className="p-6 flex flex-col gap-2 border-b border-border">
      <Link to="/" className="flex flex-col -gap-1 group/logo shrink-0">
        <span className="font-serif text-2xl font-light tracking-tight text-foreground leading-none">
          EventNest
        </span>
        <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-muted-foreground pl-0.5">
          Administration
        </span>
      </Link>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground truncate">
            {user?.full_name}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => setIsMobileOpen(false)}
          end={item.path === '/admin/dashboard'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
              isActive
                ? 'bg-foreground text-background shadow-lg'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-border space-y-2">
      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Voir le site</span>
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all text-left"
      >
        <LogOut className="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    </div>
  </>
);

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-40">
        <Link to="/" className="font-serif text-xl font-light tracking-tight text-foreground">
          EventNest
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2">
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background flex flex-col mt-[73px]">
          <SidebarContent user={user} handleLogout={handleLogout} setIsMobileOpen={setIsMobileOpen} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border shrink-0 sticky top-0 h-screen">
        <SidebarContent user={user} handleLogout={handleLogout} setIsMobileOpen={setIsMobileOpen} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-background/50 backdrop-blur-md border-b border-border sticky top-0 z-20 h-20">
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Panneau d'administration
            </h2>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
