import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

/**
 * Componente Skeleton pulsante de alta performance e visual tático BatCaverna.
 * Usado para feedback imediato de carregamento em listas, cards e perfis.
 */
export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "text":
        return "rounded h-4 my-1 w-full";
      case "card":
        return "rounded-2xl border border-bat-border/40 p-4";
      case "rectangular":
      default:
        return "rounded-xl";
    }
  };

  const inlineStyles: React.CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Carregando..."
      style={inlineStyles}
      className={`animate-pulse bg-bat-bg-elevated/80 border border-bat-border/20 ${getVariantStyles()} ${className}`}
      {...props}
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

/** Predefinições prontas para uso imediato em telas com skeletons */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 rounded-2xl bg-bat-bg-card border border-bat-border space-y-3 animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={10} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={60} />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width="30%" height={12} />
        <Skeleton variant="rectangular" width={70} height={28} />
      </div>
    </div>
  );
}
