import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks";

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FinalCTA() {
  const { isLoggedIn, organizations, user } = useAuth();

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
      aria-label="Final call to action"
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE_CURVE }}
        className="rounded-3xl border border-[#272727] bg-[#181818] p-8 sm:p-16 text-center flex flex-col items-center shadow-2xl transition-colors duration-300 hover:border-[#3a3a3a]"
      >
        <span className="caption-3 uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full border border-[#6366f1]/20">
          Get started today
        </span>

        <h2 className="heading-3 mt-4 text-white max-w-[620px]">
          Start managing client delivery in one clean workspace
        </h2>

        <p className="body-2 text-[#a0a0a0] mt-4 max-w-[560px]">
          Keep client tickets separated, organize your team projects, and maintain complete audit control from day one.
        </p>

        {/* Primary CTA (identical wording to hero) */}
        <div className="mt-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_CURVE }}
          >
            <Link
              to={isLoggedIn ? workspacePath : "/signup"}
              className="group button-md inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#818cf8] text-white px-6 py-3 rounded-xl shadow-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
            >
              <span>{isLoggedIn ? "Open workspace" : "Create workspace"}</span>
              <svg
                viewBox="0 0 256 256"
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
              </svg>
            </Link>
          </motion.div>

        </div>

        {/* Risk Reversal Points */}
        {/* <div className="mt-8 pt-6 border-t border-[#272727] w-full max-w-md flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#a0a0a0]">
          {[
            "Free account",
            "No credit card required",
            "Delete workspace anytime",
          ].map((claim, idx) => (
            <div key={idx} className="flex items-center gap-1.5 caption-2">
              <svg viewBox="0 0 256 256" className="w-3.5 h-3.5 text-[#22c55e] shrink-0" fill="currentColor">
                <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm45.66 85.66-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z" />
              </svg>
              <span>{claim}</span>
            </div>
          ))}
        </div> */}
      </motion.div>
    </section>
  );
}
