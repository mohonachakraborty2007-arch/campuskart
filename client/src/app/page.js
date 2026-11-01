import Hero from "@/components/sections/Hero";
import LatestTicker from "@/components/sections/LatestTicker";
import TrustStrip from "@/components/sections/TrustStrip";
import CategoryStrip from "@/components/sections/CategoryStrip";
import FreshListings from "@/components/sections/FreshListings";
import HowItWorks from "@/components/sections/HowItWorks";
import FinalCta from "@/components/sections/FinalCta";
import Reveal from "@/components/ui/Reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestTicker />
      <TrustStrip />
      <Reveal>
        <CategoryStrip />
      </Reveal>
      <Reveal>
        <FreshListings />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
    </>
  );
}