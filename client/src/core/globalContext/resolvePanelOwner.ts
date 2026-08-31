import type { AccountType } from "#core/auth/domain/user.entity";
import type { GlobalContextValue } from "./context/globalContext";

/**
 * Resuelve bajo qué cuenta (accountType + id) viven los datos del panel
 * activo en Firestore: `{accountType}/{ownerId}/panels/{panelId}/...`.
 *
 * Si el panel tiene un dueño explícito (`state.panel.ownerId` /
 * `ownerAccountType` — se llena cuando el panel llega por una invitación,
 * ver `globalContext.tsx`), usamos SIEMPRE ese dueño, sin importar quién
 * esté mirando. Si no hay dueño explícito (panel propio), caemos al
 * usuario actual.
 *
 * IMPORTANTE: nunca mezclar el `accountType` del visitante con el
 * `ownerId` del dueño (o viceversa) — eso rompe en cuanto el que comparte
 * y el invitado tienen `accountType` distinto (ej. "users" invita a un
 * "guest"). Este helper existe para que los cinco repositorios que leen
 * datos de un panel (tasks, events, notes, schedule, widgets) no
 * dupliquen (ni desincronicen) esta lógica.
 */
export function resolvePanelOwner(
  ctx: GlobalContextValue,
): { accountType: AccountType; ownerId: string } {
  const { user, panel } = ctx.state;

  return {
    accountType: panel.ownerAccountType ?? user.accountType,
    ownerId: panel.ownerId ?? user.userId,
  };
}
