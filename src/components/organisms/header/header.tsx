import React from "react";
import type { HeaderProps, HeaderAction } from "./header.types";
import "./header.css";
import { Button } from "#components/atoms/button";
import ModalPortal from "#components/molecules/modal/modalPortal";
import Icon from "#shared/ui/atoms/icons";
import { Dropdown } from "#components/molecules/dropdown";

export const Header: React.FC<HeaderProps> = ({
  logo,
  logoText = "TheTavlo",
  logoHref = "/",
  actions = [],
  rightContent,
  dateTimeItem,
  ...props
}) => {
  const hasDateTime = Boolean(dateTimeItem);

  return (
    <header className="header" {...props}>
      {/* Logo */}
      <a href={logoHref} className="header__logo">
        {logo && <span className="header__logo-icon">{logo}</span>}
        <span>{logoText}</span>
      </a>

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
        >
          <Icon name={action.icon} size={24} />
        </Button>
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
            <Button variant="primary">
              <Icon name={action.iconTrigger || "IconHelp"} size={24} />
            </Button>
          }
        >
          {action.options.map((option, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => {
                action.onChange(option.label);
                option.onclick && option.onclick();
              }}
              danger={option.strong}
            >
              {option.icon && (
                <Icon
                  name={option.icon}
                  size={16}
                  className="dropdown-item-icon"
                />
              )}
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
      );

    case "children":
      return <>{action.children}</>;

    default:
      return null;
  }
}
