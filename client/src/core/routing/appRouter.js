import { createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
// Todo lo demás de este archivo queda igual: basename hace que CADA
// navigate("/login"), <Navigate to="/home"/>, redirect("/home?...") etc.
// en toda la app se resuelva contra "/app" automáticamente — no hace
// falta tocar ni un solo llamado existente.
export const appRouter = createBrowserRouter(routes, { basename: "/app" });
