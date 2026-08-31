import { useContext } from "react";
import { InvitationContext } from "../context/invitationContext";

export default function useInvitation() {
    const context = useContext(InvitationContext);

    if (!context) {
        throw new Error("Necesitas tener el contexto dentro del provider");
    }

    return context;
};