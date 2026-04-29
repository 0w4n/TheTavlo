// import React, { useState } from "react";
// import { Timestamp } from "firebase/firestore";
// import { useEvents } from "#features/event/presentation/hooks/useEvents";
// import type {
//   typeEvent,
//   multidayCategory,
//   createAnyEventDTO,
//   AnyEvent,
// } from "#features/events/domain/events.entity";
// import "./addEvent.css";

// // ─── Sub-forms ─────────────────────────────────────────────────────────────────

// interface ExamFieldsProps {
//   value: ExamFields;
//   onChange: (v: ExamFields) => void;
// }

// interface ExamFields {
//   makeAt: Timestamp;
//   durationMinutes: number;
//   notes: string;
// }

// function ExamSubForm({ value, onChange }: ExamFieldsProps) {
//   const set =
//     (k: keyof ExamFields) =>
//     (
//       e: React.ChangeEvent<
//         HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//       >,
//     ) =>
//       onChange({ ...value, [k]: e.target.value });

//   return (
//     <div className="exam-subform">
//       <div className="field-row">
//         <label className="field-label">
//           Exam date & time <span className="required">*</span>
//           <input
//             type="datetime-local"
//             className="field-input"
//             value={value.makeAt}
//             onChange={set("makeAt")}
//             required
//           />
//         </label>
//         <label className="field-label">
//           Duration (minutes) <span className="required">*</span>
//           <input
//             type="number"
//             className="field-input"
//             min={1}
//             value={value.durationMinutes}
//             onChange={(e) =>
//               onChange({ ...value, durationMinutes: +e.target.value })
//             }
//           />
//         </label>
//       </div>
//       <div className="field-row">
//         <label className="field-label">
//           Notes
//           <textarea
//             className="field-input field-textarea"
//             placeholder="Additional notes…"
//             value={value.notes}
//             onChange={set("notes")}
//           />
//         </label>
//       </div>
//     </div>
//   );
// }

// // ── Multidays ──────────────────────────────────────────────────────────────────

// interface MultidaysFields {
//   startsAt: Timestamp;
//   endsAt: Timestamp;
//   location: string;
//   category: multidayCategory;
//   agenda: string;
//   isVirtual: boolean;
//   meetingUrl: string;
// }

// function MultidaysSubForm({
//   value,
//   onChange,
// }: {
//   value: MultidaysFields;
//   onChange: (v: MultidaysFields) => void;
// }) {
//   const set =
//     (k: keyof MultidaysFields) =>
//     (
//       e: React.ChangeEvent<
//         HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//       >,
//     ) =>
//       onChange({ ...value, [k]: e.target.value });

//   return (
//     <div className="exam-subform">
//       <div className="field-row">
//         <label className="field-label">
//           Starts at <span className="required">*</span>
//           <input
//             type="datetime-local"
//             className="field-input"
//             value={value.startsAt}
//             onChange={set("startsAt")}
//           />
//         </label>
//         <label className="field-label">
//           Ends at <span className="required">*</span>
//           <input
//             type="datetime-local"
//             className="field-input"
//             value={value.endsAt}
//             onChange={set("endsAt")}
//           />
//         </label>
//       </div>
//       <div className="field-row">
//         <label className="field-label">
//           Category
//           <select
//             className="field-input"
//             value={value.category}
//             onChange={set("category")}
//           >
//             {(
//               [
//                 "workshop",
//                 "meeting",
//                 "course",
//                 "hackathon",
//                 "other",
//               ] as multidayCategory[]
//             ).map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>
//         </label>
//       </div>
//       <label className="field-label">
//         Location
//         <input
//           type="text"
//           className="field-input"
//           placeholder="Conference center / Online"
//           value={value.location}
//           onChange={set("location")}
//         />
//       </label>
//       <label className="checkbox-label">
//         <input
//           type="checkbox"
//           checked={value.isVirtual}
//           onChange={(e) => onChange({ ...value, isVirtual: e.target.checked })}
//         />
//         Virtual event
//       </label>
//       {value.isVirtual && (
//         <label className="field-label">
//           Meeting URL
//           <input
//             type="url"
//             className="field-input"
//             placeholder="https://meet.google.com/…"
//             value={value.meetingUrl}
//             onChange={set("meetingUrl")}
//           />
//         </label>
//       )}
//       <label className="field-label">
//         Agenda
//         <textarea
//           className="field-input field-textarea"
//           placeholder="Day 1: …"
//           value={value.agenda}
//           onChange={set("agenda")}
//         />
//       </label>
//     </div>
//   );
// }

