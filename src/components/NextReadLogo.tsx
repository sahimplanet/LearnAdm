import React from "react";

interface NextReadLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const NextReadLogo: React.FC<NextReadLogoProps> = ({ className = "", size = "md" }) => {
  const sizeMap = {
    sm: "w-28 h-[84px]",
    md: "w-44 h-[132px]",
    lg: "w-60 h-[180px]",
    xl: "w-72 h-[216px]",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 360 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} filter drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        aria-label="NextRead Logo"
      >
        {/* Book Spine 5 (Bottom) - Olive Green */}
        <rect
          x="65"
          y="188"
          width="185"
          height="22"
          rx="11"
          fill="#69824B"
        />

        {/* Book Spine 4 - Deep Teal */}
        <rect
          x="80"
          y="156"
          width="205"
          height="22"
          rx="11"
          fill="#256B82"
        />

        {/* Book Spine 3 - Warm Light Beige */}
        <rect
          x="52"
          y="126"
          width="180"
          height="22"
          rx="11"
          fill="#E8D7B8"
        />

        {/* Book Spine 2 - Golden Yellow */}
        <rect
          x="30"
          y="95"
          width="230"
          height="22"
          rx="11"
          fill="#ECAF35"
        />

        {/* Top Book - Burgundy Maroon with NextRead Text (Tilted -3.5 deg) */}
        <g transform="rotate(-3.5 185 68)">
          <rect
            x="70"
            y="56"
            width="225"
            height="34"
            rx="12"
            fill="#5B1B36"
          />
          {/* Styled learnadm Text */}
          <text
            x="182"
            y="79"
            fill="#FFF8EE"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="23"
            letterSpacing="-0.5px"
            textAnchor="middle"
          >
            learnadm
          </text>
        </g>
      </svg>
    </div>
  );
};
