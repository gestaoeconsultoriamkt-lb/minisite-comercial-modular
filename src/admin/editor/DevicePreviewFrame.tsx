import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Iframe com viewport PRÓPRIO, do tamanho exato do mockup (`width`/`height`
 * em px) — sem isso, os breakpoints Tailwind (`sm:`, `md:`...) usados pelo
 * MiniSiteRenderer (tamanho do nome, altura da hero, offset da logo
 * flutuante...) respondem ao viewport da JANELA DO EDITOR (sempre
 * desktop, ≥640px), não ao tamanho visual do mockup: mesmo com o frame
 * "parecendo" um celular, `sm:` (min-width 640px) disparava sempre,
 * fazendo o preview renderizar a variante "desktop" de cada regra — o
 * motivo real de título/headline quebrarem linha de forma diferente do
 * que aparece num celular real. Clona as folhas de estilo do documento
 * pai para dentro do iframe (mesma origem, sem fetch extra) e injeta
 * `<base>` para resolver imagens/fontes contra a origem real, não
 * "about:srcdoc".
 */
export function DevicePreviewFrame({
  width,
  height,
  className,
  children,
}: {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function syncStyles(doc: Document) {
      const existingKeys = new Set(Array.from(doc.head.querySelectorAll("[data-synced-key]")).map((el) => el.getAttribute("data-synced-key")));
      Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style')).forEach((el, index) => {
        const key = el.getAttribute("href") ?? `inline-${index}`;
        if (existingKeys.has(key)) return;
        const clone = el.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-synced-key", key);
        doc.head.appendChild(clone);
      });
    }

    function setup() {
      const doc = iframe!.contentDocument;
      if (!doc) return;
      if (!doc.head.querySelector("base")) {
        const base = doc.createElement("base");
        base.href = `${window.location.origin}/`;
        doc.head.appendChild(base);
      }
      syncStyles(doc);
      doc.documentElement.style.margin = "0";
      doc.body.style.margin = "0";
      let mount = doc.getElementById("device-preview-mount");
      if (!mount) {
        mount = doc.createElement("div");
        mount.id = "device-preview-mount";
        doc.body.appendChild(mount);
      }
      setMountNode(mount);
    }

    iframe.addEventListener("load", setup);
    // `srcDoc` já entrega um documento pronto de imediato em alguns casos
    // (ex.: remount em StrictMode) — se já estiver completo, roda direto.
    if (iframe.contentDocument?.readyState === "complete") setup();

    // Em dev, o Vite pode injetar novas folhas de estilo depois do mount
    // inicial — mantém o iframe em dia sem exigir refresh manual.
    const observer = new MutationObserver(() => {
      if (iframe.contentDocument) syncStyles(iframe.contentDocument);
    });
    observer.observe(document.head, { childList: true });

    return () => {
      iframe.removeEventListener("load", setup);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Preview do celular"
        srcDoc="<!doctype html><html><head></head><body></body></html>"
        className={className}
        style={{ width, height, border: "none", display: "block" }}
      />
      {mountNode ? createPortal(children, mountNode) : null}
    </>
  );
}
