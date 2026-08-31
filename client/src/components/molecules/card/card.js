import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import "./card.css";
/**
 * Card component for grouping related content
 *
 * @example
 * ```tsx
 * <Card variant="elevated" interactive>
 *   <Card.Header>
 *     <h3>Título</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     Contenido de la tarjeta
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Acción</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
export const Card = ({ variant = "default", interactive = false, children, className = "", onClick, ...props }) => {
    const classes = [
        "card",
        `card--${variant}`,
        interactive && "card--interactive",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    const handleClick = (e) => {
        if (interactive && onClick) {
            onClick(e);
        }
    };
    const handleKeyDown = (e) => {
        if (interactive && (e.key === "Enter" || e.key === " ") && onClick) {
            e.preventDefault();
            onClick(e);
        }
    };
    return (_jsx("div", { className: classes, onClick: handleClick, onKeyDown: handleKeyDown, role: interactive ? "button" : undefined, tabIndex: interactive ? 0 : undefined, ...props, children: children }));
};
/**
 * Card Header subcomponent
 */
const CardHeader = ({ children, className = "", ...props }) => {
    return (_jsx("div", { className: `card__header ${className}`, ...props, children: children }));
};
/**
 * Card Body subcomponent
 */
const CardBody = ({ children, className = "", ...props }) => {
    return (_jsx("div", { className: `card__body ${className}`, ...props, children: children }));
};
/**
 * Card Footer subcomponent
 */
const CardFooter = ({ children, className = "", ...props }) => {
    return (_jsx("div", { className: `card__footer ${className}`, ...props, children: children }));
};
// Attach subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.displayName = "Card";
CardHeader.displayName = "Card.Header";
CardBody.displayName = "Card.Body";
CardFooter.displayName = "Card.Footer";
