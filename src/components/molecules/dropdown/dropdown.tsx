import React, { useState, useRef, useEffect } from "react";
import type { DropdownProps } from "./dropdown.types";
import { type DropdownItemProps, DropdownItem, DropdownDivider } from "./components";

import "./dropdown.css";

/** Type guard para detectar Dropdown.Item */
function isDropdownItem(
  element: React.ReactElement,
): element is React.ReactElement<DropdownItemProps> {
  return element.type === DropdownItem;
}

export function Dropdown({
  trigger,
  position = "bottom-start",
  disabled = false,
  children,
  className = "",
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    if (!disabled) setIsOpen(!isOpen);
  }

  function handleClose() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      // Si el click fue dentro de un modal portal, no cerrar
      const isInsidePortal = document.querySelector('[data-modal-portal]')
        ?.contains(event.target as Node);

      if (isInsidePortal) return;
      console.log("isInsidePortal:", isInsidePortal);
      console.log("CLICK OUTSIDE DROPDOWN", event.target, event.currentTarget);

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
        triggerRef.current?.focus();
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = dropdownRef.current?.querySelectorAll(
          ".dropdown__item:not(:disabled)",
        );
        if (!items?.length) return;

        const currentIndex = Array.from(items).indexOf(
          document.activeElement as HTMLElement,
        );
        let nextIndex =
          e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;

        (items[nextIndex] as HTMLElement).focus();
      }
    }

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
                if (isDropdownItem(child)) {
                    return React.cloneElement(child, {
                      onClick: (e: React.MouseEvent) => {
                        child.props.portalModal === false && child.props.onClick?.(e);
                        handleClose();
                      }
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
}

Dropdown.displayName = "Dropdown";

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