// // ── Reminder ───────────────────────────────────────────────────────────────────

// interface ReminderFields {
//   remindAt: Timestamp;
//   isRecurring: boolean;
//   recurrenceRule: string;
// }

// function ReminderSubForm({
//   value,
//   onChange,
// }: {
//   value: ReminderFields;
//   onChange: (v: ReminderFields) => void;
// }) {
//   const set =
//     (k: keyof ReminderFields) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
//       onChange({ ...value, [k]: e.target.value });

//   return (
//     <div className="exam-subform">
//       <div className="field-row">
//         <label className="field-label">
//           Remind at <span className="required">*</span>
//           <input
//             type="datetime-local"
//             className="field-input"
//             value={value.remindAt}
//             onChange={set("remindAt")}
//           />
//         </label>
//       </div>
//       <label className="checkbox-label">
//         <input
//           type="checkbox"
//           checked={value.isRecurring}
//           onChange={(e) =>
//             onChange({ ...value, isRecurring: e.target.checked })
//           }
//         />
//         Recurring reminder
//       </label>
//       {value.isRecurring && (
//         <label className="field-label">
//           Recurrence rule (RRULE)
//           <input
//             type="text"
//             className="field-input"
//             placeholder="FREQ=WEEKLY;BYDAY=MO"
//             value={value.recurrenceRule}
//             onChange={set("recurrenceRule")}
//           />
//         </label>
//       )}
//     </div>
//   );
// }

// // ─── Main Form ─────────────────────────────────────────────────────────────────

// const KIND_META: Record<
//   typeEvent,
//   { label: string; icon: string; color: string }
// > = {
//   generic: { label: "Generic", icon: "◈", color: "hsl(232, 100%, 70%)" },
//   exam: { label: "Exam", icon: "✎", color: "hsl(38, 100%, 70%)" },
//   multiDay: { label: "MultiDay", icon: "▦", color: "hsl(160, 100%, 70%)" },
//   reminder: { label: "Reminder", icon: "◉", color: "hsl(0, 100%, 70%)" },
// };

// export function CreateEventForm() {
//   const { createEvent, isLoading, error } = useEvents();

//   const [kind, setKind] = useState<typeEvent>("generic");
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [success, setSuccess] = useState<string | null>(null);

//   // Generic fields
//   const [genericFields, setGenericFields] = useState({
//     startsAt: Timestamp.now(),
//     endsAt: "",
//     location: "",
//   });

//   // Exam fields
//   const [examFields, setExamFields] = useState<ExamFields>({
//     makeAt: Timestamp.now(),
//     durationMinutes: 60,
//     notes: ""
//   });

//   // Multidays fields
//   const [multidaysFields, setMultidaysFields] = useState<MultidaysFields>({
//     startsAt: Timestamp.now(),
//     endsAt: Timestamp.now(),
//     location: "",
//     category: "meeting",
//     agenda: "",
//     isVirtual: false,
//     meetingUrl: "",
//   });

//   // Reminder fields
//   const [reminderFields, setReminderFields] = useState<ReminderFields>({
//     remindAt: Timestamp.now(),
//     isRecurring: false,
//     recurrenceRule: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSuccess(null);

//     let payload: createAnyEventDTO<AnyEvent>;

//     const base = { name, description: description || undefined, kind };

//     if (kind === "generic") {
//       payload = {
//         ...base,
//         kind: "generic",
//         startsAt: genericFields.startsAt,
//         endsAt: genericFields.endsAt,
//         location: genericFields.location || undefined,
//       };
//     } else if (kind === "exam") {
//       payload = {
//         ...base,
//         kind: "exam",
//         makeAt: examFields.makeAt,
//         durationMinutes: examFields.durationMinutes,,
//         notes: examFields.notes || undefined,
//       };
//     } else if (kind === "multiDay") {
//       payload = {
//         ...base,
//         kind: "multidays",
//         startsAt: multidaysFields.startsAt,
//         endsAt: multidaysFields.endsAt,
//         location: multidaysFields.location || undefined,
//         category: multidaysFields.category,
//         agenda: multidaysFields.agenda || undefined,
//         isVirtual: multidaysFields.isVirtual,
//         meetingUrl: multidaysFields.meetingUrl || undefined,
//       };
//     } else {
//       payload = {
//         ...base,
//         kind: "reminder",
//         remindAt: reminderFields.remindAt,
//         isRecurring: reminderFields.isRecurring,
//         recurrenceRule: reminderFields.recurrenceRule || undefined,
//         isDone: false,
//       };
//     }

