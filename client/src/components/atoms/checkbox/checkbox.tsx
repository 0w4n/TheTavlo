import { useId } from "react";
import "./checkbox.css";
import type { CheckBoxProps } from "./checkbox.types";

/**
 * Antes este componente renderizaba `<input type="checkbox">` con un
 * `<span>{label}</span>` como HIJO del input — HTML inválido (input es un
 * elemento vacío) que React ni siquiera monta, así que el label nunca se
 * veía, no había caja visual, y los props sueltos (`checked`, `onChange`,
 * `disabled`, `name`, `id`...) no se reenviaban al elemento real.
 *
 * Ahora es el patrón estándar de checkbox accesible: un <input> nativo
 * (oculto visualmente pero enfocable por teclado) + una caja + un SVG que
 * dibuja el check con una animación de trazo al marcarse.
 */
export function CheckBox({
  label,
  variant = "square",
  className = "",
  id,
  ...props
}: CheckBoxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const boxClasses = ["input-checkbox", `input-checkbox__${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="input-checkbox-wrapper" htmlFor={inputId}>
      <input type="checkbox" id={inputId} className="input-checkbox__native" {...props} />
      <span className={boxClasses} aria-hidden="true">
        <svg className="input-checkbox__check" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {label && <span className="input-checkbox__label">{label}</span>}
    </label>
  );
}