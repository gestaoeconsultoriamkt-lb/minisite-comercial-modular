import { useEffect, useState } from "react";
import { MiniSiteRenderer } from "../../shared/renderer";
import { useEditorStore } from "./editorStore";
import { DevicePreviewFrame } from "./DevicePreviewFrame";

type PreviewMode = "mobile" | "desktop";

/**
 * Espelha o breakpoint `sm:` do Tailwind (640px) para o JS — usado só para
 * escolher o tamanho NUMÉRICO do mockup (a moldura em si, no viewport do
 * PRÓPRIO editor); não tem relação com os breakpoints internos do
 * MiniSiteRenderer, que agora respondem ao viewport isolado do iframe
 * (ver DevicePreviewFrame), não ao viewport do editor.
 */
function useIsAtLeast(px: number) {
  const [match, setMatch] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= px : true));
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const listener = () => setMatch(mq.matches);
    listener();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [px]);
  return match;
}

export function LivePreview() {
  const config = useEditorStore((s) => s.config);
  const [mode, setMode] = useState<PreviewMode>("mobile");
  const isWideEditor = useIsAtLeast(640);

  // Nome público é opcional (não cai no nome interno) — ver MiniSiteRenderer.
  const displayName = config.header.displayName ?? "";

  // Largura alinhada a um celular real (390px = iPhone 12/13/14 em CSS px,
  // uma das larguras de teste do projeto) quando o editor tem espaço
  // (viewport ≥640px); abaixo disso, cai para 320px para nunca estourar o
  // container do editor e causar scroll horizontal. Estes números viram o
  // viewport REAL do iframe (ver DevicePreviewFrame) — não só a largura
  // visual da moldura.
  const phoneWidth = isWideEditor ? 390 : 320;
  const phoneHeight = isWideEditor ? 730 : 600;

  return (
    // Wrapper "cru": o grid pai estica este bloco para a altura da coluna
    // esquerda (align-items: stretch). O sticky precisa ficar num FILHO
    // interno — se ficasse neste mesmo nível, o próprio elemento sticky
    // seria também o seu "containing block" (já esticado à altura total),
    // sem sobra de espaço para "colar": por isso ele não acompanhava o
    // scroll antes. Com o filho de altura natural, sobra espaço no pai
    // esticado para o sticky de fato se mover/colar durante o scroll.
    <div>
      <div className="lg:sticky lg:top-6">
        <div className="mx-auto mb-4 flex w-fit rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("mobile")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${mode === "mobile" ? "bg-brand-blue-600 text-white shadow-sm" : "text-slate-600"}`}
          >
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setMode("desktop")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${mode === "desktop" ? "bg-brand-blue-600 text-white shadow-sm" : "text-slate-600"}`}
          >
            Desktop
          </button>
        </div>

        <div className="mx-auto flex justify-center">
          {mode === "mobile" ? (
            // `box-content`: com `box-border` (padrão do projeto), a borda
            // do frame seria descontada da largura declarada — o conteúdo
            // renderizaria mais estreito que `phoneWidth`, exatamente como
            // a moldura física de um celular real não consome pixels de
            // viewport da própria tela.
            <div
              className="box-content rounded-[2.4rem] border-[7px] border-brand-navy-950 bg-brand-navy-950 shadow-xl sm:rounded-[2.8rem] sm:border-[9px]"
              style={{ width: phoneWidth }}
            >
              <div className="flex items-center justify-between px-5 py-1.5 text-[10px] font-semibold text-white sm:px-6 sm:py-2.5 sm:text-[12px]">
                <span>9:41</span>
                <span className="h-1.5 w-16 rounded-full bg-white/20 sm:h-2 sm:w-20" />
              </div>
              <DevicePreviewFrame width={phoneWidth} height={phoneHeight} className="rounded-b-[1.9rem] sm:rounded-b-[2.3rem]">
                <MiniSiteRenderer displayName={displayName} config={config} />
              </DevicePreviewFrame>
            </div>
          ) : (
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
              <div className="h-[560px] overflow-y-auto">
                <MiniSiteRenderer displayName={displayName} config={config} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
