/**
 * Dispara la descarga de un Blob con el nombre indicado. Es el mismo truco de
 * siempre (enlace temporal con `download`), aislado aquí para no repetirlo y
 * para poder probarlo.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";

  // Firefox exige que el enlace esté en el documento para respetar el click.
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revocar en el mismo tick cancelaría la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
