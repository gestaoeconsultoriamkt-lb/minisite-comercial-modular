import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { UsersIcon } from "../components/icons";
import { SOCIAL_ICONS } from "../../shared/icons";
import type { MiniSiteSocialLinks } from "../../shared/schemas/miniSiteConfig";
import { useEditorStore } from "./editorStore";

const SOCIAL_FIELDS: { key: keyof MiniSiteSocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/seunegocio" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/seunegocio" },
  { key: "tiktok", label: "Tiktok", placeholder: "https://tiktok.com/@seunegocio" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@seunegocio" },
  { key: "linkedin", label: "Linkedin", placeholder: "https://linkedin.com/company/seunegocio" },
  { key: "kwai", label: "Kwai", placeholder: "https://kwai.com/@seunegocio" },
];

export function SocialLinksEditor() {
  const socialLinks = useEditorStore((s) => s.config.socialLinks);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  function update(key: keyof MiniSiteSocialLinks, value: string) {
    patchConfig({ socialLinks: { ...socialLinks, [key]: value || undefined } });
  }

  return (
    <EditorSection icon={<UsersIcon className="h-5 w-5" />} title="Redes sociais" subtitle="Informe suas redes sociais para aparecer no seu MiniSite.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => {
          const Icon = SOCIAL_ICONS[key];
          return (
            <TextField
              key={key}
              name={key}
              label={label}
              placeholder={placeholder}
              icon={<Icon className="h-4 w-4" />}
              value={socialLinks[key] ?? ""}
              onChange={(e) => update(key, e.target.value)}
            />
          );
        })}
      </div>
    </EditorSection>
  );
}
