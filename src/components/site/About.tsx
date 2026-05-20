export function About() {
  return (
    <section id="about" className="relative bg-ink py-28 md:py-40 border-t border-border/60">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § About
            </p>
            <h2 className="font-display text-bone text-5xl md:text-6xl leading-[0.95]">
              Florida tattoo artists <span className="italic text-muted-foreground">with a passion.</span>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              Revival Tattoo Collective sits just minutes from Clearwater
              Beach — the home shop for some of the most knowledgeable
              tattoo artists in Florida. Full-time residents and rotating
              guest artists, all with years behind the machine.
            </p>
            <p>
              If you're looking for a one-of-a-kind tattoo — whether it's
              built off a reference or a half-formed idea — it takes a real
              artist to bring the vision into focus. That's the work we do
              here. By appointment, by consultation, by collaboration.
            </p>
            <p className="text-bone">
              Local to Florida or traveling through? Book a session.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}