import { useEffect, useRef } from "react";
import { PERMISSION_LABELS, type MarketplaceListing } from "../domain/marketplace.types";

interface Props {
  plugin: MarketplaceListing;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Consentimiento explícito: el usuario ve exactamente los permisos que concede. */
export function InstallDialog({ plugin, onConfirm, onCancel }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="mkt-backdrop" onClick={onCancel}>
      <div className="mkt-dialog" role="dialog" aria-modal="true" aria-labelledby="mkt-dlg-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="mkt-dlg-title">Instalar {plugin.name}</h2>
        {plugin.permissions.length === 0 ? (
          <p>Este plugin no solicita ningún permiso.</p>
        ) : (
          <>
            <p>Este plugin podrá:</p>
            <ul>{plugin.permissions.map((p) => <li key={p}>{PERMISSION_LABELS[p]}</li>)}</ul>
          </>
        )}
        <p className="mkt-note">Se ejecuta aislado y sin acceso a internet ni a tu cuenta.</p>
        <div className="mkt-actions">
          <button type="button" className="mkt-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" ref={confirmRef} onClick={onConfirm}>Aceptar e instalar</button>
        </div>
      </div>
    </div>
  );
}
