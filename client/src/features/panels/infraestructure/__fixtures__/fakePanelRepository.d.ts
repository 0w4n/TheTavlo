import type { DocumentReference } from "firebase/firestore";
import type { PanelRepository } from "../../app/panelsRepository.interface";
import type { Panel } from "../../domain/panel.entity";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
export declare function refTo(id: string): DocumentReference;
/**
 * Implementación 100% en memoria de `PanelRepository`, para tests que no
 * quieren (ni deberían) tocar Firestore de verdad. Expone contadores de
 * llamadas (`calls`) para que los tests de `CachedPanelsRepository` puedan
 * afirmar cosas del tipo "la segunda navegación no generó ninguna lectura
 * nueva" sin depender de mocks de red.
 */
export declare function createFakePanelRepository(initialPanels?: Panel[]): {
    repository: PanelRepository;
    calls: {
        findById: number;
        findManyByIds: number;
        findByParentId: number;
        create: number;
        update: number;
        delete: number;
        deleteCascade: number;
        findArchived: number;
        archive: number;
        unarchive: number;
        deleteArchived: number;
    };
    /** Acceso directo al store interno — útil para setup/aserciones en tests. */
    panels: Map<string, Panel>;
    spies: {
        findById: import("vitest").Mock<(id: string) => Promise<ResultApp<Panel | undefined, AppErr>>>;
        findManyByIds: import("vitest").Mock<(ids: string[]) => Promise<ResultApp<Panel[], AppErr>>>;
        findByParentId: import("vitest").Mock<(parentId: DocumentReference) => Promise<ResultApp<Panel[], AppErr>>>;
    };
};
