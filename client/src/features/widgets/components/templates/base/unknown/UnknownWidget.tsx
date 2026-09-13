// Se muestra cuando `widget.type` no tiene ningún WidgetDefinition
// registrado: el widget fue eliminado, es de una versión más nueva de la
// app, o el documento de Firestore está corrupto. En cualquier caso, el
// dashboard no debe romperse — solo este widget queda inerte.
export default function UnknownWidget({ type }: { type: string }) {
  return (
    <div className="widget-error" role="alert">
      <p>Este widget ("{type}") ya no está disponible.</p>
    </div>
  );
}
