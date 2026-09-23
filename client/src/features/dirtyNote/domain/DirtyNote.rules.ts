import {
  err,
  ok,
  validationErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import {
  DIRTY_NOTE_STATUSES,
  type CreateDirtyNoteDTO,
  type DirtyNoteStatus,
  type UpdateDirtyNoteDTO,
} from "./DirtyNote.entity";

export const DEFAULT_DIRTY_NOTE_STATUS: DirtyNoteStatus = "sucio";
export const DIRTY_NOTE_TITLE_MAX_LENGTH = 100;

/**
 * Tope de caracteres del contenido. Firestore limita un documento a 1 MiB y
 * un carácter puede ocupar hasta 4 bytes en UTF-8: 200 000 caracteres
 * (≤ ~800 KB) dejan margen para el resto de los campos.
 */
export const DIRTY_NOTE_CONTENT_MAX_LENGTH = 200_000;

/** Nombre de archivo cuando el título no deja nada utilizable. */
const FALLBACK_FILE_NAME = "Sin título";
const MAX_FILE_NAME_LENGTH = 100;

// Caracteres que Windows/macOS/Linux no permiten (o que rompen rutas) en un
// nombre de archivo, más los caracteres de control.
// eslint-disable-next-line no-control-regex
const ILLEGAL_FILE_NAME_CHARS = /[\\/:*?"<>|\u0000-\u001f\u007f]/g;
const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

export type DirtyNoteFileExtension = "md" | "pdf";

export class DirtyNoteRules {
  static isStatus(value: unknown): value is DirtyNoteStatus {
    return (
      typeof value === "string" &&
      (DIRTY_NOTE_STATUSES as readonly string[]).includes(value)
    );
  }

  /** Valor válido siempre: un status desconocido/ausente cae a "sucio". */
  static toStatus(value: unknown): DirtyNoteStatus {
    return DirtyNoteRules.isStatus(value) ? value : DEFAULT_DIRTY_NOTE_STATUS;
  }

  static validateTitle(title: string): ResultApp<string, AppErr> {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return err(
        validationErr("El título es requerido", {
          title: "El título no puede estar vacío.",
        }),
      );
    }
    if (trimmed.length > DIRTY_NOTE_TITLE_MAX_LENGTH) {
      return err(
        validationErr(
          `El título no puede exceder ${DIRTY_NOTE_TITLE_MAX_LENGTH} caracteres`,
          {
            title: `Usa ${DIRTY_NOTE_TITLE_MAX_LENGTH} caracteres o menos.`,
          },
        ),
      );
    }
    return ok(trimmed);
  }

  static validateContent(content: string): ResultApp<string, AppErr> {
    if (content.length > DIRTY_NOTE_CONTENT_MAX_LENGTH) {
      return err(
        validationErr(
          `El contenido no puede exceder ${DIRTY_NOTE_CONTENT_MAX_LENGTH} caracteres`,
          { content: "Divide el contenido en más de una DirtyNote." },
        ),
      );
    }
    return ok(content);
  }

  static validateStatus(status: unknown): ResultApp<DirtyNoteStatus, AppErr> {
    if (!DirtyNoteRules.isStatus(status)) {
      return err(
        validationErr(
          `El estado debe ser uno de: ${DIRTY_NOTE_STATUSES.join(", ")}`,
          { status: "Selecciona un estado válido." },
        ),
      );
    }
    return ok(status);
  }

  static validateCreate(
    data: CreateDirtyNoteDTO,
  ): ResultApp<CreateDirtyNoteDTO, AppErr> {
    const title = DirtyNoteRules.validateTitle(data.title);
    if (!title.success) return title;

    const content = DirtyNoteRules.validateContent(data.content);
    if (!content.success) return content;

    const status = DirtyNoteRules.validateStatus(data.status);
    if (!status.success) return status;

    return ok({
      title: title.value,
      content: content.value,
      status: status.value,
    });
  }

  /** Solo valida los campos presentes: un patch parcial es lo normal. */
  static validateUpdate(
    data: UpdateDirtyNoteDTO,
  ): ResultApp<UpdateDirtyNoteDTO, AppErr> {
    const result: UpdateDirtyNoteDTO = {};

    if (data.title !== undefined) {
      const title = DirtyNoteRules.validateTitle(data.title);
      if (!title.success) return title;
      result.title = title.value;
    }
    if (data.content !== undefined) {
      const content = DirtyNoteRules.validateContent(data.content);
      if (!content.success) return content;
      result.content = content.value;
    }
    if (data.status !== undefined) {
      const status = DirtyNoteRules.validateStatus(data.status);
      if (!status.success) return status;
      result.status = status.value;
    }

    return ok(result);
  }

  /** Solo tiene sentido exportar (.md / .pdf) contenido que no esté en blanco. */
  static isExportable(content: string): boolean {
    return content.trim().length > 0;
  }

  /**
   * Una DirtyNote en "final" queda congelada: título y contenido dejan de
   * editarse y solo se ve el Markdown renderizado (nada de la fuente en
   * crudo). La única salida es cambiar el estado a "sucio" o "en progreso"
   * — por diseño, esta regla NUNCA bloquea el propio selector de estado.
   */
  static isLocked(status: DirtyNoteStatus): boolean {
    return status === "final";
  }

  /**
   * Nombre de archivo para las descargas, a partir del título de la
   * DirtyNote: conserva acentos, espacios y mayúsculas, y solo sustituye lo
   * que los sistemas de archivos no aceptan.
   *
   * @example buildFileName("Ideas: v2/final", "md") // "Ideas v2 final.md"
   */
  static buildFileName(title: string, extension: DirtyNoteFileExtension): string {
    let stem = title
      .replace(ILLEGAL_FILE_NAME_CHARS, " ")
      .replace(/\s+/g, " ")
      .trim()
      // Sin puntos al inicio (archivo oculto) ni al final (Windows los elimina).
      .replace(/^\.+/, "")
      .replace(/[. ]+$/, "");

    // Recorte por puntos de código, no por unidades UTF-16, para no partir
    // un emoji a la mitad.
    stem = Array.from(stem).slice(0, MAX_FILE_NAME_LENGTH).join("").trim();

    if (stem.length === 0) stem = FALLBACK_FILE_NAME;
    if (WINDOWS_RESERVED_NAMES.test(stem)) stem = `_${stem}`;

    return `${stem}.${extension}`;
  }
}
