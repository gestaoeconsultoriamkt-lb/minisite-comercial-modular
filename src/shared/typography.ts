import type { MiniSiteTypographyPreset } from "./schemas/miniSiteConfig";

/**
 * Tokens de tipografia por preset — fonte de verdade única usada tanto
 * pelo `MiniSiteRenderer` (classes/estilos inline) quanto pelo carregamento
 * de fonte (Google Fonts via `<link>`, ver `TYPOGRAPHY_FONT_LINK_HREF` e
 * `renderMiniSitePage`/`index.html`). Nenhuma família é bundlada — todas
 * carregam do CDN da Google, prática padrão para sites públicos simples.
 *
 * `padrao` é o default de schema: Inter em todo o MiniSite. Antes deste
 * sistema, "Inter" já era referenciado em `--font-sans` mas nunca chegou a
 * ser carregado de fato (sem `<link>` em lugar nenhum) — o texto sempre
 * caiu no fallback `system-ui`. Passa a carregar de verdade agora; é uma
 * melhoria estrita (nunca pior que o fallback), não uma mudança de rota.
 */
export interface TypographyTokens {
  /** `font-family` aplicado à raiz do MiniSite (`.minisite-root`). */
  bodyFontFamily: string;
  /** `font-family` do nome do negócio na hero — pode ser um display/serif diferente do corpo. */
  nameFontFamily: string;
  /** Classes Tailwind extras (peso/tracking) aplicadas ao nome do negócio. */
  nameClassName: string;
  /** Classes Tailwind extras (peso/tracking) aplicadas ao headline/subtítulo. */
  headlineClassName: string;
}

const INTER = `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
const PLAYFAIR = `"Playfair Display", ui-serif, Georgia, serif`;
const MANROPE = `"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;

export const TYPOGRAPHY_TOKENS: Record<MiniSiteTypographyPreset, TypographyTokens> = {
  padrao: {
    bodyFontFamily: INTER,
    nameFontFamily: INTER,
    nameClassName: "font-extrabold tracking-tight",
    headlineClassName: "font-semibold",
  },
  elegante: {
    // Serif só no nome do negócio — assinatura de marca elegante (restaurante,
    // boutique, salão); o resto do texto continua em Inter para legibilidade.
    bodyFontFamily: INTER,
    nameFontFamily: PLAYFAIR,
    nameClassName: "font-bold tracking-normal",
    headlineClassName: "font-medium tracking-wide",
  },
  premium: {
    // Manrope em tudo, peso mais forte e tracking mais fechado no nome —
    // identidade mais "produto/SaaS moderno" do que a serif de `elegante`.
    bodyFontFamily: MANROPE,
    nameFontFamily: MANROPE,
    nameClassName: "font-extrabold tracking-tight",
    headlineClassName: "font-semibold tracking-tight",
  },
};

/**
 * URL única do Google Fonts CSS2 por preset — só os pesos realmente usados
 * (ver `nameClassName`/`headlineClassName` acima e `font-semibold`/
 * `font-bold` no restante do corpo). `padrao` inclui Inter mesmo sendo a
 * família "de sempre", porque nunca foi de fato carregada (ver acima).
 */
export const TYPOGRAPHY_FONT_LINK_HREF: Record<MiniSiteTypographyPreset, string> = {
  padrao: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  elegante:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap",
  premium: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
};

export function getTypographyTokens(preset: MiniSiteTypographyPreset): TypographyTokens {
  return TYPOGRAPHY_TOKENS[preset];
}
