import type { DocumentData } from "firebase/firestore";
export interface Mapper<tDomain, tDTO> {
    fromFirestore(id: string, data: DocumentData): tDomain;
    toFirestore(data: Partial<tDTO>): DocumentData;
}
export declare class FeatureMapper {
    /**
     *
     * @param id
     * @param data
     * @returns Fe
     */
    static fromFirestore(id: string, data: DocumentData): any;
    /**
     *
     * @param data
     * @returns DocumentData
     */
    static toFirestore(data: Partial<any>): DocumentData;
}
