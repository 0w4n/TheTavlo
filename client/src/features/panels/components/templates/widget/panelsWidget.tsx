import Icon from "#shared/ui/atoms/icons";
import type {
  CreatePanelDTO,
  Panel,
  PanelConfig,
} from "#features/panels/domain/panel.entity";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "#components/atoms/button";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";

import "./panelsWidget.css";

export default function PanelsWidget({
  items,
  config = {typeView: "list"},
}: {
  items: Panel[] | undefined;
  config: PanelConfig;
}) {
  if (!items || items.length === 0) {
    return <span>No hay paneles</span>;
  } else {
    return (
      <div className={`widgetContent__view--${config.typeView ? "list" : "list"}`}>
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
  const lightColor = `hsl(${color}, 100%, 70%)`;
  const darkColor = `hsl(${color}, 100%, 20%)`;

  const [chosenEmoji, setChosenEmoji] = useState("✏️");
  const [showPicker, setShowPicker] = useState(false);

  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setChosenEmoji(emojiData.emoji);
    setShowPicker(false); // Hide picker after selection
  };

  const isIcon = icon.startsWith("Icon");

  return (
    <div
      className="panels__widget--item panels__widget--item__preview"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      <div className="panels__widget--item__header">
        <Button
          className="panels__widget--item__icon"
          label={isIcon ? undefined : chosenEmoji}
          icon={isIcon ? icon : undefined}
          iconSize={32}
          iconColor={darkColor}
          onClick={() => setShowPicker((prev) => !prev)}
        />
      </div>
      <div className="panels__widget--item__name">
        <span>{name}</span>
        <Icon name="IconArrowNarrowRightDashed" color={lightColor} size={32} />
      </div>

      {showPicker && (
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          theme={Theme.AUTO}
          lazyLoadEmojis={true}
          className="emoji-picker"
        />
      )}
    </div>
  );
}
