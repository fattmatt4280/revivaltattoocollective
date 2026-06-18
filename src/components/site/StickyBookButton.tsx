import { useState, useEffect } from "react";

export function StickyBookButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY > 500;
      const bookSection = document.getElementById("book");
      if (bookSection) {
        const rect = bookSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        setVisible(scrolled && !inView);
      } else {
        setVisible(scrolled);
      }
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <a
      href="/#book"
      aria-label="Book a session"
      className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 px-6 py-3.5 bg-primary text-primary-foreground text-[11px] tracking-editorial uppercase font-medium shadow-accent transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      Book Now
      <span className="w-4 h-px bg-current" />
    </a>
  );
}
