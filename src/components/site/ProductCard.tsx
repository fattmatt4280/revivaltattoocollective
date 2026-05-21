import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const variant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <div className="group flex flex-col">
      <Link
        to="/product/$handle"
        params={{ handle: product.node.handle }}
        className="block aspect-square bg-secondary/10 border border-border/40 overflow-hidden mb-4"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? product.node.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] tracking-editorial uppercase text-muted-foreground/50">
              No image
            </span>
          </div>
        )}
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/product/$handle"
            params={{ handle: product.node.handle }}
            className="block"
          >
            <h3 className="font-display text-lg text-bone leading-tight truncate hover:text-primary transition-colors">
              {product.node.title}
            </h3>
          </Link>
          <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mt-1">
            {product.node.productType || "Merch"}
          </p>
        </div>
        <p className="font-display text-bone text-lg whitespace-nowrap">
          ${parseFloat(price.amount).toFixed(0)}
        </p>
      </div>
      <Button
        onClick={handleAdd}
        disabled={!variant || isLoading || !variant.availableForSale}
        variant="outline"
        className="mt-4 w-full text-[11px] tracking-editorial uppercase"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : !variant?.availableForSale ? (
          "Sold out"
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}