const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function parseHex(hex: string): [number, number, number] | null {
  if (!HEX_PATTERN.test(hex)) return null;
  let normalized = hex.slice(1);
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [parseInt(normalized.slice(0, 2), 16), parseInt(normalized.slice(2, 4), 16), parseInt(normalized.slice(4, 6), 16)];
}

/** Converte `#rgb`/`#rrggbb` para `rgba(r,g,b,alpha)`. */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(15, 29, 69, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Mistura duas cores hex — usado para tingir o corpo acrílico com a marca
 * SEM usar a cor da marca "pura": uma marca com cor quente (vermelho,
 * laranja) aplicada a 100% + alpha alto vira uma lavagem de cor sólida, não
 * um vidro. Misturando majoritariamente com uma base neutra escura antes de
 * aplicar a transparência, o resultado lê como vidro tingido em qualquer
 * paleta de marca, sem nunca ficar "avermelhado/estranho".
 */
export function mixHex(base: string, tint: string, tintRatio: number): string {
  const baseRgb = parseHex(base);
  const tintRgb = parseHex(tint);
  if (!baseRgb || !tintRgb) return base;
  const mixed = baseRgb.map((c, i) => Math.round(c * (1 - tintRatio) + tintRgb[i] * tintRatio));
  return `#${mixed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
