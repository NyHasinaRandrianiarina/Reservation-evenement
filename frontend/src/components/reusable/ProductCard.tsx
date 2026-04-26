import type { Product } from "@/types";
import { formatPrice, formatDistance } from "@/utils/formatters";
import { Heart, MapPin } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (productId: string) => void;
  onClick?: (slug: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  onWishlist,
  onClick,
  className = "",
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
    else addItem(product);
  };

  return (
    <div 
      onClick={() => onClick?.(product.slug)}
      className={`group relative flex flex-col bg-transparent ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Container Image avec Zoom */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-muted/30">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Wishlist flottante style Glass */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.(product.id);
          }}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black cursor-pointer"
        >
          <Heart size={18} />
        </button>

        {/* Badge minimaliste */}
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-xl">
            <span className="text-[9px] font-black tracking-tighter uppercase text-black">New</span>
          </div>
        )}

        {/* Overlay Rupture */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white border border-white/30 px-4 py-2">
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* Infos Produit */}
      <div className="pt-3 px-1 flex flex-col items-center text-center">
        <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">
          {product.seller.name}
        </span>
        <h3 className="text-sm font-medium text-foreground tracking-tight line-clamp-1 mb-1">
          {product.title}
        </h3>
        <p className="text-sm font-bold text-primary">
          {formatPrice(product.price)}
        </p>
        
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <MapPin size={10} className="text-muted-foreground" />
           <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
             {formatDistance(product.seller.distance)}
           </span>
        </div>
      </div>

      {/* Bouton Add to Cart visible par défaut */}
      <button
        disabled={isOutOfStock}
        onClick={handleAddToCart}
        className="mt-2 w-full py-2.5 bg-foreground text-background text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl transition-all duration-300 hover:bg-primary cursor-pointer disabled:opacity-30 disabled:hover:bg-foreground"
      >
        Ajouter au panier
      </button>
    </div>
  );
}
