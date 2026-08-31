export function pascalToKebab(name) {
    const isFilled = name.endsWith("Filled");
    name = name
        .replace(/^Icon?/, "")
        .replace(/Filled$/, "")
        .replace(/([a-z])([A-Z2-9])/g, "$1-$2")
        .replace(/([2-9])([A-Za-z])/g, "$1-$2")
        .toLowerCase();
    return { file: name, isFilled };
}
export function extractSvgContent(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");
    return svg?.innerHTML ?? "";
}
