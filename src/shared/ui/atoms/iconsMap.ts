const iconsMap = import.meta.glob<string>(
  "/node_modules/@tabler/icons/icons/outline/*.svg",
  { query: `?raw`, import: "default" }
);

export default iconsMap;
