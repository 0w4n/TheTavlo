import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from "react";
import { initialPanelsState, panelsReducer, type PanelsState } from "./panelReducer";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "features/panels/domain/panel.entity";
import type { PanelsService } from "../../app/panels.service";


type PanelsContextValue = {
  state: PanelsState;
  fetchPanels: () => Promise<void>;
  createPanel: (data: CreatePanelDTO) => Promise<void>;
  updatePanel: (id: string, data: UpdatePanelDTO) => Promise<void>;
  deletePanel: (id: string) => Promise<void>;
  selectPanel: (panel: Panel | null) => void;
  reorderPanels: (panelIds: string[]) => Promise<void>;
  refreshPanelStats: (panelId: string) => Promise<void>;
  clearError: () => void;
};

export const PanelsContext = createContext<PanelsContextValue | null>(null);

type PanelsProviderProps = PropsWithChildren<{
  panelsService: PanelsService;
}>;

export function PanelsProvider({
  children,
  panelsService,
}: PanelsProviderProps) {
  const [state, dispatch] = useReducer(panelsReducer, initialPanelsState);

  const fetchPanels = useCallback(async () => {
    dispatch({ type: "FETCH_PANELS_START" });
    try {
      const panels = await panelsService.getAllPanels();
      console.log("Fetched panels:", panels);

      let homePanel = panels.find((p) => p.name === "home");

      // Si no existe el panel home, crearlo
      if (!homePanel) {
        const result = await panelsService.createPanel({
          name: "home",
          icon: "IconHelp",
          isDefault: true,
          color: "blue"
        });
        if (result.panel) {
          homePanel = result.panel;
          panels.push(result.panel);
        }
      }

      // Despachamos todos los paneles (incluyendo home si se creó)
      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: panels });

      // Seleccionamos el panel home por defecto
      if (homePanel) {
        dispatch({ type: "SELECT_PANEL", payload: homePanel });
      }
    } catch (error) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: "Error al cargar paneles",
      });
    }
  }, [panelsService]);

  const createPanel = useCallback(
    async (data: CreatePanelDTO) => {
      const result = await panelsService.createPanel(data);

      if (result.error) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.panel) {
        dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.panel });
      }
    },
    [panelsService]
  );

  const updatePanel = useCallback(
    async (id: string, data: UpdatePanelDTO) => {
      const result = await panelsService.updatePanel(id, data);

      if (result.error) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.panel) {
        dispatch({ type: "UPDATE_PANEL_SUCCESS", payload: result.panel });
      }
    },
    [panelsService]
  );

  const deletePanel = useCallback(
    async (id: string) => {
      const result = await panelsService.deletePanel(id);

      if (result.error) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      dispatch({ type: "DELETE_PANEL_SUCCESS", payload: id });
    },
    [panelsService]
  );

  const selectPanel = useCallback((panel: Panel | null) => {
    dispatch({ type: "SELECT_PANEL", payload: panel });
  }, []);

  const reorderPanels = useCallback(
    async (panelIds: string[]) => {
      const reordered = panelIds
        .map((id, index) => {
          const panel = state.panels.find((p) => p.name === id);
          return panel ? { ...panel, order: index } : null;
        })
        .filter(Boolean) as Panel[];

      dispatch({ type: "REORDER_PANELS", payload: reordered });

      const result = await panelsService.reorderPanels(panelIds);
      if (result.error) {
        // Revertir en caso de error
        await fetchPanels();
      }
    },
    [panelsService, state.panels, fetchPanels]
  );

  const refreshPanelStats = useCallback(
    async (panelId: string) => {
      const stats = await panelsService.getPanelStats(panelId);
      if (stats) {
        dispatch({ type: "UPDATE_PANEL_STATS", payload: { panelId, stats } });
      }
    },
    [panelsService]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Cargar paneles (y crear "home" si no existe) al montar
  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  const value: PanelsContextValue = {
    state,
    fetchPanels,
    createPanel,
    updatePanel,
    deletePanel,
    selectPanel,
    reorderPanels,
    refreshPanelStats,
    clearError,
  };

  return (
    <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>
  );
}
