import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { WIDGET_TEMPLATES } from "#features/widgets/domain/widgetTemplates";
import { useState } from "react";
import { Button } from "../../../atoms/button";
import { Modal } from "#components/molecules/modal";
import WidgetPreview from "#features/widgets/components/templates/base/preview/widgetPreview";
import ModalPortal from "#components/molecules/modal/portal";
import "./addWidget.css";
export default function AddWidget({ onClose, onAddWidget }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedWidget, setSelectedWidget] = useState();
    const [loading, setLoading] = useState(false);
    const [isSelected, setSelected] = useState(false);
    const categories = [
        { key: "tasks", icon: "IconCheckbox", isHome: false },
        { key: "events", icon: "IconCalendar", isHome: true },
        { key: "exams", icon: "IconFile", isHome: true },
        { key: "productivity", icon: "IconGraph", isHome: true },
        { key: "other", icon: "IconDots", isHome: true },
    ];
    const filteredTemplates = selectedCategory === "all"
        ? WIDGET_TEMPLATES
        : WIDGET_TEMPLATES.filter((t) => t.category === selectedCategory);
    const handleAddWidget = async (type) => {
        setLoading(true);
        try {
            const res = await onAddWidget(type);
            setSelected(false);
            onClose();
            return res;
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectedWidget = (type) => {
        setSelected(true);
        setSelectedWidget(type);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, title: "A\u00F1ade un widget" }), _jsxs(Modal.Body, { children: [_jsx("aside", { className: "CategoriasDialog", children: categories.map((cat) => (_jsx(Button, { variant: "secondary", className: selectedCategory === cat.key ? "selected" : undefined, icon: cat.icon, iconSize: 28, label: cat.key, onClick: () => setSelectedCategory(cat.key === selectedCategory ? "all" : cat.key) }, cat.key))) }), _jsx("div", { className: "ContentDialog", children: filteredTemplates.map((template) => (_jsx(Button, { disabled: loading || template.commingSoon, label: template.commingSoon ? "Comming Soon" : template.title, icon: template.commingSoon ? undefined : template.icon, onClick: () => handleSelectedWidget(template.type), onDoubleClick: () => handleAddWidget(template.type), className: `ContentDialog-Item ${selectedWidget === template.type ? " :focus" : ""}` }, template.type))) })] }), _jsxs(Modal.Footer, { children: [_jsx(ModalPortal, { variant: "secondary", disabled: !isSelected || loading, label: isSelected ? "Vista previa" : "Seleccione un widget", iconName: "IconEye", children: (onClose) => (_jsx(WidgetPreview, { onClose: onClose, type: selectedWidget })) }), _jsx(Button, { variant: "primary", onClick: () => handleAddWidget(selectedWidget), disabled: !isSelected || loading, label: isSelected ? "Añadir widget" : "Seleccione un widget", icon: "IconPlus" })] })] }));
}
