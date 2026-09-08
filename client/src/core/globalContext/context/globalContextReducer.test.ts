import { describe, expect, it } from "vitest";
import {
  globalContextReducer,
  initialGlobalContext,
} from "./globalContextReducer";

const panel = {
  panelId: "panel-1",
  ownerId: "owner-1",
  ownerAccountType: "users" as const,
};

describe("globalContextReducer", () => {
  it("conserva el panel si llega antes que el usuario", () => {
    const withPanel = globalContextReducer(initialGlobalContext, {
      type: "SET_PANEL",
      payload: panel,
    });

    const state = globalContextReducer(withPanel, {
      type: "SET_USER",
      payload: { userId: "user-1", accountType: "guests" },
    });

    expect(state).toEqual({
      status: "ready",
      state: {
        user: { userId: "user-1", accountType: "guests" },
        panel,
      },
    });
  });

  it("actualiza el panel si llega después que el usuario", () => {
    const withUser = globalContextReducer(initialGlobalContext, {
      type: "SET_USER",
      payload: { userId: "user-1", accountType: "users" },
    });

    const state = globalContextReducer(withUser, {
      type: "SET_PANEL",
      payload: panel,
    });

    expect(state.status).toBe("ready");
    if (state.status === "ready") expect(state.state.panel).toEqual(panel);
  });
});