import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Merch — Revival Tattoo Collective" },
      {
        name: "description",
        content:
          "Signed prints and limited drops from Revival Tattoo Collective in Largo, FL.",
      },
      { property: "og:title", content: "Merch — Revival Tattoo Collective" },
      {
        property: "og:description",
        content: "Signed prints and limited drops from Revival Tattoo Collective.",
      },
      { property: "og:url", content: "https://revivaltattoocollective.com/merch" },
    ],
    links: [
      { rel: "canonical", href: "https://revivaltattoocollective.com/merch" },
    ],
  }),
  component: MerchPage,
});

function MerchPage() {
  return (
    <div className="min-h-screen bg-ink text-bone">
      <PaymentTestModeBanner />
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
              Signed prints and limited drops from the collective. Shipped from the studio in
              Largo, FL.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}