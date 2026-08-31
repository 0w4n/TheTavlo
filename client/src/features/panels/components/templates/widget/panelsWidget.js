import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "#components/atoms/button";
import EmojiPicker, { Theme } from "emoji-picker-react";
import "./panelsWidget.css";
export default function PanelsWidget({ items, config = { typeView: "list" }, }) {
    if (!items || items.length === 0) {
        return _jsx("span", { children: "No hay paneles" });
    }
    else {
        return (_jsx("div", { className: `widgetContent__view--${config.typeView ? "list" : "list"}`, children: items.map((item) => panelsItem(item)) }));
    }
}
function panelsItem(panel) {
    const { id, name, icon, color, sharedWith } = panel;
    const lightColor = `hsl(${color}, 100%, 70%)`;
    const darkColor = `hsl(${color}, 100%, 20%)`;
    const isIcon = icon.startsWith("Icon");
    return (_jsxs(Link, { to: id, className: "panels__widget--item", style: { "--panels__widget--color": color }, children: [_jsxs("div", { className: "panels__widget--item__header", children: [_jsx("div", { className: "panels__widget--item__icon", children: isIcon ? (_jsx(Icon, { name: icon, color: darkColor, size: 32 })) : (_jsx("span", { children: icon })) }), sharedWith && (_jsx(Icon, { name: "IconUsersGroup", color: lightColor, size: 24 }))] }), _jsxs("div", { className: "panels__widget--item__name", children: [_jsx("span", { children: name }), _jsx(Icon, { name: "IconArrowNarrowRightDashed", color: lightColor, size: 32 })] })] }, id));
}
export function PanelPreview({ panel }) {
    const { name, icon, color } = panel;
    const lightColor = `hsl(${color}, 100%, 70%)`;
    const darkColor = `hsl(${color}, 100%, 20%)`;
    const [chosenEmoji, setChosenEmoji] = useState("✏️");
    const [showPicker, setShowPicker] = useState(false);
    // Handle emoji selection
    const onEmojiClick = (emojiData) => {
        setChosenEmoji(emojiData.emoji);
        setShowPicker(false); // Hide picker after selection
    };
    const isIcon = icon.startsWith("Icon");
    return (_jsxs("div", { className: "panels__widget--item panels__widget--item__preview", style: { "--panels__widget--color": color }, children: [_jsx("div", { className: "panels__widget--item__header", children: _jsx(Button, { className: "panels__widget--item__icon", label: isIcon ? undefined : chosenEmoji, icon: isIcon ? icon : undefined, iconSize: 32, iconColor: darkColor, onClick: () => setShowPicker((prev) => !prev) }) }), _jsxs("div", { className: "panels__widget--item__name", children: [_jsx("span", { children: name }), _jsx(Icon, { name: "IconArrowNarrowRightDashed", color: lightColor, size: 32 })] }), showPicker && (_jsx(EmojiPicker, { onEmojiClick: onEmojiClick, theme: Theme.AUTO, lazyLoadEmojis: true, className: "emoji-picker" }))] }));
}
