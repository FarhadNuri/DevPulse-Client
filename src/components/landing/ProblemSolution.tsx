import { motion } from "framer-motion";

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProblemSolution() {
  return (
    <section
      aria-label="Problem and solution"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none"
    >
      {/* Section Header with Framer Motion scroll entrance */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="flex flex-col items-center text-center max-w-[680px] mx-auto"
      >
        <span className="caption-3 uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/20">
          The intake problem
        </span>
        <h2 className="heading-3 mt-4 text-white">
          Tame the chaos of client bug reports
        </h2>
        <p className="body-2 text-[#a0a0a0] mt-4">
          When clients send issues across chat, email, and calls, tickets slip through the cracks. DevPulse creates a clean boundary between raw client input and your actual engineering backlog.
        </p>
      </motion.div>

      {/* Two Column Contrast Cards with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16">
        {/* Chaotic Intake Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE_CURVE }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 transition-shadow duration-300 hover:shadow-xl hover:border-[#3a3a3a]"
        >
          <div className="flex items-center gap-3 pb-6 border-b border-[#272727]">
            <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] shrink-0">
              <svg viewBox="0 0 256 256" className="w-5 h-5" fill="currentColor">
                <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm37.66 130.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
              </svg>
            </div>
            <div>
              <h3 className="title-2 text-white">Scattered client intake</h3>
              <p className="caption-2 text-[#757575]">Without a dedicated triage gate</p>
            </div>
          </div>

          <ul className="mt-6 space-y-4">
            {[
              "Bug reports arrive in chat, emails, and calls without structure",
              "Clients submit duplicate requests directly into developer backlogs",
              "Client projects and internal discussions get mixed up in shared tools",
              "No formal approval record or documented rejection reason",
            ].map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  viewBox="0 0 256 256"
                  className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5"
                  fill="currentColor"
                >
                  <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
                </svg>
                <span className="body-3 text-[#a0a0a0]">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* The DevPulse Solution Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_CURVE }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 transition-shadow duration-300 hover:shadow-xl hover:border-[#3a3a3a]"
        >
          <div className="flex items-center gap-3 pb-6 border-b border-[#272727]">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] shrink-0">
              <svg viewBox="0 0 256 256" className="w-5 h-5" fill="currentColor">
                <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm45.66 85.66-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z" />
              </svg>
            </div>
            <div>
              <h3 className="title-2 text-white">The DevPulse triage gate</h3>
              <p className="caption-2 text-[#757575]">One controlled pipeline for delivery</p>
            </div>
          </div>

          <ul className="mt-6 space-y-4">
            {[
              "Clients submit bug reports directly through a private guest portal",
              "Maintainers review and approve tickets before they reach the board",
              "PostgreSQL row isolation guarantees complete company data privacy",
              "Full activity timeline tracks every ticket change, approval, and comment",
            ].map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg
                  viewBox="0 0 256 256"
                  className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5"
                  fill="currentColor"
                >
                  <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm45.66 85.66-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z" />
                </svg>
                <span className="body-3 text-[#f5f5f5]">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
