import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from "#components/organisms/header";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import { Dashboard } from "#components/organisms/dashboard/dashboard";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { Rise } from "#components/molecules/rise";
import { Modal, ModalHeader, ModalBody } from "#components/molecules/modal";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { useOnBoardingBootstrap } from "#features/onBoarding/presentation/hooks/useOnBoardingBootstrap";
export default function HomePage() {
    useDocumentTitle("Inicio");
    const { fetchHomePanel } = usePanels();
    useEffect(() => {
        fetchHomePanel();
    }, [fetchHomePanel]);
    // Si la persona vino de /login?onBoarding, esto personaliza el panel home,
    // agrega el widget elegido y crea la primera tarea (si cargó una). No hace
    // nada si no hay un plan pendiente — ver useOnBoardingBootstrap.ts.
    useOnBoardingBootstrap();
    const [riseOpen, setRiseOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(NeedsPanelModal, {}), _jsx(InvalidPanelNotice, {}), riseOpen ? (_jsx(Rise, { onClose: () => setRiseOpen(false), sections: [
                    {
                        title: "Hola",
                        items: [
                            {
                                type: "meeting",
                                id: "1",
                                title: "HolaHola",
                            },
                        ],
                        icon: "IconSpy",
                    },
                ], onItemClick: (item) => console.log(item), onItemStatusChange: (id, status) => console.log("Status change", id, status), isOpen: riseOpen })) : (_jsx(HomePageComponent, { onOpenRise: () => setRiseOpen(true) }))] }));
}
/**
 * Red de seguridad para URLs como "/home/task" que no existen como página
 * real (las tareas siempre pertenecen a un panel). `panel.loader.ts`
 * redirige acá con `?openModal=...` en vez de dejar navegar a esa ruta.
 * En el flujo normal esto nunca debería dispararse — la navegación real
 * pasa por `useOpenTaskList`, que ni siquiera intenta ir ahí.
 */
function NeedsPanelModal() {
    const [searchParams, setSearchParams] = useSearchParams();
    const openModal = searchParams.get("openModal");
    if (!openModal)
        return null;
    const close = () => {
        searchParams.delete("openModal");
        setSearchParams(searchParams, { replace: true });
    };
    return (_jsxs(Modal, { onClose: close, children: [_jsx(ModalHeader, { title: "Eleg\u00ED un panel", onClose: close }), _jsx(ModalBody, { children: _jsx("p", { children: "Las tareas y el calendario pertenecen a un panel. Eleg\u00ED uno desde el dashboard para verlas." }) })] }));
}
/**
 * `panel.loader.ts` redirige acá con `?invalidPanel=1` cuando la cadena de
 * `:pid` de la URL no existe o no respeta la jerarquía real de paneles
 * (alguien la escribió a mano, o un panel fue borrado mientras la tenía
 * abierta). Nunca es un error de la app — solo avisamos y volvemos al
 * dashboard limpio.
 */
function InvalidPanelNotice() {
    const [searchParams, setSearchParams] = useSearchParams();
    const invalidPanel = searchParams.get("invalidPanel");
    if (!invalidPanel)
        return null;
    const close = () => {
        searchParams.delete("invalidPanel");
        setSearchParams(searchParams, { replace: true });
    };
    return (_jsxs(Modal, { onClose: close, children: [_jsx(ModalHeader, { title: "Ese panel ya no existe", onClose: close }), _jsx(ModalBody, { children: _jsx("p", { children: "El enlace que abriste apunta a un panel que fue eliminado o movido. Te trajimos de vuelta al dashboard." }) })] }));
}
function HomePageComponent({ onOpenRise }) {
    const { signOut } = useAuth();
    // const { config, isDark, setMode } = useTheme();
    const { state: widgetsState, toggleEditMode } = useWidgets();
    // function toggleTheme() {
    //   if (config.mode === "system") {
    //     setMode(isDark ? "light" : "dark");
    //   } else {
    //     setMode(config.mode === "light" ? "dark" : "light");
    //   }
    // }
    return (_jsxs(_Fragment, { children: [_jsx(Header, { actions: [
                    {
                        type: "children",
                        children: (_jsx(EditModeButton, { editMode: widgetsState.editMode, onToggle: toggleEditMode })),
                    },
                    {
                        type: "dropdown",
                        iconTrigger: "IconUser",
                        options: [
                            {
                                icon: "IconUser",
                                label: "Hola",
                                onClick: () => {
                                    console.log("Hola");
                                },
                            },
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
                                onClick: () => {
                                    signOut();
                                },
                            },
                        ],
                    },
                ], dateTimeItem: _jsx(DateTimeBadge, { onClick: onOpenRise }) }), _jsx(Dashboard, { widgetState: widgetsState })] }));
}
