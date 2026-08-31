export const cookingBookConverter = {
    toFirestore(book) {
        const { id: _id, ...data } = book;
        return data;
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            name: data.name,
            icon: data.icon,
            recipe: data.recipe ?? [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
export const cookingRecipeConverter = {
    toFirestore(recipe) {
        const { id: _id, ...data } = recipe;
        return data;
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            name: data.name,
            steps: data.steps ?? [],
            needs: data.needs ?? [],
            // Se preserva tal cual: el mapper viejo lee `data.tag` (singular) para
            // llenar `tags` (plural) — no lo corrijo acá, es el mismo caso que
            // eventRepository (posible bug preexistente de nombre de campo, fuera
            // de alcance de "mappers -> withConverter").
            tags: data.tag ?? [],
            isLiked: data.isLiked ?? false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
