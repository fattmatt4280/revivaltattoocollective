export function Footer() {
  return (
    <footer id="contact" className="bg-ink border-t border-border/60 py-16">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="font-display text-bone text-3xl leading-tight">
              Revival Tattoo<br />
              <span className="italic text-muted-foreground">Collective.</span>
            </p>
            <p className="mt-6 text-sm text-muted-foreground max-w-sm">
              A custom tattoo studio. Walk-ins welcome. Appointments recommended.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">Visit</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              519 Highland Ave N, Suite A<br />
              Largo, FL 33770<br />
              <a href="tel:+17276008001" className="hover:text-bone transition-colors">(727) 600-8001</a>
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">Follow</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://instagram.com/shyftd.ink" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors">@shyftd.ink</a></li>
              <li><a href="https://instagram.com/inkbyashlyn" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors">@inkbyashlyn</a></li>
              <li><a href="https://instagram.com/revivalletters" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors">@revivalletters</a></li>
              <li><a href="https://facebook.com/" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors">Facebook</a></li>
              <li><a href="https://tiktok.com/" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors">TikTok</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">Site</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#artists" className="hover:text-bone transition-colors">Artists</a></li>
              <li><a href="#gallery" className="hover:text-bone transition-colors">Gallery</a></li>
              <li><a href="#book" className="hover:text-bone transition-colors">Book</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] tracking-editorial uppercase text-muted-foreground/70">
          <span>© {new Date().getFullYear()} Revival Tattoo Collective</span>
          <span>revivaltattoocollective.com</span>
        </div>
      </div>
    </footer>
  );
}