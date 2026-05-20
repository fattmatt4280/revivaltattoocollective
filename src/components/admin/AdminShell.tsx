import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Image, CalendarDays, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/artists", label: "Artists", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <aside className="w-64 border-r border-border/60 bg-ink flex flex-col">
        <div className="px-6 py-6 border-b border-border/60">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-display tracking-[0.22em] uppercase text-sm">Revival</span>
          </Link>
          <p className="mt-2 text-[10px] tracking-editorial uppercase text-muted-foreground">
            Studio Admin
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-editorial uppercase transition-colors ${
                  active
                    ? "bg-secondary text-bone border-l-2 border-primary"
                    : "text-muted-foreground hover:text-bone hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/60">
          <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-2">
            Signed in
          </p>
          <p className="text-xs text-bone truncate mb-3">{user?.email}</p>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full rounded-none border-border text-[10px] tracking-editorial uppercase"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-10 py-8 border-b border-border/60">
          <p className="text-[11px] tracking-editorial uppercase text-primary mb-2">§ {title}</p>
          <h1 className="font-display text-bone text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </header>
        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}