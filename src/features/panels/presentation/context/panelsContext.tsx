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
// ─── Provider ────────────────────────────────────────────────────────────────

export function PanelsProvider({ children, panelsService }: PanelsProviderProps) {
  const [state, dispatch] = useReducer(panelsReducer, initialPanelsState);
  const { state: authState } = useAuth();

  // ─── findByRef ────────────────────────────────────────────────────────────

  const findByRef = useCallback(
    async (ref: DocumentReference): Promise<Panel | undefined> => {
      const collectionId = ref.parent.id;

      if (collectionId !== "panels" && collectionId !== "shared") {
        // Referencia con colección desconocida: error de programación, no de red.
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

  // ─── fetchHomePanel ───────────────────────────────────────────────────────

  const fetchHomePanel = useCallback(
    async (): Promise<void> => {
      dispatch({ type: "FETCH_PANELS_START" });

      const result = await panelsService.getHomePanel();

      if (isOk(result)) {
        dispatch({ type: "FETCH_PANELS_SUCCESS", payload: [result.value] });
      } else {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
      }
    },
    [panelsService],
  );

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
    async (data: CreatePanelDTO, opt?: CreatePanelOpt): Promise<CreatePanelResult> => {
      // Sin opciones: crea en root y dispatch interno.
      if (!opt) {
        const result = await panelsService.createPanel(data);

        if (isErr(result)) {
          dispatch({ type: "FETCH_PANELS_ERROR", payload: result.err });
        } else {
          dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.value });
        }

        // ReturnType.DEFAULT implícito: retornamos void-like encapsulado en ok
        return result.success
          ? { success: true, value: undefined }
          : result;
      }

      // Con opciones: el parentId viene del currentPanel activo.
      if (opt.addToParent && state.currentPanel) {
        const result = await panelsService.createPanel(data, state.currentPanel.id);

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

      // addToParent=true pero no hay currentPanel.
      return err(
        unexpectedErr("No hay un currentPanel seleccionado para añadir el sub-panel"),
      );
    },
    [panelsService, state.currentPanel],
  );

  // ─── addSubPanel ──────────────────────────────────────────────────────────

  const addSubPanel = useCallback(
    async (parentRef: DocumentReference, childRef: DocumentReference): Promise<void> => {
      const parentResult = await panelsService.getPanelByRef(parentRef);

      if (isErr(parentResult)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: parentResult.err });
        return;
      }

      const parentDoc = parentResult.value;
      if (!parentDoc) {
        dispatch({
          type: "FETCH_PANELS_ERROR",
          payload: notFoundErr(`Panel padre con ref "${parentRef.id}" no encontrado`),
        });
        return;
      }

      // Evitar duplicados
      const alreadyLinked = parentDoc.subPanelsId.some(
        (ref) => ref.id === childRef.id,
      );
      if (alreadyLinked) return;

      const updateResult = await panelsService.updatePanel(parentRef.id, {
        subPanelsId: [...parentDoc.subPanelsId, childRef],
      });

      if (isErr(updateResult)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: updateResult.err });
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

  // ─── removeSubPanel ───────────────────────────────────────────────────────

  const removeSubPanel = useCallback(
    async (parentRef: DocumentReference, childRef: DocumentReference): Promise<void> => {
      const parentResult = await panelsService.getPanelByRef(parentRef);

      if (isErr(parentResult)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: parentResult.err });
        return;
      }

      const parent = parentResult.value;
      if (!parent) return;

      const updateResult = await panelsService.updatePanel(parentRef.id, {
        subPanelsId: parent.subPanelsId.filter((ref) => ref.id !== childRef.id),
      });

      if (isErr(updateResult)) {
        dispatch({ type: "FETCH_PANELS_ERROR", payload: updateResult.err });
      }
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

  // ─── Efecto de carga inicial ──────────────────────────────────────────────

  useEffect(() => {
    if (!authState.user) return;
    fetchHomePanel();
  }, [fetchHomePanel, authState.user]);

  // ─── Valor del contexto ───────────────────────────────────────────────────

  const value: PanelsContextValue = {
    state,
    findBySharedId,
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
