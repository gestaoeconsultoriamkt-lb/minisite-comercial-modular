import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { SOCIAL_ICONS } from "../icons";
import { SOCIAL_PLATFORM_LABELS, getFilledSocialEntries } from "../socialLinks";
import { getButtonColors, MiniSiteButtonLink } from "./MiniSiteButton";

/**
 * Botões de redes sociais no CORPO do MiniSite — coexistem com os ícones do
 * rodapé (ver MiniSiteRenderer), não os substituem. Só aparece quando há ao
 * menos uma rede preenchida (mesmo padrão de presença dos outros módulos).
 */
export function SocialButtonsSection({ config }: { config: MiniSiteConfig }) {
  const entries = getFilledSocialEntries(config.socialLinks);
  if (entries.length === 0) return null;

  const colors = getButtonColors(config);

  return (
    <div className="mt-6 flex w-full flex-col gap-2.5">
      {entries.map(({ platform, href }) => {
        const Icon = SOCIAL_ICONS[platform];
        return (
          <MiniSiteButtonLink
            key={platform}
            href={href}
            icon={<Icon className="h-4.5 w-4.5" />}
            label={SOCIAL_PLATFORM_LABELS[platform]}
            colors={colors}
          />
        );
      })}
    </div>
  );
}
