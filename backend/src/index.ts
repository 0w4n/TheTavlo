import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import apiRouter from "./router/api.js";
import { appRouter } from "./trpc/root.router.js";
import { createContext } from "./trpc/context.js";

const app = express();
const PORT = process.env.EXPRESS_PORT|| 8080;
const allowedOrigins = (
  process.env.CLIENT_ORIGIN ??
  "http://localhost:5173,https://thetavlo.com,https://www.thetavlo.com"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({error, path, type}) => { console.log(`ERRO: ${error} on ${path}, with type ${type}`)}
  }),
);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

// export default serverless(app);

app.listen(Number(PORT), "0.0.0.0", (error) => {
  console.log(`Server is running on port ${PORT}`);
  console.error(error);
});
