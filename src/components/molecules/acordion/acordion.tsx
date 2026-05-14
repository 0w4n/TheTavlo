import { useState, useId, useRef } from "react";
import type {
  AccordionItemComponentProps,
  AccordionProps,
  AccordionItem,
} from "./acordion.types";
import { Button } from "#components/atoms/button";

import "./acordion.css";

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
  panelId,
  triggerId,
}: AccordionItemComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="item">
      {/* Trigger
          data-open → el CSS rota el chevron con .trigger[data-open="true"] .chevron
          :disabled → el CSS gestiona color/cursor/opacity via pseudoclase nativa    */}
      <Button
        variant="ghost"
        label={item.title}
        icon={isOpen ? "IconChevronDown" : "IconChevronRight"}
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={item.disabled}
        onClick={onToggle}
        data-open={isOpen}
        className="acordion__item-trigger"
      />
      {/* Panel
          data-open → el CSS alterna grid-template-rows: 0fr ↔ 1fr
                      y la opacidad del contenido                    */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        data-open={isOpen}
        className="panel"
      >
        <div ref={contentRef} className="panelInner">
          <div className="content">{item.content}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion principal ──────────────────────────────────────────────────────

export function Accordion({
  items,
  variant = "single",
  defaultOpen,
  className,
}: AccordionProps) {
  const uid = useId();

  const getInitialOpen = (): Set<string> => {
    if (!defaultOpen) return new Set();
    const ids = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
    return new Set(ids);
  };

  const [openItems, setOpenItems] = useState<Set<string>>(getInitialOpen);

  const getItemId = (item: AccordionItem, index: number) =>
    item.id ?? `${uid}-item-${index}`;

  const toggle = (itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (variant === "single") next.clear();
        next.add(itemId);
      }

      return next;
    });
  };

  return (
    <div className={`accordion ${className ?? ""}`}>
      {items.map((item, index) => {
        const itemId = getItemId(item, index);
        const triggerId = `${itemId}-trigger`;
        const panelId = `${itemId}-panel`;
        const isOpen = openItems.has(itemId);

        return (
          <AccordionItemComponent
            key={itemId}
            item={item}
            isOpen={isOpen}
            onToggle={() => !item.disabled && toggle(itemId)}
            panelId={panelId}
            triggerId={triggerId}
          />
        );
      })}
    </div>
  );
}

// ─── Ejemplo de uso ───────────────────────────────────────────────────────────
//
// const items = [
//   {
//     id: "faq-1",
//     title: "¿Qué es TheTavlo?",
//     content: "Una aplicación de gestión con arquitectura limpia.",
//   },
//   {
//     id: "faq-2",
//     title: "¿Cómo añado widgets?",
//     content: <p>Haz clic en <strong>Añade tu primer widget</strong> en el dashboard.</p>,
//   },
//   {
//     id: "faq-3",
//     title: "Item deshabilitado",
//     content: "Este contenido no es accesible.",
//     disabled: true,
//   },
// ];
//
// // Variante single (default) — solo uno abierto a la vez:
// <Accordion items={items} defaultOpen="faq-1" />
//
// // Variante multiple — varios abiertos simultáneamente:
// <Accordion items={items} variant="multiple" defaultOpen={["faq-1", "faq-2"]} />
