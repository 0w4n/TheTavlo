import React from "react";
import type {
    CardProps,
    CardHeaderProps,
    CardBodyProps,
    CardFooterProps,
} from "./card.types";
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

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  variant = "default",
  interactive = false,
  children,
  className = "",
  onClick,
  ...props
}) => {
  const classes = [
    "card",
    `card--${variant}`,
    interactive && "card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (interactive && (e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick(e as any);
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header subcomponent
 */
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`card__header ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Body subcomponent
 */
const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`card__body ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer subcomponent
 */
const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`card__footer ${className}`} {...props}>
      {children}
    </div>
  );
};

// Attach subcomponents
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.displayName = "Card";
CardHeader.displayName = "Card.Header";
CardBody.displayName = "Card.Body";
CardFooter.displayName = "Card.Footer";
