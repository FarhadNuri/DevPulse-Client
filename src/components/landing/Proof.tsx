import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  tag: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "DevPulse gave our agency one clean place for client bug triage without exposing our internal backlog. Our clients love the simplicity and our engineers never get pinged in personal chat.",
    name: "Marcus Vance",
    role: "Founder and Principal Architect",
    company: "Vance Studio Labs",
    tag: "Agency Delivery",
    initials: "MV",
  },
  {
    quote:
      "The client permission scoping is phenomenal. Our clients only ever see the project we invite them to. There is zero risk of client data leaking across separate workspaces.",
    name: "Elena Rostova",
    role: "Founder and Managing Director",
    company: "Aether Craft Agency",
    tag: "Multi Company Privacy",
    initials: "ER",
  },
  {
    quote:
      "Having an approval queue for client submissions changed how we deliver software. Duplicate and unverified tickets are caught before they touch our active boards.",
    name: "Devon Reed",
    role: "Co Founder and Product Lead",
    company: "Kinetic Branch Digital",
    tag: "Triage Approval Queue",
    initials: "DR",
  },
  {
    quote:
      "Setting up a new client workspace takes less than two minutes. The guest permissions work seamlessly, and having an audit trail for every status change has saved us countless status meetings.",
    name: "Sarah Chen",
    role: "Founder and Technical Director",
    company: "Opal Creative Software",
    tag: "Audit Accountability",
    initials: "SC",
  },
  {
    quote:
      "Inviting external clients was always our biggest friction point with complex trackers. DevPulse keeps things so simple that non technical stakeholders report bugs on day one without asking for help.",
    name: "Julian Hayes",
    role: "Founder and Technical Consultant",
    company: "Apex Wave Solutions",
    tag: "Client Onboarding",
    initials: "JH",
  },
  {
    quote:
      "The cloaked routing is brilliant. When someone who does not belong to a client project tests a URL, they get an empty four zero four instead of an access denied screen. Total privacy by design.",
    name: "Nadia Patel",
    role: "Partner and Engineering Director",
    company: "Horizon Vector Systems",
    tag: "Security Cloaking",
    initials: "NP",
  },
];

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Proof() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function updateMedia() {
      setIsDesktop(window.innerWidth >= 768);
    }
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  // Desktop shows 2 cards per slide; Mobile shows 1 card per slide
  const desktopSlidesCount = Math.ceil(TESTIMONIALS.length / 2);
  const totalSlides = isDesktop ? desktopSlidesCount : TESTIMONIALS.length;

  // Auto sliding carousel every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // Reset slide index if view mode switches
  useEffect(() => {
    setCurrentSlide(0);
  }, [isDesktop]);

  function handlePrev() {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }

  return (
    <>
      {/* Architecture Proof Section */}
      <section
        aria-label="Security and proof"
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
          className="flex flex-col items-center text-center max-w-[680px] mx-auto"
        >
          <span className="caption-3 uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/20">
            Architecture proof
          </span>
          <h2 className="heading-3 mt-4 text-white">
            Verified multi company isolation
          </h2>
          <p className="body-2 text-[#a0a0a0] mt-4">
            Built with strict boundaries so your client data, projects, and internal notes never cross paths.
          </p>
        </motion.div>

        {/* 3 Architecture Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 sm:mt-16">
          {[
            {
              title: "PostgreSQL row isolation",
              description:
                "Every database query filters strictly by company identifier. Data between different companies cannot intersect under any condition.",
              badge: "Database level",
            },
            {
              title: "Four zero four protection",
              description:
                "Unauthorized requests to unassigned company routes receive an immediate four zero four response to prevent tenant discovery.",
              badge: "Zero exposure",
            },
            {
              title: "Immutable audit timeline",
              description:
                "Every ticket creation, status update, client approval, and rejection reason is permanently stored in the project audit log.",
              badge: "Full history",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: EASE_CURVE }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 flex flex-col justify-between transition-shadow duration-300 hover:shadow-xl hover:border-[#3a3a3a]"
            >
              <div>
                <span className="caption-4 text-[#a0a0a0] bg-[#1f1f1f] px-2.5 py-1 rounded-md border border-[#272727]">
                  {item.badge}
                </span>
                <h3 className="title-2 text-white mt-4">{item.title}</h3>
                <p className="body-3 text-[#a0a0a0] mt-2">{item.description}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#272727] flex items-center gap-2">

              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Testimonials Section with Framer Motion Carousel */}
      <section
        id="testimonials"
        aria-label="Customer testimonials"
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none scroll-mt-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: EASE_CURVE }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Testimonials Header */}
          <div className="flex flex-col items-center text-center max-w-[620px] mx-auto mb-8 sm:mb-12">
            <span className="caption-3 uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/20">
              Agency proof
            </span>
            <h3 className="heading-4 text-white mt-3">
              Trusted by founders delivering client software
            </h3>
            <p className="body-3 text-[#a0a0a0] mt-2">
              See how small agencies and consultancies eliminate bug intake chaos and protect their workspace boundaries.
            </p>
          </div>

          {/* Sliding Testimonial Cards Track */}
          <div className="relative overflow-hidden w-full">
            <motion.div
              className="flex"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.7, ease: EASE_CURVE }}
            >
              {isDesktop ? (
                /* Desktop: 2 Cards per slide */
                Array.from({ length: desktopSlidesCount }).map((_, slideIdx) => {
                  const pair = [
                    TESTIMONIALS[slideIdx * 2],
                    TESTIMONIALS[slideIdx * 2 + 1],
                  ].filter(Boolean);
                  return (
                    <div key={slideIdx} className="w-full shrink-0 grid grid-cols-2 gap-6">
                      {pair.map((item, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2, ease: EASE_CURVE }}
                          className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-colors duration-300 hover:border-[#3a3a3a]"
                        >
                          <div>
                            {/* Stars and Tag */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    viewBox="0 0 256 256"
                                    className="w-4 h-4 text-[#eab308]"
                                    fill="currentColor"
                                  >
                                    <path d="M234.5 114.38l-45.1 39.36 13.51 58.6a16 16 0 0 1-23.84 17.34l-51.11-31-51 31a16 16 0 0 1-23.84-17.34l13.49-58.6-45.1-39.36a16 16 0 0 1 9.11-28.06l59.46-5.15 23.21-55.36a16 16 0 0 1 29.44 0l23.21 55.36 59.46 5.15a16 16 0 0 1 9.07 28.06Z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="caption-4 text-[#6366f1] bg-[#6366f1]/10 px-2.5 py-0.5 rounded-md border border-[#6366f1]/20">
                                {item.tag}
                              </span>
                            </div>

                            {/* Quote */}
                            <p className="body-2 text-[#f5f5f5] mt-5 leading-relaxed">
                              "{item.quote}"
                            </p>
                          </div>

                          {/* Author Info */}
                          <div className="mt-8 pt-5 border-t border-[#272727] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#272727] to-[#1f1f1f] border border-[#3a3a3a] flex items-center justify-center font-semibold text-white caption-2 text-xs">
                                {item.initials}
                              </div>
                              <div>
                                <h4 className="title-3 text-white">{item.name}</h4>
                                <p className="caption-2 text-[#a0a0a0]">
                                  {item.role}, <span className="text-[#cccccc]">{item.company}</span>
                                </p>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })
              ) : (
                /* Mobile: 1 Card per slide */
                TESTIMONIALS.map((item, idx) => (
                  <div key={idx} className="w-full shrink-0">
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2, ease: EASE_CURVE }}
                      className="rounded-2xl border border-[#272727] bg-[#181818] p-6 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        {/* Stars and Tag */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                viewBox="0 0 256 256"
                                className="w-4 h-4 text-[#eab308]"
                                fill="currentColor"
                              >
                                <path d="M234.5 114.38l-45.1 39.36 13.51 58.6a16 16 0 0 1-23.84 17.34l-51.11-31-51 31a16 16 0 0 1-23.84-17.34l13.49-58.6-45.1-39.36a16 16 0 0 1 9.11-28.06l59.46-5.15 23.21-55.36a16 16 0 0 1 29.44 0l23.21 55.36 59.46 5.15a16 16 0 0 1 9.07 28.06Z" />
                              </svg>
                            ))}
                          </div>
                          <span className="caption-4 text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded-md border border-[#6366f1]/20">
                            {item.tag}
                          </span>
                        </div>

                        {/* Quote */}
                        <p className="body-2 text-[#f5f5f5] mt-4 leading-relaxed">
                          "{item.quote}"
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="mt-6 pt-4 border-t border-[#272727] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#272727] to-[#1f1f1f] border border-[#3a3a3a] flex items-center justify-center font-semibold text-white caption-2 text-xs">
                            {item.initials}
                          </div>
                          <div>
                            <h4 className="title-3 text-white">{item.name}</h4>
                            <p className="caption-4 text-[#a0a0a0]">
                              {item.role}, <span className="text-[#cccccc]">{item.company}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#22c55e] caption-4">
                          <svg viewBox="0 0 256 256" className="w-3.5 h-3.5" fill="currentColor">
                            <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm45.66 85.66-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z" />
                          </svg>
                          <span>Verified</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Carousel Navigation Indicators & Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="p-2 rounded-xl text-[#a0a0a0] hover:text-white bg-[#181818] border border-[#272727] hover:border-[#3a3a3a] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            >
              <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                <path d="M165.66 202.34a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L99.31 128l66.35 66.34a8 8 0 0 1 0 11.32Z" />
              </svg>
            </button>

            {/* Interactive Indicator Pills */}
            <div className="flex items-center gap-2">
              {[...Array(totalSlides)].map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] ${currentSlide === idx
                    ? "w-8 h-2 bg-[#6366f1]"
                    : "w-2 h-2 bg-[#3a3a3a] hover:bg-[#666666]"
                    }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="p-2 rounded-xl text-[#a0a0a0] hover:text-white bg-[#181818] border border-[#272727] hover:border-[#3a3a3a] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            >
              <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                <path d="M181.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L164.69 128 98.34 61.66a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
              </svg>
            </button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
