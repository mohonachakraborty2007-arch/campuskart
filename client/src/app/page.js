import Hero from "@/components/sections/Hero";
import TrustStrip from "@/components/sections/TrustStrip";
import CategoryStrip from "@/components/sections/CategoryStrip";
import FreshListings from "@/components/sections/FreshListings";
import HowItWorks from "@/components/sections/HowItWorks";
import FinalCta from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryStrip />
      <FreshListings />
      <HowItWorks />
      <FinalCta />
    </>
  );
}