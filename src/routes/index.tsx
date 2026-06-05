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
