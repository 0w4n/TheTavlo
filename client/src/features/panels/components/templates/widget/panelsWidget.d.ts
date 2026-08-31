import type { CreatePanelDTO, Panel, PanelConfig } from "#features/panels/domain/panel.entity";
import "./panelsWidget.css";
export default function PanelsWidget({ items, config, }: {
    items: Panel[] | undefined;
    config: PanelConfig;
}): import("react").JSX.Element;
export declare function PanelPreview({ panel }: {
    panel: CreatePanelDTO;
}): import("react").JSX.Element;
