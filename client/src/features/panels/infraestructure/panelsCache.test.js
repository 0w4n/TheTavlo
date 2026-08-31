import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAllPanelsCacheForTests, clearPanelsCache, deleteCachedPanel, deleteCachedPanels, ensurePanelsInCache, fetchChildrenPanels, getCachedChildren, getCachedPanel, getPanelsCacheKey, invalidateChildren, setCachedChildren, setCachedPanel, setCachedPanels, } from "./panelsCache";
import { ok, err, notFoundErr } from "#core/appCore/domain/AppCore.type";
const now = {};
function refTo(id) {
    return { id };
}
function makePanel(id, parentId = null) {
    return {
        id,
        parentId: parentId ? refTo(parentId) : null,
        name: id,
        color: 0,
        icon: "",
        sharedWith: null,
        createdAt: now,
        updatedAt: now,
    };
}
const KEY = "users/user-1";
beforeEach(() => {
    __resetAllPanelsCacheForTests();
});
describe("getPanelsCacheKey", () => {
    it("combina accountType e id — namespacea por usuario", () => {
        expect(getPanelsCacheKey({ accountType: "users", id: "abc" })).toBe("users/abc");
        expect(getPanelsCacheKey({ accountType: "guests", id: "abc" })).not.toBe(getPanelsCacheKey({ accountType: "users", id: "abc" }));
    });
});
describe("paneles individuales", () => {
    it("get devuelve undefined si no está cacheado", () => {
        expect(getCachedPanel(KEY, "a")).toBeUndefined();
    });
    it("set + get redondea el mismo panel", () => {
        const a = makePanel("a");
        setCachedPanel(KEY, a);
        expect(getCachedPanel(KEY, "a")).toEqual(a);
    });
    it("setCachedPanels cachea varios de una", () => {
        setCachedPanels(KEY, [makePanel("a"), makePanel("b")]);
        expect(getCachedPanel(KEY, "a")).toBeDefined();
        expect(getCachedPanel(KEY, "b")).toBeDefined();
    });
    it("delete saca el panel de la caché", () => {
        setCachedPanel(KEY, makePanel("a"));
        deleteCachedPanel(KEY, "a");
        expect(getCachedPanel(KEY, "a")).toBeUndefined();
    });
    it("deleteCachedPanels borra varios ids de una — cascade delete masivo", () => {
        setCachedPanels(KEY, [makePanel("a"), makePanel("b"), makePanel("c")]);
        deleteCachedPanels(KEY, ["a", "b"]);
        expect(getCachedPanel(KEY, "a")).toBeUndefined();
        expect(getCachedPanel(KEY, "b")).toBeUndefined();
        expect(getCachedPanel(KEY, "c")).toBeDefined();
    });
    it("dos usuarios distintos no comparten caché", () => {
        setCachedPanel(KEY, makePanel("a"));
        expect(getCachedPanel("users/other", "a")).toBeUndefined();
    });
});
describe("registro de hijos (loadedChildrenRegistry)", () => {
    it("getCachedChildren devuelve undefined si nunca se pidieron", () => {
        expect(getCachedChildren(KEY, "parent-1")).toBeUndefined();
    });
    it("setCachedChildren registra la lista, incluso vacía", () => {
        setCachedChildren(KEY, "parent-1", []);
        expect(getCachedChildren(KEY, "parent-1")).toEqual([]);
    });
    it("setCachedChildren también cachea los paneles hijos individualmente", () => {
        const child = makePanel("child-1", "parent-1");
        setCachedChildren(KEY, "parent-1", [child]);
        expect(getCachedPanel(KEY, "child-1")).toEqual(child);
        expect(getCachedChildren(KEY, "parent-1")).toEqual([child]);
    });
    it("invalidateChildren fuerza a que la próxima consulta sea undefined de nuevo", () => {
        setCachedChildren(KEY, "parent-1", [makePanel("child-1", "parent-1")]);
        invalidateChildren(KEY, "parent-1");
        expect(getCachedChildren(KEY, "parent-1")).toBeUndefined();
    });
    it("root (parentId null) se trackea aparte de un padre real", () => {
        setCachedChildren(KEY, null, [makePanel("root-child")]);
        expect(getCachedChildren(KEY, null)).toHaveLength(1);
        expect(getCachedChildren(KEY, "parent-1")).toBeUndefined();
    });
});
describe("clearPanelsCache", () => {
    it("borra todo el bucket de un usuario, sin afectar a otros", () => {
        setCachedPanel(KEY, makePanel("a"));
        setCachedPanel("users/other", makePanel("z"));
        clearPanelsCache(KEY);
        expect(getCachedPanel(KEY, "a")).toBeUndefined();
        expect(getCachedPanel("users/other", "z")).toBeDefined();
    });
});
describe("ensurePanelsInCache", () => {
    it("si todo ya está en caché, no llama a fetchMissing (0 lecturas)", async () => {
        setCachedPanels(KEY, [makePanel("a"), makePanel("b")]);
        const fetchMissing = vi.fn();
        const result = await ensurePanelsInCache(KEY, ["a", "b"], fetchMissing);
        expect(fetchMissing).not.toHaveBeenCalled();
        expect(result).toEqual(ok([makePanel("a"), makePanel("b")]));
    });
    it("pide únicamente los ids que faltan", async () => {
        setCachedPanel(KEY, makePanel("a"));
        const c = makePanel("c");
        const fetchMissing = vi.fn().mockResolvedValue(ok([c]));
        const result = await ensurePanelsInCache(KEY, ["a", "c"], fetchMissing);
        expect(fetchMissing).toHaveBeenCalledExactlyOnceWith(["c"]);
        expect(result).toEqual(ok([makePanel("a"), c]));
    });
    it("cachea lo recién traído para que la próxima llamada no vuelva a pedirlo", async () => {
        const fetchMissing = vi.fn().mockResolvedValue(ok([makePanel("a")]));
        await ensurePanelsInCache(KEY, ["a"], fetchMissing);
        await ensurePanelsInCache(KEY, ["a"], fetchMissing);
        expect(fetchMissing).toHaveBeenCalledTimes(1);
    });
    it("propaga el error si la fuente falla, sin cachear nada parcial", async () => {
        const fetchMissing = vi.fn().mockResolvedValue(err(notFoundErr("no está")));
        const result = await ensurePanelsInCache(KEY, ["ghost"], fetchMissing);
        expect(result.success).toBe(false);
        expect(getCachedPanel(KEY, "ghost")).toBeUndefined();
    });
    it("ids duplicados en el pedido no generan fetchs duplicados", async () => {
        const fetchMissing = vi.fn().mockResolvedValue(ok([makePanel("a")]));
        await ensurePanelsInCache(KEY, ["a", "a", "a"], fetchMissing);
        expect(fetchMissing).toHaveBeenCalledExactlyOnceWith(["a"]);
    });
});
describe("fetchChildrenPanels", () => {
    it("primera vez: pega a la fuente y registra el resultado", async () => {
        const child = makePanel("child-1", "parent-1");
        const fetchFromSource = vi.fn().mockResolvedValue(ok([child]));
        const result = await fetchChildrenPanels(KEY, "parent-1", fetchFromSource);
        expect(fetchFromSource).toHaveBeenCalledOnce();
        expect(result).toEqual(ok([child]));
    });
    it("segunda vez: sirve desde caché, 0 lecturas nuevas", async () => {
        const fetchFromSource = vi.fn().mockResolvedValue(ok([makePanel("child-1", "parent-1")]));
        await fetchChildrenPanels(KEY, "parent-1", fetchFromSource);
        await fetchChildrenPanels(KEY, "parent-1", fetchFromSource);
        expect(fetchFromSource).toHaveBeenCalledTimes(1);
    });
    it("un padre sin hijos también se cachea como lista vacía (no se re-consulta)", async () => {
        const fetchFromSource = vi.fn().mockResolvedValue(ok([]));
        await fetchChildrenPanels(KEY, "leaf-parent", fetchFromSource);
        await fetchChildrenPanels(KEY, "leaf-parent", fetchFromSource);
        expect(fetchFromSource).toHaveBeenCalledTimes(1);
    });
    it("no cachea nada si la fuente falla", async () => {
        const fetchFromSource = vi.fn().mockResolvedValue(err(notFoundErr("boom")));
        const result = await fetchChildrenPanels(KEY, "parent-1", fetchFromSource);
        expect(result.success).toBe(false);
        expect(getCachedChildren(KEY, "parent-1")).toBeUndefined();
    });
});
