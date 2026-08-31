import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type { CookingBook } from "../domain/CookingBook.entity";
import type { CookingRecipe } from "../domain/CookingRecipe.entity";

export const cookingBookConverter: FirestoreDataConverter<CookingBook> = {
  toFirestore(book: WithFieldValue<CookingBook>): DocumentData {
    const { id: _id, ...data } = book as CookingBook;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CookingBook {
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

export const cookingRecipeConverter: FirestoreDataConverter<CookingRecipe> = {
  toFirestore(recipe: WithFieldValue<CookingRecipe>): DocumentData {
    const { id: _id, ...data } = recipe as CookingRecipe;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CookingRecipe {
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
