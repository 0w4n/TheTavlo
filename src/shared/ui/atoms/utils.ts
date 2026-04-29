export function pascalToKebab(name: string) {
  return name
    .replace(/^Icon/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

export function extractSvgContent(svgString: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const svg = doc.querySelector("svg")
  return svg?.innerHTML ?? ""
}