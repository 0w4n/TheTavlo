import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { onAuthStateChanged } from "@firebase/auth";
function getCurrentUser(auth) {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}
export default async function invitationsLoader({ params }) {
    const { invitationId } = params;
    if (!invitationId) {
        throw new Response("[(ts)panel.loader:37]@Panel ID no proporcionado", {
            status: 400,
        });
    }
    //const db = firebaseService.firestore;
    const auth = firebaseService.auth;
    const user = await getCurrentUser(auth);
    if (!user) {
        throw new Response("[(ts)panel.loader:48]@Usuario no autenticado", {
            status: 401,
        });
    }
}
