import Hero from "@/components/sections/Hero";
import CategoryStrip from "@/components/sections/CategoryStrip";
import FreshListings from "@/components/sections/FreshListings";
import HowItWorks from "@/components/sections/HowItWorks";
import FinalCta from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <FreshListings />
      <HowItWorks />
      <FinalCta />
    </>
  );
}