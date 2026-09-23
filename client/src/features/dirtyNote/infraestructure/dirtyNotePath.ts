import type { AccountType } from "#core/auth/domain/user.entity";

/** Nombre de la subcolección dentro de cada panel. */
export const DIRTY_NOTE_COLLECTION = "dirtyNote";

export interface DirtyNoteScope {
  accountType: AccountType;
  ownerId: string;
  panelId: string;
}

/**
 * Ruta de la colección de DirtyNote de un panel:
 *
 *   `{accountType}/{ownerId}/panels/{panelId}/dirtyNote`
 *
 * Para una cuenta normal (`accountType === "users"`) queda
 * `users/{userId}/panels/{panelId}/dirtyNote/{dirtyNoteId}`. Se usa el mismo
 * `accountType`/`ownerId` que el resto de features del panel (ver
 * `resolvePanelOwner`) para que las DirtyNote convivan con tareas, eventos y
 * widgets — incluidos paneles compartidos e invitados.
 */
export function buildDirtyNoteCollectionPath({
  accountType,
  ownerId,
  panelId,
}: DirtyNoteScope): string {
  if (!ownerId || !panelId) {
    throw new Error(
      "No hay un panel activo: no se puede resolver la ruta de las DirtyNote.",
    );
  }
  return `${accountType}/${ownerId}/panels/${panelId}/${DIRTY_NOTE_COLLECTION}`;
}
