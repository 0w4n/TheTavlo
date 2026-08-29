import React, { useEffect } from "react";
import type {
  RiseProps,
  RiseSectionProps,
  RiseItemProps,
  RiseStatus,
} from "./rise.types";
import "./rise.css";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";

/**
 * RiseItem - Individual item component
 */
const RiseItem: React.FC<RiseItemProps> = ({
  item,
  onClick,
  onStatusChange,
}) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const newStatus: RiseStatus =
        item.status === "completed" ? "pending" : "completed";
      onStatusChange(item.id, newStatus);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div className={"rise-item"} onClick={handleClick}>
      <div className="rise-item__header">
        {(item.type === "task" || item.type === "deadline") && (
          <div
            className="rise-item__checkbox"
            onClick={handleCheckboxClick}
            role="checkbox"
            aria-checked={item.status === "completed"}
          />
        )}

        <div className="rise-item__content">
          <h4 className="rise-item__title">{item.title}</h4>

          {item.description && (
            <p className="rise-item__description">{item.description}</p>
          )}

          <div className="rise-item__meta">
            {item.time && (
              <div className="rise-item__meta-item">
                <Icon name="Clock" />
                <span>{item.time}</span>
              </div>
            )}

            {item.duration && (
              <div className="rise-item__meta-item">
                <span>• {item.duration}</span>
              </div>
            )}

            {item.location && (
              <div className="rise-item__meta-item">
                <Icon name="MapPinIcon" />
                <span>{item.location}</span>
              </div>
            )}

            {item.attendees && item.attendees.length > 0 && (
              <div className="rise-item__meta-item">
                <Icon name="IconUser" />
                <span>{item.attendees.length} asistentes</span>
              </div>
            )}
          </div>
        </div>

        {item.priority && (
          <div
            className={`rise-item__priority rise-item__priority--${item.priority}`}
          >
            {item.priority}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * RiseSection - Section component
 */
const RiseSection: React.FC<RiseSectionProps> = ({
  section,
  onItemClick,
  onItemStatusChange,
  showCompleted = true,
}) => {
  const filteredItems = showCompleted
    ? section.items
    : section.items.filter((item) => item.status !== "completed");

  if (filteredItems.length === 0 && !showCompleted) {
    return null;
  }

  return (
    <section className="rise-section">
      <div className="rise-section__header">
        {section.icon && (
          <div className="rise-section__icon" style={{ color: section.color }}>
            <Icon name={section.icon}/>
          </div>
        )}
        <h3 className="rise-section__title">{section.title}</h3>
        <span className="rise-section__count">{filteredItems.length}</span>
      </div>

      <div className="rise-section__items">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <RiseItem
              key={item.id}
              item={item}
              onClick={onItemClick}
              onStatusChange={onItemStatusChange}
            />
          ))
        ) : (
          <div className="rise-section__empty">
            No hay elementos en esta sección
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Rise - Main component
 */
export const Rise: React.FC<RiseProps> = ({
  onClose,
  date = new Date(),
  sections,
  onItemClick,
  onItemStatusChange,
  showCompleted = true,
  headerContent,
  className = "",
  ...props
}) => {

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const hasContent = sections.some((section) => section.items.length > 0);

  const b3 = date.getHours() < 14 ? "Buenos días" : date.getHours() < 18 ? "Buenas tardes" : "Buenas noches";

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className={`rise-page ${className}`} {...props}>
      <section className="rise__header-section">
        <header className="rise__header">
          <div className="rise__header-top">
            <div className="rise__title-container">
              <div>
                <span>{b3}, Jorge</span>
                <p className="rise__subtitle">Hoy es {formatDate(date)}</p>
              </div>
            </div>
          </div>
        </header>
      </section>
      <main className="rise__content">
        {hasContent ? (
          sections.map((section, index) => (
            <RiseSection
              key={index}
              section={section}
              onItemClick={onItemClick}
              onItemStatusChange={onItemStatusChange}
              showCompleted={showCompleted}
            />
          ))
        ) : (
          <div className="rise__no-data">
            <Icon name="IconCalendar" />
            <h2>No hay eventos para hoy</h2>
            <p>Disfruta tu día o añade nuevas tareas</p>
            <Button
              variant="primary"
              className="rise__close-btn"
              onClick={onClose}
              aria-label="Cerrar Rise"
            >
              <Icon name="IconArrowLeft" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

Rise.displayName = "Rise";
