import type { Panel } from "./panel.entity";
export type ChainValidationResult = {
    valid: true;
} | {
    valid: false;
    /**
     * "missing"     → alguno de los ids de la URL no existe como panel.
     * "broken-link" → existe, pero su `parentId` real no apunta al panel
     *                 anterior de la cadena (alguien escribió una URL a
     *                 mano combinando paneles que no están anidados así).
     */
    reason: "missing" | "broken-link";
    panelId: string;
};
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
export declare function validatePanelChain(panelIds: string[], panelsById: Map<string, Panel>): ChainValidationResult;
