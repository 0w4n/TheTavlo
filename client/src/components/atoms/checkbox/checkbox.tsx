import "./checkbox.css";
import type { CheckBoxProps } from "./checkbox.types";

export function CheckBox({
  label,
  variant = "square",
  className,
  ...props
}: CheckBoxProps) {
      const classes = [
    "input-checkbox",
    `input-checkbox__${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <input type="checkbox" className={classes}>
        <span>{label}</span>
      </input>
    </>
  );
}
