import { useNavigate } from "react-router-dom";
import { buildPanelPath } from "#core/routing/panelPath";
/**
 * Única forma soportada de "ir a ver las tareas de un panel" en toda la app.
 *
 * `/home/task` no existe como página — las tareas siempre pertenecen a un
 * panel. Este hook lo hace explícito en el tipo de retorno: si no hay ningún
 * panel en contexto (estás en /home), NO navega y devuelve `false`; es
 * responsabilidad de quien lo llama abrir un modal en ese caso, nunca
 * construir la URL a mano.
 *
 * @example
 *   const openTaskList = useOpenTaskList();
 *   const handleClick = () => {
 *     if (!openTaskList(currentPanelIds)) setShowNeedsPanelModal(true);
 *   };
 */
export function useOpenTaskList() {
    const navigate = useNavigate();
    return (panelIds) => {
        if (panelIds.length === 0)
            return false;
        navigate(buildPanelPath(panelIds, { type: "task-list" }));
        return true;
    };
}
