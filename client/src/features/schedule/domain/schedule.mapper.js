import { FeatureMapper } from "#core/appCore/domain/AppCore.mapper";
// Igual que `PanelMapper`: `FeatureMapper` hace un passthrough genérico
// (id + spread de campos) porque nuestros documentos guardan
// `DocumentReference`/`Timestamp` nativos de Firestore, que no necesitan
// transformación manual campo a campo — el SDK los serializa/deserializa
// solo. Si en el futuro algún campo necesitara lógica propia de mapeo
// (ej. migraciones de esquema), se reemplaza aquí sin tocar el resto de la
// feature.
export const ScheduleMapper = FeatureMapper;
export const SubjectMapper = FeatureMapper;
export const ClassSlotMapper = FeatureMapper;
export const OccurrenceExceptionMapper = FeatureMapper;
export const AttendanceMapper = FeatureMapper;
