import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
  {
    question: "Can clients see issues from my other clients or projects?",
    answer:
      "No. Clients receive guest access restricted solely to the specific project you invite them to. They cannot view your organization dashboard, other client projects, internal comments, or other workspaces.",
  },
  {
    question: "What happens when a client submits a bug report?",
    answer:
      "Every client ticket starts with a pending status in the approval queue. Maintainers review the request first. You can approve it directly to the board, or reject it with a written explanation that the client can see.",
  },
  {
    question: "Can clients edit their tickets after submission?",
    answer:
      "Clients can edit the title, description, and attachments of their ticket while it remains pending review. Once approved to the active board, tickets cannot be altered by guests.",
  },
  {
    question: "How are organization roles structured?",
    answer:
      "Roles belong to the organization, not the global user. A person can be an owner in one workspace and a member or guest in another. Maintainers oversee all projects in an organization, while members request access per project.",
  },
  {
    question: "Does DevPulse mix data between different companies?",
    answer:
      "No. All queries enforce organization scoping at the database level. If a user attempts to view a company or project they do not belong to, the server returns an empty four zero four status to prevent leaking tenant presence.",
  },
  {
    question: "Can teammates see projects they are not assigned to?",
    answer:
      "Members see the project list inside their organization, but project boards remain locked until a maintainer approves their access request.",
  },
  {
    question: "Is a credit card required to start?",
    answer:
      "No. You can create an account and start managing projects immediately without entering credit card details.",
  },
  {
    question: "Can I delete my workspace if I no longer need it?",
    answer:
      "Yes. Organization owners can delete a workspace at any time. The console requires typing the exact workspace name to prevent accidental deletion.",
  },
];

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleItem(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  // Schema.org FAQPage for Answer Engine Optimization (AEO)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none scroll-mt-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="flex flex-col items-center text-center max-w-[680px] mx-auto"
      >
        <span className="caption-3 uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/20">
          Questions and answers
        </span>
        <h2 className="heading-3 mt-4 text-white">
          Frequently asked questions
        </h2>
        <p className="body-2 text-[#a0a0a0] mt-4">
          Everything you need to know about company isolation, client access, and workspace security.
        </p>
      </motion.div>

      {/* Accordion List */}
      <div className="mt-12 sm:mt-16 space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: EASE_CURVE }}
              className="rounded-xl border border-[#272727] bg-[#181818] overflow-hidden transition-colors duration-300 hover:border-[#3a3a3a]"
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                className="w-full p-5 text-left flex items-center justify-between gap-4 transition duration-300 hover:bg-[#1f1f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-inset"
              >
                <span className="title-3 text-white text-balance">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_CURVE }}
                  className="w-6 h-6 shrink-0 flex items-center justify-center text-[#a0a0a0]"
                >
                  <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                    <path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: EASE_CURVE }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-[#272727]/50">
                      <p className="body-3 text-[#a0a0a0] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
