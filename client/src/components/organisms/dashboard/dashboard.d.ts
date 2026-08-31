import "./dashboard.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { WidgetsState } from "#features/widgets/presentation/context/widgetReducer";
type Props = {
    widgetState: WidgetsState;
};
export declare function Dashboard({ widgetState }: Props): import("react").JSX.Element;
export {};
