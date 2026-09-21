import { useState } from "react";
import { MiniSiteRenderer } from "../../shared/renderer";
import { useEditorStore } from "./editorStore";

type PreviewMode = "mobile" | "desktop";

export function LivePreview() {
  const config = useEditorStore((s) => s.config);
  const [mode, setMode] = useState<PreviewMode>("mobile");

  // Nome público é opcional (não cai no nome interno) — ver MiniSiteRenderer.
  const displayName = config.header.displayName ?? "";

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
            // Largura maior (340px) só a partir de `sm:` — abaixo disso
            // (telas ~360-414px de largura), 340px + borda estourava o
            // container e causava scroll horizontal; 300px sempre coube.
            <div className="w-[300px] rounded-[2.2rem] border-[6px] border-brand-navy-950 bg-brand-navy-950 shadow-xl sm:w-[340px] sm:rounded-[2.4rem] sm:border-[7px]">
              <div className="flex items-center justify-between px-5 py-1.5 text-[10px] font-semibold text-white sm:px-6 sm:py-2 sm:text-[11px]">
                <span>9:41</span>
                <span className="h-1.5 w-16 rounded-full bg-white/20 sm:h-2 sm:w-[72px]" />
              </div>
              <div className="h-[560px] overflow-y-auto rounded-b-[1.8rem] sm:h-[630px] sm:rounded-b-[2rem]">
                <MiniSiteRenderer displayName={displayName} config={config} />
              </div>
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
