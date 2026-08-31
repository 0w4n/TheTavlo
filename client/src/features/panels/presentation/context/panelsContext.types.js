import { DocumentReference } from "firebase/firestore";
// ─── Opciones de creación de panel ───────────────────────────────────────────
export var ReturnType;
(function (ReturnType) {
    ReturnType["PANEL"] = "panel";
    ReturnType["DOCREF"] = "docRef";
    ReturnType["DEFAULT"] = "default";
})(ReturnType || (ReturnType = {}));
