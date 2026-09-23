import { EditorSection } from "../components/EditorSection";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { ShareIcon } from "../components/icons";
import { SOCIAL_ICONS } from "../../shared/icons";
import { useEditorStore } from "./editorStore";

export function FooterEditor() {
  const footer = useEditorStore((s) => s.config.footer);
  const socialLinks = useEditorStore((s) => s.config.socialLinks);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  const configuredSocials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter((key) => socialLinks[key]);

  return (
    <EditorSection icon={<ShareIcon className="h-5 w-5" />} title="Rodapé social" subtitle="Escolha se deseja exibir os ícones das redes sociais no rodapé do seu MiniSite.">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={footer.showSocialIcons}
            onChange={(checked) => patchConfig({ footer: { ...footer, showSocialIcons: checked } })}
            label="ícones no rodapé"
          />
          <span className="text-sm font-semibold text-brand-navy-900">Exibir ícones no rodapé</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          {configuredSocials.length > 0 ? (
            configuredSocials.map((key) => {
              const Icon = SOCIAL_ICONS[key];
              return <Icon key={key} className="h-4 w-4" />;
            })
          ) : (
            <span className="text-xs">Nenhuma rede configurada</span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400">Esses ícones aparecem no rodapé do seu MiniSite.</p>
    </EditorSection>
  );
}
