import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Image, CalendarDays, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState, type ReactNode } from "react";

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
  const [navOpen, setNavOpen] = useState(false);

  // Auto-close the menu whenever the route changes (i.e., a tab is selected)
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex relative">
      {navOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
      <aside
        className={`fixed z-40 top-0 left-0 h-screen w-64 border-r border-border/60 bg-ink flex flex-col transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

      <main className="flex-1 overflow-auto w-full">
        <header className="px-6 md:px-10 py-6 md:py-8 border-b border-border/60 flex items-start gap-4">
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="mt-1 inline-flex items-center justify-center w-10 h-10 border border-border/60 text-bone hover:bg-secondary/50 transition-colors"
          >
            {navOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-2">§ {title}</p>
            <h1 className="font-display text-bone text-3xl md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}