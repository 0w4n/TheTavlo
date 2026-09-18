import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "./trpcClient";

describe("resolveApiBaseUrl", () => {
  it("prefiere CLIENT_API_BASE_URL sobre CLIENT_BACKEND_URI", () => {
    const env = {
      CLIENT_API_BASE_URL: "https://thetavlo.com/backend",
      CLIENT_BACKEND_URI: "http://localhost:3080",
    } as Record<string, string | undefined>;

    expect(resolveApiBaseUrl(env)).toBe("https://api.thetavlo.com");
    expect(resolveApiBaseUrl(env)).not.toContain("localhost");
  });

  it("normaliza CLIENT_BACKEND_URI sin protocolo", () => {
    const env = {
      CLIENT_BACKEND_URI: "api.thetavlo.com",
    } as Record<string, string | undefined>;

    expect(resolveApiBaseUrl(env)).toBe("https://api.thetavlo.com");
  });

  it("usa localhost solo en desarrollo local", () => {
    const env = {} as Record<string, string | undefined>;
    expect(resolveApiBaseUrl(env)).toBe("http://localhost:3080");
  });
});
