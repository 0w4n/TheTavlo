import { type Firestore, type Unsubscribe } from "firebase/firestore";
import type { AnyTask, CreateAnyTaskDTO, UpdateAnyTaskDTO } from "../domain/task.entity";
import type { TaskRepository } from "../app/taskRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { type AppErr } from "#core/appCore/domain/AppCore.type";
export declare class FirebaseTaskRepository implements TaskRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getCollectionPath;
    private getContext;
    private collectionRef;
    private docRef;
    /**
     * Escucha las tareas del panel activo en tiempo real.
     * La primera emisión entrega todas las tareas actuales;
     * las siguientes reflejan creates, updates y deletes sin polling.
     */
    subscribe(onData: (tasks: AnyTask[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    findAll(): Promise<AnyTask[]>;
    findById(id: string): Promise<AnyTask | null>;
    create(data: CreateAnyTaskDTO): Promise<AnyTask>;
    update(id: string, data: UpdateAnyTaskDTO): Promise<AnyTask>;
    delete(id: string): Promise<void>;
}
