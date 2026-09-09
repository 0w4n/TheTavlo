import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "./trpcClient";

describe("resolveApiBaseUrl", () => {
  it("prefiere VITE_API_BASE_URL sobre VITE_BACKEND_URI", () => {
    const env = {
      VITE_API_BASE_URL: "https://api.thetavlo.com",
      VITE_BACKEND_URI: "http://localhost:3000",
    } as Record<string, string | undefined>;

    expect(resolveApiBaseUrl(env)).toBe("https://api.thetavlo.com");
    expect(resolveApiBaseUrl(env)).not.toContain("localhost");
  });

  it("normaliza VITE_BACKEND_URI sin protocolo", () => {
    const env = {
      VITE_BACKEND_URI: "api.thetavlo.com",
    } as Record<string, string | undefined>;

    expect(resolveApiBaseUrl(env)).toBe("https://api.thetavlo.com");
  });

  it("usa localhost solo en desarrollo local", () => {
    const env = {} as Record<string, string | undefined>;
    expect(resolveApiBaseUrl(env)).toBe("http://localhost:3000");
  });
});
