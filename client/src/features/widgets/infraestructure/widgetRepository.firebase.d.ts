import { Firestore, DocumentReference, type Unsubscribe } from "firebase/firestore";
import type { WidgetRepository } from "../app/widgetRepository.interface";
import type { Widget, CreateWidgetDTO, UpdateWidgetDTO } from "../domain/widget.entity";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { ResponsiveLayouts } from "react-grid-layout";
export declare class FirebaseWidgetRepository implements WidgetRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getCollectionPath;
    private getContext;
    private collectionRef;
    private docRef;
    /**
     * Escucha los widgets del panel activo en tiempo real.
     * La primera emisión carga los datos actuales; las siguientes
     * reflejan cualquier cambio en Firestore sin polling.
     */
    subscribe(onData: (widgets: Widget[]) => void, onError: (err: string) => void): Unsubscribe;
    findByPanel(_panelId: string): Promise<Widget[]>;
    findById(id: string, _panelId?: string): Promise<Widget | null>;
    findByRef(documentRef: DocumentReference): Promise<Widget | null>;
    create(data: CreateWidgetDTO): Promise<Widget>;
    update(id: string, data: UpdateWidgetDTO): Promise<Widget>;
    updateLayout(layouts: ResponsiveLayouts): Promise<Widget>;
    updateBulkLayout(layouts: ResponsiveLayouts): Promise<void>;
    delete(id: string): Promise<void>;
}
