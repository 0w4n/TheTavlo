import type { ButtonVariant } from "#components/atoms/button/button";
import type { ReactNode } from "react";
export interface ModalPortalProps {
    variant?: ButtonVariant;
    disabled?: boolean;
    className?: string;
    iconName: string;
    label?: string;
    children: (onClose: () => void) => ReactNode;
}
