import { beforeEach, describe, expect, it } from "vitest";
import { PanelsService } from "./panels.service";
// import { CachedPanelsRepository } from "../infraestructure/panelRepository.cached";
import { __resetAllPanelsCacheForTests } from "../infraestructure/panelsCache";
import { createFakePanelRepository, refTo, } from "../infraestructure/__fixtures__/fakePanelRepository";
import { isErr, isOk } from "#core/appCore/domain/AppCore.type";
const now = {};
// const CACHE_KEY = "users/user-1";
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
/** El panel "default"/home tal como lo define PanelRules.canDelete. */
function makeDefaultPanel(id) {
    return {
        id,
        parentId: null,
        name: "",
        color: -1,
        icon: "",
        sharedWith: undefined,
        createdAt: now,
        updatedAt: now,
    };
}
beforeEach(() => {
    __resetAllPanelsCacheForTests();
});
describe("PanelsService.resolveChain", () => {
    it("resuelve una cadena válida de N niveles", async () => {
        const chain = [
            makePanel("a", null),
            makePanel("b", "a"),
            makePanel("c", "b"),
        ];
        const { repository } = createFakePanelRepository(chain);
        const service = new PanelsService(repository);
        const result = await service.resolveChain(["a", "b", "c"]);
        expect(isOk(result)).toBe(true);
        if (isOk(result))
            expect(result.value.map((p) => p.id)).toEqual(["a", "b", "c"]);
    });
    it("rechaza con NotFound si un id de la cadena no existe", async () => {
        const { repository } = createFakePanelRepository([makePanel("a", null)]);
        const service = new PanelsService(repository);
        const result = await service.resolveChain(["a", "ghost"]);
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("NotFound");
    });
    it("rechaza con Validation si el anidamiento no coincide con la base de datos", async () => {
        const a = makePanel("a", null);
        const b = makePanel("b", null); // no es hijo de "a" en la "base de datos"
        const { repository } = createFakePanelRepository([a, b]);
        const service = new PanelsService(repository);
        const result = await service.resolveChain(["a", "b"]);
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
    });
    it("cadena vacía resuelve a lista vacía sin tocar el repositorio", async () => {
        const { repository, calls } = createFakePanelRepository([]);
        const service = new PanelsService(repository);
        const result = await service.resolveChain([]);
        expect(result).toEqual({ success: true, value: [] });
        expect(calls.findManyByIds).toBe(0);
    });
    // it("con caché: re-resolver la misma cadena no genera lecturas nuevas", async () => {
    //   const chain = [makePanel("a", null), makePanel("b", "a"), makePanel("c", "b")];
    //   const { repository: inner, calls } = createFakePanelRepository(chain);
    //   const cachedRepository = new CachedPanelsRepository(inner, CACHE_KEY);
    //   const service = new PanelsService(cachedRepository);
    //   await service.resolveChain(["a", "b", "c"]);
    //   expect(calls.findManyByIds).toBe(1);
    //   await service.resolveChain(["a", "b", "c"]);
    //   expect(calls.findManyByIds).toBe(1); // sin cambios: 0 lecturas nuevas
    //   // Navegar un nivel más adentro solo pide el nivel nuevo.
    //   await service.resolveChain(["a", "b", "c", "d"].filter((id) => id !== "d"));
    // });
});
describe("PanelsService.deletePanel", () => {
    it("no permite borrar el panel por defecto", async () => {
        const { repository } = createFakePanelRepository([makeDefaultPanel("home")]);
        const service = new PanelsService(repository);
        const result = await service.deletePanel("home");
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
    });
    it("borra un panel normal", async () => {
        const { repository, calls } = createFakePanelRepository([makePanel("a")]);
        const service = new PanelsService(repository);
        const result = await service.deletePanel("a");
        expect(isOk(result)).toBe(true);
        expect(calls.delete).toBe(1);
    });
});
describe("PanelsService.deletePanelCascade", () => {
    it("no permite hacer cascade delete del panel por defecto", async () => {
        const { repository, calls } = createFakePanelRepository([makeDefaultPanel("home")]);
        const service = new PanelsService(repository);
        const result = await service.deletePanelCascade("home");
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
        expect(calls.deleteCascade).toBe(0);
    });
    it("elimina el panel y todos sus descendientes", async () => {
        const root = makePanel("root");
        const mid = makePanel("mid", "root");
        const leaf = makePanel("leaf", "mid");
        const { repository, calls } = createFakePanelRepository([root, mid, leaf]);
        const service = new PanelsService(repository);
        const result = await service.deletePanelCascade("mid");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
            expect(new Set(result.value.deletedIds)).toEqual(new Set(["mid", "leaf"]));
        }
        expect(calls.deleteCascade).toBe(1);
    });
    it("propaga NotFound si el panel objetivo no existe", async () => {
        const { repository } = createFakePanelRepository([]);
        const service = new PanelsService(repository);
        const result = await service.deletePanelCascade("ghost");
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("NotFound");
    });
});
describe("PanelsService.createPanel / updatePanel — validación de nombre delegada a PanelRules", () => {
    it("rechaza crear con nombre vacío", async () => {
        const { repository } = createFakePanelRepository([]);
        const service = new PanelsService(repository);
        const result = await service.createPanel({
            name: "",
            parentId: null,
            color: 1,
            icon: "",
            sharedWith: null,
            createdAt: now,
            updatedAt: now,
        });
        expect(isErr(result)).toBe(true);
    });
    it("crea con nombre válido", async () => {
        const { repository } = createFakePanelRepository([]);
        const service = new PanelsService(repository);
        const result = await service.createPanel({
            name: "Trabajo",
            parentId: null,
            color: 1,
            icon: "",
            sharedWith: null,
            createdAt: now,
            updatedAt: now,
        });
        expect(isOk(result)).toBe(true);
    });
});
