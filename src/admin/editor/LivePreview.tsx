import { useState } from "react";
import { MiniSiteRenderer } from "../../shared/renderer";
import { useEditorStore } from "./editorStore";

type PreviewMode = "mobile" | "desktop";

export function LivePreview() {
  const internalName = useEditorStore((s) => s.internalName);
  const config = useEditorStore((s) => s.config);
  const [mode, setMode] = useState<PreviewMode>("mobile");

  const displayName = config.header.displayName || internalName || "Seu negócio";

  return (
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
          <div className="w-[300px] rounded-[2.2rem] border-[6px] border-brand-navy-950 bg-brand-navy-950 shadow-xl">
            <div className="flex items-center justify-between px-5 py-1.5 text-[10px] font-semibold text-white">
              <span>9:41</span>
              <span className="h-1.5 w-16 rounded-full bg-white/20" />
            </div>
            <div className="h-[560px] overflow-y-auto rounded-b-[1.8rem]">
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
  );
}
