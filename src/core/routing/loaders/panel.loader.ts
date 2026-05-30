import { doc, DocumentReference, Firestore, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import type { Panel } from "#features/panels/domain/panel.entity";
// import type { Task } from "#features/task/domain/task.entity";

function getCurrentUser(auth: Auth) {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject,
    );
  });
}

export default async function panelsLoader({ params }: { params: any }) {
  const { pid, "*": nestedPath } = params;

  if (!pid) {
    throw new Response("[(ts)panel.loader:37]@Panel ID no proporcionado", {
      status: 400,
    });
  }

  const db = firebaseService.firestore;
  const auth = firebaseService.auth;

  const user = await getCurrentUser(auth);

  if (!user) {
    throw new Response("[(ts)panel.loader:48]@Usuario no autenticado", {
      status: 401,
    });
  }

  if (nestedPath) {
    const segments = nestedPath.split("/");

    switch (segments[0]) {
      case "calendar":
        console.info("Calendar");
        break;

      case "task":
        console.info("Task");
        break;

      default:
        return fetchSubPanel(user, db, pid, segments[0]);
        break;
    }
  } else {
    return await fetchPanel(user, db, pid);
  }
}

async function fetchPanel(user: User, db: Firestore, pid: string) {
  try {
    const panelRef = doc(db, "users", user.uid, "panels", pid);
    const snapshot = await getDoc(panelRef);

    if (!snapshot.exists()) {
      throw new Response(
        "[(ts)panel.loader-fetchPanel:80]@Panel no encontrado",
        { status: 404 },
      );
    }

    return { ...snapshot.data(), id: pid } as Panel;
  } catch (error) {
    throw new Response(
      "[(ts)panel.loader-fetchPanel:89]@Error al cargar el panel",
      { status: 500 },
    );
  }
}

async function fetchSubPanel(
  user: User,
  db: Firestore,
  pid: string,
  subPid: string,
) {
  try {
    const panelRef = doc(db, "users", user.uid, "panels", pid);
    const snapshot = await getDoc(panelRef);

    if (!snapshot.exists()) {
      throw new Response(
        "[(ts)panel.loader-fetchSubPanel:94]@Panel no encontrado",
        { status: 404 },
      );
    }

    const arraySubPanel: DocumentReference[] =
      snapshot.get("subPanelsId") ?? [];
    console.info(arraySubPanel);

    for (const ref of arraySubPanel) {
      // A subPanelsId entry can point to the user's own "panels" collection
      // OR to the global "shared" collection — match by the last segment (id).
      if (ref.id === subPid) {
        // Use the DocumentReference directly so shared refs resolve correctly.
        const subSnapshot = await getDoc(ref);
        console.info(subSnapshot);

        if (!subSnapshot.exists()) {
          throw new Response(
            "[(ts)panel.loader-fetchSubPanel:113]@SubPanel no encontrado en Firestore",
            { status: 404 },
          );
        }

        return { ...subSnapshot.data(), id: subPid } as Panel;
      }
    }

    throw new Response(
      "[(ts)panel.loader-fetchSubPanel:123]@SubPanel no encontrado en la lista del padre",
      { status: 404 },
    );
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response(
      "[(ts)panel.loader-fetchSubPanel:129]@Error al cargar el panel",
      { status: 500 },
    );
  }
}

// async function fetchTask(user: User, db: Firestore, pid: string, tid: string) {
//   try {
//     const taskRef = doc(db, "users", user.uid, "panels", pid, "task", tid);
//     const snapshot = await getDoc(taskRef);

//     if (!snapshot.exists()) {
//       throw new Response(
//         "[(ts)panel.loader-fetchTask:143]@Panel no encontrado",
//         { status: 404 },
//       );
//     }

//     return { ...snapshot.data(), id: tid } as Task;
//   } catch (error) {
//     console.error("Error al cargar la task:", error);
//     throw new Response(
//       "[(ts)panel.loader-fetchTask:152]@Error al cargar la task",
//       { status: 500 },
//     );
//   }
// }
