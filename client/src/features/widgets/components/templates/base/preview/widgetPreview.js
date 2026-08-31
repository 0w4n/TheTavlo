import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from "#components/molecules/modal";
import WidgetContent from "../content/WidgetContent";
import { Timestamp } from "firebase/firestore";
export default function WidgetPreview({ onClose, type }) {
    const widget = {
        id: "preview",
        type,
        layout: { lg: { x: 0, y: 0, w: 4, h: 2 } },
        config: {},
        isHome: true,
        locked: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    console.log(widget);
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, title: "Vista previa del widget" }), _jsx(Modal.Body, { children: _jsx(WidgetContent, { widget: widget, multiSelection: false }) })] }));
}
