import { router } from "../../trpc/trpc.js";
import { marketplaceRouter } from "./marketplace/marketplace.router.js";
import { runtimeRouter } from "./runtime/runtime.router.js";

/** Se monta en root.router.ts como `plugins: pluginsRouter`
 *  → plugins.marketplace.* y plugins.runtime.* */
export const pluginsRouter = router({
  marketplace: marketplaceRouter,
  runtime: runtimeRouter,
});
