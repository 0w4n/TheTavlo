export function pascalToKebab(name: string): { file: string; isFilled: boolean } {
  const isFilled = name.endsWith("Filled");
  name = name.replace(/^Icon?/, "");
  name = name.replace(/Filled$/, "");
  name = name.replace(/([a-z0-9])([A-Z2-9])/g, "$1-$2").toLowerCase();
  return { file: name, isFilled };
}

export function extractSvgContent(svgString: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const svg = doc.querySelector("svg")
  return svg?.innerHTML ?? ""
}