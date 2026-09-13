import "./widgetSkeleton.css";

export default function WidgetSkeleton() {
  return (
    <div className="widget-skeleton" role="status" aria-label="Cargando widget">
      <div className="widget-skeleton__line widget-skeleton__line--title" />
      <div className="widget-skeleton__line" />
      <div className="widget-skeleton__line" />
    </div>
  );
}
