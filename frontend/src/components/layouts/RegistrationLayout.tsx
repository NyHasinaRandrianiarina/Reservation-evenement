import { Outlet, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import { useEvent } from '@/hooks/useEvents';

export default function RegistrationLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { data: event } = useEvent(slug || '');
  const clearRegistration = useRegistrationStore((state) => state.clearRegistration);

  const steps = [
    { id: 'tickets', label: '1. Billets', path: `/events/${slug}/register/tickets` },
    { id: 'info', label: '2. Informations', path: `/events/${slug}/register/info` },
    { id: 'payment', label: '3. Paiement', path: `/events/${slug}/register/payment` },
  ];

  const currentStepIndex = steps.findIndex(step => location.pathname === step.path);

  const handleQuit = () => {
    if (confirm("Êtes-vous sûr de vouloir quitter ? Votre sélection de billets sera perdue.")) {
      clearRegistration();
      navigate(`/events/${slug}`);
    }
  };

  if (!event) return null; // We could render a loading state here

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Simplified Header */}
      <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex flex-col -gap-1">
            <span className="font-serif text-xl font-light tracking-tight text-foreground leading-none">
              EventNest
            </span>
          </Link>

          <h1 className="text-sm font-semibold truncate max-w-xs md:max-w-md lg:max-w-xl text-center">
            {event.title}
          </h1>

          <button 
            onClick={handleQuit}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Quitter l'inscription"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </div>
      </header>

      {/* Stepper */}
      {currentStepIndex >= 0 && (
        <div className="bg-muted/30 border-b border-border py-4 px-6 overflow-x-auto no-scrollbar">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-w-max gap-4 sm:gap-12">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-colors",
                    isActive ? "text-primary" : isPast ? "text-primary/60" : "text-muted-foreground/50"
                  )}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-8 sm:w-16 h-px bg-border mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
