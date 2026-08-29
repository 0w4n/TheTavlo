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
