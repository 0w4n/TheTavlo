import { useState } from "react";
import { useMarketplace } from "../presentation/hooks/useMarketplace";
import type { MarketplaceListing } from "../domain/marketplace.types";
import { InstallDialog } from "./InstallDialog";
import { PluginCard } from "./PluginCard";
import "./marketplace.css";

export function MarketplacePage() {
  const mkt = useMarketplace();
  const [pending, setPending] = useState<MarketplaceListing | null>(null);

  return (
    <main className="mkt">
      <h1>Marketplace de plugins</h1>
      <label className="mkt-search">
        <span>Buscar plugins</span>
        <input type="search" value={mkt.query} onChange={(e) => mkt.setQuery(e.target.value)} placeholder="Nombre o descripción" />
      </label>

      {mkt.actionError && <p role="alert" className="mkt-error">{mkt.actionError}</p>}
      <p aria-live="polite" className="mkt-status">
        {mkt.status === "loading" && "Cargando…"}
        {mkt.status === "error" && "No se pudo cargar el catálogo. Inténtalo de nuevo más tarde."}
        {mkt.status === "ready" && mkt.items.length === 0 && "No hay plugins que coincidan con tu búsqueda."}
      </p>

      <div className="mkt-grid">
        {mkt.items.map((p) => (
          <PluginCard key={p.id} plugin={p} busy={mkt.busyId === p.id} onInstall={setPending} onUninstall={(x) => mkt.uninstall(x.id)} />
        ))}
      </div>

      {pending && (
        <InstallDialog
          plugin={pending}
          onCancel={() => setPending(null)}
          onConfirm={() => { void mkt.install(pending.id, pending.permissions); setPending(null); }}
        />
      )}
    </main>
  );
}
