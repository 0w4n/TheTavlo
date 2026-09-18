import Icon from "#shared/ui/atoms/icons";
import type {
  CreatePanelDTO,
  Panel,
  PanelConfig,
} from "#features/panels/domain/panel.entity";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "#components/atoms/button";

import "./panelsWidget.css";

export default function PanelsWidget({
  items,
  config = { typeView: "list" },
}: {
  items: Panel[] | undefined;
  config: PanelConfig;
}) {
  if (!items || items.length === 0) {
    return <span>No hay paneles</span>;
  } else {
    return (
      <div
        className={`widgetContent__view--${config.typeView ? "list" : "list"}`}
      >
        {items.map((item) => panelsItem(item))}
      </div>
    );
  }
}

function panelsItem(panel: Panel) {
  const { id, name, icon, color, sharedWith } = panel;
  const lightColor = `hsl(${color}, 100%, 70%)`;
  const darkColor = `hsl(${color}, 100%, 20%)`;

  const isIcon = icon.startsWith("Icon");

  return (
    <Link
      to={id}
      key={id}
      className="panels__widget--item"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      <div className="panels__widget--item__header">
        <div className="panels__widget--item__icon">
          {isIcon ? (
            <Icon name={icon} color={darkColor} size={32} />
          ) : (
            <span>{icon}</span>
          )}
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

export function PanelPreview({ panel }: { panel: CreatePanelDTO }) {
  const { name, icon, color } = panel;
  // const lightColor = `hsl(${color}, 100%, 70%)`;
  console.log("Panel: ", panel);
  const darkColor = `hsl(${color}, 100%, 20%)`;

  const isIcon = icon.startsWith("Icon");
  console.log(isIcon);

  return (
    <div
      className="panels__widget--item panels__widget--item__preview"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      <div className="panels__widget--item__header">
        {isIcon ? (
          <Icon
            className="panels__widget--item__icon"
            name={icon}
            size={32}
            color={darkColor}
          />
        ) : (
          <span className="panels__widget--item__icon">{icon}</span>
        )}
      </div>
      <div className="panels__widget--item__name">
        <span>{name}</span>
      </div>
    </div>
  );
}
