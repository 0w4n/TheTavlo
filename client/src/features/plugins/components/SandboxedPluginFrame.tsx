import { useEffect, useRef, useState } from "react";
import { PROTOCOL_VERSION, type HostEvent, type InitMessage } from "../domain/hostProtocol";
import type { PanelScope, ResolvedPlugin } from "../domain/plugin.types";
import { loadVerifiedBundle } from "../infrastructure/bundleLoader";
import { buildSrcDoc } from "../runtime/buildSrcDoc";
import { createCapabilities } from "../runtime/capabilities";
import { attachBridge } from "../runtime/hostBridge";
import "./pluginFrame.css";

interface Props {
  plugin: ResolvedPlugin;
  widgetKey: string;
  instanceId: string;
  title: string;
  config: Record<string, unknown>;
  scope: PanelScope;
  readOnly: boolean;
  onToast?: (message: string) => void;
}

type Status = "loading" | "ready" | "error";

/**
 * UNA instancia = UN iframe + UN MessageChannel + UN namespace de estado.
 *  - `sandbox="allow-scripts"` (sin allow-same-origin): origen opaco único por iframe →
 *    sin cookies, sin storage, sin acceso al DOM/JS del host ni a otras instancias.
 *  - HTML verificado por SHA-256 y servido vía `srcdoc` con CSP inyectada (sin red).
 *  - Todo acceso a datos pasa por el bridge RPC con permisos, rate-limit y read-only.
 */
export function SandboxedPluginFrame(props: Props) {
  const { plugin, instanceId, widgetKey, config } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const portRef = useRef<MessagePort | null>(null);
  const loadsRef = useRef(0);
  const latest = useRef(props);
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { latest.current = props; });

  // 1) Descargar + verificar integridad + construir srcdoc
  useEffect(() => {
    let cancelled = false;
    loadsRef.current = 0;
    setStatus("loading");
    setSrcDoc(null);
    loadVerifiedBundle(plugin)
      .then((html) => { if (!cancelled) setSrcDoc(buildSrcDoc(html)); })
      .catch((error) => { console.error("[plugins]", plugin.pluginId, error); if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [plugin.pluginId, plugin.version, plugin.integrity, plugin.bundleUrl, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2) Handshake: el plugin envía "hello" (reintenta cada 250 ms); el host responde con "init" + puerto
  useEffect(() => {
    if (!srcDoc) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let detach: (() => void) | undefined;
    const timeout = window.setTimeout(() => setStatus("error"), 8000);

    const onMessage = (ev: MessageEvent) => {
      // El origen del iframe sandboxed es "null": se autentica por referencia a la ventana.
      if (ev.source !== iframe.contentWindow || detach) return;
      const data = ev.data as { type?: string; protocol?: number } | null;
      if (data?.type !== "tavlo:hello" || data.protocol !== PROTOCOL_VERSION) return;

      const { port1, port2 } = new MessageChannel();
      portRef.current = port1;
      detach = attachBridge(port1, {
        permissions: new Set(latest.current.plugin.permissions),
        isReadOnly: () => latest.current.readOnly,
        handlers: createCapabilities(() => ({
          scope: latest.current.scope,
          instanceId: latest.current.instanceId,
          onToast: latest.current.onToast,
        })),
      });
      const init: InitMessage = {
        type: "tavlo:init", protocol: PROTOCOL_VERSION,
        instanceId: latest.current.instanceId, widgetKey: latest.current.widgetKey,
        config: latest.current.config, readOnly: latest.current.readOnly,
        permissions: latest.current.plugin.permissions,
      };
      // targetOrigin "*" es obligatorio con origen opaco; el init no contiene secretos.
      iframe.contentWindow!.postMessage(init, "*", [port2]);
      window.clearTimeout(timeout);
      setStatus("ready");
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      detach?.();
      portRef.current = null;
    };
  }, [srcDoc]);

  // 3) Cambios de configuración → evento al plugin (sin remontar el iframe)
  useEffect(() => {
    const event: HostEvent = { event: "config", payload: config };
    portRef.current?.postMessage(event);
  }, [config]);

  // Un 2º `load` = el plugin navegó el frame a otra URL (phishing/redirect) → se descarta.
  const onLoad = () => {
    loadsRef.current += 1;
    if (loadsRef.current > 1) { setSrcDoc(null); setStatus("error"); }
  };

  return (
    <div className="plugin-frame" data-status={status}>
      {status === "loading" && <p className="plugin-frame__msg" role="status">Cargando plugin…</p>}
      {status === "error" && (
        <div className="plugin-frame__msg" role="alert">
          <p>Este plugin no pudo cargarse.</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>Reintentar</button>
        </div>
      )}
      {srcDoc && (
        <iframe
          key={`${instanceId}:${plugin.version}:${attempt}`}
          ref={iframeRef}
          title={props.title}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          allow=""
          referrerPolicy="no-referrer"
          onLoad={onLoad}
          data-widget-key={widgetKey}
        />
      )}
    </div>
  );
}
