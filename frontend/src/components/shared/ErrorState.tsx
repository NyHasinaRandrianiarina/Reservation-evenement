import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-[2rem] bg-destructive/5 flex items-center justify-center mb-8 relative">
        <AlertCircle className="w-10 h-10 text-destructive opacity-60" />
        <div className="absolute inset-0 border border-destructive/20 rounded-[2rem] scale-125 opacity-30 animate-pulse" />
      </div>
      
      <h3 className="text-2xl font-serif italic font-medium text-foreground mb-3">
        Une ombre au tableau
      </h3>
      <p className="text-muted-foreground max-w-sm mb-10 font-light italic">
        "{message}"
      </p>
      
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="rounded-full px-8 h-12 gap-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-bold"
        >
          <RefreshCw size={16} />
          Retenter l'expérience
        </Button>
      )}
    </motion.div>
  );
}