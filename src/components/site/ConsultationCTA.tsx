export function ConsultationCTA({
  headline = "Ready to begin?",
  sub = "Book a consultation — no deposit until we align on your vision.",
}: {
  headline?: string;
  sub?: string;
}) {
  return (
    <div className="border-t border-border/40 bg-secondary/5 py-16 md:py-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="text-[11px] tracking-editorial uppercase text-primary mb-3">§ Next step</p>
          <h3 className="font-display text-bone text-3xl md:text-4xl leading-[0.95]">
            {headline}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">{sub}</p>
        </div>
        <a
          href="/#book"
          className="btn-liquid shrink-0 inline-flex items-center gap-4 px-8 py-4 text-sm tracking-wide uppercase font-medium rounded-xl"
        >
          Reserve a Session
          <span className="w-6 h-px bg-current" />
        </a>
      </div>
    </div>
  );
}
