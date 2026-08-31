export default function ChoiceCard({ icon, title, description, selected, onSelect, }: {
    icon: string;
    title: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
}): import("react").JSX.Element;
