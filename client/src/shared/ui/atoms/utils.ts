export function pascalToKebab(name: string): {
  file: string;
  isFilled: boolean;
} {
  const isFilled = name.endsWith("Filled");
  name = name
    .replace(/^Icon?/, "")
    .replace(/Filled$/, "")
    .replace(/([a-z])([A-Z2-9])/g, "$1-$2")
    .replace(/([2-9])([A-Za-z])/g, "$1-$2")
    .toLowerCase();
  return { file: name, isFilled };
}