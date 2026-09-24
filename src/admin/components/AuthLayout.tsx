import type { ReactNode } from "react";
import smartBioBuilderLogo from "../assets/smart-bio-builder-logo.webp";

interface AuthLayoutProps {
  children: ReactNode;
  /** Ex.: CTA "Ainda não tem uma conta? Cadastrar agora", só na tela de login. */
  topRightSlot?: ReactNode;
}

/**
 * Shell de duas colunas (painel institucional azul-marinho + área branca)
 * reutilizado por Login, Cadastro, Esqueci minha senha e Redefinir senha.
 * Em telas pequenas o painel institucional vira um cabeçalho compacto para
 * não competir com o formulário nem gerar scroll horizontal.
 *
 * A identidade do painel institucional (logo Smart bio.builder + frase) é
 * própria desta área — não usa o `BrandLogo` genérico ("MiniSite Comercial
 * Modular"), que continua intacto no card do formulário (AuthCard) e no
 * resto do admin (Sidebar). O arquivo do logo já vem com glow/sombra
 * própria em PNG/WebP com alpha — combina bem direto sobre o navy, sem
 * precisar de placa/fundo branco por trás (ao contrário do LogoPlate do
 * MiniSite público, pensado para logos de clientes sem controle de fundo).
 */
export function AuthLayout({ children, topRightSlot }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh w-full bg-white md:flex">
      <div className="flex items-center justify-center gap-2.5 bg-brand-navy-950 px-6 py-5 md:hidden">
        <img src={smartBioBuilderLogo} alt="Smart bio.builder" className="h-10 w-10 object-contain" />
        <span className="text-sm font-semibold tracking-wide text-white/90">Smart bio.builder</span>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-navy-950 md:flex md:w-[46%] md:flex-col md:items-center md:justify-center">
        <div
          aria-hidden
          className="absolute -bottom-1/3 -left-1/4 h-[75%] w-[150%] rotate-[-16deg] rounded-[4rem] bg-gradient-to-tr from-brand-navy-700/70 via-brand-navy-800/40 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -top-1/4 right-0 h-[60%] w-[60%] rounded-[4rem] bg-gradient-to-bl from-brand-blue-600/20 to-transparent blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center px-10 text-center">
          <img src={smartBioBuilderLogo} alt="Smart bio.builder" className="h-44 w-44 object-contain" />
          <p className="mt-9 text-[13px] font-medium uppercase leading-relaxed tracking-[0.32em] text-white/75">
            Crie <span className="text-white/40">•</span> Publique <span className="text-white/40">•</span> Gerencie
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex min-h-11 justify-end px-6 pt-6 sm:px-10">{topRightSlot}</div>
        <main className="flex flex-1 items-center justify-center px-6 pb-10 pt-2 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
