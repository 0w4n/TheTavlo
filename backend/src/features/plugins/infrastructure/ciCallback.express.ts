import type { Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { adminDb } from "../../../firebase/config.js";
import { reportBuild } from "../app/sync.service.js";

const JWKS = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));

/**
 * POST /internal/plugins/build-report
 * Autenticado con el OIDC token de GitHub Actions (sin secretos compartidos):
 * solo el workflow plugin-build.yaml de NUESTRO repo puede aprobar releases.
 */
export async function buildReportHandler(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    if (!token) return res.status(401).end();

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "https://token.actions.githubusercontent.com",
      audience: process.env.PLUGIN_CI_AUDIENCE ?? "thetavlo-plugin-ci",
    });
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
