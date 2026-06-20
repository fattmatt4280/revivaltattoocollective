import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { StyleTicker } from "@/components/site/StyleTicker";
import { Artists } from "@/components/site/Artists";
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
      { title: "Revival Tattoo Collective — Custom Award-Winning Tattoo Studio in Largo, FL" },
      {
        name: "description",
        content:
          "Largo, FL's award-winning custom tattoo studio. Specializing in color realism, traditional, lettering, and sign painting. Walk-ins welcome — appointments recommended.",
      },
      {
        property: "og:title",
        content: "Revival Tattoo Collective — Custom Award-Winning Tattoo Studio in Largo, FL",
      },
      {
        property: "og:description",
        content:
          "Largo, FL's award-winning custom tattoo studio. Specializing in color realism, traditional, lettering, and sign painting. Walk-ins welcome — appointments recommended.",
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
