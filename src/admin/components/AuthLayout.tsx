import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

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
 */
export function AuthLayout({ children, topRightSlot }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh w-full bg-white md:flex">
      <div className="flex items-center justify-center gap-3 bg-brand-navy-950 px-6 py-6 md:hidden">
        <BrandLogo size={32} tone="light" />
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
          <BrandLogo size={56} tone="light" />
          <div className="mt-6 h-[3px] w-12 rounded-full bg-gradient-to-r from-brand-cyan-400 to-brand-blue-500" />
          <p className="mt-8 text-sm font-light leading-relaxed tracking-[0.18em] text-white/80">
            COMUNICAÇÃO, PRATICIDADE
            <br />E SOFISTICAÇÃO
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
