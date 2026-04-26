import type { Seller } from "@/types";
import { formatDistance, formatRating, formatCount } from "@/utils/formatters";
import { BadgeCheck, Star, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerCardProps {
  seller: Seller;
  onClick?: (slug: string) => void;
  className?: string;
}

export function SellerCard({ seller, onClick, className = "" }: SellerCardProps) {
  const avatarInitials = seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={() => onClick?.(seller.slug)}
      className={`group relative w-64 flex flex-col bg-transparent cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
    >
      {/* Container Image avec Shadow "Airy" */}
      <div className="relative h-72 w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
        <img
          src={seller.coverImage}
          alt={seller.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay dégradé pour la lisibilité */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status "Ouvert" minimaliste style "Point de lumière" */}
        <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${seller.openNow ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[9px] font-bold tracking-widest uppercase text-black">
            {seller.openNow ? "Disponible" : "Fermé"}
          </span>
        </div>

        {/* Bouton d'action flottant */}
        <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Zone Infos sous la carte */}
      <div className="mt-5 px-2 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase">
            {seller.category}
          </span>
          {seller.verified && <BadgeCheck size={12} className="text-primary" />}
        </div>

        <h3 className="text-base font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
          {seller.name}
        </h3>

        {/* Rating & Distance stylisés */}
        <div className="flex items-center justify-center gap-3 text-muted-foreground/60 text-[10px] font-bold tracking-tighter">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-primary text-primary border-none" />
            <span className="text-foreground">{formatRating(seller.rating)}</span>
            <span>({formatCount(seller.reviewCount)})</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{formatDistance(seller.distance)}</span>
        </div>

        {/* Avatar traité comme un logo de marque en bas */}
        <div className="mt-4 flex items-center gap-3">
            <Avatar className="w-6 h-6 border border-border/40">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="text-[8px]">{avatarInitials}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-muted-foreground italic">
                {seller.productCount} créations
            </span>
        </div>
      </div>
    </div>
  );
}