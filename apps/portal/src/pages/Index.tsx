import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavBar } from "@/components/ls/NavBar";
import { SchedulingModal } from "@/components/ls/SchedulingModal";
import { HeroSection } from "@/components/ls/sections/HeroSection";
import { ProblemSection } from "@/components/ls/sections/ProblemSection";
import { EcosystemSection } from "@/components/ls/sections/EcosystemSection";
import { FunnelSection } from "@/components/ls/sections/FunnelSection";
import { AdvantagesSection } from "@/components/ls/sections/AdvantagesSection";
import { FinalCTASection } from "@/components/ls/sections/FinalCTASection";
import { Footer } from "@/components/ls/Footer";
import { CookieConsent } from "@/components/ls/CookieConsent";
import { SEO } from "@/components/ls/SEO";

const Index = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const { i18n } = useTranslation();
  const open = () => setDemoOpen(true);
  const isEn = i18n.language?.startsWith("en");

  const title = isEn
    ? "Lead Seller — Enterprise CRM with Autonomous AI"
    : "Lead Seller — CRM Enterprise com IA Autônoma";
  const description = isEn
    ? "The first enterprise CRM with autonomous SDR, Help Desk AI and intelligent VOIP. Qualify leads in 1.4s and focus on closing."
    : "O primeiro CRM enterprise com SDR autônomo, Help Desk AI e VOIP inteligente. Qualifique leads em 1.4s e foque no fechamento.";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Lead Seller",
      url: "https://leadseller.com.br/",
      logo: "https://leadseller.com.br/leadseller-funnel-mark.svg",
      sameAs: ["https://acesso.leadseller.com.br/"],
      contactPoint: [{
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contato@leadseller.com.br",
        areaServed: "BR",
        availableLanguage: ["Portuguese", "English"],
      }],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Lead Seller",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "https://leadseller.com.br/",
      name: "Lead Seller",
      inLanguage: isEn ? "en" : "pt-BR",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <SEO path="/" title={title} description={description} jsonLd={jsonLd} />
      <NavBar onOpenDemo={open} />
      <main>
        <HeroSection onOpenDemo={open} />
        <ProblemSection />
        <EcosystemSection />
        <FunnelSection />
        <AdvantagesSection />
        <FinalCTASection onOpenDemo={open} />
      </main>
      <Footer />
      <SchedulingModal open={demoOpen} onOpenChange={setDemoOpen} />
      <CookieConsent />
    </div>
  );
};

export default Index;
