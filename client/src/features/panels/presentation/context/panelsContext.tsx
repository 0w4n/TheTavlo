import { createContext, useReducer, useCallback, useEffect, useMemo } from "react";
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

  // ─── Suscripción en tiempo real al panel home ─────────────────────────────
  // Se activa cuando hay usuario autenticado y se cancela al desmontar
  // o cuando el usuario cambia.

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
      (err) => {
        console.log("Panel err: ", err);
        dispatch({ type: "FETCH_PANELS_ERROR", payload: err });
      },
    );

    // Limpieza: cancela la suscripción de Firestore
    return unsubscribe;
  }, [panelsService, authState.status]);

  // currentPanel.id derivado del estado — única fuente de verdad para saber
  // "en qué panel estoy", usada tanto por el efecto de sincronización de
  // subPanels como por createPanel (evita closures obsoletas: sin esto,
  // useCallback solo se re-crea cuando cambia state.status, no cuando
  // cambia el currentPanel dentro de ese mismo status).
  const currentPanelId =
    state.status === "panel" ? state.currentPanel.id : undefined;

  // ─── loadSubPanels (interno) ───────────────────────────────────────────────
  // Único lugar que efectivamente pide los hijos de un panel a Firestore.
  // Lo usan: el efecto de sincronización automática (con cancelToken) y
  // fetchSubPanels/la vía legacy de addSubPanel (sin cancelToken — el
  // chequeo `currentPanel.id === parentId` en el reducer ya actúa como red
  // de seguridad barata contra condiciones de carrera).
  const loadSubPanels = useCallback(
    async (
      parentId: string,
      cancelToken?: { cancelled: boolean },
    ): Promise<void> => {
      const refResult = await panelsService.getDocRef(parentId);
      if (cancelToken?.cancelled) return;

      if (isErr(refResult)) {
        dispatch({ type: "FETCH_SUBPANELS_ERROR", payload: refResult.err });
        return;
      }

      const result = await panelsService.getSubPanels(refResult.value);
      if (cancelToken?.cancelled) return;

      if (isErr(result)) {
        dispatch({ type: "FETCH_SUBPANELS_ERROR", payload: result.err });
        return;
      }

      dispatch({
        type: "FETCH_SUBPANELS_SUCCESS",
        payload: { parentId, panels: result.value },
      });
    },
    [panelsService],
  );

  // ─── Sincronización de subPanels con el currentPanel ──────────────────────
  // Único punto de sincronización con Firestore para subPanels (no vive en
  // los widgets). Se dispara con la carga inicial, con la navegación entre
  // paneles y con selectPanel — siempre que cambie currentPanel.id. Usa
  // cancelToken para no aplicar un resultado que quedó "en vuelo" si el
  // usuario navega antes de que resuelva.
  useEffect(() => {
    if (currentPanelId === undefined) return;

    const cancelToken = { cancelled: false };
    loadSubPanels(currentPanelId, cancelToken);

    return () => {
      cancelToken.cancelled = true;
    };
  }, [currentPanelId, loadSubPanels]);

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

  const findArchived = useCallback(
    async (
      parentRef: DocumentReference | null,
    ): Promise<Panel[] | undefined> => {
      const result = await panelsService.getArchivedPanels(parentRef);
      if (isErr(result)) {
        dispatch({ type: "FETCH_ARCHIVED_ERROR", payload: result.err });
        return undefined;
      }
      return result.value;
    },
    [panelsService],
  );

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

      if (opt.addToParent && currentPanelId !== undefined) {
        const currentRef = await panelsService.getDocRef(currentPanelId);
        const result = await panelsService.createPanel(
          data,
          currentRef.success ? currentRef.value : undefined,
        );

        console.log("createPanel result: ", result);

        if (isErr(result)) {
          dispatch({ type: "FETCH_SUBPANELS_ERROR", payload: result.err });
          return result;
        }

        // El panel creado ya viene completo (con parentId incluido): el
        // reducer lo agrega a subPanels en memoria si corresponde al
        // currentPanel — cero lecturas extra a Firestore, y ya no depende
        // de que el widget se re-monte o de recargar la página.
        dispatch({ type: "CREATE_PANEL_SUCCESS", payload: result.value });

        switch (opt.return) {
          case ReturnType.PANEL:
            return result;

          case ReturnType.DOCREF: {
            const refResult = await panelsService.getDocRef(result.value.id);
            if (isErr(refResult)) {
              dispatch({
                type: "FETCH_SUBPANELS_ERROR",
                payload: refResult.err,
              });
              return refResult;
            }

            return refResult;
          }

          case ReturnType.DEFAULT:
          default:
            return { success: true, value: undefined };
        }
      }

      return err(
        unexpectedErr(
          "No hay un currentPanel seleccionado para añadir el sub-panel",
        ),
      );
    },
    [panelsService, currentPanelId],
  );

  const archivePanel = useCallback(
    async (id: string): Promise<void> => {
      const result = await panelsService.archivePanel(id);
      if (isErr(result)) {
        dispatch({ type: "ARCHIVED_ERROR", payload: result.err });
        return;
      }
      dispatch({ type: "ARCHIVED", payload: result.value });
    },
    [panelsService],
  );

  const unarchivePanel = useCallback(
    async (id: string): Promise<void> => {
      const result = await panelsService.unarchivePanel(id);
      if (isErr(result)) {
        dispatch({ type: "UNARCHIVED_ERROR", payload: result.err });
        return;
      }
      dispatch({ type: "UNARCHIVED", payload: result.value });
    },
    [panelsService],
  );

  // ─── fetchSubPanels ───────────────────────────────────────────────────────

  const fetchSubPanels = useCallback(
    async (parentId: DocumentReference | string): Promise<void> => {
      if (typeof parentId === "string") {
        // Sin cancelToken a propósito: es la misma vía legacy documentada
        // arriba (addSubPanel solo recibe DocumentReferences, no el Panel
        // completo) — el chequeo currentPanel.id === parentId dentro del
        // reducer ya descarta el resultado si el usuario navegó mientras
        // tanto, sin necesidad de una señal de cancelación explícita.
        await loadSubPanels(parentId);
        return;
      }

      const result = await panelsService.getSubPanels(parentId);

      if (isErr(result)) {
        dispatch({ type: "FETCH_SUBPANELS_ERROR", payload: result.err });
        return;
      }

      dispatch({
        type: "FETCH_SUBPANELS_SUCCESS",
        payload: { parentId: parentId.id, panels: result.value },
      });
    },
    [panelsService, loadSubPanels],
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

  const deletePanelArchive = useCallback(
    async (id: string): Promise<void> => {
      const result = await panelsService.deletePanelArchive(id);
      if (isErr(result)) {
        dispatch({ type: "DELETE_ARCHIVED_ERROR", payload: result.err });
        return;
      }
      dispatch({ type: "DELETE_ARCHIVED_SUCCESS", payload: result.value });
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

  const value = useMemo<PanelsContextValue>(
    () => ({
      state,
      findBySharedId,
      findByRef,
      fetchPanels,
      fetchHomePanel,
      findArchived,
      createPanel,
      archivePanel,
      unarchivePanel,
      fetchSubPanels,
      updatePanel,
      deletePanel,
      deletePanelCascade,
      deletePanelArchive,
      selectPanel,
      clearError,
    }),
    [
      state,
      findBySharedId,
      findByRef,
      fetchPanels,
      fetchHomePanel,
      findArchived,
      createPanel,
      archivePanel,
      unarchivePanel,
      fetchSubPanels,
      updatePanel,
      deletePanel,
      deletePanelCascade,
      deletePanelArchive,
      selectPanel,
      clearError,
    ],
  );

  return (
    <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>
  );
}
