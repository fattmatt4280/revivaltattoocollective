import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/site/CartDrawer";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Index" },
  { to: "/", label: "Artists", hash: "artists" },
  { to: "/", label: "Gallery", hash: "gallery" },
  { to: "/", label: "About", hash: "about" },
  { to: "/", label: "Contact", hash: "contact" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <span className="w-2 h-2 rounded-full bg-primary shadow-accent group-hover:scale-125 transition-transform" />
            <span className="font-display text-base tracking-[0.22em] uppercase text-bone">
              Revival
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-[11px] tracking-editorial uppercase text-muted-foreground">
            {links.slice(1).map((l) => (
              <a
                key={l.label}
                href={`#${l.hash}`}
                className="hover:text-bone transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link to="/merch" className="hover:text-bone transition-colors">
              Merch
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <CartDrawer />
            {user ? (
              <Link
                to="/admin"
                className="hidden md:inline-flex text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                {isAdmin ? "Admin" : "Account"}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                Sign In
              </Link>
            )}
            <a
              href="/#book"
              className="hidden md:inline-flex text-[11px] tracking-editorial uppercase px-5 py-2.5 border border-bone/80 text-bone hover:bg-bone hover:text-ink transition-colors"
            >
              Book Now
            </a>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-9 h-9 text-bone"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink pt-16 flex flex-col">
          <nav className="flex flex-col px-6 pt-10 gap-0">
            {links.slice(1).map((l) => (
              <a
                key={l.label}
                href={`#${l.hash}`}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border/40 py-5 font-display text-bone text-4xl leading-none hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/merch"
              onClick={() => setMobileOpen(false)}
              className="border-b border-border/40 py-5 font-display text-bone text-4xl leading-none hover:text-primary transition-colors"
            >
              Merch
            </Link>
          </nav>
          <div className="px-6 pt-10 flex flex-col gap-4">
            <a
              href="/#book"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-4 text-[11px] tracking-editorial uppercase text-bone border border-bone/80 px-6 py-3 hover:bg-bone hover:text-ink transition-colors"
            >
              Book Now <span className="text-primary">→</span>
            </a>
            {user ? (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                {isAdmin ? "Admin Panel" : "Account"}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}