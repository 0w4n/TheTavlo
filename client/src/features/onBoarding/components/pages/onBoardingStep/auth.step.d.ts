export default function StepAuth({ onGoogle, onGuest, isLoading, errorMessage, success, }: {
    onGoogle: () => void;
    onGuest: () => void;
    isLoading: boolean;
    errorMessage: string | null;
    success: boolean;
}): import("react").JSX.Element;
