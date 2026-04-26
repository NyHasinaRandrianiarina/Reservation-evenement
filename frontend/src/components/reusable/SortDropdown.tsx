import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import clsx from "clsx";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SortDropdown({
  options,
  value,
  onChange,
  className = "",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLabel = options.find((o) => o.value === value)?.label ?? "Trier";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={clsx("relative", className)}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300 cursor-pointer outline-none bg-background"
      >
        <ArrowUpDown size={13} />
        {activeLabel}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 min-w-[180px] py-2 bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={clsx(
                "w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium tracking-wide transition-colors cursor-pointer",
                option.value === value
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {option.label}
              {option.value === value && (
                <Check size={13} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
