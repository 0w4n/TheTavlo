import "./LandingPage.css";
import "../base/colors.css";
/**
 * Se renderiza FUERA de <RouterProvider> (ver App.tsx) — vive en la raíz
 * real del dominio, antes de que el router (con basename "/app") tome el
 * control. Por eso los links de acá son <a href> normales, no <Link>/
 * useNavigate: cruzar a /app siempre implica una carga de página nueva,
 * no una transición de cliente.
 */
export default function LandingPage(): import("react").JSX.Element;
