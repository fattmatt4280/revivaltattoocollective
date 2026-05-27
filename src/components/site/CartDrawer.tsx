import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { getProduct, formatPrice } from "@/lib/products";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineItems = items
    .map((item) => ({ item, product: getProduct(item.productId) }))
    .filter((x): x is { item: typeof items[number]; product: NonNullable<ReturnType<typeof getProduct>> } => !!x.product);

  const totalItems = lineItems.reduce((sum, { item }) => sum + item.quantity, 0);
  const subtotalCents = lineItems.reduce(
    (sum, { item, product }) => sum + product.priceCents * item.quantity,
    0,
  );

  const handleCheckout = () => {
    setIsOpen(false);
    navigate({ to: "/checkout" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative w-9 h-9 flex items-center justify-center text-bone hover:text-primary transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full p-0 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-ink text-bone border-l border-border/60">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-bone">Cart</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {lineItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {lineItems.map(({ item, product }) => (
                    <div key={item.productId} className="flex gap-4 p-2">
                      <div className="w-16 h-16 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={1024}
                          height={1024}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-bone">{product.name}</h4>
                        <p className="font-semibold text-bone mt-1">
                          {formatPrice(product.priceCents)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-bone"
                          onClick={() => removeItem(item.productId)}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border/60">
                <div className="flex justify-between items-center">
                  <span className="text-sm tracking-editorial uppercase text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-xl font-display text-bone">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>
                <p className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                  Shipping & tax calculated at checkout
                </p>
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={lineItems.length === 0}
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}