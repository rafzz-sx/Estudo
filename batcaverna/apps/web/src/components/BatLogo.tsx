import React from "react";

interface BatLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BatLogo({
  size = 56,
  className = "",
  glow = true,
}: BatLogoProps) {
  return (
    <img
      src="/images/bat_logo.png"
      alt="BatCaverna Morcego"
      width={size}
      style={{
        width: `${size}px`,
        height: "auto",
        objectFit: "contain",
        display: "inline-block",
        filter: glow
          ? "drop-shadow(0 0 12px rgba(245, 197, 24, 0.65)) drop-shadow(0 0 24px rgba(245, 197, 24, 0.3))"
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
  iconSize = 56,
  textSize = "text-4xl sm:text-5xl md:text-6xl",
  className = "",
  showSub = false,
}: BatBrandProps) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Morcego oficial do Batman amarelo */}
        <BatLogo size={iconSize} glow />

        {/* Tipografia BatCaverna com Chakra Petch idêntica à foto */}
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
        <span className="text-bat-text-muted text-xs uppercase tracking-[0.25em] font-semibold mt-2">
          Central de Concursos Militares & ENEM
        </span>
      )}
    </div>
  );
}
