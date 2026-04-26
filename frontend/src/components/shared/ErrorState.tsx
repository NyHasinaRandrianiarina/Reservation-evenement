import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error?: Error | unknown;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message =
    error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        Oups, quelque chose a mal tourné
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
