import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import "./header.css";
import { Button } from "#components/atoms/button";
import ModalPortal from "#components/molecules/modal/portal";
import { Dropdown } from "#components/molecules/dropdown";
import { Link } from "react-router-dom";
export const Header = ({ logo, logoText = "TheTavlo", logoHref = "/home", actions = [], rightContent, dateTimeItem, ...props }) => {
    const hasDateTime = Boolean(dateTimeItem);
    return (_jsxs("header", { className: "header", ...props, children: [_jsxs(Link, { to: logoHref, className: "header__logo", children: [logo && _jsx("span", { className: "header__logo-icon", children: logo }), _jsx("span", { children: logoText })] }), _jsxs("div", { className: "header__right", children: [rightContent, hasDateTime ? (_jsxs("div", { className: "header__actions-group", children: [actions.length > 0 && (_jsx("div", { className: "header__actions", children: actions.map((action, index) => (_jsx(HeaderActionRenderer, { action: action }, index))) })), _jsx("div", { className: "header__datetime", children: dateTimeItem })] })) : (_jsx(_Fragment, { children: actions.length > 0 && (_jsx("div", { className: "header__actions", children: actions.map((action, index) => (_jsx(HeaderActionRenderer, { action: action }, index))) })) }))] })] }));
};
Header.displayName = "Header";
function HeaderActionRenderer({ action }) {
    switch (action.type) {
        case "button":
            return (_jsx(Button, { variant: "primary", disabled: action.disabled, onClick: action.onClick, icon: action.icon, iconSize: 16 }));
        case "dialog":
            return (_jsx(ModalPortal, { className: action.className ?? "header-button", iconName: action.icon, children: (onClose) => action.dialog(onClose) }));
        case "dropdown":
            return (_jsx(Dropdown, { trigger: _jsx(Button, { variant: "primary", icon: action.iconTrigger || "IconHelp", iconSize: 16 }), children: action.options.map((option, index) => option.portalModal ? (_jsx(Dropdown.Item, { label: option.label, icon: option.icon, danger: option.danger, render: option.render, portalModal: true }, index)) : (_jsx(Dropdown.Item, { label: option.label, icon: option.icon, danger: option.danger, onClick: option.onClick }, index))) }));
        case "children":
            return _jsx(_Fragment, { children: action.children });
        default:
            return null;
    }
}
