import type { HTMLAttributes } from "react";
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Content of the header
     */
    onClose: (open: boolean) => void;
    title: string;
    icon?: string;
}
