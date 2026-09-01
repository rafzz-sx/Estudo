import React from "react";

interface BatLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BatLogo({
  size = 48,
  className = "",
  glow = true,
}: BatLogoProps) {
  return (
    <img
      src="/images/bat_logo.png"
      alt="BatCaverna Morcego"
      width={size}
      style={{
        maxWidth: `${size}px`,
        width: "100%",
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
        filter: glow
          ? "drop-shadow(0 0 10px rgba(245, 197, 24, 0.65)) drop-shadow(0 0 20px rgba(245, 197, 24, 0.3))"
          : "none",
      }}
      className={`shrink-0 select-none ${className}`}
    />
  );
}

interface BatBrandProps {
  iconSize?: number;
  textSize?: string;
  className?: string;
  showSub?: boolean;
}

export function BatBrand({
  iconSize = 44,
  textSize = "text-3xl sm:text-5xl md:text-6xl",
  className = "",
  showSub = false,
}: BatBrandProps) {
  return (
    <div className={`flex flex-col items-center select-none max-w-full px-2 ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-nowrap max-w-full">
        {/* Morcego oficial do Batman amarelo */}
        <div className="w-8 sm:w-12 md:w-14 shrink-0 flex items-center justify-center">
          <BatLogo size={iconSize} glow />
        </div>

        {/* Tipografia BatCaverna */}
        <span
          className={`heading font-extrabold tracking-tight leading-none ${textSize}`}
          style={{
            fontFamily: "'Chakra Petch', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
            Bat
          </span>
          <span
            className="text-[#F5C518] drop-shadow-[0_0_20px_rgba(245,197,24,0.45)]"
            style={{ color: "#F5C518" }}
          >
            Caverna
          </span>
        </span>
      </div>

      {showSub && (
        <span className="text-bat-text-muted text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mt-2 text-center">
          Central de Concursos Militares & ENEM
        </span>
      )}
    </div>
  );
}
