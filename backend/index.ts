import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import apiRouter from "./router/api.ts";
import { appRouter } from "./src";
import { createContext } from "./trpc/context.ts";

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN ?? "http://localhost:5173").split(","),
    credentials: true,
  }),
);
app.use(express.json());

// API REST "clásica" — reservada a superficie pública/legacy (ver sección C
// de la auditoría): webhooks, endpoints de terceros. El core de la app
// (incluyendo invitaciones) vive en tRPC, montado abajo.
app.use("/api/v1", apiRouter);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
