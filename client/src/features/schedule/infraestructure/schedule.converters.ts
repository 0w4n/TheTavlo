import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type { Schedule } from "../domain/schedule.entity";
import type { Subject } from "../domain/subject.entity";
import type { ClassSlot } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord } from "../domain/attendanceRecord.entity";

function stripId<T extends { id: string }>(value: T): DocumentData {
  const { id: _id, ...data } = value;
  return data;
}

export const scheduleConverter: FirestoreDataConverter<Schedule> = {
  toFirestore: (schedule: WithFieldValue<Schedule>) =>
    stripId(schedule as Schedule),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Schedule => {
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

export const subjectConverter: FirestoreDataConverter<Subject> = {
  toFirestore: (subject: WithFieldValue<Subject>) => stripId(subject as Subject),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Subject => {
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

export const classSlotConverter: FirestoreDataConverter<ClassSlot> = {
  toFirestore: (slot: WithFieldValue<ClassSlot>) => stripId(slot as ClassSlot),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ClassSlot => {
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

export const occurrenceExceptionConverter: FirestoreDataConverter<OccurrenceException> = {
  toFirestore: (exception: WithFieldValue<OccurrenceException>) =>
    stripId(exception as OccurrenceException),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): OccurrenceException => {
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

export const attendanceRecordConverter: FirestoreDataConverter<AttendanceRecord> = {
  toFirestore: (record: WithFieldValue<AttendanceRecord>) =>
    stripId(record as AttendanceRecord),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): AttendanceRecord => {
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
