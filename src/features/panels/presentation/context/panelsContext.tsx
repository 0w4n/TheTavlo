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
      try {
        console.log(`Buscando panel por referencia: ${ref.id}`);
        const panel = await panelsService.getPanelByRef(ref);
        return panel || undefined;
      } catch (error) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: Error(`Error al buscar panel por referencia: ${error}`),
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
      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: [homePanel] });
      console.log("Panel home cargado:", homePanel);
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
          dispatch({
            type: "FETCH_PANELS_ERROR",
            payload: result,
          });
        } else {
          dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result });
        }
      } else {
        // 1. Ejecutamos la creación del panel
        const result = await panelsService.createPanel(data);

        if (result instanceof Error) {
          dispatch({
            type: "FETCH_PANELS_ERROR",
            payload: result,
          });
          return result;
        }

        // 2. Si se solicita, vinculamos el panel con su padre
        // Nota: Asumimos que 'data' contiene la referencia del padre (data.parentRef)
        // y 'result' expone su propia referencia (result.ref)
        if (opt.addToParent) {
          await panelsService.addSubPanel(data.parentRef, result.ref);
        }

        // 3. Manejamos los distintos tipos de retorno solicitados
        switch (opt.return) {
          case returnTypes.PANEL:
            return result; // Retorna el objeto Panel completo

          case returnTypes.DOCREF:
            return result.ref; // Retorna la DocumentReference

          case returnTypes.STRING:
            return result.id; // Retorna el ID del panel como string

          case returnTypes.DEFAULT:
          default:
            dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result });
            return;
        }
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
