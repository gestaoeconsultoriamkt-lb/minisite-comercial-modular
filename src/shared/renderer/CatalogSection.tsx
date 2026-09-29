import { getAssetUrl } from "../assetUrl";
import { formatCatalogPrice, getSectionImageItems, isCatalogSectionReady, type CatalogImageItem } from "../catalog";
import { TagIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";
import type { MiniSiteConfig, MiniSiteSectionDisplayMode, MiniSiteVisualStyle } from "../schemas/miniSiteConfig";

/** Moldura do card por `visualStyle` — `simple` é o card que já existia (sem regressão). */
const CARD_FRAME: Record<MiniSiteVisualStyle, string> = {
  simple: "rounded-2xl",
  premium: "rounded-[20px] ring-1 ring-white/10 shadow-[0_10px_26px_-10px_rgba(0,0,0,0.45)]",
  glass: "rounded-[20px] ring-1 ring-white/20 shadow-[0_14px_32px_-12px_rgba(0,0,0,0.5)]",
};

/**
 * A imagem é a unidade visual principal da seção — sem Item/CTA/descrição
 * longa. Cada imagem pode opcionalmente ter um nome curto e/ou preço.
 *
 * `standard` (default, comportamento que já existia — só a proporção subiu
 * de 2:3 para 4:5, mais alinhada ao tamanho recomendado no painel) mostra
 * nome/preço numa faixa translúcida sobre a base da foto, com
 * `object-cover`. `poster` é para artes já prontas (cardápio, promoção,
 * peça de story) enviadas pelo cliente: usa 9:16 e `object-contain` para
 * nunca cortar texto/elementos da própria arte, e por isso nunca sobrepõe
 * nome/preço na imagem — eles aparecem como legenda abaixo do card.
 */
function CatalogImageCard({
  id,
  item,
  showPrice,
  visualStyle,
  displayMode,
}: {
  id: string;
  item: CatalogImageItem;
  showPrice: boolean;
  visualStyle: MiniSiteVisualStyle;
  displayMode: MiniSiteSectionDisplayMode;
}) {
  const hasLabel = Boolean(item.label?.trim());
  const hasPrice = showPrice && typeof item.price === "number";

  if (displayMode === "poster") {
    return (
      // Largura relativa ao carrossel (não pixels fixos) — mesmo princípio
      // do card 4:5 abaixo: 1 poster deve dominar a tela no mobile, com o
      // próximo só espiando na lateral (ver comentário do card padrão).
      <div id={id} className="flex w-[88%] shrink-0 flex-col gap-1.5 snap-start">
        <div className={`relative w-full overflow-hidden bg-white/10 ${CARD_FRAME[visualStyle]}`}>
          <img src={getAssetUrl(item.imageKey)} alt={item.label ?? ""} loading="lazy" className="aspect-[9/16] w-full object-contain" />
          {visualStyle === "glass" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 via-transparent to-transparent ring-1 ring-inset ring-white/10"
            />
          ) : null}
        </div>
        {hasLabel || hasPrice ? (
          <div className="px-0.5 text-center">
            {hasLabel ? <p className="truncate text-[13px] font-semibold text-white">{item.label}</p> : null}
            {hasPrice ? <p className="text-[13px] font-semibold text-white/70">{formatCatalogPrice(item.price!)}</p> : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    // Largura em % do carrossel (não pixels fixos como `w-44`/`sm:w-56`
    // antes) — a mesma largura fixa que parecia "grande" no preview do
    // editor (colunas largas) ficava pequena demais no celular real, onde
    // o conteúdo é bem mais estreito: 2 cards de ~176-224px cabiam quase
    // inteiros lado a lado em qualquer tela de 360-414px. 88% do
    // container garante 1 card bem dominante + só uma lasca do próximo,
    // consistente em qualquer largura de tela — mesmo raciocínio já usado
    // na Galeria (aprovada), sem alterar nenhum arquivo da Galeria.
    <div id={id} className={`relative w-[88%] shrink-0 snap-start overflow-hidden bg-white/10 ${CARD_FRAME[visualStyle]}`}>
      <img src={getAssetUrl(item.imageKey)} alt={item.label ?? ""} loading="lazy" className="aspect-[4/5] w-full object-cover" />
      {visualStyle === "glass" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 via-transparent to-transparent ring-1 ring-inset ring-white/10"
        />
      ) : null}
      {hasLabel || hasPrice ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 pb-2.5 pt-7">
          {hasLabel ? <p className="truncate text-[13px] font-semibold text-white">{item.label}</p> : null}
          {hasPrice ? <p className="text-[13px] font-semibold text-white">{formatCatalogPrice(item.price!)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function CatalogSection({ config }: { config: MiniSiteConfig }) {
  const sections = [...config.sections].filter(isCatalogSectionReady).sort((a, b) => a.position - b.position);
  if (sections.length === 0) return null;

  const visualStyle = config.appearance.visualStyle;

  return (
    <section className="mt-10 flex flex-col gap-10">
      {sections.map((section) => {
        const images = getSectionImageItems(section);
        return (
          <div key={section.id} className="flex flex-col gap-5">
            <SectionHeading icon={<TagIcon className="h-3.5 w-3.5" />} title={section.title} visualStyle={visualStyle} />
            <div className="flex flex-col gap-2">
              {/* Sem hidratação no MiniSite público — swipe funciona nativamente via
                  scroll-snap (inclusive scroll horizontal por mouse/trackpad no
                  desktop); os pontos são links de âncora (scroll-to-target
                  nativo, sem JS). O primeiro ponto aparece "ativo" por padrão
                  (mesmo padrão da Galeria) — não é possível destacar
                  dinamicamente qual imagem está visível sem JS, mas os pontos
                  passam a indicar de fato a quantidade/posição de slides em
                  vez de ficarem todos idênticos. */}
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((item, index) => (
                  <CatalogImageCard
                    key={`${item.id}-${index}`}
                    id={`cat-${section.id}-img-${index}`}
                    item={item}
                    showPrice={section.showPrices}
                    visualStyle={visualStyle}
                    displayMode={section.displayMode}
                  />
                ))}
              </div>
              {images.length > 1 ? (
                <div className="flex justify-center gap-1.5">
                  {images.map((_, index) => (
                    <a
                      key={index}
                      href={`#cat-${section.id}-img-${index}`}
                      aria-label={`Ir para imagem ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all ${index === 0 ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
