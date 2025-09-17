import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureBento } from "@/components/landing/feature-bento";
import { FAQSection } from "@/components/landing/faq-section";
import { ContactSection } from "@/components/landing/contact-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="w-full">
        <HeroSection />
        <div id="features">
          <FeatureBento />
        </div>
        <FAQSection />
        <ContactSection />
      </main>
    </div>
  );
}
