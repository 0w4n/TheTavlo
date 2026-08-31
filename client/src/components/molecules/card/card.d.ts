import React from "react";
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from "./card.types";
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
export declare const Card: React.FC<CardProps> & {
    Header: React.FC<CardHeaderProps>;
    Body: React.FC<CardBodyProps>;
    Footer: React.FC<CardFooterProps>;
};
