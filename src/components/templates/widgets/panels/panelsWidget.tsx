import type { PanelsItemProps, PanelsWidgetProps } from "./panelsWidget.type";
import Icon from "#shared/ui/atoms/icons";

export default function PanelsWidget({ items }: PanelsWidgetProps) {


  return (
    <>{items.map((item) => panelsItem(item))}</>
  );
}

function panelsItem({ panelId, icon, color }: PanelsItemProps) {
  return (
    <div
      key={panelId}
      className="panels-widget-item"
      style={{ backgroundColor: color }}
    >
      <Icon name={icon} color={color}/>
    </div>
  );
}
