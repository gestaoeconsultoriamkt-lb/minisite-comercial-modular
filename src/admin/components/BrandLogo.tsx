/**
 * Marca do produto. Desacoplada do layout de propósito: hoje o "mark" é um
 * placeholder vetorial (gradiente ciano→azul, sem arquivo externo) só para
 * não deixar a interface sem identidade — quando os assets oficiais
 * (símbolo isolado + versão horizontal em SVG/PNG) existirem, troque apenas
 * o conteúdo de <BrandMark> por um <img>/<svg> importado. Nenhum outro
 * componente (AuthLayout, Sidebar etc.) precisa mudar.
 */

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 40, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      role="img"
      aria-label="Símbolo MiniSite Comercial Modular"
    >
      <defs>
        <linearGradient id="brand-mark-gradient" x1="4" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-brand-cyan-400)" />
          <stop offset="1" stopColor="var(--color-brand-blue-600)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6 L32 20 L8 34 L8 22 L20 20 L8 18 Z"
        fill="url(#brand-mark-gradient)"
      />
    </svg>
  );
}

interface BrandLogoProps {
  size?: number;
  tone?: "light" | "dark";
  className?: string;
  /** Override do texto (ver LoginPage) — default preserva "MiniSite" / "Comercial Modular" em todo o resto do admin. */
  title?: string;
  subtitle?: string;
}

/** Símbolo + wordmark ("MiniSite" / "Comercial Modular", por padrão) lado a lado. */
export function BrandLogo({ size = 40, tone = "dark", className, title = "MiniSite", subtitle = "Comercial Modular" }: BrandLogoProps) {
  const titleColor = tone === "light" ? "text-white" : "text-brand-navy-900";
  const subtitleColor = tone === "light" ? "text-white/70" : "text-slate-500";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <BrandMark size={size} />
      <div className="leading-tight">
        <p className={`text-xl font-extrabold tracking-tight ${titleColor}`}>{title}</p>
        <p className={`text-sm font-medium ${subtitleColor}`}>{subtitle}</p>
      </div>
    </div>
  );
}
