import React, { useEffect, useRef } from "react";
import type {
  RiseProps,
  RiseSectionProps,
  RiseItemProps,
  RiseStatus,
} from "./rise.types";
import "./rise.css";
import Icon from "#shared/ui/atoms/icons";

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

  const itemClasses = [
    "rise-item",
    item.status === "completed" && "rise-item--completed",
    item.status === "overdue" && "rise-item--overdue",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={itemClasses} onClick={handleClick}>
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
                <Icon name="IconClock" />
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
            {section.icon}
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
  isOpen,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate stats
  const totalItems = sections.reduce(
    (sum, section) => sum + section.items.length,
    0
  );
  const completedItems = sections.reduce(
    (sum, section) =>
      sum + section.items.filter((item) => item.status === "completed").length,
    0
  );
  const pendingItems = totalItems - completedItems;

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hasContent = sections.some((section) => section.items.length > 0);

  return (
    <div
      ref={overlayRef}
      className="rise-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rise-title"
    >
      <div className={`rise ${className}`} {...props}>
        {/* Header */}
        <header className="rise__header">
          <div className="rise__header-top">
            <div className="rise__title-container">
              <div className="rise__icon">
                <Icon name="IconSunrise" />
              </div>
              <div>
                <h1 id="rise-title" className="rise__title">
                  Rise
                </h1>
                <p className="rise__subtitle">{formatDate(date)}</p>
              </div>
            </div>

            <button
              className="rise__close-btn"
              onClick={onClose}
              aria-label="Cerrar Rise"
              type="button"
            >
              <Icon name="IconX" />
            </button>
          </div>

          {/* Stats */}
          <div className="rise__stats">
            <div className="rise__stat">
              <span className="rise__stat-value">{totalItems}</span>
              <span className="rise__stat-label">Total</span>
            </div>
            <div className="rise__stat">
              <span className="rise__stat-value">{pendingItems}</span>
              <span className="rise__stat-label">Pendientes</span>
            </div>
            <div className="rise__stat">
              <span className="rise__stat-value">{completedItems}</span>
              <span className="rise__stat-label">Completados</span>
            </div>
          </div>

          {headerContent}
        </header>

        {/* Content */}
        <div className="rise__content">
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
              <h2 className="rise__no-data-title">No hay eventos para hoy</h2>
              <p className="rise__no-data-description">
                Disfruta de tu día libre o añade nuevas tareas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Rise.displayName = "Rise";
