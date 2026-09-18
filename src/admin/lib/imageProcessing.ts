import type { UploadPurpose } from "./minisitesApi";

const MAX_DIMENSION_BY_PURPOSE: Record<UploadPurpose, number> = {
  logo: 800,
  cover: 1600,
  background: 1600,
  gallery: 1600,
  card: 1000,
  section: 1000,
};

/**
 * Redimensiona/recomprime no cliente antes do upload — evita arquivos
 * excessivamente grandes chegando ao Worker/R2. Preserva o formato (e
 * portanto a transparência) de PNG e WebP; JPEG permanece JPEG.
 */
export async function compressImage(file: File, purpose: UploadPurpose): Promise<Blob> {
  const maxDimension = MAX_DIMENSION_BY_PURPOSE[purpose];
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  const quality = outputType === "image/png" ? undefined : 0.85;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao processar imagem"))),
      outputType,
      quality,
    );
  });
}
