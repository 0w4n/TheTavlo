import DOMPurify from "dompurify";
import { Marked } from "marked";

/**
 * Markdown → HTML SANITIZADO. Es la única vía por la que el contenido de una
 * DirtyNote llega a `dangerouslySetInnerHTML` o al PDF.
 *
 * Por qué sanitizar: en un panel compartido, el contenido lo pudo escribir
 * OTRA persona (un editor). `marked` deja pasar HTML crudo, así que sin
 * sanitizar un `<img onerror=…>` se ejecutaría en la sesión de quien abra la
 * DirtyNote (XSS). Además de lo que DOMPurify ya bloquea (scripts, handlers
 * `on*`, URLs `javascript:`), aquí se prohíbe lo que permitiría suplantar la
 * interfaz de la app: estilos (posicionar contenido encima de la UI),
 * formularios/controles, y `id`/`name` (chocarían con ids reales como
 * `modal-title`).
 */

const markdown = new Marked({ gfm: true, breaks: false });

markdown.use({
  renderer: {
    // Las casillas de las listas de tareas (`- [x] algo`) salen como <input>
    // por defecto, y <input> está prohibido más abajo. Se dibujan como texto
    // con aria-label, así que además no son interactivas.
    checkbox({ checked }) {
      return checked
        ? '<span class="dirty-note-checkbox" role="img" aria-label="Completada">☑</span> '
        : '<span class="dirty-note-checkbox" role="img" aria-label="Pendiente">☐</span> ';
    },
  },
});

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    "style",
    "form",
    "input",
    "button",
    "select",
    "option",
    "textarea",
  ],
  FORBID_ATTR: ["style", "id", "name"],
};

let purifier: ReturnType<typeof DOMPurify> | undefined;

// Instancia propia (no el DOMPurify global) para que el hook de abajo no
// afecte a nadie más que use DOMPurify en la app. Se crea perezosamente
// porque necesita `window`.
function getPurifier() {
  if (purifier) return purifier;

  purifier = DOMPurify(window);
  purifier.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.hasAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  return purifier;
}

export function renderDirtyNoteMarkdown(source: string): string {
  const html = markdown.parse(source, { async: false });
  return getPurifier().sanitize(html, SANITIZE_CONFIG);
}
