import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Config de Vitest separada de vite.config.ts a propósito: mantiene la config
// de build de producción libre de nada relacionado a testing, pero reusa
// exactamente los mismos alias "#..." para que los imports en los tests
// sean idénticos a los del código de la app.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "#components": path.resolve(__dirname, "src/components"),
      "#core": path.resolve(__dirname, "src/core"),
      "#features": path.resolve(__dirname, "src/features"),
      "#shared": path.resolve(__dirname, "src/shared"),
      "#pages": path.resolve(__dirname, "src/pages"),
      "#elements": path.resolve(__dirname, "src/elements"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setupTests.ts"],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.types.ts",
        "src/main.tsx",
        "src/**/index.ts",
      ],
    },
  },
});
