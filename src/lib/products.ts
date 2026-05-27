import print1114 from "@/assets/print-1114.jpg";
import print1824 from "@/assets/print-1824.jpg";

export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
  type: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "signed_print_11x14",
    priceId: "signed_print_11x14_usd",
    name: "Signed Art Print 11×14",
    description:
      "Signed and numbered 11×14 archival print from a Revival artist. Shipped flat from the studio in Largo, FL.",
    priceCents: 4500,
    image: print1114,
    type: "Print",
  },
  {
    id: "large_format_print_18x24",
    priceId: "large_format_print_18x24_usd",
    name: "Large Format Print 18×24",
    description:
      "Limited 18×24 art print from a Revival artist. Shipped rolled in a kraft tube from the studio in Largo, FL.",
    priceCents: 8500,
    image: print1824,
    type: "Print",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return PRODUCTS.find((p) => p.priceId === priceId);
}

export function formatPrice(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}