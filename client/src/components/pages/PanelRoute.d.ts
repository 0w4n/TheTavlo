/**
 * Único componente para toda la cadena `home/:pid[/:pid...]`. Antes había
 * una PanelsPage por cada combinación de rutas; ahora hay un solo switch
 * sobre `data.kind`, que viene ya resuelto por el loader.
 */
export default function PanelRoute(): import("react").JSX.Element;
