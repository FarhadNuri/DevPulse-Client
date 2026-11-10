import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks";

const HERO_SLIDES = [
  {
    title: "Project Kanban Board",
    url: "devpulse.app/orgs/1/projects/fitness-app",
    image: "/screenshots/kanban-board.png",
    alt: "DevPulse project kanban board showing tickets grouped by status with assignee tags",
  },
  {
    title: "Workspace Dashboard",
    url: "devpulse.app/dashboard",
    image: "/screenshots/dashboard-overview.png",
    alt: "DevPulse workspace dashboard overview showing metrics and project health",
  },
  {
    title: "Project Member Details",
    url: "devpulse.app/orgs/1/projects/chaldal/members",
    image: "/screenshots/activity-timeline.png",
    alt: "DevPulse live project activity timeline documenting ticket actions and status changes",
  },
];

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { isLoggedIn, organizations, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic slide rotation every 4.5 seconds (paused on user hover or focus)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  function handlePrev() {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }

  // Compute workspace path for logged in users
  let workspacePath = "/dashboard";
  if (user?.is_super_admin) {
    workspacePath = "/admin";
  } else if (organizations && organizations.length > 0) {
    try {
      const saved = localStorage.getItem("devpulse_last_org");
      const target = saved && organizations.some((o) => o.id === Number(saved))
        ? Number(saved)
        : organizations[0].id;
      workspacePath = `/orgs/${target}/projects`;
    } catch {
      workspacePath = `/orgs/${organizations[0].id}/projects`;
    }
  }

  return (
    <section
      aria-label="Hero section"
      className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24 flex flex-col items-center text-center select-none"
    >
      {/* Text Group: Headline & Subheading with Framer Motion Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_CURVE }}
        className="flex flex-col items-center"
      >
        {/* Hero Heading: max-w-[680px], #FFFFFF to #9B9B9B gradient text, meaningful breaks, no hyphens */}
        <h1 className="heading-1 max-w-[680px] bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent">
          Run client projects and team issues
          <br className="hidden sm:inline" /> in one private workspace
        </h1>

        {/* Hero Subheading: max-w-[680px], body-2, no hyphens */}
        <p className="body-2 text-[#a0a0a0] max-w-[680px] mt-6">
          Keep client bug reports out of your inbox and chat. Triage incoming tickets, assign work to teammates, and protect your internal discussions with strict company isolation.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_CURVE }}
          >
            <Link
              to={isLoggedIn ? workspacePath : "/signup"}
              className="group button-md inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#818cf8] text-white px-5 py-2.5 rounded-xl shadow-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
            >
              <span>{isLoggedIn ? "Open workspace" : "Create workspace"}</span>
              <svg
                viewBox="0 0 256 256"
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="currentColor"
                aria-hidden="true"
              >
                {/* Phosphor ArrowRight */}
                <path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
              </svg>
            </Link>
          </motion.div>

        </div>
      </motion.div>

      {/* Hero Visual: Framer Motion Carousel in Browser Device Frame */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE_CURVE }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="mt-12 sm:mt-16 w-full"
      >
        <div className="rounded-2xl border border-[#272727] bg-[#181818] shadow-2xl overflow-hidden text-left">
          {/* Subtle Browser Window Header */}
          <div className="h-10 bg-[#1f1f1f] border-b border-[#272727] px-4 flex items-center justify-between select-none">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#313131]" />
              <div className="w-3 h-3 rounded-full bg-[#313131]" />
              <div className="w-3 h-3 rounded-full bg-[#313131]" />
            </div>

            {/* Dynamic URL Bar */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#181818] border border-[#272727] rounded-md text-[#a0a0a0] caption-4 max-w-[340px] w-full justify-center transition-colors">
              <svg
                viewBox="0 0 256 256"
                className="w-3 h-3 text-[#757575] shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                {/* Phosphor LockSimple */}
                <path d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16ZM96 56a32 32 0 0 1 64 0v24H96ZM208 208H48V96h160v112Z" />
              </svg>
              <span className="truncate">{HERO_SLIDES[currentSlide].url}</span>
            </div>

            {/* Slide Index Pill */}
            <div className="hidden sm:flex items-center gap-1 text-[#757575] caption-4 font-mono">
              <span className="text-white">{currentSlide + 1}</span>
              <span>/</span>
              <span>{HERO_SLIDES.length}</span>
            </div>
          </div>

          {/* Sliding Track with Framer Motion */}
          <div className="relative overflow-hidden bg-[#181818]">
            <motion.div
              className="flex"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.7, ease: EASE_CURVE }}
            >
              {HERO_SLIDES.map((slide, idx) => (
                <div key={idx} className="w-full shrink-0 relative bg-[#181818]">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-auto block select-none pointer-events-none"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom Interactive Navigation & Indicator Bar */}
          <div className="h-12 bg-[#1f1f1f] border-t border-[#272727] px-4 flex items-center justify-between select-none">
            {/* Slide Title Tag */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
              <span className="caption-3 text-white">
                {HERO_SLIDES[currentSlide].title}
              </span>
            </div>

            {/* Interactive Progress Indicators (Pills) */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Switch to screenshot ${idx + 1}: ${slide.title}`}
                  className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] ${currentSlide === idx
                    ? "w-7 h-2 bg-[#6366f1]"
                    : "w-2 h-2 bg-[#3a3a3a] hover:bg-[#666666]"
                    }`}
                />
              ))}
            </div>

            {/* Next / Previous Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous screenshot"
                className="p-1.5 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-[#272727] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              >
                <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                  {/* Phosphor CaretLeft */}
                  <path d="M165.66 202.34a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L99.31 128l66.35 66.34a8 8 0 0 1 0 11.32Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next screenshot"
                className="p-1.5 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-[#272727] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
              >
                <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                  {/* Phosphor CaretRight */}
                  <path d="M181.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L164.69 128 98.34 61.66a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
