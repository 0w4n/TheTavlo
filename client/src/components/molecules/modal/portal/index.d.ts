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
export default function ModalPortal({ variant, disabled, iconName, label, className, children }: ModalPortalProps): import("react").JSX.Element;
