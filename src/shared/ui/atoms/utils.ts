export default function pascalToKebab(name: string) {
  return name
    .replace(/^Icon/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}