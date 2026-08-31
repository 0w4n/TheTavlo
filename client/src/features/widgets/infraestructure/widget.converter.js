export const widgetConverter = {
    toFirestore(widget) {
        const { id: _id, ...data } = widget;
        return data;
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            type: data.type,
            config: data.config ?? {},
            locked: data.locked ?? false,
            layout: data.layout,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
