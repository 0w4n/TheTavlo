/**
 * CSP inyectada por el HOST como PRIMER nodo del documento (antes que cualquier
 * script del plugin, que no puede adelantarse porque quitamos su doctype).
 * Sin red, sin frames, sin workers, sin eval. Solo código/estilos inline.
 */
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

export function buildSrcDoc(html: string): string {
  const body = html.replace(/^\uFEFF?\s*<!doctype[^>]*>/i, "");
  return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${CSP}">${body}`;
}
