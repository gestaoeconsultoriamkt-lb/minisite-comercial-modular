import type { SVGProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WhatsAppIcon, MapPinIcon, LinkIcon } from "../../shared/icons";
import { TYPOGRAPHY_FONT_LINK_HREF } from "../../shared/typography";
// Mesmo truque de renderMiniSitePage.tsx: CSS do Tailwind do admin embutida
// inline como string — esta página também é servida pura pelo Worker, sem
// o HTML/manifest do admin.
import publicStyles from "../../admin/styles.css?inline";

type IconProps = SVGProps<SVGSVGElement>;

const WHATSAPP_NUMBER = "5511991308714";
const WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre a criação de um Mini Site.";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/**
 * Ícones locais desta página — não existe asset/ícone apropriado no projeto
 * pra cadeado (só dentro de src/admin, cross-project isolation entre
 * tsconfig.worker/app — ver histórico) nem seta/smartphone/galeria no
 * conjunto público (src/shared/icons.tsx). Mesmo estilo visual dos ícones
 * de lá (viewBox 24, stroke currentColor) pra ficar visualmente coerente.
 */
const iconBase: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function LockGlyph(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

function ArrowRightGlyph(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M4.5 12h15" />
      <path d="M13 5.5 19.5 12 13 18.5" />
    </svg>
  );
}

function GalleryGlyph(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0l1.7 1.7a1.5 1.5 0 0 0 2.1 0l1.4-1.4a1.5 1.5 0 0 1 2.1 0L21 16.5" />
    </svg>
  );
}

function SmartphoneGlyph(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

/**
 * Marca visual "BioSystem" — não há no projeto um ícone isolado apropriado
 * pra usar pequeno num header (o asset existente,
 * src/admin/assets/smart-bio-builder-logo.webp, já tem a wordmark "Smart
 * bio.builder" cozida na própria imagem e foi desenhado pra aparecer
 * grande/centralizado — ver AuthLayout.tsx; usá-lo pequeno aqui duplicaria
 * marca de um jeito confuso). SVG simples de duas formas arredondadas
 * sobrepostas (silhueta "nuvem/conectado"), gradiente azul->ciano da própria
 * paleta do projeto (ver --color-brand-blue-500/--color-brand-cyan-400).
 */
function BioSystemMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <defs>
        <linearGradient id="biosystem-mark-g" x1="4" y1="8" x2="36" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="17" r="11" fill="url(#biosystem-mark-g)" opacity="0.92" />
      <circle cx="25" cy="24" r="8.5" fill="url(#biosystem-mark-g)" />
    </svg>
  );
}

interface BenefitItem {
  Icon: (props: IconProps) => React.JSX.Element;
  title: string;
  description: string;
}

const BENEFITS: BenefitItem[] = [
  { Icon: LinkIcon, title: "Todos os seus links", description: "WhatsApp, Instagram, site, avaliação, Pix e muito mais." },
  { Icon: GalleryGlyph, title: "Catálogo e galeria", description: "Mostre seus produtos, serviços e diferenciais." },
  { Icon: MapPinIcon, title: "Como chegar", description: "Mapa integrado do Google e botão de navegação." },
  { Icon: SmartphoneGlyph, title: "Design moderno", description: "Layouts profissionais e otimizados para celular." },
];

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-navy-900 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(0,0,0,0.4)] sm:px-5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
        <WhatsAppIcon className="h-4.5 w-4.5" />
      </span>
      <span className="hidden sm:inline">Fale comigo no WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}

function BioSystemHomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="relative overflow-hidden bg-brand-navy-950">
        {/* Gradientes suaves de profundidade — mesma técnica do painel institucional do login (ver AuthLayout.tsx). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 right-[-10%] h-[70%] w-[70%] rounded-[6rem] bg-gradient-to-bl from-brand-blue-600/25 via-brand-cyan-400/10 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-1/3 -left-1/4 h-[70%] w-[120%] rotate-[-12deg] rounded-[6rem] bg-gradient-to-tr from-brand-navy-700/60 via-brand-navy-800/30 to-transparent blur-3xl"
        />

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1440px] flex-col px-6 sm:px-10 lg:px-16">
          <header className="flex items-center justify-between pt-8 sm:pt-10">
            <div className="flex items-center gap-3">
              <BioSystemMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
              <div className="leading-none">
                <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  <span className="text-white">Bio</span>
                  <span className="text-brand-cyan-400">System</span>
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-[11px]">Smart Bio Builder</p>
              </div>
            </div>

            <a
              href="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-600/25 transition duration-200 hover:brightness-110 sm:px-5"
            >
              <LockGlyph className="h-4 w-4" />
              Entrar
            </a>
          </header>

          <main className="flex flex-1 items-center py-16 sm:py-20">
            <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-cyan-400 sm:text-sm">
                  Mini sites que conectam o seu negócio
                </p>
                <h1 className="mt-5 text-[clamp(2.25rem,4.5vw+1rem,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                  Crie, publique e gerencie
                  <br />
                  sua <span className="text-brand-cyan-400">presença digital.</span>
                </h1>
                <p className="mt-6 text-[clamp(1.05rem,0.6vw+0.95rem,1.375rem)] leading-relaxed text-white/70">
                  Mini sites profissionais com catálogo, links, mapa e muito mais.
                  <br className="hidden sm:inline" />
                  Tudo de forma simples, rápida e sem complicação.
                </p>

                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#2fe37c] to-[#20b85a] px-7 py-4 text-[clamp(1.05rem,0.4vw+1rem,1.25rem)] font-bold text-white shadow-[0_10px_28px_-6px_rgba(37,211,102,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-6px_rgba(37,211,102,0.55)]"
                >
                  <WhatsAppIcon className="h-6 w-6 shrink-0" />
                  Solicitar a criação do meu Mini Site
                  <ArrowRightGlyph className="h-5 w-5 shrink-0" />
                </a>
              </div>

              {/* Composição premium dos dois celulares — asset institucional único
                  (ver public/assets/biosystem-phone-mockups.webp), com alpha real,
                  tratado como imagem indivisível (nunca recortada/redesenhada em
                  HTML/CSS). Largura responsiva, altura automática, contain — nunca
                  estica/distorce a proporção original (1357x1159). Mais estreita só
                  abaixo de sm: a ponta direita encostava no WhatsApp flutuante fixo
                  (ver FloatingWhatsApp) na largura cheia; sm+/desktop inalterados. */}
              <div className="relative mx-0 w-full max-w-[190px] sm:mx-auto sm:max-w-[420px] lg:mx-0 lg:ml-auto lg:max-w-[520px]">
                <img
                  src="/assets/biosystem-phone-mockups.webp"
                  alt="Dois celulares mostrando exemplos de Mini Sites — um restaurante e uma clínica de estética"
                  width={1357}
                  height={1159}
                  className="h-auto w-full object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </main>
        </div>

        {/* Curva suave de transição pro bloco de benefícios claro abaixo. */}
        <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="relative z-10 block h-12 w-full text-white sm:h-20">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </div>

      <section className="bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {BENEFITS.map(({ Icon, title, description }, index) => (
            <div
              key={title}
              className={`flex items-start gap-4 lg:pl-6 ${index > 0 ? "lg:border-l lg:border-slate-200" : ""}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold text-brand-navy-900">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FloatingWhatsApp />
    </div>
  );
}

export function renderHomePage(): string {
  const body = renderToStaticMarkup(<BioSystemHomePage />);
  const title = "BioSystem | Smart Bio Builder";
  const description =
    "Mini sites profissionais para conectar seu negócio aos seus clientes. Catálogo, links, WhatsApp, avaliações, mapa e muito mais.";
  const fontHref = TYPOGRAPHY_FONT_LINK_HREF.padrao;

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${fontHref}" />
    <style>${publicStyles}</style>
  </head>
  <body>${body}</body>
</html>`;
}
