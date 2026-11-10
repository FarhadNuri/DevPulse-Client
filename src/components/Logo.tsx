interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconDimensions = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-lg",
    lg: "w-11 h-11 rounded-xl",
  }[size];

  const textDimensions = {
    sm: "text-lg font-bold tracking-tight",
    md: "text-xl font-bold tracking-tight",
    lg: "text-3xl font-extrabold tracking-tight",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* DevPulse Crisp Brand Badge - vibrant indigo/purple gradient */}
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border border-white/25 shadow-sm shadow-indigo-500/30 ${iconDimensions}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Bold, razor-sharp white pulse waveform */}
          <path
            d="M 3 12 H 7 L 10 5 L 14 19 L 17 9 L 19 12 H 21"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`text-text-primary ${textDimensions}`}>
          <span className="text-accent">Dev</span>Pulse
        </span>
      )}
    </div>
  );
}
