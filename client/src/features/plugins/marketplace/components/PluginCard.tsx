import type { MarketplaceListing } from "../domain/marketplace.types";

interface Props {
  plugin: MarketplaceListing;
  busy: boolean;
  onInstall: (plugin: MarketplaceListing) => void;
  onUninstall: (plugin: MarketplaceListing) => void;
}

export function PluginCard({ plugin, busy, onInstall, onUninstall }: Props) {
  const installed = plugin.installedVersion !== null;
  const outdated = installed && plugin.installedVersion !== plugin.version;

  return (
    <article className="mkt-card" aria-labelledby={`mkt-${plugin.id}`}>
      <header>
        <h3 id={`mkt-${plugin.id}`}>{plugin.name}</h3>
        <span className={`mkt-badge mkt-badge--${plugin.tier}`}>{plugin.tier === "verified" ? "Verificado" : "Comunidad"}</span>
      </header>
      <p>{plugin.description}</p>
      <small>
        {plugin.author} · v{plugin.version} · {plugin.widgetCount} widget{plugin.widgetCount === 1 ? "" : "s"}
      </small>
      <footer>
        {!installed && <button type="button" disabled={busy} onClick={() => onInstall(plugin)}>Instalar</button>}
        {outdated && <button type="button" disabled={busy} onClick={() => onInstall(plugin)}>Actualizar a v{plugin.version}</button>}
        {installed && (
          <button type="button" className="mkt-secondary" disabled={busy} onClick={() => onUninstall(plugin)}>
            Desinstalar
          </button>
        )}
      </footer>
    </article>
  );
}
