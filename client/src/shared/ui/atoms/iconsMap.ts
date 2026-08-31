const iconsMapOutline = import.meta.glob<string>(
  "/node_modules/@tabler/icons/icons/outline/*.svg",
  { query: `?raw`, import: "default" }
);

const iconsMapFilled = import.meta.glob<string>(
  "/node_modules/@tabler/icons/icons/filled/*.svg",
  { query: `?raw`, import: "default" }
);

const iconsMap = { ...iconsMapOutline, ...iconsMapFilled };

export default iconsMap;
