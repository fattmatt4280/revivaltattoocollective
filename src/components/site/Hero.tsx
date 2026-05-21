export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ink">
      {/* Layered backdrop */}
      <div className="absolute inset-0 bg-grain opacity-60" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.22 0.08 25 / 0.45), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 60%, oklch(0.08 0.003 20) 100%)",
        }}
      />

      {/* Top label bar */}
      <div className="absolute top-24 left-0 right-0 z-10 px-6 md:px-10">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between text-[10px] tracking-editorial uppercase text-muted-foreground">
          <span>Clearwater, FL — Est. Collective</span>
          <span className="hidden md:inline">Tattoo · Sign Painting · Lettering · Color Realism</span>
          <span>N° 001</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center pt-40 md:pt-32 px-6 md:px-10">
        <div className="mx-auto max-w-[1600px] w-full">
          <p className="text-[11px] tracking-editorial uppercase text-primary mb-8 animate-fade-in">
            Revival Tattoo Collective
          </p>

          <h1 className="font-display text-bone leading-[0.92] tracking-[-0.02em] animate-fade-up">
            <span className="block text-[clamp(3.5rem,11vw,11rem)] font-normal">
              Ink as
            </span>
            <span className="block text-[clamp(3.5rem,11vw,11rem)] italic font-light text-muted-foreground">
              artifact.
            </span>
          </h1>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <p
              className="md:col-span-5 md:col-start-7 text-base md:text-lg text-muted-foreground leading-relaxed max-w-md animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Expert tattoo and sign painting in Clearwater, Florida — minutes
              from Clearwater Beach. A gallery-forward studio where editorial
              restraint meets the physicality of the needle.
            </p>
          </div>

          <div
            className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="#book"
              className="group inline-flex items-center gap-4 px-8 py-4 bg-bone text-ink text-[11px] tracking-editorial uppercase font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Reserve a Session
              <span className="w-6 h-px bg-current transition-all group-hover:w-10" />
            </a>
            <a
              href="#artists"
              className="text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
            >
              Meet the Artists
            </a>
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-12 px-6 text-[11px] tracking-editorial uppercase text-muted-foreground"
            >
              <span>Walk-Ins by Appointment</span>
              <span className="text-primary">◆</span>
              <span>Color Realism — Matt</span>
              <span className="text-primary">◆</span>
              <span>Traditional — Ashlyn</span>
              <span className="text-primary">◆</span>
              <span>Lettering — Brady</span>
              <span className="text-primary">◆</span>
              <span>Revival Tattoo Collective</span>
              <span className="text-primary">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}