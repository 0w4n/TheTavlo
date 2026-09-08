import "./LandingPricing.css";

/**
 * Sección de precios — el diseño y el contenido ya están listos, pero
 * TODAVÍA NO SE MUESTRA en la página: no está invocada en
 * LandingPage.tsx (queda como `{/* <LandingPricing /> *}` comentado).
 *
 * Se dejó como componente real (no como bloque de JSX comentado a mano)
 * a propósito: así sigue pasando por TypeScript/ESLint y no se pudre en
 * silencio mientras no se usa. Para activarla: descomentar esa única
 * línea en LandingPage.tsx cuando el precio esté confirmado.
 */
export default function LandingPricing() {
  return (
    <section className="pricing">
      <div className="pricing__intro">
        <h2>Un precio simple.</h2>
        <p>Empezás gratis. Pasás al plan completo cuando lo necesites.</p>
      </div>

      <div className="pricing__plans">
        <article className="pricing__plan">
          <h3>Gratis</h3>
          <p className="pricing__price">
            <span className="pricing__amount">0€</span>
          </p>
          <ul className="pricing__features">
            <li>Paneles ilimitados</li>
            <li>Tareas, notas y calendario</li>
            <li>Un horario de clases</li>
          </ul>
          <a
            className="landing__button landing__button--ghost"
            href="/app/register"
          >
            Empezar gratis
          </a>
        </article>

        <article className="pricing__plan pricing__plan--featured">
          <span className="pricing__badge">Recomendado</span>
          <h3>Individual</h3>
          <p className="pricing__price">
            <span className="pricing__amount">12€</span>
            <span className="pricing__period">/mes</span>
          </p>
          <p className="pricing__alt">
            o 92€ al año (equivale a ~7,67€/mes)
          </p>
          <ul className="pricing__features">
            <li>Todo lo del plan gratis</li>
            <li>Paneles y horarios ilimitados</li>
            <li>Compartir e invitar sin límite</li>
            <li>Historial completo de cambios de horario</li>
          </ul>
          <a
            className="landing__button landing__button--primary"
            href="/app/register"
          >
            Empezar prueba
          </a>
        </article>
      </div>
    </section>
  );
}
