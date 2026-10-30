import { useState } from "react";
import { createPortal } from "react-dom";
import { useMarketplace } from "../presentation/hooks/useMarketplace";
import type { MarketplaceListing } from "../domain/marketplace.types";
import { InstallDialog } from "./InstallDialog";
import { PluginCard } from "./PluginCard";
import "./marketplace.css";

interface Props {
  /** Se llama tras instalar/desinstalar, cuando el registry de widgets ya se actualizó. */
  onChanged?: () => void;
}

/**
 * Versión embebible del marketplace (p. ej. dentro del diálogo "Añade un widget").
 * Reutiliza el mismo hook, tarjetas y consentimiento de permisos que MarketplacePage.
 * Debe usarse dentro de <PluginRuntimeProvider>.
 */
export function PluginPicker({ onChanged }: Props) {
  const mkt = useMarketplace();
  const [pending, setPending] = useState<MarketplaceListing | null>(null);

  const install = async (plugin: MarketplaceListing) => {
    await mkt.install(plugin.id, plugin.permissions);
    onChanged?.();
  };
  const uninstall = async (plugin: MarketplaceListing) => {
    await mkt.uninstall(plugin.id);
    onChanged?.();
  };

  return (
    <section className="mkt mkt--embedded" aria-label="Plugins disponibles">
      <label className="mkt-search">
        <span>Buscar plugins</span>
        <input
          type="search"
          value={mkt.query}
          onChange={(e) => mkt.setQuery(e.target.value)}
          placeholder="Nombre o descripción"
        />
      </label>

      {mkt.actionError && <p role="alert" className="mkt-error">{mkt.actionError}</p>}
      <p aria-live="polite" className="mkt-status">
        {mkt.status === "loading" && "Cargando…"}
        {mkt.status === "error" && "No se pudo cargar el catálogo. Inténtalo de nuevo más tarde."}
        {mkt.status === "ready" && mkt.items.length === 0 && "No hay plugins que coincidan con tu búsqueda."}
      </p>

      <div className="mkt-grid">
        {mkt.items.map((p) => (
          <PluginCard
            key={p.id}
            plugin={p}
            busy={mkt.busyId === p.id}
            onInstall={setPending}
            onUninstall={uninstall}
          />
        ))}
      </div>

      {pending &&
        createPortal(
          <div className="mkt">
            <InstallDialog
              plugin={pending}
              onCancel={() => setPending(null)}
              onConfirm={() => {
                const plugin = pending;
                setPending(null);
                void install(plugin);
              }}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
