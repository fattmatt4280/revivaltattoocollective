import { Instagram } from "lucide-react";

export type Artist = {
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  handles: { handle: string; url: string }[];
  accentNumber: string;
};

export const ARTISTS: Artist[] = [
  {
    slug: "brady",
    name: "Brady Martin",
    specialty: "Lettering · Sign Painting · Owner",
    bio:
      "Founder of Revival. Brady is a tattooist and sign painter — script, blackletter, and custom typography on skin. He treats every word as architecture: measured, weighted, and built to live a lifetime.",
    handles: [
      { handle: "@revivalletters", url: "https://instagram.com/revivalletters" },
    ],
    accentNumber: "01",
  },
  {
    slug: "ashlyn",
    name: "Ashlyn",
    specialty: "American Traditional",
    bio:
      "Bold lines, packed color, and the discipline of tradition. Ashlyn approaches every flash sheet with reverence for the form and an editor's eye.",
    handles: [
      { handle: "@inkbyashlyn", url: "https://instagram.com/inkbyashlyn" },
    ],
    accentNumber: "02",
  },
  {
    slug: "matt",
    name: "Matt",
    specialty: "Color Realism · Surrealism",
    bio:
      "Saturated, dream-state portraits and surreal compositions. Matt builds pieces that read like still frames pulled from a half-remembered film.",
    handles: [
      { handle: "@shyftd.ink", url: "https://instagram.com/shyftd.ink" },
    ],
    accentNumber: "03",
  },
];

function ThumbPlaceholder({ name, idx }: { name: string; idx: number }) {
  return (
    <div
      className="relative aspect-[3/4] overflow-hidden bg-secondary border border-border/60 group/thumb"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.006 20) 0%, oklch(0.13 0.005 20) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <span className="text-[9px] tracking-editorial uppercase text-muted-foreground/60 mb-2">
          Plate {idx}
        </span>
        <span className="font-display text-bone/70 text-sm">{name}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="group relative border-t border-border pt-10 pb-12">
      <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
        {/* Accent number */}
        <div className="col-span-12 md:col-span-1">
          <span className="font-display text-primary text-xl">
            {artist.accentNumber}
          </span>
        </div>

        {/* Name + meta */}
        <header className="col-span-12 md:col-span-4">
          <h3 className="font-display text-bone text-5xl md:text-6xl leading-none">
            {artist.name}
          </h3>
          <p className="mt-4 text-[11px] tracking-editorial uppercase text-primary">
            {artist.specialty}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-sm">
            {artist.bio}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {artist.handles.map((h) => (
              <a
                key={h.handle}
                href={h.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                {h.handle}
              </a>
            ))}
          </div>

          <a
            href={`#book?artist=${artist.slug}`}
            className="mt-8 inline-flex items-center gap-4 text-[11px] tracking-editorial uppercase text-bone border-b border-bone/40 pb-1 hover:border-primary hover:text-primary transition-colors"
          >
            Book with {artist.name}
            <span className="text-primary">→</span>
          </a>
        </header>

        {/* Thumbs */}
        <div className="col-span-12 md:col-span-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ThumbPlaceholder key={i} name={artist.name} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Artists() {
  return (
    <section id="artists" className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Roster
            </p>
            <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95] max-w-3xl">
              Three artists, <span className="italic text-muted-foreground">three obsessions.</span>
            </h2>
          </div>
          <span className="hidden md:block font-display text-muted-foreground text-sm">
            03 — Collective
          </span>
        </div>

        <div>
          {ARTISTS.map((a) => (
            <ArtistCard key={a.slug} artist={a} />
          ))}
        </div>
      </div>
    </section>
  );
}