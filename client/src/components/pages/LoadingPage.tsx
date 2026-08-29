export default function LoadingPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div className="spin"
      />
      <p>Cargando TheTavlo...</p>
    </div>
  );
}
