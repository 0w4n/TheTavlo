// ─── Enums ───────────────────────────────────────────────────────────────────
export var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["REJECTED"] = "rejected";
    InvitationStatus["EXPIRED"] = "expired";
    InvitationStatus["REVOKED"] = "revoked";
})(InvitationStatus || (InvitationStatus = {}));
export var InvitationType;
(function (InvitationType) {
    InvitationType["CHOWN"] = "chown";
    InvitationType["CHMOD"] = "chmod";
    InvitationType["CHROL"] = "chrol";
    InvitationType["SHARE"] = "share";
})(InvitationType || (InvitationType = {}));
export var SharedObjType;
(function (SharedObjType) {
    SharedObjType["PANEL"] = "panel";
    SharedObjType["TASK"] = "task";
    SharedObjType["NOTES"] = "notes";
    SharedObjType["CALENDAR"] = "calendar";
    SharedObjType["EVENT"] = "event";
})(SharedObjType || (SharedObjType = {}));
export var UserRole;
(function (UserRole) {
    UserRole["EDITOR"] = "editor";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
export var InvitationMode;
(function (InvitationMode) {
    InvitationMode["LINK"] = "link";
    InvitationMode["USERS"] = "users";
})(InvitationMode || (InvitationMode = {}));
// ─── Type Guards ──────────────────────────────────────────────────────────────────────────────────
export function isChownInvitation(invitation) {
    return invitation.type === InvitationType.CHOWN;
}
export function isSharedInvitation(invitation) {
    return invitation.type === InvitationType.SHARE;
}
export function isPublicSharedInvitation(invitation) {
    return (invitation.type === InvitationType.SHARE &&
        invitation.mode === InvitationMode.LINK);
}
export function isPrivateSharedInvitation(invitation) {
    return (invitation.type === InvitationType.SHARE &&
        invitation.mode === InvitationMode.USERS);
}
