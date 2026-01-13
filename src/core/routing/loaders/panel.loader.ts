import useAuth from "#core/auth/presentation/hooks/useAuth";
import { get, getDatabase, ref } from "firebase/database";

export default async function panelsLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const panelId = url.searchParams.get("panelId");

  if (!panelId) {
    throw new Response("Panel ID no proporcionado", { status: 400 });
  }

  const { state } = useAuth();

  if (!state.initialized) {
    throw new Response("Usuario no autenticado", { status: 401 });
  }

  try {
    const db = getDatabase();
    const panelRef = ref(db, `user/${state.user?.id}/panels/${panelId}`);
    const snapshot = await get(panelRef);

    if (!snapshot.exists()) {
      throw new Response("Panel no encontrado", { status: 404 });
    }

    return { panelData: snapshot.val(), panelId };
  } catch (error) {
    console.error("Error al cargar el panel:", error);
    throw new Response("Error al cargar el panel", { status: 500 });
  }
}
