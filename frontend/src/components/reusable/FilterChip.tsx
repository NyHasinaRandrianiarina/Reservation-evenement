import clsx from "clsx";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: ComponentType<LucideProps>;
  className?: string;
}

export function FilterChip({
  label,
  isActive,
  onClick,
  icon: Icon,
  className = "",
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-400 cursor-pointer outline-none shrink-0",
        "border",
        isActive
          ? "bg-foreground text-background border-foreground shadow-md"
          : "bg-transparent text-muted-foreground border-border/50 hover:border-foreground/30 hover:text-foreground",
        className
      )}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}
