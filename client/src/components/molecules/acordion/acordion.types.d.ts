export interface AccordionItem {
    id?: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
}
export interface AccordionProps {
    items: AccordionItem[];
    variant?: "single" | "multiple";
    defaultOpen?: string | string[];
    className?: string;
}
export interface AccordionItemComponentProps {
    item: AccordionItem;
    isOpen: boolean;
    onToggle: () => void;
    panelId: string;
    triggerId: string;
}
