import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Button from "@/components/reusable/Button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Rechercher...",
  defaultValue = "",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full bg-background/95 backdrop-blur-sm border border-border/50 rounded-full p-1.5 shadow-lg transition-all hover:shadow-xl focus-within:shadow-xl focus-within:ring-4 focus-within:ring-primary/10 ${className}`}
    >
      <div className="pl-4 text-primary/70 shrink-0">
        <Search size={20} />
      </div>
      
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 h-12 min-h-[48px] border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 text-base text-foreground placeholder-muted-foreground"
      />
      
      <Button
        type="submit"
        className="rounded-full px-8 h-12 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
      >
        Rechercher
      </Button>
    </form>
  );
}
