import { useContext } from "react";
import { PluginRuntimeContext } from "../context/pluginRuntime.context";

export function usePluginRuntime() {
  const value = useContext(PluginRuntimeContext);
  if (!value) throw new Error("usePluginRuntime debe usarse dentro de <PluginRuntimeProvider>");
  return value;
}
