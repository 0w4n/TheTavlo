import { type LoaderFunctionArgs } from "react-router-dom";
import type { PanelLoaderData } from "./panel.loader";
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
export default function sharedPanelLoader({ params, }: LoaderFunctionArgs): Promise<PanelLoaderData>;
