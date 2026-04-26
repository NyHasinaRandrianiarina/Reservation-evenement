import type { Category } from "@/types";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface CategoryCardProps {
  category: Category;
  onClick: (slug: string) => void;
  className?: string;
}

// Map pour résoudre dynamiquement les icônes à partir de lucide-react
const iconMap: Record<string, ComponentType<LucideProps>> = {
  ShoppingBag: LucideIcons.ShoppingBag,
  Palette: LucideIcons.Palette,
  Shirt: LucideIcons.Shirt,
  Home: LucideIcons.Home,
  Smartphone: LucideIcons.Smartphone,
  Sparkles: LucideIcons.Sparkles,
  Dumbbell: LucideIcons.Dumbbell,
  UtensilsCrossed: LucideIcons.UtensilsCrossed,
  Wrench: LucideIcons.Wrench,
  Package: LucideIcons.Package,
};

export function CategoryCard({
  category,
  onClick,
  className = "",
}: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || LucideIcons.Package;

  return (
    <button
      onClick={() => onClick(category.slug)}
      className={`
        group relative flex flex-col items-center justify-center 
        w-full min-w-[120px] sm:min-w-[140px] p-6 rounded-[2rem] 
        bg-card border border-border/40
        /* Ombre très fine et diffuse au repos */
        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] 
        transition-all duration-500 ease-out
        /* Au survol : on réduit le lift et on adoucit l'ombre */
        hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]
        hover:border-primary/30 outline-none cursor-pointer 
        ${className}
      `}
      aria-label={`Catégorie ${category.name}`}
    >
      {/* Lueur subtile (Glow) au lieu d'une ombre colorée forte */}
      <div className="absolute inset-0 bg-radial from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Conteneur d'icône plus épuré */}
      <div
        className={`
          relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 
          transition-all duration-500 bg-secondary/30
          group-hover:scale-110 group-hover:bg-primary/10
        `}
      >
        <IconComponent 
          size={24} 
          className="text-foreground/70 group-hover:text-primary transition-colors duration-300" 
        />
      </div>
      
      <span className="relative z-10 text-sm font-bold tracking-tight text-foreground/80 text-center group-hover:text-primary transition-colors duration-300">
        {category.name}
      </span>
      
      {/* Badge de compte produit plus discret */}
      <div className="relative z-10 mt-3 text-[12px] font-bold tracking-widest text-muted-foreground/60 group-hover:text-primary/70 transition-colors duration-300">
        {category.productCount} produits
      </div>

      {/* Bordure de brillance sur le dessus (effet luxe) */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </button>
  );
}
