Cuando pongo un form y luego un input y pulso para poder rellenarlo, en este caso el modal se cierra y me impide el poder rellenarlo. Le paso todos los archivos que participan en este fragmento de código. Has de saber que no veo en la consola el comentario de `CLICK OVERLAY: ...` y si el comentario de `Soy yo quien está dando por culo con el Bubbling`.

1º: Pulso y se me despliega el dropdown `WidgetContainer.tsx` => 
```ts
import { useEffect, useRef } from "react";
import { Button } from "#components/atoms/button";
import type { Widget } from "#features/widgets/domain/widget.entity";
import Icon from "#shared/ui/atoms/icons";
import WidgetContent from "../content/WidgetContent";
import { getIconWidgetType } from "./utils";
import { Dropdown } from "#components/molecules/dropdown";
import BreadCrumb from "#components/molecules/breadcrumb/breadcrumb";

import "./widgetcontainer.css";
import addShared from "#components/templates/dialog/modShared/addShared";

const actionTrigers = {
  iconTrigger: "IconDotsVertical",
  options: [
    {
      label: "Compartir",
      icon: "IconUserPlus",
      onClick: () => console.log("Opción 1 seleccionada"),
      render: (onClose: () => void) => addShared({ type: "panel", onClose }),
      portalModal: true,
    },
    {
      label: "Ajustes",
      icon: "IconSettings",
      onClick: () => console.log("Opción 2 seleccionada"),
    },
    {
      label: "Bloquear",
      icon: "IconLock",
      onClick: () => console.log("Opción 3 seleccionada"),
    },
    {
      label: "Eliminar",
      icon: "IconTrash",
      danger: true,
      onClick: () => console.log("Opción 4 seleccionada"),
    },
  ],
};

export default function WidgetContainer({
  widget,
  editMode,
  onRemove,
}: {
  widget: Widget;
  editMode: boolean;
  onResize?: (layout: Widget["layout"]) => void;
  onRemove?: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // 🔹 Detectar overflow y aplicar clase
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      el.classList.toggle("widget__content-scroll", hasOverflow);
    };

    // Inicial
    update();

    // Resize del contenedor
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    // Cambios en el DOM interno
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Resize de ventana (por si cambia layout global)
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="widget" style={{ cursor: editMode ? "grab" : "default" }}>
      <div className="widget__header">
        <div>
          <Icon name={getIconWidgetType(widget.type)} />
        </div>
        <div>
          <BreadCrumb />
          {editMode && !widget.locked && (
            <Button variant="danger" onClick={onRemove}>
              <Icon name="IconTrash" />
            </Button>
          )}

          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                iconSize={16}
                icon="IconDotsVertical"
                className="configButton "
              />
            }
          >
            {actionTrigers.options.map((option, index) =>
              option.portalModal ? (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  render={option.render}
                  portalModal
                />
              ) : (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  onClick={option.onClick}
                />
              ),
            )}
          </Dropdown>
        </div>
      </div>

      <div ref={contentRef} className="widget__content">
        <WidgetContent widget={widget} />
        <div className="widget__content-add">
          <Icon name={"IconPlus"} strokeWidth={2.0} size={32} />
          <div className="widget__content-add-text">
            <span>Añadir tu próximo panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

2º: Pasa por el `item.tsx` del dropdown => 
```ts
import { Button } from "#components/atoms/button";
import ModalPortal from "#components/molecules/modal/portal";
import type { DropdownItemProps } from "./item.types";

import "./item.css";

export function DropdownItem({
  icon,
  label,
  disabled = false,
  danger = false,
  className = "",
  ...props
}: DropdownItemProps) {
  const classes = [
    "dropdown__item",
    danger && "dropdown__item--danger",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.portalModal) {
    return (
      <ModalPortal iconName={icon} label={label} className={classes}>
        {(onClose) => props.render(onClose)}
      </ModalPortal>
    );
  }

  return (
    <Button
      className={classes}
      disabled={disabled}
      role="menuitem"
      label={label}
      icon={icon}
      {...props}
    >
      {props.children}
    </Button>
  );
}
```

3º: Pasa por el portalModal en este caso llamado `index.ts` =>
```ts
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "#components/atoms/button";
import { Modal } from "../modal";
import type { ModalPortalProps } from "./modalPortal.types";

/**
 * Modal component for dialogs and overlays
 *
 * @example
 * ```tsx
 * <ModalPortal iconName="IconLayoutGridAdd">
 *   {children}
 * </ModalPortal>
 * ```
 */
