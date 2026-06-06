import Icon from "#shared/ui/atoms/icons";
import type { Panel } from "#features/panels/domain/panel.entity";
import { Link } from "react-router-dom";

import "./panelsWidget.css";

export default function PanelsWidget({ items }: { items: Panel[] }) {
  return <>{items.map((item) => panelsItem(item))}</>;
}

function panelsItem(panel: Panel) {
  const { id, name, icon, color, sharedWith } = panel;
  const lightColor = `hsl(${color}, 100%, 70%)`;
  const darkColor = `hsl(${color}, 100%, 20%)`;

  return (
    <Link
      to={`${id}`}
      key={id}
      className="panels__widget--item"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      <div className="panels__widget--item__header">
        <div className="panels__widget--item__icon">
          <Icon name={icon} color={darkColor} size={32} />
        </div>
        {sharedWith && (
            <Icon name="IconUsersGroup" color={lightColor} size={24} />
        )}
      </div>
      <div className="panels__widget--item__name">
        <span>{name}</span>
        <Icon name="IconArrowNarrowRightDashed" color={lightColor} size={32} />
      </div>
    </Link>
  );
}
