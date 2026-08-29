import "./upcomingDeadLine.css";

export default function UpcomingDeadlinesWidget(/*{ widget }: { widget: Widget }*/) {
    return (
      <>
        <div className="upcomingDeadlines-item">
          <div className="upcomingDeadlines-item__date">
            <span>24 Días</span>
          </div>
            <div className="upcomingDeadlines-item__info">
                <span>Entrega Documentación</span>
            </div>
        </div>
      </>
    );
}