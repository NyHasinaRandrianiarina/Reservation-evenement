import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary opacity-40" />
        </div>
        <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[2rem] animate-[spin_10s_linear_infinite]" />
      </div>
      
      <h3 className="text-2xl font-serif italic font-medium text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-10 font-light">{description}</p>
      
      {actionLabel && onAction && (
        <Button 
          variant="outline" 
          onClick={onAction}
          className="rounded-full px-8 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground font-bold transition-all"
        >
          {actionLabel}
        </Button>
      )}
      {children}
    </motion.div>
  );
}