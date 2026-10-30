// API pública de la feature: el resto de la app SOLO importa desde aquí.
export { PluginRuntimeProvider } from "./presentation/context/PluginRuntimeProvider";
export { usePluginRuntime } from "./presentation/hooks/usePluginRuntime";
export { PanelPluginHost } from "./components/PanelPluginHost";
export { MarketplacePage, PluginPicker } from "./marketplace";
export { pluginWidgetType, parsePluginWidgetType } from "./domain/plugin.rules";
