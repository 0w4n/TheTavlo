export default function GridOverlay({
  cols = 12,
  rowHeight = 120,
  gap = 16,
}: {
  cols?: number;
  rowHeight?: number;
  gap?: number;
}) {
  return (
    <div
      className="grid-overlay"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: rowHeight,
        gap,
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Array.from({ length: cols * 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            border: "1px dashed rgba(102,126,234,0.25)",
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
}
