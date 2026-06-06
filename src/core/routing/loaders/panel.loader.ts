import {
  doc,
  Firestore,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  DocumentReference,
} from "firebase/firestore";
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
    console.info("nestedPath segments:", segments);

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
  pid: DocumentReference,
  subPid: DocumentReference,
) {
  try {
    // Query sub-panel by its parentId field — no longer relies on subPanelsId array.
    const panelsCol = collection(db, "users", user.uid, "panels");
    const q = query(panelsCol, where("parentId", "==", pid));
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      if (docSnap.id === subPid.id) {
        return { ...docSnap.data(), id: subPid.id } as Panel;
      }
    }

    throw new Response(
      "[(ts)panel.loader-fetchSubPanel:113]@SubPanel no encontrado",
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
