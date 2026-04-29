import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from "react";
import {
  initialPanelsState,
  panelsReducer,
  type PanelsState,
} from "./panelReducer";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "features/panels/domain/panel.entity";
import type { PanelsService } from "../../app/panels.service";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { DocumentReference, Timestamp } from "firebase/firestore";

type PanelsContextValue = {
  state: PanelsState;
  fetchPanels: () => Promise<void>;
  fetchHomePanel: () => Promise<Panel>;
  //findById: (id: string) => Promise<Panel | undefined>;
  findByRef: (ref: DocumentReference) => Promise<Panel | undefined>;
  createPanel: (data: CreatePanelDTO) => Promise<void>;
  addSubPanel: (parentRef: DocumentReference, childRef: DocumentReference) => Promise<void>;
  updatePanel: (id: string, data: UpdatePanelDTO) => Promise<void>;
  deletePanel: (id: string) => Promise<void>;
  removeSubPanel: (parentId: DocumentReference, childId: DocumentReference) => Promise<void>;
  selectPanel: (panel: Panel) => void;
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
  const { state: authState } = useAuth();

  const findByRef = useCallback(
    async (ref: DocumentReference): Promise<Panel | undefined> => {
      try {
        console.log(`Buscando panel por referencia: ${ref.id}`);
        const panel = await panelsService.getPanelByRef(ref);
        return panel || undefined;
      } catch (error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: `Error al buscar panel por referencia: ${error}`,
        });
        return undefined;
      }
    },
    [panelsService],
  );

  const fetchHomePanel = useCallback(async (): Promise<Panel> => {
    dispatch({ type: "FETCH_PANELS_START" });

    try {
      const homePanel = await panelsService.getHomePanel();
      return homePanel;
    } catch (error) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: `Error al cargar el panel home: ${error}`,
      });
      throw error;
    }
  }, [panelsService]);

  const fetchPanels = useCallback(async () => {
    dispatch({ type: "FETCH_PANELS_START" });

    try {
      const panels = await panelsService.getAllPanels();

      console.log(
        "Paneles con isDefault= true:",
        panels.find((p) => p.isDefault === true),
      );

      let homePanel = panels.find((p) => p.isDefault === true);

      if (!homePanel) {
        const result = await panelsService.createPanel({
          name: "Home",
          icon: "IconHome",
          isDefault: true,
          color: 0,
          subPanelsId: [],
          sharedWith: "",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        if (result.panel) {
          homePanel = result.panel;
          panels.push(result.panel);
        }
      }

      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: panels });
    } catch (error) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: `Error al cargar paneles: ${error}`,
      });
    }
  }, [panelsService]);

  const createPanel = useCallback(
    async (data: CreatePanelDTO) => {
      const result = await panelsService.createPanel(data);

      if (result.error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: `Error al crear panel: ${result.error}`,
        });
      }

      if (result.panel) {
        dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.panel });
      }
    },
    [panelsService],
  );

  const addSubPanel = useCallback(
    async (parentRef: DocumentReference, childId: DocumentReference) => {
      const parentDoc = await panelsService.getPanelByRef(parentRef);
      if (!parentDoc) return;

      const already = parentDoc.subPanelsId.includes(childId);
      if (already) return;

      const result = await panelsService.updatePanel(parentRef.id, {
        subPanelsId: [...parentDoc.subPanelsId, childId],
      });

      if (result.error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: `Error al crear panel: ${result.error}`,
        });
      }
    },
    [panelsService],
  );

  const updatePanel = useCallback(
    async (id: string, data: UpdatePanelDTO) => {
      const result = await panelsService.updatePanel(id, data);

      if (result.error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: `Error al actualizar panel: ${result.error}`,
        });
      }

      if (result.panel) {
        dispatch({ type: "UPDATE_PANEL_SUCCESS", payload: result.panel });
      }
    },
    [panelsService],
  );

  const deletePanel = useCallback(
    async (id: string) => {
      const result = await panelsService.deletePanel(id);

      if (result.error) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.error });
      }

      dispatch({ type: "DELETE_PANEL_SUCCESS", payload: id });
    },
    [panelsService],
  );

  const removeSubPanel = useCallback(
    async (parentRef: DocumentReference, childRef: DocumentReference) => {
      const parent = await panelsService.getPanelByRef(parentRef);
      if (!parent) return;

      await panelsService.updatePanel(parentRef.id, {
        subPanelsId: parent.subPanelsId.filter((id) => id !== childRef),
      });
    },
    [panelsService],
  );

  const selectPanel = useCallback((panel: Panel) => {
    if (!panel) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: `Error al seleccionar panel: Panel no encontrado`,
      });
      return;
    }

    dispatch({ type: "SELECT_PANEL", payload: panel });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  useEffect(() => {
    if (!authState.user) return;
    fetchPanels();
  }, [fetchPanels, authState.user]);

  const value: PanelsContextValue = {
    state,
    findByRef,
    fetchPanels,
    fetchHomePanel,
    createPanel,
    addSubPanel,
    updatePanel,
    deletePanel,
    removeSubPanel,
    selectPanel,
    clearError,
  };

  return (
    <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>
  );
}
