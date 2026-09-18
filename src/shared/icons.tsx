import type { SVGProps } from "react";

/**
 * Ícones do MiniSite público (renderer). Separados de `src/admin/components/icons.tsx`
 * de propósito: aqueles são cromo de UI do painel; estes são o que aparece
 * para o visitante final. Tudo SVG inline, sem dependência externa, SSR-safe.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.25" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill={props.fill === "currentColor" ? "currentColor" : "none"}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 17.5 4.5 20l2.6-.7A8.5 8.5 0 1 0 4 12a8.4 8.4 0 0 0 1.2 4.4Z" />
      <path d="M9 9.7c0-.5.4-.9 1-.9.4 0 .6.2.8.6l.5 1.2c.1.3 0 .6-.2.8l-.5.5c.4.9 1.3 1.8 2.2 2.2l.5-.5c.2-.2.5-.3.8-.2l1.2.5c.4.2.6.4.6.8 0 .6-.4 1-.9 1-2.6 0-6-3.4-6-6Z" />
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.6 4.9a3.5 3.5 0 1 1 5 5L16 11.5" />
      <path d="M13 17.5 11.4 19.1a3.5 3.5 0 1 1-5-5L8 12.5" />
    </svg>
  );
}

export function PixIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 8.5 12 4.5l4 4M8 15.5 12 19.5l4-4" />
      <path d="m4.5 12 2.3-2.3a2 2 0 0 1 2.8 0L12 12l2.4-2.3a2 2 0 0 1 2.8 0L19.5 12l-2.3 2.3a2 2 0 0 1-2.8 0L12 12l-2.4 2.3a2 2 0 0 1-2.8 0Z" />
    </svg>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5a12 12 0 0 1 16 0" />
      <path d="M7 13a7.5 7.5 0 0 1 10 0" />
      <path d="M10 16.5a3 3 0 0 1 4 0" />
      <path d="M12 19.5h.01" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h3l1.3 4L8 9.5a11 11 0 0 0 6.5 6.5l2-2.3 4 1.3v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 6.7 2 2 0 0 1 6 3.5Z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.5S5 15 5 10a7 7 0 1 1 14 0c0 5-7 11.5-7 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 21v-7h2.5l.5-3H14v-2c0-.9.3-1.5 1.6-1.5H17V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V11H8.5v3H11v7Z" />
    </svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3.5c.4 1.9 1.7 3.2 3.7 3.4v2.6c-1.3 0-2.5-.4-3.7-1.2v6.4a5 5 0 1 1-4.3-4.9v2.6a2.4 2.4 0 1 0 1.8 2.3V3.5Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5v6M8 7.8h.01M12.2 16.5v-3.6c0-1.2.8-2 2-2s1.8.8 1.8 2v3.6" />
    </svg>
  );
}

export function KwaiIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h6.5L14 9l3.5-5H20l-5 8 5 8h-2.5L14 15l-3.5 5H4l5-8Z" />
    </svg>
  );
}

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  kwai: KwaiIcon,
} as const;

export const BUTTON_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  agendar: CalendarIcon,
  avaliar_google: StarIcon,
  whatsapp: WhatsAppIcon,
  site: LinkIcon,
  telefone: PhoneIcon,
  pix: PixIcon,
  wifi: WifiIcon,
  link_personalizado: LinkIcon,
  localizacao: MapPinIcon,
  instagram: InstagramIcon,
  social: LinkIcon,
};
