import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/product/$handle")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-ink text-bone flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/merch" className="text-primary hover:underline text-sm">
          Back to merch
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { handle } = Route.useParams();
  const [imgIndex, setImgIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["shopify", "product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <Nav />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!product) throw notFound();

  const images = product.node.images.edges;
  const variant = product.node.variants.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;
  const mainImage = images[imgIndex]?.node;

  const handleAdd = async () => {
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
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Link
            to="/merch"
            className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors mb-10"
          >
            <ArrowLeft className="w-3 h-3" /> All Merch
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="aspect-square bg-secondary/10 border border-border/40 overflow-hidden mb-4">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.altText ?? product.node.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] tracking-editorial uppercase text-muted-foreground/50">
                      No image
                    </span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-16 h-16 border ${
                        i === imgIndex ? "border-primary" : "border-border/40"
                      } overflow-hidden`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:pt-6">
              <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">
                {product.node.productType || "Merch"}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-bone leading-tight">
                {product.node.title}
              </h1>
              <p className="font-display text-3xl text-bone mt-6">
                ${parseFloat(price.amount).toFixed(2)}
              </p>
              {product.node.description && (
                <p className="mt-8 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.node.description}
                </p>
              )}

              <Button
                onClick={handleAdd}
                disabled={!variant || isLoading || !variant.availableForSale}
                size="lg"
                className="mt-10 w-full md:w-auto md:min-w-64 tracking-editorial uppercase text-[11px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : !variant?.availableForSale ? (
                  "Sold out"
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}