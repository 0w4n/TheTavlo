import type { Request, Response } from "express";
import crypto from "node:crypto";
import { adminDb } from "../../../firebase/config.js";
import { reportBuild } from "../app/sync.service.js";

// Caché en memoria para el JWKS de GitHub
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const CACHE_TTL = 3600 * 1000; // 1 hora

async function getPublicKey(kid: string) {
  const now = Date.now();
  if (!jwksCache || now - jwksCache.fetchedAt > CACHE_TTL) {
    const res = await fetch("https://token.actions.githubusercontent.com/.well-known/jwks");
    if (!res.ok) throw new Error("Failed to fetch JWKS");
    const data = (await res.json()) as { keys: any[] };
    jwksCache = { keys: data.keys, fetchedAt: now };
  }

  let jwk = jwksCache.keys.find((k) => k.kid === kid);
  if (!jwk) {
    // Si no se encuentra, forzar actualización por si hubo rotación de llaves
    const res = await fetch("https://token.actions.githubusercontent.com/.well-known/jwks");
    if (!res.ok) throw new Error("Failed to fetch JWKS");
    const data = (await res.json()) as { keys: any[] };
    jwksCache = { keys: data.keys, fetchedAt: now };
    jwk = jwksCache.keys.find((k) => k.kid === kid);
    if (!jwk) throw new Error(`JWK not found for kid: ${kid}`);
  }

  return crypto.createPublicKey({ key: jwk, format: "jwk" });
}

/**
 * POST /internal/plugins/build-report
 * Autenticado con el OIDC token de GitHub Actions (sin secretos compartidos):
 * solo el workflow plugin-build.yaml de NUESTRO repo puede aprobar releases.
 */
export async function buildReportHandler(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    if (!token) return res.status(401).end();

    const parts = token.split(".");
    if (parts.length !== 3) return res.status(401).end();

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    // Validar algoritmo y key ID
    if (header.alg !== "RS256" || !header.kid) {
      return res.status(401).end();
    }

    // Obtener llave pública y verificar firma criptográfica
    const publicKey = await getPublicKey(header.kid);
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signature = Buffer.from(encodedSignature, "base64url");

    const isValid = crypto.verify("RSA-SHA256", Buffer.from(dataToVerify), publicKey, signature);
    if (!isValid) {
      return res.status(401).end();
    }

    // Validar claims esenciales
    const expectedIssuer = "https://token.actions.githubusercontent.com";
    const expectedAudience = process.env.PLUGIN_CI_AUDIENCE ?? "thetavlo-plugin-ci";

    if (payload.iss !== expectedIssuer || payload.aud !== expectedAudience) {
      return res.status(403).end();
    }

    // Validar expiración del token
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return res.status(401).end();
    }

    const repo = process.env.PLUGIN_BUILD_REPO;
    const workflow = String(payload.job_workflow_ref ?? "").split("@")[0];
    if (payload.repository !== repo || workflow !== `${repo}/.github/workflows/plugin-build.yaml`) {
      return res.status(403).end();
    }

    await reportBuild(adminDb, req.body);
    return res.json({ ok: true });
  } catch (error) {
    console.error("[plugins.build-report]", error);
    return res.status(400).json({ error: "invalid_report" });
  }
}