import { redirect } from "react-router-dom";
import { doc } from "firebase/firestore";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { FirebasePanelsRepository } from "#features/panels/infraestructure/panelRepository.firebase";
import { isErr } from "#core/appCore/domain/AppCore.type";
import { getCurrentUser } from "./getCurrentUser";
import { withReturnTo } from "../returnTo";
/**
 * Loader para `/shared/:ownerAccountType/:ownerId/:panelId` — adonde se
 * llega DESPUÉS de aceptar una invitación (o al abrir un enlace público),
 * ver `InvitationGate.tsx`.
 *
 * A propósito NO reutiliza `panel.loader.ts` (resolveChain): ese loader
 * asume que todo panel cuelga, vía `parentId`, del homePanel del usuario
 * ACTUAL — un panel compartido vive en el árbol de OTRO dueño, así que se
 * resuelve directo por referencia (`findByRef`, que ya sabe derivar el
 * dueño real desde el path del documento — ver `panel.converter.ts`),
 * sin cadena ni breadcrumb anidado
 * (fuera de alcance para v1 — ver Q5 de la conversación de invitaciones).
 *
 * El acceso real ya lo deciden `firestore.rules` (canRead) al momento del
 * `getDoc` dentro de `findByRef` — acá solo evitamos un error de permisos
 * "feo" en consola cuando obviamente no hay sesión, mandando a login con
 * `returnTo` de vuelta a esta misma URL.
 */
export default async function sharedPanelLoader({ params, }) {
    const { ownerAccountType, ownerId, panelId } = params;
    if (!ownerAccountType || !ownerId || !panelId) {
        throw redirect("/home?invalidPanel=1");
    }
    const returnPath = `/shared/${ownerAccountType}/${ownerId}/${panelId}`;
    const user = await getCurrentUser(firebaseService.auth);
    if (!user) {
        throw redirect(withReturnTo("/login", returnPath));
    }
    const panelsRepository = new FirebasePanelsRepository(firebaseService.firestore, () => user);
    const ref = doc(firebaseService.firestore, ownerAccountType, ownerId, "panels", panelId);
    const result = await panelsRepository.findByRef(ref);
    if (isErr(result) || !result.value) {
        // Sin acceso (las reglas lo bloquearon) o el panel ya no existe.
        throw redirect("/home?invalidPanel=1");
    }
    const panel = result.value;
    return { kind: "dashboard", panels: [panel], panel };
}
