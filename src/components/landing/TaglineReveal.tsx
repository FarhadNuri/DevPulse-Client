import { useEffect, useRef, useState } from "react";

const TAGLINE_WORDS = [
  "One",
  "single",
  "workspace",
  "for",
  "your",
  "team",
  "and",
  "clients.",
  "\n",
  "No",
  "mixed",
  "company",
  "data,",
  "no",
  "lost",
  "tickets.",
];

export default function TaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWordCount, setActiveWordCount] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setActiveWordCount(TAGLINE_WORDS.length);
      return;
    }

    let rafId: number | null = null;

    function handleScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Progress based on container crossing the lower half of viewport
        const startTrigger = windowHeight * 0.85;
        const endTrigger = windowHeight * 0.35;
        const progress = Math.min(
          Math.max((startTrigger - rect.top) / (startTrigger - endTrigger), 0),
          1
        );

        const count = Math.floor(progress * TAGLINE_WORDS.length);
        setActiveWordCount(count);
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Core message"
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center justify-center text-center select-none"
    >
      <div className="max-w-[680px]">
        <h2 className="heading-2 text-balance leading-tight">
          {TAGLINE_WORDS.map((word, index) => {
            if (word === "\n") {
              return <br key={`br-${index}`} className="hidden sm:inline" />;
            }
            const isActive = index < activeWordCount;
            return (
              <span
                key={`${word}-${index}`}
                style={{
                  transition: "color 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className={`inline-block mr-[0.3em] ${
                  isActive ? "text-white" : "text-white/25"
                } motion-reduce:text-white`}
              >
                {word}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
}

