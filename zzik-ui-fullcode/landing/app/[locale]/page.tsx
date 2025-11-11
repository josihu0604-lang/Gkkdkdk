import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import FeatureGrid from "@/components/sections/FeatureGrid";
import ComplianceBanner from "@/components/sections/ComplianceBanner";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";

export default function LocalePage() {
  return (
    <>
      <main>
        <Hero />
        <div className="container">
          <TrustBar />
        </div>
        <div className="container">
          <FeatureGrid />
        </div>
        <div className="container">
          <ComplianceBanner />
        </div>
        <div className="container">
          <LeadForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
