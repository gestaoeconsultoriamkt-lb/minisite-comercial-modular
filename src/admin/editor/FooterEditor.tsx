import { EditorSection } from "../components/EditorSection";
import { ShareIcon } from "../components/icons";
import { SOCIAL_ICONS } from "../../shared/icons";
import { useEditorStore } from "./editorStore";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-blue-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

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
