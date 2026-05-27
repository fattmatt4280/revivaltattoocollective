import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Package, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUS_OPTIONS = ["paid", "packed", "shipped", "delivered", "refunded", "cancelled"] as const;

type OrderItem = {
  name: string;
  quantity: number;
  unit_amount_cents: number;
  amount_total_cents: number;
};

type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

function AdminOrders() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const updateTracking = useMutation({
    mutationFn: async ({ id, tracking_number }: { id: string; tracking_number: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ tracking_number })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tracking saved");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <AdminShell title="Orders" subtitle="Shop orders. Update status as you pack and ship.">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="border border-border/40 py-20 text-center">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            const items = (order.items as unknown as OrderItem[]) || [];
            const address = (order.shipping_address as ShippingAddress | null) ?? null;
            return (
              <div key={order.id} className="border border-border/40 bg-secondary/20">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-bone truncate">{order.customer_email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="font-display text-bone">{formatPrice(order.total_cents)}</div>
                    <div>
                      <span
                        className={`inline-block text-[10px] tracking-editorial uppercase px-2 py-1 border ${
                          order.status === "paid"
                            ? "border-primary/60 text-primary"
                            : order.status === "shipped" || order.status === "delivered"
                              ? "border-green-700 text-green-500"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="hidden md:block text-right text-muted-foreground">
                      {isOpen ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-6 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-3">
                        Items
                      </p>
                      <ul className="space-y-2 text-sm">
                        {items.map((item, i) => (
                          <li key={i} className="flex justify-between gap-4 border-b border-border/30 pb-2">
                            <span className="text-bone">
                              {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
                            </span>
                            <span className="font-display text-bone whitespace-nowrap">
                              {formatPrice(item.amount_total_cents)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal_cents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>{formatPrice(order.shipping_cents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>{formatPrice(order.tax_cents)}</span>
                        </div>
                        <div className="flex justify-between font-display text-bone text-sm pt-2 border-t border-border/30">
                          <span>Total</span>
                          <span>{formatPrice(order.total_cents)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-2 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Shipping address
                        </p>
                        {address ? (
                          <address className="not-italic text-sm text-bone leading-relaxed">
                            {address.name && <div>{address.name}</div>}
                            {address.line1 && <div>{address.line1}</div>}
                            {address.line2 && <div>{address.line2}</div>}
                            <div>
                              {address.city}
                              {address.state ? `, ${address.state}` : ""} {address.postal_code}
                            </div>
                            {address.country && <div>{address.country}</div>}
                          </address>
                        ) : (
                          <p className="text-sm text-muted-foreground">No address captured</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-2 block">
                          Status
                        </label>
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}
                        >
                          <SelectTrigger className="w-full rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <TrackingForm
                        initial={order.tracking_number ?? ""}
                        onSave={(tracking_number) =>
                          updateTracking.mutate({ id: order.id, tracking_number })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function TrackingForm({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <label className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-2 block">
        Tracking number
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="USPS / UPS / FedEx"
          className="rounded-none"
        />
        <Button
          variant="outline"
          onClick={() => onSave(value)}
          disabled={value === initial}
          className="rounded-none text-[10px] tracking-editorial uppercase"
        >
          Save
        </Button>
      </div>
    </div>
  );
}