const items = [
  "COLOR REALISM",
  "SURREALISM",
  "AMERICAN TRADITIONAL",
  "LETTERING",
  "SIGN PAINTING",
  "BLACKWORK",
  "FINE LINE",
  "CUSTOM SCRIPT",
  "PORTRAIT",
  "NEO TRADITIONAL",
];

function TickerRow({
  speed = "animate-marquee",
  accent = false,
}: {
  speed?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex overflow-hidden whitespace-nowrap select-none">
      <div className={`flex items-center gap-0 shrink-0 ${speed}`}>
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-6 px-6 ${
              accent
                ? "text-primary text-[11px] tracking-editorial uppercase font-normal"
                : "text-muted-foreground/50 text-[11px] tracking-editorial uppercase font-normal"
            }`}
          >
            {item}
            <span className={accent ? "text-bone/30" : "text-border"}>—</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StyleTicker() {
  return (
    <div className="relative overflow-hidden border-y border-border/40 bg-ink py-0">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-ink to-transparent" />

      <div className="py-3">
        <TickerRow speed="animate-marquee" />
      </div>
      <div className="border-t border-border/20 py-3">
        <TickerRow speed="animate-marquee-reverse" accent />
      </div>
    </div>
  );
}
