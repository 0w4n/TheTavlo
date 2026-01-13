import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  } else {
    console.log("[VERBOSE] useAuth")
  }
  return context;
}
