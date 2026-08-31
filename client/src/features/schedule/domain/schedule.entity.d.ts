import type { DocumentReference, Timestamp } from "firebase/firestore";
/**
 * Un festivo o periodo de vacaciones dentro de un Schedule. Se guarda
 * embebido en el propio documento `Schedule` (array pequeño, ≈5-15 por
 * periodo) — no necesita subcolección propia (ver diseño §10).
 */
export interface Holiday {
    label: string;
    startDate: Timestamp;
    endDate: Timestamp;
}
/**
 * Documento en `/{accountType}/{userId}/panels/{panelId}/schedule/{scheduleId}`.
 *
 * Relación con Panel (ver diseño §0): todo `Schedule` cuelga siempre de un
 * único Panel-anfitrión — el `{panelId}` de la propia ruta, que además se
 * denormaliza aquí en `homePanelRef` para no tener que reconstruirlo a
 * mano desde el path en cada sitio que lo necesite (ej. `collectionGroup`
 * queries futuras, UI). Es una referencia distinta del `panelRef` opcional
 * que cada `Subject` puede tener hacia OTRO panel específico.
 */
export interface Schedule {
    id: string;
    homePanelRef: DocumentReference;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
    weekStartsOn: 1 | 0;
    holidays: Holiday[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type CreateScheduleDTO = Omit<Schedule, "id">;
export type UpdateScheduleDTO = Partial<Omit<CreateScheduleDTO, "createdAt" | "homePanelRef">>;
