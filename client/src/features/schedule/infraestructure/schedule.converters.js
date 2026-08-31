function stripId(value) {
    const { id: _id, ...data } = value;
    return data;
}
export const scheduleConverter = {
    toFirestore: (schedule) => stripId(schedule),
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            homePanelRef: data.homePanelRef,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            weekStartsOn: data.weekStartsOn,
            holidays: data.holidays ?? [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
export const subjectConverter = {
    toFirestore: (subject) => stripId(subject),
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            scheduleId: data.scheduleId,
            name: data.name,
            color: data.color,
            panelRef: data.panelRef ?? null,
            exam: data.exam ?? null,
            isArchived: data.isArchived ?? false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
export const classSlotConverter = {
    toFirestore: (slot) => stripId(slot),
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            slotGroupId: data.slotGroupId,
            scheduleId: data.scheduleId,
            subjectId: data.subjectId,
            dayOfWeek: data.dayOfWeek,
            startMinute: data.startMinute,
            endMinute: data.endMinute,
            type: data.type,
            room: data.room,
            building: data.building,
            professor: data.professor,
            notes: data.notes,
            validFromWeek: data.validFromWeek,
            validToWeek: data.validToWeek,
            status: data.status,
            supersedes: data.supersedes ?? null,
            createdAt: data.createdAt,
            editReason: data.editReason,
        };
    },
};
export const occurrenceExceptionConverter = {
    toFirestore: (exception) => stripId(exception),
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            slotGroupId: data.slotGroupId,
            scheduleId: data.scheduleId,
            date: data.date,
            kind: data.kind,
            overrides: data.overrides,
            status: data.status,
            supersedes: data.supersedes ?? null,
            reason: data.reason,
            createdAt: data.createdAt,
        };
    },
};
export const attendanceRecordConverter = {
    toFirestore: (record) => stripId(record),
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            slotGroupId: data.slotGroupId,
            scheduleId: data.scheduleId,
            subjectId: data.subjectId,
            date: data.date,
            status: data.status,
            reason: data.reason,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    },
};
