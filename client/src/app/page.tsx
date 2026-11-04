"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import ProofSection from "@/components/landing/ProofSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ClosingSection from "@/components/landing/ClosingSection";
import LandingFooter from "@/components/landing/LandingFooter";
import ProductPreview from "@/components/landing/ProductPreview";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => setIsLoggedIn(Boolean(getCookie("oryn_token"))));
  }, []);

  const destination = isLoggedIn ? "/chat" : "/signup";
  const handleDemoAsk = (query: string) => {
    router.push(isLoggedIn ? `/chat?q=${encodeURIComponent(query)}` : "/signup");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcf9] font-sans text-[#15201b] selection:bg-lime-200 selection:text-[#26351e]">
      <LandingHeader isLoggedIn={isLoggedIn} />
      <main>
        <HeroSection destination={destination} />
        <ProductPreview onAsk={handleDemoAsk} />
        <ProofSection />
        <FeaturesSection destination={destination} />
        <HowItWorksSection />
        <ClosingSection destination={destination} />
      </main>
      <LandingFooter />
    </div>
  );
}
