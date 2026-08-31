import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Desmonta los componentes montados por cada test — sin esto, un test que
// olvide desmontar deja el DOM "sucio" para el siguiente y produce falsos
// positivos/negativos difíciles de rastrear.
afterEach(() => {
  cleanup();
});
