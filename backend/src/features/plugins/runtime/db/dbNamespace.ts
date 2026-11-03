import type { CollectionReference, DocumentReference, Transaction } from "firebase-admin/firestore";
import { TRPCError } from "@trpc/server";
import { widgetsCollection } from "../../../widgets/widgets.router.js";
import type { InstanceInput } from "../runtime.inputs.js";

export const DB_TARGETS = ["instance", "panel"] as const;
export type DbTarget = (typeof DB_TARGETS)[number];

/**
 * Raíz del namespace. NUNCA la elige el plugin:
 *  instance → {widgetRef}/pluginDb/root          (datos de UNA instancia)
 *  panel    → {panelRef}/pluginDb/{pluginId}     (compartido entre instancias del MISMO plugin)
 * `pluginId` llega derivado del `type` del widget (assertDbAccess), jamás del input.
 */
export function namespaceRoot(ctx: any, scope: InstanceInput, target: DbTarget, pluginId: string): DocumentReference {
  const widgets = widgetsCollection(ctx, scope) as CollectionReference;
  if (target === "instance") return widgets.doc(scope.widgetId).collection("pluginDb").doc("root");
  const panelRef = widgets.parent;
  if (!panelRef) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Panel no resoluble." });
  return panelRef.collection("pluginDb").doc(pluginId);
}

/** El path del plugin cuelga COMO SUBCOLECCIONES de la raíz: el primer segmento es una colección. */
export function resolveRef(root: DocumentReference, segments: string[]): CollectionReference | DocumentReference {
  let ref: CollectionReference | DocumentReference = root;
  segments.forEach((seg, i) => {
    ref = i % 2 === 0 ? (ref as DocumentReference).collection(seg) : (ref as CollectionReference).doc(seg);
  });
  return ref;
}

// ── Contador transaccional de documentos (campo `docCount` del doc raíz) ──────────────────────
export async function readCount(tx: Transaction, root: DocumentReference): Promise<number> {
  const n = (await tx.get(root)).data()?.docCount;
  return typeof n === "number" && Number.isSafeInteger(n) && n > 0 ? n : 0;
}

export function writeCount(tx: Transaction, root: DocumentReference, count: number): void {
  tx.set(root, { docCount: Math.max(0, count), updatedAt: new Date().toISOString() }, { merge: true });
}
