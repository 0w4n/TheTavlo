import type { FirestoreDataConverter } from "firebase/firestore";
import type { Panel } from "../domain/panel.entity";
/**
 * Reemplaza `mapDocumentToPanel` + `ownerFromPath`. El mapper viejo
 * necesitaba que el CALLER le pasara `{ownerId, ownerAccountType}` a mano
 * en cada uno de sus ~10 call sites (salvo en `findByRef`/`findBySharedId`,
 * que ya lo derivaban de `docSnap.ref.path`). Acá se deriva SIEMPRE del
 * path del propio documento (`snapshot.ref.path` = "{accountType}/{ownerId}/panels/{id}"),
 * que es exactamente lo mismo que un query contra tu propia colección
 * también te da — así que no se pierde nada, y se deja de tener que
 * acordarse de pasar `owner` en cada método nuevo.
 */
export declare const panelConverter: FirestoreDataConverter<Panel>;
