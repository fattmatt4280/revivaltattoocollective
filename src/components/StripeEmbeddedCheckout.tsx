import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface CartLine {
  priceId: string;
  quantity: number;
}

interface Props {
  items?: CartLine[];
  customerEmail?: string;
  returnUrl?: string;
  /** Optional custom fetcher — overrides the default cart-based fetcher. */
  fetchClientSecret?: () => Promise<string>;
}

export function StripeEmbeddedCheckout({ items, customerEmail, returnUrl, fetchClientSecret }: Props) {
  const defaultFetcher = async (): Promise<string> => {
    if (!items) throw new Error("No items provided");
    const result = await createCheckoutSession({
      data: {
        items,
        customerEmail,
        returnUrl:
          returnUrl ||
          `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret: fetchClientSecret ?? defaultFetcher }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}