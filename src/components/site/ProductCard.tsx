import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { type Product, formatPrice } from "@/lib/products";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group flex flex-col">
      <div className="block aspect-square bg-secondary/10 border border-border/40 overflow-hidden mb-4">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg text-bone leading-tight truncate">
            {product.name}
          </h3>
          <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mt-1">
            {product.type}
          </p>
        </div>
        <p className="font-display text-bone text-lg whitespace-nowrap">
          {formatPrice(product.priceCents)}
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      <Button
        onClick={handleAdd}
        variant="outline"
        className="mt-4 w-full text-[11px] tracking-editorial uppercase"
      >
        Add to Cart
      </Button>
    </div>
  );
}