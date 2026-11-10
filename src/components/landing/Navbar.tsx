import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks";
import Logo from "../Logo";

const EASE_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface NavbarProps {
  activeSection?: string;
}

export default function Navbar({ activeSection = "" }: NavbarProps) {
  const { isLoggedIn, organizations, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  // Close menus on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname === "/" || window.location.pathname === "") {
      e.preventDefault();
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        window.history.pushState(null, "", window.location.pathname);
      }
    }
  }

  const navLinks = [
    { label: "Benefits", id: "benefits" },
    { label: "How it works", id: "workflow" },
    { label: "Testimonials", id: "testimonials" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <>
      {/* Floating Centered Desktop & Tablet Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-6xl px-4 sm:px-6 select-none">
        <nav
          aria-label="Main navigation"
          className="w-full bg-[#181818]/90 backdrop-blur-md border border-[#272727] rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 shadow-xl flex items-center justify-between gap-4 transition-all"
        >
          {/* Left: Brand Logo & Wordmark */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818] rounded-lg transition"
            aria-label="DevPulse Home"
          >
            <Logo size="sm" />
          </Link>

          {/* Middle: Anchor Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleAnchorClick(e, item.id)}
                  className={`title-4 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] rounded-md px-1.5 py-1 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-[#a0a0a0] hover:text-[#f5f5f5]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right: Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1e1e1e] border border-[#2e2e2e] hover:border-[#444444] hover:bg-[#262626] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818] cursor-pointer select-none"
                  aria-label="Open profile menu"
                  aria-expanded={userMenuOpen}
                >
                  {/* Round profile icon */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs shadow-inner uppercase shrink-0">
                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
                  </div>
                  {/* User name */}
                  <span className="text-sm font-medium text-[#f5f5f5] max-w-[130px] truncate">
                    {user?.name || "User"}
                  </span>
                  {/* Chevron */}
                  <svg
                    viewBox="0 0 256 256"
                    className={`w-3.5 h-3.5 text-[#a0a0a0] transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                  >
                    <path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: EASE_CURVE }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#181818]/95 backdrop-blur-xl border border-[#2e2e2e] shadow-2xl p-1.5 z-50 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-[#272727] mb-1">
                        <div className="text-sm font-semibold text-white truncate">
                          {user?.name}
                        </div>
                        <div className="text-xs text-[#a0a0a0] truncate">
                          {user?.email}
                        </div>
                        {user?.is_super_admin && (
                          <span className="inline-block mt-1 text-[10px] uppercase font-mono tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">
                            Super Admin
                          </span>
                        )}
                      </div>

                      {/* Dashboard Option */}
                      <Link
                        to={workspacePath}
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#f5f5f5] hover:bg-[#272727] hover:text-white transition group cursor-pointer"
                      >
                        <svg
                          viewBox="0 0 256 256"
                          className="w-4 h-4 text-[#a0a0a0] group-hover:text-[#6366f1] transition-colors"
                          fill="currentColor"
                        >
                          <path d="M104 40H48a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Zm-8 56H56V56h40ZM208 40h-56a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Zm-8 56h-40V56h40ZM104 144H48a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8v-56a8 8 0 0 0-8-8Zm-8 56H56v-40h40ZM208 144h-56a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8v-56a8 8 0 0 0-8-8Zm-8 56h-40v-40h40Z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      {/* Logout Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition group cursor-pointer text-left"
                      >
                        <svg
                          viewBox="0 0 256 256"
                          className="w-4 h-4 text-red-400/80 group-hover:text-red-300 transition-colors"
                          fill="currentColor"
                        >
                          <path d="M120 216a8 8 0 0 1-8 8H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h64a8 8 0 0 1 0 16H48v160h64a8 8 0 0 1 8 8Zm101.66-93.66l-40-40a8 8 0 0 0-11.32 11.32L196.69 120H104a8 8 0 0 0 0 16h92.69l-26.35 26.34a8 8 0 0 0 11.32 11.32l40-40a8 8 0 0 0 0-11.32Z" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="button-sm text-[#f5f5f5] hover:text-white bg-transparent hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#444444] active:scale-[0.98] px-3 py-2 rounded-lg transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="button-sm bg-[#6366f1] hover:bg-[#818cf8] active:scale-[0.98] text-white px-3 py-2 rounded-lg shadow-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
                >
                  Create workspace
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle (Phosphor List / X icon) */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-[#272727] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
            >
              <svg
                viewBox="0 0 256 256"
                className="w-6 h-6 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                fill="currentColor"
              >
                {mobileMenuOpen ? (
                  /* Phosphor X icon */
                  <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
                ) : (
                  /* Phosphor List icon */
                  <path d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8ZM40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16Zm176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16Z" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Full Height Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASE_CURVE }}
            className="fixed inset-0 z-50 md:hidden bg-[#000000]/95 backdrop-blur-2xl flex flex-col justify-between p-6"
          >
          {/* Mobile Header with Logo and Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-[#272727]">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center"
            >
              <Logo size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 rounded-lg text-[#a0a0a0] hover:text-white hover:bg-[#272727] transition"
            >
              <svg viewBox="0 0 256 256" className="w-6 h-6" fill="currentColor">
                <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
              </svg>
            </button>
          </div>

          {/* Stepped Link Entrance (Skill B7 Link Entrance: 24px translateY, stepped 60ms) */}
          <div className="flex flex-col gap-5 py-8">
            {navLinks.map((item, idx) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleAnchorClick(e, item.id)}
                style={{
                  animationDelay: `${idx * 60}ms`,
                  animationDuration: "400ms",
                  animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  animationFillMode: "both",
                }}
                className="title-1 text-2xl text-[#f5f5f5] hover:text-[#6366f1] transition animate-in fade-in slide-in-from-bottom-6"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Bottom Actions: Log in then Create workspace */}
          <div
            className="flex flex-col gap-3 pt-6 border-t border-[#272727] animate-in fade-in slide-in-from-bottom-6"
            style={{
              animationDelay: "240ms",
              animationDuration: "400ms",
              animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              animationFillMode: "both",
            }}
          >
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#181818] border border-[#272727]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase shrink-0">
                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="truncate flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {user?.name}
                    </div>
                    <div className="text-xs text-[#a0a0a0] truncate">
                      {user?.email}
                    </div>
                  </div>
                  {user?.is_super_admin && (
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold shrink-0">
                      Super Admin
                    </span>
                  )}
                </div>
                <Link
                  to={workspacePath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="button-md w-full text-center bg-[#6366f1] hover:bg-[#818cf8] text-white py-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                    <path d="M104 40H48a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Zm-8 56H56V56h40ZM208 40h-56a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Zm-8 56h-40V56h40ZM104 144H48a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8v-56a8 8 0 0 0-8-8Zm-8 56H56v-40h40ZM208 144h-56a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h56a8 8 0 0 0 8-8v-56a8 8 0 0 0-8-8Zm-8 56h-40v-40h40Z" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="button-md w-full text-center text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 py-3 rounded-xl font-semibold transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg viewBox="0 0 256 256" className="w-4 h-4" fill="currentColor">
                    <path d="M120 216a8 8 0 0 1-8 8H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h64a8 8 0 0 1 0 16H48v160h64a8 8 0 0 1 8 8Zm101.66-93.66l-40-40a8 8 0 0 0-11.32 11.32L196.69 120H104a8 8 0 0 0 0 16h92.69l-26.35 26.34a8 8 0 0 0 11.32 11.32l40-40a8 8 0 0 0 0-11.32Z" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="button-md w-full text-center text-[#f5f5f5] hover:text-white bg-[#181818] border border-[#2e2e2e] py-3 rounded-xl font-semibold transition active:scale-[0.98]"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="button-md w-full text-center bg-[#6366f1] hover:bg-[#818cf8] text-white py-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.98]"
                >
                  Create workspace
                </Link>
              </>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