export default function ModalPortal({
  iconName,
  label,
  className,
  children,
}: ModalPortalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={iconName}
        label={label}
        className={className}
      ></Button>

      {open &&
        createPortal(
          <Modal onClose={(open) => setOpen(open)} size="full">
            {children(() => setOpen(false))}
          </Modal>,
          document.body,
        )}
    </>
  );
}
```

4º: Se renderiza el `addShared.tsx` => 

```ts
import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
import Input from "#components/atoms/input/input";
import type { AddSharedProps } from "./addShared.type";

import "./addShared.css";

export default function addShared({ type, onClose }: AddSharedProps) {
  return (
    <>
      <Modal.Header onClose={onClose} icon="IconShare">
        <span>Compartir {type}</span>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) => e.preventDefault()}>
          <Input
            variant="default"
            label="Correo electrónico"
            placeholder="Ingrese el correo electrónico"
            leftIcon="IconAt"
            onClick={(e) => {
              console.log("CLICK OVERLAY", e.target, e.currentTarget);
            }}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="ghost" label="Cancelar" />
        <Button variant="primary" label="Guardar" />
      </Modal.Footer>
    </>
  );
}
```


Además aquí tienes el `modal.tsx`, 
```ts
import { useEffect, useRef } from "react";
import type { ModalProps } from "./modal.types";
import { ModalHeader, ModalBody, ModalFooter } from "./components";

import "./modal.css";

/**
 * Modal component
 */
export function Modal({
  onClose,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  className = "",
  children,
  ...props
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ESC
  useEffect(() => {
    if (!closeOnEscape) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [closeOnEscape, onClose]);

  // Scroll lock + restore focus
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
      previousActiveElement.current?.focus();
    };
  }, []);

  // Focus trap
  useEffect(() => {
    if (!modalRef.current) return;
    const modal = modalRef.current;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    modal.addEventListener("keydown", onTab);
    return () => modal.removeEventListener("keydown", onTab);
  }, []);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (!closeOnBackdropClick) return;

        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose(false);
        }
      }}
    >
      <div
        ref={modalRef}
        className={`modal__container modal__${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

Modal.displayName = "Modal";

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
```, el `Input.tsx` así quedaría ```
import React, { forwardRef } from "react";
import type { InputProps } from "./input.types";
import "./Input.css";
import Icon from "#shared/ui/atoms/icons";

function InputFn(
  {
    variant = "default",
    size = "md",
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    required = false,
    className = "",
    wrapperClassName = "",
    id,
    disabled,
    ...props
  }: InputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const inputId = id || `input-${React.useId()}`;
  const helperTextId = `${inputId}-helper`;
  const errorMessageId = `${inputId}-error`;

  const finalVariant = errorMessage ? "error" : variant;

  const inputClasses = [
    "input",
    `input--${size}`,
    finalVariant !== "default" && `input--${finalVariant}`,
    leftIcon && "input--with-left-icon",
    rightIcon && "input--with-right-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = ["input-wrapper", wrapperClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`input__label ${required ? "input__label--required" : ""}`}
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="input-container">
        {leftIcon && (
          <Icon name={leftIcon} className="input__icon input__icon--left" aria-hidden="true" />
        )}

        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={finalVariant === "error" ? "true" : "false"}
          aria-describedby={
            errorMessage
              ? errorMessageId
              : helperText
              ? helperTextId
              : undefined
          }
          {...props}
        />

        {rightIcon && (
          <Icon name={rightIcon} className="input__icon input__icon--right" aria-hidden="true" />
        )}
      </div>

      {errorMessage && (
        <span
          id={errorMessageId}
          className="input__error-message"
          role="alert"
          aria-live="polite"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM8.66667 11.3333H7.33333V10H8.66667V11.3333ZM8.66667 8.66668H7.33333V4.66668H8.66667V8.66668Z"
              fill="currentColor"
            />
          </svg>
          {errorMessage}
        </span>
      )}

      {!errorMessage && helperText && (
        <span id={helperTextId} className="input__helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}

const Input = forwardRef(InputFn);
Input.displayName = "Input";

export default Input;
``` y el `Dropdown.tsx` quedaría así 
```ts
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
        console.log("Hola, soy quien está dando por culo con el Bubbling");
        console.log(
          "Targets del dropdown",
          dropdownRef.current,
          event.target,
          dropdownRef.current.contains(event.target as Node),
        );
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
}

Dropdown.displayName = "Dropdown";

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
```
