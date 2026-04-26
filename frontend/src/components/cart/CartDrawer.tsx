import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/formatters";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Button from "@/components/reusable/Button";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le panier"
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside
        className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 id="cart-drawer-title" className="text-lg font-semibold text-foreground">
              Panier
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 rounded-xl border border-border/60 bg-card p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight text-foreground line-clamp-2">
                      {product.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(product.price)} / unité
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(product.id)}
                        aria-label="Retirer du panier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <Button type="button" className="w-full" onClick={closeCart}>
              Continuer
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
