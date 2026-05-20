import { MapPin, Phone, Clock, Mail } from "lucide-react";

const info = [
  { icon: MapPin, label: "Visit", value: "1356 Cleveland St\nClearwater, FL 33755" },
  { icon: Phone, label: "Call", value: "(727) 953-8534", href: "tel:+17279538534" },
  { icon: Clock, label: "Hours", value: "Tue – Sat\n12 – 8 PM" },
  { icon: Mail, label: "Inquire", value: "Use the booking form", href: "#book" },
];

export function Contact() {
  return (
    <section id="contact-section" className="relative bg-ink py-28 md:py-40 border-t border-border/60">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Contact
            </p>
            <h2 className="font-display text-bone text-5xl md:text-6xl leading-[0.95]">
              Come see <span className="italic text-muted-foreground">the room.</span>
            </h2>

            <dl className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {info.map(({ icon: Icon, label, value, href }) => (
                <div key={label}>
                  <dt className="flex items-center gap-2 text-[10px] tracking-editorial uppercase text-primary mb-3">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </dt>
                  <dd className="text-sm text-bone whitespace-pre-line leading-relaxed">
                    {href ? (
                      <a href={href} className="hover:text-primary transition-colors">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="relative aspect-[4/5] md:aspect-[4/5] border border-border overflow-hidden bg-secondary">
              <iframe
                title="Revival Tattoo Collective — Clearwater, FL"
                src="https://www.google.com/maps?q=1356+Cleveland+St+Clearwater+FL+33755&output=embed"
                className="w-full h-full grayscale contrast-125 opacity-80 hover:opacity-100 transition-opacity"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
            <p className="mt-4 text-[10px] tracking-editorial uppercase text-muted-foreground">
              1356 Cleveland St · Clearwater, Florida
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}