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
        width: "auto",
        height: "auto",
        maxHeight: `${size}px`,
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
  iconSize = 36,
  textSize = "text-2xl sm:text-4xl md:text-5xl",
  className = "",
  showSub = false,
}: BatBrandProps) {
  return (
    <div className={`flex flex-col items-center select-none whitespace-nowrap shrink-0 ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-nowrap shrink-0">
        {/* Morcego oficial do Batman amarelo */}
        <div className="shrink-0 flex items-center justify-center">
          <BatLogo size={iconSize} glow />
        </div>

        {/* Tipografia BatCaverna — Sempre em linha única */}
        <span
          className={`heading font-extrabold tracking-tight leading-none whitespace-nowrap shrink-0 ${textSize}`}
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
        <span className="text-bat-text-muted text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mt-1.5 text-center whitespace-nowrap">
          Central de Concursos Militares & ENEM
        </span>
      )}
    </div>
  );
}
