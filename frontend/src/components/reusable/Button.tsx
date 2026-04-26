import clsx from "clsx";
import React, { forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading, leftIcon, rightIcon, className, children, ...props }, ref
) {
  
  const variants: Record<Variant, string> = {
    // Utilise ta couleur dorée oklch comme identité forte
    primary: "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
    // Pour les actions secondaires, on reste sobre
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border/40",
    // Outline subtil
    outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
    // Ghost pour les actions de navigation (ex: "Retour")
    ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
    // Alerte pour annulation de commande
    destructive: "bg-destructive text-destructive-foreground hover:brightness-110 shadow-sm"
  };

  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[12px] gap-1.5",
    md: "h-10 px-5 text-[13px] gap-2",
    lg: "h-12 px-8 text-sm gap-2.5 uppercase tracking-wide font-semibold",
    icon: "h-10 w-10", // Pour les boutons de favoris ou réseaux sociaux
  };

  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-[var(--radius)] font-sans font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
         <span className="animate-spin mr-2">◌</span> 
      ) : (
        <>
          {leftIcon && <span className="opacity-90">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="opacity-90">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;