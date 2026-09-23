const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Converte `#rgb`/`#rrggbb` para `rgba(r,g,b,alpha)` — usado no tingimento do corpo acrílico. */
export function hexToRgba(hex: string, alpha: number): string {
  if (!HEX_PATTERN.test(hex)) return `rgba(15, 29, 69, ${alpha})`;
  let normalized = hex.slice(1);
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
