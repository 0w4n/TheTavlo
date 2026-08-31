interface DelNoteProps {
    id: string;
    onClose: (open: boolean) => void;
}
export default function DelNote({ id, onClose }: DelNoteProps): import("react").JSX.Element;
export {};
