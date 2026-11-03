/**
 * Descarga un archivo generado en el navegador sin pasar por el servidor ni
 * persistirlo: la URL del Blob se revoca de inmediato tras iniciar la descarga.
 */
export function downloadBlob(filename: string, data: BlobPart, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
