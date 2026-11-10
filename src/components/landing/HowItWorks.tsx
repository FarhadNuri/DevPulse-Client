import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Create your organization",
    description:
      "Sign up with your name and email. Name your company workspace and immediately start your first project with custom boards.",
  },
  {
    step: "02",
    title: "Invite teammates and clients with scoped roles",
    description:
      "Add your team as organization members or send project specific invite links to clients. Clients automatically join as guests with restricted views.",
  },
  {
    step: "03",
    title: "Triage, approve, and deliver",
    description:
      "Review incoming client tickets on the approval queue. Approved issues move to your Kanban board where your team tracks progress to resolution.",
  },
];

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HowItWorks() {
  return (
    <section
      id="workflow"
      aria-label="How it works"
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
          Workflow
        </span>
        <h2 className="heading-3 mt-4 text-white">
          Three simple steps to structured client delivery
        </h2>
        <p className="body-2 text-[#a0a0a0] mt-4">
          From workspace setup to client invitation, DevPulse keeps your onboarding friction free.
        </p>
      </motion.div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 sm:mt-16">
        {STEPS.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: EASE_CURVE }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 flex flex-col justify-between transition-shadow duration-300 hover:shadow-xl hover:border-[#3a3a3a]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="caption-3 font-mono text-[#6366f1] bg-[#6366f1]/10 px-2.5 py-1 rounded-md border border-[#6366f1]/20">
                  {step.step}
                </span>
                {/* <span className="caption-5 text-[#757575]">Step {idx + 1} of 3</span> */}
              </div>
              <h3 className="title-2 text-white mt-6">
                {step.title}
              </h3>
              <p className="body-3 text-[#a0a0a0] mt-3">
                {step.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#272727] flex items-center gap-2">

            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
