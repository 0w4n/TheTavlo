import "dotenv/config";
import express from "express";
import serverless from 'serverless-http';
import cors from "cors";
import helmet from "helmet";
import { TRPCError } from "@trpc/server";
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from "@trpc/server/adapters/express";
import apiRouter from "./router/api.ts";
import { appRouter } from "./trpc/root.router.ts";
import { createContext } from "./trpc/context.ts";
import { getEmojiSuggestions, parseEmojiInput } from "./features/suggestions/suggestions.router.ts";

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173,https://thetavlo.com,https://www.thetavlo.com").split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(express.json());

// API REST "clásica" — reservada a superficie pública/legacy (ver sección C
// de la auditoría): webhooks, endpoints de terceros. El core de la app
// (incluyendo invitaciones) vive en tRPC, montado abajo.
app.use("/api/v1", apiRouter);

app.get("/api/trpc/suggestions/emoji", async (req, res) => {
  const context = await createContext({
    req,
    res,
    info: {} as CreateExpressContextOptions["info"],
  });

  if (!context.user) {
    res.status(401).json({
      error: {
        message: "Necesitas iniciar sesión.",
        data: { code: "UNAUTHORIZED" },
      },
    });
    return;
  }

  try {
    const rawInput = typeof req.query.input === "string"
      ? JSON.parse(req.query.input)
      : {};
    const result = await getEmojiSuggestions(parseEmojiInput(rawInput));
    console.log("Emoji suggestions result:", result);
    res.json({ result: { data: result } });
  } catch (error) {
    const isBadInput = error instanceof TRPCError && error.code === "BAD_REQUEST";
    res.status(isBadInput ? 400 : 500).json({
      error: {
        message: error instanceof Error ? error.message : "Error interno del servidor.",
        data: { code: isBadInput ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR" },
      },
    });
  }
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

export default serverless(app);

//app.listen(PORT, () => {
//  console.log(`Server is running on port ${PORT}`);
//});
