import { beforeEach, describe, expect, it } from "vitest";
import { CachedPanelsRepository } from "./panelRepository.cached";
import { __resetAllPanelsCacheForTests } from "./panelsCache";
import { createFakePanelRepository, refTo, } from "./__fixtures__/fakePanelRepository";
import { isErr, isOk } from "#core/appCore/domain/AppCore.type";
const now = {};
const CACHE_KEY = "users/user-1";
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
beforeEach(() => {
    __resetAllPanelsCacheForTests();
});
describe("CachedPanelsRepository — findById", () => {
    it("primera llamada pega a la fuente; la segunda sale de caché", async () => {
        const a = makePanel("a");
        const { repository: inner, calls } = createFakePanelRepository([a]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        await cached.findById("a");
        await cached.findById("a");
        expect(calls.findById).toBe(1);
    });
    it("dos cacheKey (usuarios) distintos no comparten resultados", async () => {
        const a = makePanel("a");
        const { repository: inner, calls } = createFakePanelRepository([a]);
        const userA = new CachedPanelsRepository(inner, "users/a");
        const userB = new CachedPanelsRepository(inner, "users/b");
        await userA.findById("a");
        await userB.findById("a");
        expect(calls.findById).toBe(2);
    });
});
describe("CachedPanelsRepository — findManyByIds (resolución de cadena de URL)", () => {
    it("una cadena de 5 niveles ya visitada resuelve en 0 lecturas nuevas", async () => {
        const chain = [
            makePanel("a", null),
            makePanel("b", "a"),
            makePanel("c", "b"),
            makePanel("d", "c"),
            makePanel("e", "d"),
        ];
        const { repository: inner, calls } = createFakePanelRepository(chain);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        const ids = ["a", "b", "c", "d", "e"];
        // Primera visita: todo faltaba, una sola llamada por lote a la fuente.
        const first = await cached.findManyByIds(ids);
        expect(isOk(first)).toBe(true);
        expect(calls.findManyByIds).toBe(1);
        // Segunda visita a la MISMA cadena: cero llamadas nuevas.
        const second = await cached.findManyByIds(ids);
        expect(isOk(second)).toBe(true);
        expect(calls.findManyByIds).toBe(1);
    });
    it("agregar un nivel más solo pide el nivel nuevo, no toda la cadena de nuevo", async () => {
        const chain = [makePanel("a", null), makePanel("b", "a"), makePanel("c", "b")];
        const { repository: inner, calls } = createFakePanelRepository(chain);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        await cached.findManyByIds(["a", "b"]);
        expect(calls.findManyByIds).toBe(1);
        const spyBefore = calls.findManyByIds;
        await cached.findManyByIds(["a", "b", "c"]);
        // Se llamó de nuevo a la fuente (una vez), pero pidiendo solo lo que faltaba.
        expect(calls.findManyByIds).toBe(spyBefore + 1);
    });
});
describe("CachedPanelsRepository — findByParentId (hijos bajo demanda)", () => {
    it("cachea la lista de hijos y no vuelve a consultar en la siguiente llamada", async () => {
        const parent = makePanel("parent");
        const child = makePanel("child", "parent");
        const { repository: inner, calls } = createFakePanelRepository([parent, child]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        await cached.findByParentId(refTo("parent"));
        await cached.findByParentId(refTo("parent"));
        expect(calls.findByParentId).toBe(1);
    });
    it("un padre sin hijos también se cachea (lista vacía) y no se re-consulta", async () => {
        const leaf = makePanel("leaf");
        const { repository: inner, calls } = createFakePanelRepository([leaf]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        const first = await cached.findByParentId(refTo("leaf"));
        const second = await cached.findByParentId(refTo("leaf"));
        expect(isOk(first) && first.value).toEqual([]);
        expect(isOk(second) && second.value).toEqual([]);
        expect(calls.findByParentId).toBe(1);
    });
});
describe("CachedPanelsRepository — create/update mantienen la caché al día", () => {
    it("create cachea el nuevo panel e invalida los hijos del padre", async () => {
        const parent = makePanel("parent");
        const { repository: inner, calls } = createFakePanelRepository([parent]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        // Cacheamos "sin hijos" primero.
        await cached.findByParentId(refTo("parent"));
        expect(calls.findByParentId).toBe(1);
        await cached.create({ name: "nuevo", parentId: null, color: 1, icon: "", sharedWith: null, createdAt: now, updatedAt: now }, refTo("parent"));
        // El registro de hijos de "parent" fue invalidado — la próxima consulta
        // vuelve a pegarle a la fuente, y esta vez trae al hijo nuevo.
        const afterCreate = await cached.findByParentId(refTo("parent"));
        expect(calls.findByParentId).toBe(2);
        expect(isOk(afterCreate) && afterCreate.value).toHaveLength(1);
    });
    it("update sincroniza el panel en caché", async () => {
        const a = makePanel("a");
        const { repository: inner } = createFakePanelRepository([a]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        await cached.findById("a"); // lo mete en caché
        await cached.update("a", { name: "Renombrado" });
        const result = await cached.findById("a");
        expect(isOk(result) && result.value?.name).toBe("Renombrado");
    });
});
describe("CachedPanelsRepository — delete / deleteCascade limpian la caché", () => {
    it("delete saca el panel de la caché e invalida los hijos de su padre", async () => {
        const parent = makePanel("parent");
        const child = makePanel("child", "parent");
        const { repository: inner, calls } = createFakePanelRepository([parent, child]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        await cached.findByParentId(refTo("parent")); // cachea [child]
        await cached.delete("child");
        const result = await cached.findById("child");
        expect(isOk(result) && result.value).toBeUndefined();
        // El registro de hijos de "parent" quedó invalidado.
        const childrenAfter = await cached.findByParentId(refTo("parent"));
        expect(calls.findByParentId).toBe(2);
        expect(isOk(childrenAfter) && childrenAfter.value).toEqual([]);
    });
    it("deleteCascade limpia el panel, todos sus descendientes, y el registro de hijos de cada uno", async () => {
        const root = makePanel("root");
        const mid = makePanel("mid", "root");
        const leaf1 = makePanel("leaf1", "mid");
        const leaf2 = makePanel("leaf2", "mid");
        const { repository: inner, calls } = createFakePanelRepository([
            root,
            mid,
            leaf1,
            leaf2,
        ]);
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        // Precargamos todo en caché para simular una sesión activa.
        await cached.findManyByIds(["root", "mid", "leaf1", "leaf2"]);
        await cached.findByParentId(refTo("mid")); // registra [leaf1, leaf2] como hijos de mid
        const result = await cached.deleteCascade("mid");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
            expect(new Set(result.value.deletedIds)).toEqual(new Set(["mid", "leaf1", "leaf2"]));
        }
        expect(calls.deleteCascade).toBe(1);
        // "root" no se tocó — sigue en caché sin necesidad de re-pedirlo.
        const rootStillCached = await cached.findManyByIds(["root"]);
        expect(isOk(rootStillCached) && rootStillCached.value).toHaveLength(1);
        // Pero "mid", "leaf1" y "leaf2" ya no están.
        const goneIds = await cached.findManyByIds(["mid", "leaf1", "leaf2"]);
        expect(isOk(goneIds) && goneIds.value).toEqual([]);
    });
    it("propaga el error si la fuente falla y no toca la caché", async () => {
        const { repository: inner } = createFakePanelRepository([]);
        inner.deleteCascade = async () => ({
            success: false,
            err: { kind: "Unexpected", message: "boom", code: 500 },
        });
        const cached = new CachedPanelsRepository(inner, CACHE_KEY);
        const result = await cached.deleteCascade("ghost");
        expect(isErr(result)).toBe(true);
    });
});
