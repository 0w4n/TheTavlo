import { Header } from "#components/organisms/header";
import useTheme from "#shared/themes/presentation/hooks/useTheme";
import { ThemeSettingsDialog } from "#components/ThemeSettingsDialog";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import { Dashboard } from "#components/organisms/dashboard";
import WidgetContainer from "#components/WidgetContainer";
import { useState } from "react";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import useAuth from "#core/auth/presentation/hooks/useAuth";

export default function HomePage() {
  console.log("[VERBOSE] HomePage");

  const { signOut } = useAuth();
  const { config, isDark, setMode } = useTheme();
  const { state: widgetsState, removeWidget } = useWidgets();

  const [editMode, setEditMode] = useState(false);
  const [userMenuValue, setUserMenuValue] = useState("Puedo");

  function toggleTheme() {
    if (config.mode === "system") {
      setMode(isDark ? "light" : "dark");
    } else {
      setMode(config.mode === "light" ? "dark" : "light");
    }
  }

  return (
    <>
      <Header
        logoText="TheTavlo"
        actions={[
          {
            type: "dialog",
            icon: "IconWand",
            dialog: (onClose) => <ThemeSettingsDialog onClose={onClose} />,
          },
          {
            type: "button",
            icon: "IconSunMoon",
            onClick: toggleTheme,
          },
          {
            type: "children",
            children: (
              <EditModeButton
                isHome={true}
                editMode={editMode}
                onToggle={() => setEditMode(!editMode)}
              />
            ),
          },
          {
            type: "dropdown",
            iconTrigger: "IconUser",
            value: userMenuValue,
            onChange: (value) => setUserMenuValue(value),
            options: [
              {
                icon: "IconUser",
                label: "Hola",
                onclick: () => {
                  console.log("Hola");
                },
              },
              {
                icon: "IconLogout",
                label: "Adiós",
                strong: true,
                onclick: () => {
                  console.log("Adiós");
                },
              },
            ],
          },
          {
            type: "button",
            icon: "IconLogout",
            onClick: () => signOut(),
          },
        ]}
        dateTimeItem={<DateTimeBadge />}
      />
      <Dashboard>
        {widgetsState.widgets.map((widget) => {
          return (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              editMode={editMode}
              onDragStart={(e) => handleDragStart(widget, e)}
              onResizeStart={(e) => handleResizeStart(widget, e)}
              onRemove={() => removeWidget(widget.id)}
              onConfig={() => onWidgetConfig(widget.id)}
            />
          );
        })}
      </Dashboard>
    </>
  );
}
