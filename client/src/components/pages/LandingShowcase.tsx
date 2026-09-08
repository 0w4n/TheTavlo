import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./LandingShowcase.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ShowcasePanel {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
}

const PANELS: ShowcasePanel[] = [
  {
    id: "horarios",
    eyebrow: "Horarios",
    title: "Tu horario, sin choques.",
    description:
      "Cargás tus clases una vez. Si una cambia de aula a mitad de cuatrimestre, queda el historial en vez de perderse.",
    visual: <ScheduleVisual />,
  },
  {
    id: "agendas",
    eyebrow: "Agendas",
    title: "Tu día, ordenado.",
    description:
      "Eventos, recordatorios y exámenes en una sola línea de tiempo — no repartidos en tres apps distintas.",
    visual: <AgendaVisual />,
  },
  {
    id: "proyectos",
    eyebrow: "Proyectos",
    title: "Tus proyectos, por partes.",
    description:
      "Dividís un trabajo grande en tareas chicas y las movés a medida que avanzan.",
    visual: <ProjectVisual />,
  },
  {
    id: "compartir",
    eyebrow: "Compartir",
    title: "Compartilo con quien quieras.",
    description:
      "Invitás por correo o mandás un enlace. Vos elegís quién edita y quién solo mira.",
    visual: <ShareVisual />,
  },
  {
    id: "mas",
    eyebrow: "Y más",
    title: "Notas, widgets, y lo que se te ocurra.",
    description:
      "Armás cada panel con los bloques que necesitás — no con los que vienen puestos de fábrica.",
    visual: <MoreVisual />,
  },
];

/**
 * Carrusel horizontal de "flexibilidad" — funciona en TODOS lados sin
 * JavaScript (overflow-x + scroll-snap nativo de CSS, swipe normal en
 * mobile). En pantallas anchas y sin `prefers-reduced-motion`, GSAP
 * ScrollTrigger toma el control: fija la sección y traduce el scroll
 * vertical normal en el desplazamiento horizontal entre paneles, con
 * `snap` para que cada uno quede centrado — el "scroll-snapping"
 * pedido, hecho con GSAP en vez de solo CSS.
 *
 * `gsap.matchMedia()` se encarga de prender/apagar esto según el
 * viewport y de revertirlo solo si el usuario cambia de tamaño de
 * ventana cruzando el breakpoint — no hay pin activo en mobile ni con
 * "reducir movimiento" activado.
 */
export default function LandingShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      if (!section || !track) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          section.classList.add("showcase--pinned");

          const panelCount = PANELS.length;

          const updateEmphasis = (progress: number) => {
            panelRefs.current.forEach((el, i) => {
              if (!el) return;
              const target = panelCount > 1 ? i / (panelCount - 1) : 0;
              const distance = Math.abs(progress - target);
              gsap.set(el, {
                scale: gsap.utils.clamp(0.86, 1, 1 - distance * 1.4),
                opacity: gsap.utils.clamp(0.35, 1, 1 - distance * 2.2),
              });
            });
          };
          updateEmphasis(0);

          const getScrollAmount = () =>
            -(track.scrollWidth - window.innerWidth);

          gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              pin: true,
              scrub: 1,
              snap: 1 / (panelCount - 1),
              end: () => `+=${Math.abs(getScrollAmount())}`,
              invalidateOnRefresh: true,
              onUpdate: (self) => updateEmphasis(self.progress),
            },
          });

          return () => {
            section.classList.remove("showcase--pinned");
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section className="showcase" ref={sectionRef}>
      <div className="showcase__intro">
        <h2>Se adapta a como estudias.</h2>
        <p>Horarios, agendas, proyectos, y quien quieras sumar al panel.</p>
      </div>

      <div className="showcase__track" ref={trackRef}>
        {PANELS.map((panel, i) => (
          <article
            key={panel.id}
            className="showcase__panel"
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
          >
            <div className="showcase__visual">{panel.visual}</div>
            <span className="showcase__eyebrow">{panel.eyebrow}</span>
            <h3>{panel.title}</h3>
            <p>{panel.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Mini-visuales por panel (mismo espíritu que el mockup del panel en el hero: mostrar el producto, no íconos genéricos) ───

function ScheduleVisual() {
  // true = hay clase en ese bloque. Patrón fijo, no aleatorio (estable entre renders).
  const columns = [
    [true, false, true],
    [false, true, false],
    [true, false, false],
    [false, true, true],
    [true, false, false],
  ];
  const days = ["L", "M", "M", "J", "V"];

  return (
    <div className="scheduleVisual">
      {columns.map((blocks, i) => (
        <div className="scheduleVisual__col" key={days[i] + i}>
          {blocks.map((filled, j) => (
            <span
              key={j}
              className={
                filled
                  ? "scheduleVisual__block"
                  : "scheduleVisual__block scheduleVisual__block--empty"
              }
            />
          ))}
          <span className="scheduleVisual__day">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function AgendaVisual() {
  const items = [
    { time: "09:00", label: "Entrega TP2" },
    { time: "11:30", label: "Física — parcial" },
    { time: "16:00", label: "Reunión de grupo" },
  ];
  return (
    <div className="agendaVisual">
      {items.map((item) => (
        <div className="agendaVisual__row" key={item.time}>
          <span className="agendaVisual__time">{item.time}</span>
          <span className="agendaVisual__dot" />
          <span className="agendaVisual__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProjectVisual() {
  const columns = [
    { title: "Por hacer", cards: 2 },
    { title: "Haciendo", cards: 1 },
    { title: "Listo", cards: 2 },
  ];
  return (
    <div className="projectVisual">
      {columns.map((col) => (
        <div className="projectVisual__col" key={col.title}>
          <span className="projectVisual__title">{col.title}</span>
          {Array.from({ length: col.cards }).map((_, i) => (
            <span className="projectVisual__card" key={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ShareVisual() {
  return (
    <div className="shareVisual">
      <div className="shareVisual__avatars">
        <span className="shareVisual__avatar">M</span>
        <span className="shareVisual__avatar">J</span>
        <span className="shareVisual__avatar">+2</span>
      </div>
      <div className="shareVisual__roles">
        <span className="shareVisual__chip">Editor</span>
        <span className="shareVisual__chip shareVisual__chip--muted">
          Solo lectura
        </span>
      </div>
    </div>
  );
}

function MoreVisual() {
  const tiles = ["Notas", "Clima", "Ánimo", "Reloj"];
  return (
    <div className="moreVisual">
      {tiles.map((tile) => (
        <span className="moreVisual__tile" key={tile}>
          {tile}
        </span>
      ))}
    </div>
  );
}
