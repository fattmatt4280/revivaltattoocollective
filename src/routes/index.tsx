import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { StyleTicker } from "@/components/site/StyleTicker";
import { Artists } from "@/components/site/Artists";
import { Gallery } from "@/components/site/Gallery";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { BookingForm } from "@/components/site/BookingForm";
import { Footer } from "@/components/site/Footer";
import { StickyBookButton } from "@/components/site/StickyBookButton";
import { ConsultationCTA } from "@/components/site/ConsultationCTA";
import { InstagramSection } from "@/components/site/InstagramSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revival Tattoo Collective — Editorial Tattoo Studio in Clearwater, FL" },
      {
        name: "description",
        content:
          "Revival Tattoo Collective is a gallery-forward tattoo studio in Clearwater, FL specializing in color realism, surrealism, traditional, and lettering work.",
      },
      {
        property: "og:title",
        content: "Revival Tattoo Collective — Editorial Tattoo Studio in Clearwater, FL",
      },
      {
        property: "og:description",
        content:
          "Color realism, surrealism, traditional, and lettering tattoos from a Clearwater, FL collective.",
      },
      { property: "og:url", content: "https://revivaltattoocollective.com/" },
    ],
    links: [{ rel: "canonical", href: "https://revivaltattoocollective.com/" }],
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
        <StyleTicker />
        <Artists />
        <ConsultationCTA
          headline="See someone whose work speaks to you?"
          sub="Choose your artist and reserve a session. A $100–$200 deposit holds your chair and applies to your final balance."
        />
        <Gallery />
        <ConsultationCTA
          headline="Have an idea forming?"
          sub="You don't need a finished concept to start. Book a consultation and we'll bring it into focus together."
        />
        <InstagramSection />
        <About />
        <BookingForm />
        <Contact />
      </main>
      <Footer />
      <StickyBookButton />
    </div>
  );
}
