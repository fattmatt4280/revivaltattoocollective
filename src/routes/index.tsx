import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Artists } from "@/components/site/Artists";
import { Gallery } from "@/components/site/Gallery";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { BookingForm } from "@/components/site/BookingForm";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revival Tattoo Collective — Editorial Tattoo Studio in Largo, FL" },
      { name: "description", content: "Revival Tattoo Collective is a gallery-forward tattoo studio in Largo, FL specializing in color realism, surrealism, traditional, and lettering work." },
      { property: "og:title", content: "Revival Tattoo Collective — Editorial Tattoo Studio in Largo, FL" },
      { property: "og:description", content: "Color realism, surrealism, traditional, and lettering tattoos from a Largo, FL collective." },
      { property: "og:url", content: "https://revivaltattoocollective.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://revivaltattoocollective.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TattooParlor",
          name: "Revival Tattoo Collective",
          url: "https://revivaltattoocollective.com",
          telephone: "+1-727-600-8001",
          address: {
            "@type": "PostalAddress",
            streetAddress: "519 Highland Ave N, Suite A",
            addressLocality: "Largo",
            addressRegion: "FL",
            postalCode: "33770",
            addressCountry: "US",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "11:00",
              closes: "20:00",
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main>
        <Hero />
        <Artists />
        <Gallery />
        <About />
        <BookingForm />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
