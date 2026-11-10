import { motion } from "framer-motion";

const BENEFITS = [
  {
    title: "Client tickets never pollute your backlog without review",
    description:
      "Clients submit bug reports directly through their guest link. Every client submission lands in an approval queue where maintainers approve, reject with a stated reason, or request edits before tickets reach the active board.",
    tag: "Triage approval queue",
    icon: (
      /* Phosphor ShieldCheck */
      <svg viewBox="0 0 256 256" className="w-6 h-6" fill="currentColor">
        <path d="M208 40H48a8 8 0 0 0-8 8v64c0 74.59 55.65 125.86 113.62 135.53a8 8 0 0 0 8.76 0C220.35 237.86 276 186.59 276 112V48a8 8 0 0 0-8-8Zm-40 72-56 56a8 8 0 0 1-11.31 0l-24-24a8 8 0 0 1 11.31-11.31L107 151.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z" />
      </svg>
    ),
  },
  {
    title: "Clients only see the exact project you assign to them",
    description:
      "Guest permissions lock visitors to their designated project board. Clients cannot see your other client projects, internal organization settings, or teammate rosters.",
    tag: "Strict guest scoping",
    icon: (
      /* Phosphor EyeSlash */
      <svg viewBox="0 0 256 256" className="w-6 h-6" fill="currentColor">
        <path d="M231.88 175.7a8 8 0 0 1-11.18 2.18c-20.25-13.68-42.53-22.38-66.22-25.86l22.25 22.25a8 8 0 1 1-11.32 11.32l-24-24a8 8 0 0 1-1.39-9.87l-28.5-28.5a40 40 0 0 1-46.77-46.77L40.46 52.17a8 8 0 0 1 11.32-11.31l176 176a8 8 0 0 1 4.1 18.84ZM128 72a55.63 55.63 0 0 0-21.72 4.41l17.43 17.43A40 40 0 0 1 168 128a39.63 39.63 0 0 1-4.16 17.71l17.43 17.43A56 56 0 0 0 128 72Zm-88 56a120.46 120.46 0 0 0 44.42 58.74 8 8 0 0 0 9.8-12.69C75.25 160.77 58.9 145.24 48.71 128c18.59-31.5 50.19-56 87.29-56a99.47 99.47 0 0 1 27.24 3.79 8 8 0 1 0 4.29-15.42A115.48 115.48 0 0 0 136 56c-43.23 0-80 28.53-96 72Z" />
      </svg>
    ),
  },
  {
    title: "Teammates collaborate across projects without data leaks",
    description:
      "Teammates request access per project, while maintainers keep full administrative control. Non members requesting an unassigned company route receive an absolute four zero four instead of revealing project existence.",
    tag: "Cloaked routing",
    icon: (
      /* Phosphor UsersThree */
      <svg viewBox="0 0 256 256" className="w-6 h-6" fill="currentColor">
        <path d="M244.8 150.4a8 8 0 0 1-11.2-1.6A51.6 51.6 0 0 0 192 128a8 8 0 0 1-7.42-4.94 8 8 0 0 1 1.77-8.73 36 36 0 1 0-56.7 0 8 8 0 0 1 1.77 8.73A8 8 0 0 1 124 128a51.6 51.6 0 0 0-41.6 20.8 8 8 0 0 1-12.8-9.6A67.88 67.88 0 0 1 116 114.19a52 52 0 1 1 84 0A67.88 67.88 0 0 1 243.2 139.2a8 8 0 0 1 1.6 11.2ZM128 144a60.07 60.07 0 0 0-60 60 8 8 0 0 0 16 0 44 44 0 0 1 88 0 8 8 0 0 0 16 0 60.07 60.07 0 0 0-60-60Zm-68-16a36 36 0 1 0-36-36 36 36 0 0 0 36 36Zm0-56a20 20 0 1 1-20 20 20 20 0 0 1 20-20Zm-36 104a51.6 51.6 0 0 0-41.6 20.8 8 8 0 0 0 12.8 9.6A35.8 35.8 0 0 1 24 192a8 8 0 0 0 0-16Z" />
      </svg>
    ),
  },
  {
    title: "Instant visibility into who changed what and when",
    description:
      "Every ticket status change, approval decision, assignment, and comment is permanently recorded in the project activity timeline, giving you a full audit trail for client delivery.",
    tag: "Audit trail",
    icon: (
      /* Phosphor ClockCounterClockwise */
      <svg viewBox="0 0 256 256" className="w-6 h-6" fill="currentColor">
        <path d="M136 80v48a8 8 0 0 1-2.34 5.66l-32 32a8 8 0 0 1-11.32-11.32L120 124.69V80a8 8 0 0 1 16 0Zm104 48A112 112 0 0 1 48 199.16V216a8 8 0 0 1-16 0v-40a8 8 0 0 1 8-8h40a8 8 0 0 1 0 16H58.46A96 96 0 1 0 40 128a8 8 0 0 1-16 0 112 112 0 1 1 216 0Z" />
      </svg>
    ),
  },
];

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Benefits() {
  return (
    <section
      id="benefits"
      aria-label="Product benefits"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none scroll-mt-28"
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
          Core benefits
        </span>
        <h2 className="heading-3 mt-4 text-white">
          Engineered for agencies delivering client projects
        </h2>
        <p className="body-2 text-[#a0a0a0] mt-4">
          DevPulse replaces informal bug intake with formal project gates, clear access boundaries, and complete accountability.
        </p>
      </motion.div>

      {/* 2x2 Grid of Benefit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16">
        {BENEFITS.map((item, idx) => (
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
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#272727] border border-[#313131] flex items-center justify-center text-[#6366f1] shrink-0">
                  {item.icon}
                </div>
                <span className="caption-4 text-[#a0a0a0] bg-[#1f1f1f] px-2.5 py-1 rounded-md border border-[#272727]">
                  {item.tag}
                </span>
              </div>

              <h3 className="title-1 text-white mt-6">
                {item.title}
              </h3>
              <p className="body-3 text-[#a0a0a0] mt-3">
                {item.description}
              </p>

            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
