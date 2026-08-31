import { trpcMutation, trpcQuery } from "#shared/infraestructure/api/trpcClient";
import { UserRole } from "../domain/invitation.entity";
/** Parsea "{accountType}/{ownerId}/panels/{panelId}" -> partes, o null si no calza. */
export function parsePanelDocPath(path) {
    if (!path)
        return null;
    const [ownerAccountType, ownerId, collection, panelId] = path.split("/");
    if (!ownerAccountType || !ownerId || collection !== "panels" || !panelId)
        return null;
    return { ownerAccountType, ownerId, panelId };
}
export const InvitationApiClient = {
    inviteByEmail(input) {
        return trpcMutation("invitations.inviteByEmail", input);
    },
    createPublicLink(input) {
        return trpcMutation("invitations.createPublicLink", input);
    },
    resolveAccess(input) {
        return trpcQuery("invitations.resolveAccess", input);
    },
    respond(input) {
        return trpcMutation("invitations.respond", input);
    },
};
export { UserRole };
