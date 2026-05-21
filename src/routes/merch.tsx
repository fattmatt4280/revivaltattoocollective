import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Merch — Revival Tattoo Collective" },
      {
        name: "description",
        content:
          "Stickers, prints, and limited merch from Revival Tattoo Collective in Largo, FL.",
      },
      { property: "og:title", content: "Merch — Revival Tattoo Collective" },
      {
        property: "og:description",
        content: "Stickers, prints, and limited merch from Revival Tattoo Collective.",
      },
    ],
  }),
  component: MerchPage,
});

function MerchPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["shopify", "products"],
    queryFn: () => fetchProducts(50),
  });

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <header className="mb-16 max-w-2xl">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">Shop</p>
            <h1 className="font-display text-5xl md:text-7xl text-bone leading-[0.95]">
              Merch &<br />
              <span className="italic text-muted-foreground">Prints.</span>
            </h1>
            <p className="mt-6 text-muted-foreground max-w-md">
              Stickers, signed prints, and limited drops from the collective. Shipped from the
              studio in Largo, FL.
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="border border-border/40 py-32 text-center">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}