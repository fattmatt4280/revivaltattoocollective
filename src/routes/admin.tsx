import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { claimFirstAdminRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Revival Tattoo Collective" },
      { name: "description", content: "Studio administration for Revival Tattoo Collective." },
      { property: "og:title", content: "Admin — Revival Tattoo Collective" },
      { property: "og:description", content: "Studio administration." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, refreshRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-ink text-muted-foreground flex items-center justify-center text-[11px] tracking-editorial uppercase">
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return <ClaimAdmin onClaimed={refreshRole} />;
  }

  return <Outlet />;
}

function ClaimAdmin({ onClaimed }: { onClaimed: () => Promise<void> }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const claimFirstAdmin = useServerFn(claimFirstAdminRole);

  const claim = async () => {
    if (!user) return;
    try {
      await claimFirstAdmin();
      toast.success("You are now the studio admin.");
      await onClaimed();
    } catch (error) {
      toast.error("Could not claim admin role. " + (error instanceof Error ? error.message : "Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-[11px] tracking-editorial uppercase text-primary mb-4">§ Access</p>
        <h1 className="font-display text-4xl mb-4">No admin role.</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You're signed in as <span className="text-bone">{user?.email}</span>, but you don't have admin
          access yet. If you're the first user, claim the admin role below.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={claim}
            className="rounded-none h-11 bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
          >
            Claim admin role
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="rounded-none h-11 text-[11px] tracking-editorial uppercase text-muted-foreground"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}