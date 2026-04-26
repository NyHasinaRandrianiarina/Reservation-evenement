import clsx from "clsx";
import React, { forwardRef, useId } from "react";

type InputVariant = "default" | "muted" | "destructive";
type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<InputVariant, string> = {
  // Bordure plus fine et focus sur la couleur primaire (dorée)
  default: "bg-background border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
  // Parfait pour une interface "Dashboard" moins chargée
  muted: "bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
  destructive: "bg-background border-destructive focus:ring-4 focus:ring-destructive/10",
};

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-5 text-base",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "default", size = "md", label, error, className, leftIcon, rightIcon, ...props },
  ref
) {
  const resolvedVariant = error ? "destructive" : variant;
  const generatedId = useId();
  const inputId = props.id ?? generatedId;

  return (
    <div className={clsx("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-foreground/80 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3.5 inset-y-0 flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors">
            {/* On s'assure que l'icône fait une taille fixe */}
            {React.isValidElement(leftIcon) ? React.cloneElement(leftIcon as React.ReactElement<{ size?: number }>, { size: 18 }) : leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            // On passe de rounded-full à rounded-xl pour plus de modernité sans l'effet "bulle"
            "w-full rounded-xl border outline-none transition-all duration-200",
            "placeholder:text-muted-foreground/60 text-foreground",
            "disabled:opacity-50 disabled:bg-muted",
            variantStyles[resolvedVariant],
            sizeStyles[size],
            leftIcon && "pl-11",
            rightIcon && "pr-11"
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 inset-y-0 flex items-center justify-center text-muted-foreground">
            {React.isValidElement(rightIcon) ? React.cloneElement(rightIcon as React.ReactElement<{ size?: number }>, { size: 18 }) : rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[12px] text-destructive font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;