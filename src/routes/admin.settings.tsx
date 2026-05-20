import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Meta = { title: string; description: string };
type Contact = { address: string; phone: string; hours: string };

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, unknown>;
      return {
        meta: (map.meta as Meta) ?? { title: "", description: "" },
        contact: (map.contact as Contact) ?? { address: "", phone: "", hours: "" },
      };
    },
  });

  const [meta, setMeta] = useState<Meta>({ title: "", description: "" });
  const [contact, setContact] = useState<Contact>({ address: "", phone: "", hours: "" });

  useEffect(() => {
    if (data) {
      setMeta(data.meta);
      setContact(data.contact);
    }
  }, [data]);

  const saveKey = async (key: string, value: Meta | Contact) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: value as never });
    if (error) return toast.error(error.message);
    toast.success(`${key} saved`);
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  };

  return (
    <AdminShell title="Settings" subtitle="Page titles, meta descriptions, and contact info.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="SEO Meta">
          <Field label="Page title">
            <Input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} className="rounded-none bg-ink border-border" />
          </Field>
          <Field label="Meta description">
            <Textarea rows={3} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} className="rounded-none bg-ink border-border" />
          </Field>
          <SaveBtn onClick={() => saveKey("meta", meta)} />
        </Card>

        <Card title="Contact">
          <Field label="Address">
            <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className="rounded-none bg-ink border-border" />
          </Field>
          <Field label="Phone">
            <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="rounded-none bg-ink border-border" />
          </Field>
          <Field label="Hours">
            <Input value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} className="rounded-none bg-ink border-border" />
          </Field>
          <SaveBtn onClick={() => saveKey("contact", contact)} />
        </Card>
      </div>
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-secondary/30 p-6 space-y-4">
      <h2 className="font-display text-2xl text-bone">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] tracking-editorial uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function SaveBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]">
      Save
    </Button>
  );
}