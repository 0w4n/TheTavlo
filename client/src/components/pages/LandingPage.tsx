import "./LandingPage.css";
import "../base/colors.css";

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
        <span className="landing__wordmark">TheTavlo</span>
        <a className="landing__navLink" href="/app/login">
          Iniciar sesión
        </a>
      </header>

      <main>
        <section className="landing__hero">
          <div className="landing__heroText">
            <h1>Tu semestre, en un solo panel.</h1>
            <p>
              Tareas, horario, notas y exámenes en un mismo lugar — y lo
              compartís con quien estudiás, si querés.
            </p>
            <div className="landing__ctaRow">
              <a className="landing__button landing__button--primary" href="/app/login?onBoarding">
                Crear cuenta gratis
              </a>
              <a className="landing__button landing__button--ghost" href="/app/login">
                Iniciar sesión
              </a>
            </div>
          </div>

          <div className="landing__mock" aria-hidden="true">
            <PanelMock />
          </div>
        </section>

        <section className="landing__features">
          <FeatureRow
            title="Organizá todo por panel"
            description="Cada materia, proyecto o grupo de estudio tiene su propio espacio — con tareas, notas y calendario adentro, no repartidos en cinco apps distintas."
            align="left"
          />
          <FeatureRow
            title="Tu horario, con asistencia"
            description="Cargás tus clases una vez. Si cambia el aula o el horario a mitad de cuatrimestre, TheTavlo guarda el historial en vez de pisar los datos viejos — y te deja anotar las faltas."
            align="right"
          />
          <FeatureRow
            title="Compartilo con tu grupo"
            description="Invitás por correo o mandás un enlace. Vos decidís si la otra persona puede editar el panel o solo mirarlo."
            align="left"
          />
          <FeatureRow
            title="Widgets, no una lista más"
            description="Armás el panel con lo que de verdad querés ver: próximos exámenes, tareas pendientes, la semana que viene."
            align="right"
          />
        </section>

        <section className="landing__closing">
          <h2>Empezá gratis, no hace falta tarjeta.</h2>
          <a className="landing__button landing__button--primary" href="/app/login?onBoarding">
            Crear cuenta gratis
          </a>
        </section>
      </main>

      <footer className="landing__footer">
        <span>© {new Date().getFullYear()} TheTavlo</span>
        <a href="/app/login">Iniciar sesión</a>
      </footer>
    </div>
  );
}

/** Vista previa estática de un panel real — el "elemento con firma" de la página: mostrar el producto en vez de una ilustración genérica. */
function PanelMock() {
  return (
    <div className="panelMock">
      <div className="panelMock__header">
        <span className="panelMock__dot" />
        <span>Cálculo II</span>
      </div>
      <div className="panelMock__row panelMock__row--done">
        <span className="panelMock__check" />
        Guía de límites
      </div>
      <div className="panelMock__row">
        <span className="panelMock__check panelMock__check--empty" />
        Repasar derivadas
      </div>
      <div className="panelMock__divider" />
      <div className="panelMock__chip">Lun 10:00 · Física</div>
      <div className="panelMock__chip panelMock__chip--accent">
        Examen parcial · 14 oct
      </div>
    </div>
  );
}

function FeatureRow({
  title,
  description,
  align,
}: {
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div className={`featureRow featureRow--${align}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
