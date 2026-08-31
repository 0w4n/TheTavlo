/**
 * Verifica, de forma pura y sincrónica, que la cadena de `panelIds` tal como
 * viene en la URL (`home/:pid/:pid/...`) respete estrictamente la jerarquía
 * real de `parentId` en la base de datos: cada panel debe existir, y su
 * `parentId` debe apuntar exactamente al panel anterior de la cadena (o no
 * tener padre, si es el primero).
 *
 * No toca Firestore ni ninguna caché — recibe los paneles ya resueltos
 * (típicamente vía `ensurePanelsInCache`) indexados por id. Esto la hace
 * trivial de testear con datos fabricados a mano, sin mocks de red.
 */
export function validatePanelChain(panelIds, panelsById) {
    let previous;
    for (const id of panelIds) {
        const panel = panelsById.get(id);
        if (!panel)
            return { valid: false, reason: "missing", panelId: id };
        const expectedParentId = previous?.id ?? null;
        if ((panel.parentId?.id ?? null) !== expectedParentId) {
            return { valid: false, reason: "broken-link", panelId: id };
        }
        previous = panel;
    }
    return { valid: true };
}
