import type { FirestoreDataConverter } from "firebase/firestore";
import type { AnyEvent } from "../domain/events.entity";
/**
 * ⚠️ Port 1:1 de `mapDocumentToAnyEvent` — NO es una corrección. Este
 * mapper YA estaba roto antes de tocar nada acá: switchea sobre
 * `"exam" | "multiDay" | "reminder"` y campos (`category`, `isRecurring`,
 * `recurrenceRule`) que no existen en `AnyEvent` (events.entity.ts define
 * `GenericEvent | ExamEvent | MeetingEvent | OtherEvent`, con
 * `multiday`/`reminder` como sub-objetos y tipos `"generic"|"exam"|
 * "meeting"|"other"`). Es uno de los 67 errores de `tsc -b` preexistentes
 * que reporté aparte (no en este cambio) — no lo arreglo acá adentro de un
 * cambio que se pidió como "mappers -> withConverter" porque no sé si hay
 * documentos reales en Firestore ya escritos con esta forma (arreglarlo a
 * ciegas podría dejar de leer datos existentes). El `as unknown as
 * AnyEvent` de abajo silencia el error de tipos para que este archivo
 * nuevo no aparezca con errores propios — es a propósito, NO es una
 * corrección; el objeto que se arma en runtime es idéntico al de antes.
 * Si se confirma que no hay data real todavía, avísenme y lo alineo al
 * dominio real (`GenericEvent | ExamEvent | MeetingEvent | OtherEvent`).
 */
export declare const eventConverter: FirestoreDataConverter<AnyEvent>;
