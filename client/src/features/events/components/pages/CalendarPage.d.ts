import type { AnyEvent } from "../../domain/events.entity";
import "./CalendarPage.css";
export type ViewMode = "day" | "week" | "month";
interface CalendarPageProps {
    events: AnyEvent[];
    initialView?: ViewMode;
    initialDate?: Date;
}
export default function CalendarPage({ events, initialView, initialDate, }: CalendarPageProps): import("react").JSX.Element;
export {};
