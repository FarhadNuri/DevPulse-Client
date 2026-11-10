import { useState, useEffect } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProblemSolution from "../components/landing/ProblemSolution";
import TaglineReveal from "../components/landing/TaglineReveal";
import Benefits from "../components/landing/Benefits";
import HowItWorks from "../components/landing/HowItWorks";
import Proof from "../components/landing/Proof";
import FAQ from "../components/landing/FAQ";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("");

  // Track active section for navbar indicator
  useEffect(() => {
    const sectionIds = ["benefits", "workflow", "testimonials", "faq"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          },
          { threshold: 0.3 }
        );
        obs.observe(el);
        observers.push(obs);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] flex flex-col items-center selection:bg-[#6366f1]/30 selection:text-white overflow-x-hidden">
      {/* Floating Centered Navbar */}
      <Navbar activeSection={activeSection} />

      {/* Main Landing Page Sections */}
      <main className="w-full flex flex-col items-center flex-1">
        <Hero />
        <ProblemSolution />
        <TaglineReveal />
        <Benefits />
        <HowItWorks />
        <Proof />
        <FAQ />
        <FinalCTA />
      </main>

      {/* Semantic Site Footer */}
      <Footer />
    </div>
  );
}
