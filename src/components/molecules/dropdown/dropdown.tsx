import React, { useState, useRef, useEffect } from "react";
import type {
  DropdownProps,
  DropdownItemProps,
  DropdownDividerProps,
} from "./dropdown.types";
import "./dropdown.css";

/** Type guard para detectar Dropdown.Item */
function isDropdownItem(
  element: React.ReactElement
): element is React.ReactElement<DropdownItemProps> {
  return element.type === Dropdown.Item;
}

export const Dropdown: React.FC<DropdownProps> & {
  Item: React.FC<DropdownItemProps>;
  Divider: React.FC<DropdownDividerProps>;
} = ({
  trigger,
  position = "bottom-start",
  disabled = false,
  children,
  className = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleClose = () => setIsOpen(false);

  // Click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Navegación teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        triggerRef.current?.focus();
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = dropdownRef.current?.querySelectorAll(
          ".dropdown__item:not(:disabled)"
        );
        if (!items?.length) return;

        const currentIndex = Array.from(items).indexOf(
          document.activeElement as HTMLElement
        );
        let nextIndex =
          e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;

        (items[nextIndex] as HTMLElement).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const containerClasses = [
    "dropdown",
    disabled && "dropdown--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={dropdownRef} className={containerClasses} {...props}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className="dropdown__trigger"
        onClick={handleToggle}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          <div className="dropdown__backdrop" onClick={handleClose} />
          <div
            className={`dropdown__menu dropdown__menu--${position}`}
            role="menu"
            aria-orientation="vertical"
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // Solo actúa sobre Dropdown.Item
                if (isDropdownItem(child)) {
                  return React.cloneElement(child, {
                    onClick: (e: React.MouseEvent) => {
                      child.props.onClick?.(e);
                      handleClose();
                    },
                  });
                }
                return child;
              }
              return child;
            })}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Dropdown Item
 */
const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  disabled = false,
  danger = false,
  children,
  className = "",
  onClick,
  ...props
}) => {
  const classes = [
    "dropdown__item",
    danger && "dropdown__item--danger",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled}
      role="menuitem"
      onClick={onClick}
      {...props}
    >
      {icon && (
        <span className="dropdown__item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

/**
 * Dropdown Divider
 */
const DropdownDivider: React.FC<DropdownDividerProps> = ({ label }) => {
  if (label) {
    return (
      <div className="dropdown__divider dropdown__divider--with-label">
        <span className="dropdown__divider-label">{label}</span>
      </div>
    );
  }

  return <div className="dropdown__divider" role="separator" />;
};

// Attach subcomponents
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

Dropdown.displayName = "Dropdown";
DropdownItem.displayName = "Dropdown.Item";
DropdownDivider.displayName = "Dropdown.Divider";
