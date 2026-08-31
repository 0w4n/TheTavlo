export class FeatureMapper {
    /**
     *
     * @param id
     * @param data
     * @returns Fe
     */
    static fromFirestore(id, data) {
        return {
            id,
            ...data.data(),
        };
    }
    /**
     *
     * @param data
     * @returns DocumentData
     */
    static toFirestore(data) {
        return data;
    }
}
