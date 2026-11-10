import { Link } from "react-router-dom";
import Logo from "../Logo";

export default function Footer() {
  function scrollToTop(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer
      aria-label="Site footer"
      className="w-full border-t border-[#272727] bg-[#000000] py-12 select-none"
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Wordmark */}
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <Link
              to="/"
              onClick={scrollToTop}
              aria-label="DevPulse Home"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-md"
            >
              <Logo size="sm" />
            </Link>
            <span className="caption-4 text-[#757575]">
              Multi company issue tracker for client projects
            </span>
          </div>

          {/* Navigation & Legal Links */}
          <div className="flex items-center gap-6 caption-2 text-[#a0a0a0]">
            <a
              href="#benefits"
              className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-sm"
            >
              Benefits
            </a>
            <a
              href="#workflow"
              className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-sm"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-sm"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-sm"
            >
              FAQ
            </a>
            <Link
              to="/login"
              className="hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-sm"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Copyright Notice in Middle */}
        <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex items-center justify-center text-center text-[#757575] caption-4">
          <p>© {new Date().getFullYear()} DevPulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