//     const id = await createEvent(payload as createAnyEventDTO<AnyEvent>);
//     if (id) {
//       setSuccess(id);
//       setName("");
//       setDescription("");
//     }
//   };

//   return (
//     <>
//       <div className="event-form-root">
//         <div className="event-form-wrapper">
//           {/* Header */}
//           <div className="form-header">
//             <p className="form-eyebrow">events / create</p>
//             <h1 className="form-title">
//               New <em>event</em>
//             </h1>
//             <p className="form-subtitle">
//               Pick a kind and fill in the details — it goes straight to
//               Firestore.
//             </p>
//           </div>

//           {/* Kind selector */}
//           <div className="kind-selector">
//             {(
//               Object.entries(KIND_META) as [
//                 typeEvent,
//                 (typeof KIND_META)[typeEvent],
//               ][]
//             ).map(([k, meta]) => (
//               <button
//                 key={k}
//                 type="button"
//                 className={`kind-btn ${kind === k ? "active" : ""}`}
//                 style={{ "--kind-color": meta.color } as React.CSSProperties}
//                 onClick={() => setKind(k)}
//               >
//                 <span className="kind-icon" style={{ color: meta.color }}>
//                   {meta.icon}
//                 </span>
//                 <span className="kind-label">{meta.label}</span>
//               </button>
//             ))}
//           </div>

//           {/* Form card */}
//           <div className="form-card" key={kind}>
//             <form onSubmit={handleSubmit}>
//               {/* Base fields */}
//               <p className="section-label">Base info</p>

//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "1rem",
//                 }}
//               >
//                 <label className="field-label">
//                   Event name <span className="required">*</span>
//                   <input
//                     type="text"
//                     className="field-input"
//                     placeholder="Give it a clear name…"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     required
//                   />
//                 </label>

//                 <label className="field-label">
//                   Description
//                   <textarea
//                     className="field-input field-textarea"
//                     placeholder="Optional — what is this event about?"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                   />
//                 </label>
//               </div>

//               {/* Kind-specific fields */}
//               <div className="section-divider" />
//               <p className="section-label">{KIND_META[kind].label} details</p>

//               {kind === "generic" && (
//                 <div className="exam-subform">
//                   <div className="field-row">
//                     <label className="field-label">
//                       Starts at <span className="required">*</span>
//                       <input
//                         type="datetime-local"
//                         className="field-input"
//                         value={genericFields.startsAt}
//                         onChange={(e) =>
//                           setGenericFields({
//                             ...genericFields,
//                             startsAt: e.target.value,
//                           })
//                         }
//                       />
//                     </label>
//                     <label className="field-label">
//                       Ends at
//                       <input
//                         type="datetime-local"
//                         className="field-input"
//                         value={genericFields.endsAt}
//                         onChange={(e) =>
//                           setGenericFields({
//                             ...genericFields,
//                             endsAt: e.target.value,
//                           })
//                         }
//                       />
//                     </label>
//                   </div>
//                   <label className="field-label">
//                     Location
//                     <input
//                       type="text"
//                       className="field-input"
//                       placeholder="Where?"
//                       value={genericFields.location}
//                       onChange={(e) =>
//                         setGenericFields({
//                           ...genericFields,
//                           location: e.target.value,
//                         })
//                       }
//                     />
//                   </label>
//                 </div>
//               )}

//               {kind === "exam" && (
//                 <ExamSubForm value={examFields} onChange={setExamFields} />
//               )}

//               {kind === "multiDay" && (
//                 <MultidaysSubForm
//                   value={multidaysFields}
//                   onChange={setMultidaysFields}
//                 />
//               )}

//               {kind === "reminder" && (
//                 <ReminderSubForm
//                   value={reminderFields}
//                   onChange={setReminderFields}
//                 />
//               )}

//               {/* Submit */}
//               <button type="submit" className="submit-btn" disabled={isLoading}>
//                 {isLoading
//                   ? "Saving…"
//                   : `↗ Save ${KIND_META[kind].label} event`}
//               </button>

//               {success && (
//                 <div className="feedback success">
//                   ✓ Event created — ID <code>{success}</code>
//                 </div>
//               )}

//               {error && <div className="feedback error">✕ {error}</div>}
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
