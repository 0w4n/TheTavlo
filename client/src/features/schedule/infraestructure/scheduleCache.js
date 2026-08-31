const buckets = new Map();
function getBucket(cacheKey) {
    let bucket = buckets.get(cacheKey);
    if (!bucket) {
        bucket = {
            schedule: undefined,
            subjects: new Map(),
            slots: new Map(),
            exceptions: new Map(),
            attendance: new Map(),
        };
        buckets.set(cacheKey, bucket);
    }
    return bucket;
}
export function getScheduleCacheKey(user, panelId) {
    return `${user.accountType}/${user.id}/panels/${panelId}/schedule`;
}
// ─── Schedule ────────────────────────────────────────────────────────────
export function getCachedSchedule(cacheKey) {
    return getBucket(cacheKey).schedule;
}
export function setCachedSchedule(cacheKey, schedule) {
    getBucket(cacheKey).schedule = schedule;
}
// ─── Subjects ────────────────────────────────────────────────────────────
export function setCachedSubjects(cacheKey, subjects) {
    const bucket = getBucket(cacheKey);
    bucket.subjects = new Map(subjects.map((s) => [s.id, s]));
}
export function getCachedSubjects(cacheKey) {
    return Array.from(getBucket(cacheKey).subjects.values());
}
export function upsertCachedSubject(cacheKey, subject) {
    getBucket(cacheKey).subjects.set(subject.id, subject);
}
// ─── ClassSlots ──────────────────────────────────────────────────────────
export function setCachedSlots(cacheKey, slots) {
    const bucket = getBucket(cacheKey);
    bucket.slots = new Map(slots.map((s) => [s.id, s]));
}
export function getCachedSlots(cacheKey) {
    return Array.from(getBucket(cacheKey).slots.values());
}
export function getCachedSlotById(cacheKey, id) {
    return getBucket(cacheKey).slots.get(id);
}
export function upsertCachedSlot(cacheKey, slot) {
    getBucket(cacheKey).slots.set(slot.id, slot);
}
/**
 * La versión de `slotGroupId` cuyo rango de vigencia cubre `week` — usada
 * por `ScheduleService.editClassSlot`/`deleteClassSlot` para construir el
 * plan de versionado sin una lectura extra a Firestore, dado que el
 * listener de `subscribeToSlotVersions` ya mantiene esto actualizado.
 */
export function getCachedActiveSlotVersion(cacheKey, slotGroupId, week) {
    return getCachedSlots(cacheKey).find((s) => s.slotGroupId === slotGroupId && s.validFromWeek <= week && week <= s.validToWeek);
}
// ─── Exceptions ──────────────────────────────────────────────────────────
export function setCachedExceptions(cacheKey, exceptions) {
    const bucket = getBucket(cacheKey);
    bucket.exceptions = new Map(exceptions.map((e) => [e.id, e]));
}
export function getCachedExceptions(cacheKey) {
    return Array.from(getBucket(cacheKey).exceptions.values());
}
export function upsertCachedException(cacheKey, exception) {
    getBucket(cacheKey).exceptions.set(exception.id, exception);
}
// ─── Attendance ──────────────────────────────────────────────────────────
export function setCachedAttendance(cacheKey, records) {
    const bucket = getBucket(cacheKey);
    bucket.attendance = new Map(records.map((a) => [a.id, a]));
}
export function getCachedAttendance(cacheKey) {
    return Array.from(getBucket(cacheKey).attendance.values());
}
export function upsertCachedAttendance(cacheKey, record) {
    getBucket(cacheKey).attendance.set(record.id, record);
}
/** Limpia toda la caché de un Schedule — usar en logout / cambio de cuenta o panel. */
export function clearScheduleCache(cacheKey) {
    buckets.delete(cacheKey);
}
/** Solo para tests: resetea todo el estado del módulo entre specs. */
export function __resetAllScheduleCacheForTests() {
    buckets.clear();
}
