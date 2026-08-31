import { useEvents } from "#features/events/presentation/hooks/useEvents";

export default function ExamList() {
  const { state } = useEvents();

  if (!state || state.status === "loading") {
    return <div>Loading...</div>;
  }

  if (state.status === "error") {
    return <div>Error loading exams.</div>;
  }

  const exams = state.event.filter((event) => event.type === "exam");

  return (
    <div>
      <h1>Exam List</h1>
      <div>
        {exams.map((exam) => (
          <div key={exam.id}>
            <h2>{exam.name}</h2>
            <p>{exam.makeAt.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
