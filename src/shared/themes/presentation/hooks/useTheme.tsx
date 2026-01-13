import { useContext } from "react";

import { ThemeContext } from "../context/themeContext";

export default function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  } else {
    console.log("[VERBOSE] useTheme")
  }
  return context;
}
