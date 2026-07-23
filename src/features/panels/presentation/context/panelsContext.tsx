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
  ReturnType,
  type CreatePanelOpt,
  type CreatePanelResult,
  type PanelsContextValue,
  type PanelsProviderProps,
} from "./panelsContext.types";
import {
  isErr,
  isOk,
  unexpectedErr,
  err,
  notFoundErr,
} from "#core/appCore/domain/AppCore.type";

export const PanelsContext = createContext<PanelsContextValue | undefined>(
  undefined,
);

export function PanelsProvider({
  children,
  panelsService,
}: PanelsProviderProps) {
  const [state, dispatch] = useReducer(panelsReducer, initialPanelsState);
  const { state: authState } = useAuth();

  useEffect(() => {
    console.log("state cambió a:", state);
  }, [state]);

  // ─── Suscripción en tiempo real al panel home ─────────────────────────────
  // Se activa cuando hay usuario autenticado y se cancela al desmontar
  // o cuando el usuario cambia.

  console.log("1. useEffect");
  console.log("authState: ", authState);

  useEffect(() => {
    if (authState.status === "error") return;
    if (authState.status === "initializing") return;
    if (authState.status === "migration-pending") return;
    if (authState.status === "unauthenticated") return;

    dispatch({ type: "FETCH_PANELS_START" });

    const unsubscribe = panelsService.subscribeToHomePanel(
      (panel) => {
        console.log("Panel recibido: ", panel);
        dispatch({ type: "FETCH_PANELS_SUCCESS", payload: [panel] });
      },
      (err) => {console.log("Panel err: ", err); dispatch({ type: "FETCH_PANELS_ERROR", payload: err });},
    );

    // Limpieza: cancela la suscripción de Firestore
    return unsubscribe;
  }, [panelsService, authState.status]);

  // ─── findByRef ────────────────────────────────────────────────────────────

  const findByRef = useCallback(
    async (ref: DocumentReference): Promise<Panel | undefined> => {
      const collectionId = ref.parent.id;
      if (collectionId !== "panels" && collectionId !== "shared") {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: notFoundErr(
            `Referencia con colección padre desconocida: ${collectionId}`,
          ),
        });
        return undefined;
      }

      const result = await panelsService.getPanelByRef(ref);
      if (isErr(result)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        return undefined;
      }
      return result.value;
    },
    [panelsService],
  );

  // ─── findBySharedId ───────────────────────────────────────────────────────

  const findBySharedId = useCallback(
    async (sharedId: DocumentReference): Promise<Panel | undefined> => {
      const result = await panelsService.getPanelBySharedId(sharedId);
      if (isErr(result)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        return undefined;
      }
      return result.value;
    },
    [panelsService],
  );

  // ─── fetchHomePanel (puntual, por compatibilidad) ─────────────────────────

  const fetchHomePanel = useCallback(async (): Promise<void> => {
    dispatch({ type: "FETCH_PANELS_START" });
    const result = await panelsService.getHomePanel();
    if (isOk(result)) {
      dispatch({ type: "FETCH_PANELS_SUCCESS", payload: [result.value] });
      console.log("Hola, ahí te va el homeId: ", result.value);
    } else {
      dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
    }
  }, [panelsService]);

  // ─── fetchPanels ──────────────────────────────────────────────────────────

  const fetchPanels = useCallback(async (): Promise<void> => {
    dispatch({ type: "FETCH_PANELS_START" });
    const result = await panelsService.getAllPanels();
    if (isErr(result)) {
      dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
      return;
    }
    dispatch({ type: "FETCH_PANELS_SUCCESS", payload: result.value });
  }, [panelsService]);

  // ─── createPanel ──────────────────────────────────────────────────────────

  const createPanel = useCallback(
    async (
      data: CreatePanelDTO,
      opt?: CreatePanelOpt,
    ): Promise<CreatePanelResult> => {
      if (!opt) {
        const result = await panelsService.createPanel(data);
        if (isErr(result)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        } else {
          dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.value });
        }
        return result.success ? { success: true, value: undefined } : result;
      }

      if (opt.addToParent && state.status === "panel" && state.currentPanel) {
        const currentRef = await panelsService.getDocRef(state.currentPanel.id);
        const result = await panelsService.createPanel(
          data,
          currentRef.success ? currentRef.value : undefined,
        );

        if (isErr(result)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
          return result;
        }

        switch (opt.return) {
          case ReturnType.PANEL:
            dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.value });
            return result;
          case ReturnType.DOCREF: {
            const refResult = await panelsService.getDocRef(result.value.id);
            if (isErr(refResult)) {
              dispatch({ type: "FETCH_PANELS_ERROR", payload: refResult.err });
              return refResult;
            }
            return refResult;
          }
          case ReturnType.DEFAULT:
          default:
            dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.value });
            return { success: true, value: undefined };
        }
      }

      return err(
        unexpectedErr(
          "No hay un currentPanel seleccionado para añadir el sub-panel",
        ),
      );
    },
    [panelsService, state.status],
  );

  // ─── fetchSubPanels ───────────────────────────────────────────────────────

  const fetchSubPanels = useCallback(
    async (parentId: DocumentReference | string): Promise<Panel[]> => {
      if (typeof parentId === "string") {
        const parentRef = await panelsService.getDocRef(parentId);
        if (isErr(parentRef)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: parentRef.err });
          return [];
        }

        const result = await panelsService.getSubPanels(parentRef.value);
        if (isErr(result)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
          return [];
        }
        return result.value;
      } else {
        const result = await panelsService.getSubPanels(parentId);
        if (isErr(result)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
          return [];
        }
        dispatch({type: "REFRESH_PANEL"})
        return result.value;
      }
    },
    [panelsService],
  );

  // ─── updatePanel ──────────────────────────────────────────────────────────

  const updatePanel = useCallback(
    async (id: string, data: UpdatePanelDTO): Promise<void> => {
      const result = await panelsService.updatePanel(id, data);
      if (isErr(result)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        return;
      }
      dispatch({ type: "UPDATE_PANEL_SUCCESS", payload: result.value });
    },
    [panelsService],
  );

  // ─── deletePanel ──────────────────────────────────────────────────────────

  const deletePanel = useCallback(
    async (id: string): Promise<void> => {
      const result = await panelsService.deletePanel(id);
      if (isErr(result)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        return;
      }
      dispatch({ type: "DELETE_PANEL_SUCCESS", payload: id });
    },
    [panelsService],
  );

  // ─── deletePanelCascade ─────────────────────────────────────────────────

  const deletePanelCascade = useCallback(
    async (id: string): Promise<string[]> => {
      const result = await panelsService.deletePanelCascade(id);
      if (isErr(result)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        return [];
      }
      dispatch({
        type: "DELETE_PANEL_CASCADE_SUCCESS",
        payload: result.value,
      });
      return result.value.deletedIds;
    },
    [panelsService],
  );

  // ─── selectPanel ─────────────────────────────────────────────────────────

  const selectPanel = useCallback((panel: Panel): void => {
    if (!panel) {
      dispatch({
        type: "FETCH_PANELS_ERROR",
        payload: notFoundErr("Panel no encontrado al intentar seleccionarlo"),
      });
      return;
    }
    dispatch({ type: "SELECT_PANEL", payload: panel });
  }, []);

  // ─── clearError ──────────────────────────────────────────────────────────

  const clearError = useCallback((): void => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: PanelsContextValue = {
    state,
    findBySharedId,
    findByRef,
    fetchPanels,
    fetchHomePanel,
    createPanel,
    fetchSubPanels,
    updatePanel,
    deletePanel,
    deletePanelCascade,
    selectPanel,
    clearError,
  };

  return (
    <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>
  );
}
