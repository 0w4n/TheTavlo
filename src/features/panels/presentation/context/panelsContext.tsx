import { createContext, useReducer, useCallback, useEffect } from "react";
import { initialPanelsState, panelsReducer } from "./panelReducer";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../../domain/panel.entity";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { DocumentReference } from "firebase/firestore";
import {
  returnTypes,
  type createOpt,
  type PanelsContextValue,
  type PanelsProviderProps,
} from "./panelsContext.types";

export const PanelsContext = createContext<PanelsContextValue | undefined>(
  undefined,
);

export function PanelsProvider({
  children,
  panelsService,
}: PanelsProviderProps) {
  const [state, dispatch] = useReducer(panelsReducer, initialPanelsState);
  const { state: authState } = useAuth();

  const findByRef = useCallback(
    async (ref: DocumentReference): Promise<Panel | undefined> => {
      if (ref.parent.id === "panels") {
        try {
          const panel = await panelsService.getPanelByRef(ref);
          return panel || undefined;
        } catch (error) {
          dispatch({
            type: "FETCH_PANELS_ERROR",
            payload: Error(`Error al buscar panel por referencia: ${error}`),
          });
          return undefined;
        }
      } else if (ref.parent.id === "shared") {
        try {
          const panel = await panelsService.getPanelByRef(ref);
          return panel || undefined;
        } catch (error) {
          dispatch({
            type: "FETCH_PANELS_ERROR",
            payload: Error(`Error al buscar panel por referencia: ${error}`),
          });
          return undefined;
        }
      } else {
        throw new Error(
          `Referencia con colección padre desconocida: ${ref.parent.id}`,
        );
      }
    },
    [panelsService],
  );

  const fetchHomePanel = useCallback(async (): Promise<Panel> => {
    dispatch({ type: "FETCH_PANELS_START" });

    try {
      const homePanel = await panelsService.getHomePanel();
      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: [homePanel] });
      return homePanel;
    } catch (error) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: Error(`Error al cargar el panel home: ${error}`),
      });
      throw error;
    }
  }, [panelsService]);

  const fetchPanels = useCallback(async () => {
    dispatch({ type: "FETCH_PANELS_START" });

    try {
      const panels = await panelsService.getAllPanels();

      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: panels });
    } catch (error) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: Error(`Error al cargar paneles: ${error}`),
      });
    }
  }, [panelsService]);

  const createPanel = useCallback(
    async (data: CreatePanelDTO, opt?: createOpt) => {
      if (opt == undefined) {
        const result = await panelsService.createPanel(data);

        if (result instanceof Error) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result });
        } else {
          dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result });
        }
      } else {
        console.log("Creando panel con opciones:", opt);
        // 2. Si se solicita, vinculamos el panel con su padre obteniendo sus DocumentReferences reales
        if (opt.addToParent && state.currentPanel) {
          const result = await panelsService.createPanel(data, state.currentPanel.id);

          if (result instanceof Error) {
            console.error(result);
            dispatch({ type: "FETCH_PANELS_ERROR", payload: result });
            return result;
          }

          // 3. Manejamos los distintos tipos de retorno solicitados de forma segura
          switch (opt.return) {
            case returnTypes.PANEL:
              return result;

            case returnTypes.DOCREF: {
              const ref = await panelsService.getDocRef(result.id);
              if (ref instanceof Error) throw ref;
              return ref;
            }

            case returnTypes.DEFAULT:
            default:
              dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result });
          }
        }
      }
    },
    [panelsService, state.currentPanel],
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

      if (result instanceof Error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: result,
        });
      }
    },
    [panelsService],
  );

  const updatePanel = useCallback(
    async (id: string, data: UpdatePanelDTO) => {
      const result = await panelsService.updatePanel(id, data);

      if (result instanceof Error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: result,
        });
      } else {
        dispatch({ type: "UPDATE_PANEL_SUCCESS", payload: result });
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
        payload: Error(`Error al seleccionar panel: Panel no encontrado`),
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
    fetchHomePanel();
  }, [fetchHomePanel, authState.user]);

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
