import "./LandingPage.css";
import LandingShowcase from "./LandingShowcase";
import "../base/colors.css";
import logoSrc from "../../assets/TheTavlo_logo.svg";
import { Button } from "#components/atoms/button";
// Lista para activarse, ver el comentario junto a <LandingPricing/> más abajo.
// import LandingPricing from "./LandingPricing";

/**
 * Se renderiza FUERA de <RouterProvider> (ver App.tsx) — vive en la raíz
 * real del dominio, antes de que el router (con basename "/app") tome el
 * control. Por eso los links de acá son <a href> normales, no <Link>/
 * useNavigate: cruzar a /app siempre implica una carga de página nueva,
 * no una transición de cliente.
 */
export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing__header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
          <img
            src={logoSrc}
            alt="TheTavlo Logo"
            style={{ aspectRatio: "auto", height: "1.5rem" }}
          />
          <span className="landing__wordmark">TheTavlo</span>
        </div>
        <Button variant="primary" label="Iniciar sesión" href="/app/login" iconPosition="right" icon="IconArrowRight"/>
      </header>

      <main className="landing__main">
        <section className="landing__hero">
          <div className="landing__heroText">
            <h1>Tus proyectos, organizados en un solo panel.</h1>
            <p>
              Tareas, entregas, eventos y objetivos centralizados — colabora y
              comparte el progreso con tu equipo o clientes sin esfuerzo.
            </p>
            <div className="landing__ctaRow">
              <a
                className="landing__button landing__button--primary"
                href="/app/register"
              >
                Empezar gratis
              </a>
              <a
                className="landing__button landing__button--ghost"
                href="/app/login"
              >
                Iniciar sesión
              </a>
            </div>
          </div>

          <div className="landing__mock" aria-hidden="true">
            <PanelMock />
          </div>
        </section>

        <LandingShowcase />

        {/*
          Precio todavía no confirmado — la sección ya está armada
          (LandingPricing.tsx) y pasa TypeScript/ESLint, pero no se
          renderiza hasta descomentar la línea de abajo (y el import
          de arriba). 12€/mes o 92€/año, más un plan gratis.
        */}
        {/* <LandingPricing /> */}

        <section className="landing__closing">
          <h2>Empieza gratis, sin tarjeta de crédito.</h2>
          <a
            className="landing__button landing__button--primary"
            href="/app/register"
          >
            Crear cuenta gratis
          </a>
        </section>
      </main>
    </div>
  );
}

/** Vista previa estática de un panel real — muestra un flujo de trabajo generalista en lugar de académico. */
function PanelMock() {
  return (
    <div className="panelMock">
      <div className="panelMock__header">
        <span className="panelMock__dot" />
        <span>Rediseño Web</span>
      </div>
      <div className="panelMock__row panelMock__row--done">
        <span className="panelMock__check" />
        Aprobar wireframes
      </div>
      <div className="panelMock__row">
        <span className="panelMock__check panelMock__check--empty" />
        Revisar feedback del cliente
      </div>
      <div className="panelMock__divider" />
      <div className="panelMock__chip">Lun 10:00 · Reunión de equipo</div>
      <div className="panelMock__chip panelMock__chip--accent">
        Entrega final · 14 oct
      </div>
    </div>
  );
}