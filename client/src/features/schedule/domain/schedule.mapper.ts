import { FeatureMapper, type Mapper } from "#core/appCore/domain/AppCore.mapper";
import type { CreateScheduleDTO, Schedule } from "./schedule.entity";
import type { CreateSubjectDTO, Subject } from "./subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "./classSlot.entity";
import type {
  CreateOccurrenceExceptionDTO,
  OccurrenceException,
} from "./occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "./attendanceRecord.entity";

// Igual que `PanelMapper`: `FeatureMapper` hace un passthrough genérico
// (id + spread de campos) porque nuestros documentos guardan
// `DocumentReference`/`Timestamp` nativos de Firestore, que no necesitan
// transformación manual campo a campo — el SDK los serializa/deserializa
// solo. Si en el futuro algún campo necesitara lógica propia de mapeo
// (ej. migraciones de esquema), se reemplaza aquí sin tocar el resto de la
// feature.

export const ScheduleMapper: Mapper<Schedule, CreateScheduleDTO> = FeatureMapper;
export const SubjectMapper: Mapper<Subject, CreateSubjectDTO> = FeatureMapper;
export const ClassSlotMapper: Mapper<ClassSlot, CreateClassSlotDTO> = FeatureMapper;
export const OccurrenceExceptionMapper: Mapper<
  OccurrenceException,
  CreateOccurrenceExceptionDTO
> = FeatureMapper;
export const AttendanceMapper: Mapper<AttendanceRecord, UpsertAttendanceDTO> =
  FeatureMapper;
