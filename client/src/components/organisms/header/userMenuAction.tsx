import type { DropdownItemProps } from "#components/molecules/dropdown";
import { UserAvatar } from "#components/atoms/userAvatar/UserAvatar";
import type { HeaderAction } from "./header.types";

interface UserMenuOptions {
  userId: string;
  onSignOut: () => void;
  /** Opciones extra que van ANTES de Ajustes (p. ej. compartir el panel). */
  extraOptions?: DropdownItemProps[];
}

/**
 * Acción de header "avatar del usuario + dropdown". Es la misma para Home y
 * para los paneles, así ambos headers son idénticos; lo que cambia entre
 * pantallas son solo las `extraOptions`.
 */
export function buildUserMenuAction({
  userId,
  onSignOut,
  extraOptions = [],
}: UserMenuOptions): HeaderAction {
  return {
    type: "dropdown",
    childrenTrigger: <UserAvatar name={userId} />,
    className: "header__user-dropdown",
    options: [
      ...extraOptions,
      {
        icon: "IconSettings",
        label: "Ajustes",
        onClick: () => {
          window.location.href = "/app/settings";
        },
      },
      {
        icon: "IconLogout",
        label: "Cerrar Sesión",
        danger: true,
        onClick: onSignOut,
      },
    ],
  };
}
