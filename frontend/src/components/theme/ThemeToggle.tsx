import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  /** Classes pour le style « barre blanche » sur la home (resizable navbar) */
  variant?: "default" | "homeNav";
};

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const homeNavClasses =
    "w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white group-[.is-visible]/nav:text-muted-foreground group-[.is-visible]/nav:hover:text-foreground group-[.not-home]/nav:text-muted-foreground transition-all duration-300 cursor-pointer";

  const defaultClasses =
    "w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(variant === "homeNav" ? homeNavClasses : defaultClasses, className)}
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
