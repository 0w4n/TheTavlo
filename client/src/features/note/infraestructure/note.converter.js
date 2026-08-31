export const noteConverter = {
    toFirestore(note) {
        const { id: _id, ...data } = note;
        return data;
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            title: data.title,
            body: data.body,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
