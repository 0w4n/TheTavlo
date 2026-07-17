import React from "react";
import type { HeaderProps, HeaderAction } from "./header.types";
import "./header.css";
import { Button } from "#components/atoms/button";
import ModalPortal from "#components/molecules/modal/portal";
import { Dropdown } from "#components/molecules/dropdown";
import { Link } from "react-router-dom";

export const Header: React.FC<HeaderProps> = ({
  logo,
  logoText = "TheTavlo",
  logoHref = "/home",
  actions = [],
  rightContent,
  dateTimeItem,
  ...props
}) => {
  const hasDateTime = Boolean(dateTimeItem);

  return (
    <header className="header" {...props}>
      {/* Logo */}
      <Link to={logoHref} className="header__logo">
        {logo && <span className="header__logo-icon">{logo}</span>}
        <span>{logoText}</span>
      </Link>

      {/* Right Side */}
      <div className="header__right">
        {rightContent}

        {hasDateTime ? (
          <div className="header__actions-group">
            {actions.length > 0 && (
              <div className="header__actions">
                {actions.map((action, index) => (
                  <HeaderActionRenderer key={index} action={action} />
                ))}
              </div>
            )}
            <div className="header__datetime">{dateTimeItem}</div>
          </div>
        ) : (
          <>
            {actions.length > 0 && (
              <div className="header__actions">
                {actions.map((action, index) => (
                  <HeaderActionRenderer key={index} action={action} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

Header.displayName = "Header";

function HeaderActionRenderer({ action }: { action: HeaderAction }) {
  switch (action.type) {
    case "button":
      return (
        <Button
          variant="primary"
          disabled={action.disabled}
          onClick={action.onClick}
          icon={action.icon}
          iconSize={16}
        ></Button>
      );

    case "dialog":
      return (
        <ModalPortal
          className={action.className ?? "header-button"}
          iconName={action.icon}
        >
          {(onClose) => action.dialog(onClose)}
        </ModalPortal>
      );

    case "dropdown":
      return (
        <Dropdown
          trigger={
            <Button variant="primary" icon={action.iconTrigger || "IconHelp"} iconSize={16}>
            </Button>
          }
        >
          {action.options.map((option, index) => 
            option.portalModal ? (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  render={option.render}
                  portalModal
                />
              ) : (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  onClick={option.onClick}
                />
              ),
          )}
        </Dropdown>
      );

    case "children":
      return <>{action.children}</>;

    default:
      return null;
  }
}
