import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/site/CartDrawer";

const links = [
  { to: "/", label: "Index" },
  { to: "/", label: "Artists", hash: "artists" },
  { to: "/", label: "Gallery", hash: "gallery" },
  { to: "/", label: "About", hash: "about" },
  { to: "/", label: "Contact", hash: "contact" },
];

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
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
          <a
            href="/#book"
            className="text-[11px] tracking-editorial uppercase px-5 py-2.5 border border-bone/80 text-bone hover:bg-bone hover:text-ink transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </header>
  );
}