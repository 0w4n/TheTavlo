import React, { useState } from "react";
import { Header } from "#components/organisms/header";
import { Dashboard } from "#components/organisms/dashboard";
import { EmptyState } from "#components/organisms/emptystate";
import { Button } from "#components/atoms/button";
import { Card } from "#components/molecules/card";

// Icons para el Header
const WandIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.833 4.167l-11.666 11.666M11.667 2.5l.833 2.5 2.5.833-2.5.834-.833 2.5-.834-2.5-2.5-.834 2.5-.833.834-2.5zM5.833 11.667l.417 1.25 1.25.416-1.25.417-.417 1.25-.416-1.25-1.25-.417 1.25-.416.416-1.25z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 1.667a8.333 8.333 0 0 0-8.333 8.333c0 2.5 1.25 3.75 2.5 3.75.833 0 1.25-.417 1.25-1.25v-.833c0-.834.417-1.25 1.25-1.25h1.666a6.667 6.667 0 1 0 1.667-8.75zM6.667 8.333a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm2.916-3.333a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm3.334 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm2.083 4.583a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.166 2.5a2.121 2.121 0 0 1 3 3L6.75 15.916 2.5 17.084l1.166-4.25L14.166 2.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.667 17.5v-1.667a3.333 3.333 0 0 0-3.334-3.333H6.667a3.333 3.333 0 0 0-3.334 3.333V17.5M10 9.167A3.333 3.333 0 1 0 10 2.5a3.333 3.333 0 0 0 0 6.667z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Grid Icon para el Empty State
const GridIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="8"
      y="8"
      width="28"
      height="28"
      rx="4"
      stroke="currentColor"
      strokeWidth="3"
    />
    <rect
      x="44"
      y="8"
      width="28"
      height="28"
      rx="4"
      stroke="currentColor"
      strokeWidth="3"
    />
    <rect
      x="8"
      y="44"
      width="28"
      height="28"
      rx="4"
      stroke="currentColor"
      strokeWidth="3"
    />
    <rect
      x="44"
      y="44"
      width="28"
      height="28"
      rx="4"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);

// Plus Icon para el botón
const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 4.167v11.666M4.167 10h11.666"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * TheTavlo Dashboard - Página principal completa
 */
export const TheTavloDashboard: React.FC = () => {
  const [isRiseOpen, setIsRiseOpen] = useState(false);
  const [activeTab] = useState("overview");

  const handleAddWidget = () => {
    console.log("Añadir widget");
    alert("Funcionalidad de añadir widget - Por implementar");
  };

  const handleMagic = () => {
    console.log("Magic wand");
  };

  const handleTheme = () => {
    console.log("Change theme");
  };

  const handleEdit = () => {
    console.log("Edit mode");
  };

  const handleProfile = () => {
    console.log("User profile");
  };

  // const chartData = [
  //   { label: "Lun", value: 30 },
  //   { label: "Mar", value: 45 },
  //   { label: "Mié", value: 35 },
  //   { label: "Jue", value: 60 },
  //   { label: "Vie", value: 50 },
  //   { label: "Sáb", value: 40 },
  //   { label: "Dom", value: 25 },
  // ];

  const riseSections = [
    {
      title: "Tareas Pendientes",
      icon: "✓",
      color: "#6b7df6",
      type: "task",
      items: [
        {
          id: "1",
          title: "Revisar propuesta de diseño",
          description: "Análisis completo del nuevo sistema de componentes",
          time: "09:00",
          priority: "high",
          status: "pending",
          tags: ["Diseño", "Urgente"],
        },
        {
          id: "2",
          title: "Actualizar documentación",
          description: "Añadir ejemplos de los nuevos componentes",
          time: "14:00",
          priority: "medium",
          status: "in-progress",
        },
      ],
    },
    {
      title: "Reuniones",
      icon: "👥",
      color: "#0d8f5f",
      type: "meeting",
      items: [
        {
          id: "3",
          title: "Daily Standup",
          description: "",
          time: "10:00",
          duration: "15 min",
          location: "Sala Virtual",
          attendees: ["Team Lead", "Developers"],
          status: "pending",
        },
        {
          id: "4",
          title: "Sprint Review",
          description: "",
          time: "16:00",
          duration: "1 hora",
          location: "Sala Principal",
          attendees: ["Todo el equipo"],
          status: "pending",
        },
      ],
    },
    {
      title: "Entregas",
      icon: "📦",
      color: "#f59e0b",
      type: "deadline",
      items: [
        {
          id: "5",
          title: "Componente Rise completado",
          description: "Implementación final del panel de recap diario",
          time: "18:00",
          priority: "urgent",
          status: "pending",
        },
      ],
    },
  ];

  const quotes = [
    {
      text: "El diseño no es solo cómo se ve o cómo se siente. El diseño es cómo funciona.",
      author: "Steve Jobs",
      authorTitle: "Co-fundador de Apple",
    },
    {
      text: "La simplicidad es la máxima sofisticación.",
      author: "Leonardo da Vinci",
      authorTitle: "Artista e inventor",
    },
    {
      text: "Los buenos diseños son innovadores, hacen que un producto sea útil, son estéticos y honestos.",
      author: "Dieter Rams",
      authorTitle: "Diseñador industrial",
    },
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  return (
    <>
      {/* Header */}
      <Header
        logoText="TheTavlo"
        actions={[
          { icon: <WandIcon />, label: "Magic wand", onClick: handleMagic },
          {
            icon: <PaletteIcon />,
            label: "Change theme",
            onClick: handleTheme,
          },
          { icon: <EditIcon />, label: "Edit mode", onClick: handleEdit },
          { icon: <UserIcon />, label: "User profile", onClick: handleProfile },
        ]}
      />

      {/* Dashboard */}
      <Dashboard
        isEmpty
        emptyState={
          <EmptyState
            icon={<GridIcon />}
            title="Dashboard Vacío"
            description="Comienza agregando widgets para personalizar tu panel"
            action={
              <Button
                variant="primary"
                size="lg"
                icon={<PlusIcon />}
                onClick={handleAddWidget}
              >
                Añade tu primer widget
              </Button>
            }
          />
        }
      >
        <div className="dashboard__grid">
          {activeTab === "quote" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <Card variant="elevated">
                <div
                  style={{
                    position: "relative",
                    padding: "2rem",
                    borderLeft: "4px solid #6b7df6",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      fontSize: "3rem",
                      color: "#6b7df6",
                      opacity: 0.2,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    "
                  </span>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      lineHeight: "1.75",
                      fontStyle: "italic",
                      marginBottom: "1.5rem",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {quotes[currentQuoteIndex].text}
                  </p>
                  <div
                    style={{
                      width: "3rem",
                      height: "2px",
                      background: "#6b7df6",
                      marginBottom: "1rem",
                      borderRadius: "9999px",
                    }}
                  />
                  <div>
                    <cite
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {quotes[currentQuoteIndex].author}
                    </cite>
                    <span style={{ fontSize: "0.875rem", color: "#c5d1cb" }}>
                      {quotes[currentQuoteIndex].authorTitle}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center",
                    marginTop: "1.5rem",
                  }}
                >
                  {quotes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuoteIndex(i)}
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "9999px",
                        background:
                          i === currentQuoteIndex ? "#6b7df6" : "#3e564b",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Rise Panel */}
          {isRiseOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10, 18, 13, 0.95)",
                backdropFilter: "blur(8px)",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1vh",
                animation: "fadeIn 0.25s ease-out",
              }}
            >
              <div
                style={{
                  width: "98vw",
                  height: "98vh",
                  maxWidth: "1600px",
                  background: "#0a120d",
                  borderRadius: "1.5rem",
                  border: "1px solid #c5d1cb",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  animation: "scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Header */}
                <header
                  style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid rgba(160, 179, 168, 0.2)",
                    background: "linear-gradient(to bottom, #0a120d, #152419)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "2.5rem" }}>🌅</span>
                      <div>
                        <h1
                          style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          Rise
                        </h1>
                        <p
                          style={{
                            fontSize: "1.125rem",
                            color: "#c5d1cb",
                            margin: 0,
                          }}
                        >
                          {new Date().toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsRiseOpen(false)}
                      style={{
                        width: "3rem",
                        height: "3rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "none",
                        border: "1px solid #c5d1cb",
                        borderRadius: "9999px",
                        color: "#c5d1cb",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#2a3d34";
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.color = "#ef4444";
                        e.currentTarget.style.transform = "rotate(90deg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#c5d1cb";
                        e.currentTarget.style.color = "#c5d1cb";
                        e.currentTarget.style.transform = "rotate(0deg)";
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "2rem" }}>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        5
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#c5d1cb",
                          textTransform: "uppercase",
                        }}
                      >
                        Total
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        5
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#c5d1cb",
                          textTransform: "uppercase",
                        }}
                      >
                        Pendientes
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        0
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#c5d1cb",
                          textTransform: "uppercase",
                        }}
                      >
                        Completados
                      </div>
                    </div>
                  </div>
                </header>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.5rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "1.5rem",
                    alignContent: "start",
                  }}
                >
                  {riseSections.map((section, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#152419",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(160, 179, 168, 0.2)",
                        padding: "1.25rem",
                        animation: `slideUp 0.25s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                          paddingBottom: "0.75rem",
                          borderBottom: "1px solid rgba(160, 179, 168, 0.2)",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>
                          {section.icon}
                        </span>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            margin: 0,
                            flex: 1,
                          }}
                        >
                          {section.title}
                        </h3>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#6b7df6",
                            color: "#fff",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {section.items.length}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        {riseSections.map((section, i) => (
                          <div
                            key={section.title}
                            style={{
                              background: "#152419",
                              borderRadius: "0.75rem",
                              border: "1px solid rgba(160, 179, 168, 0.2)",
                              padding: "1.25rem",
                              animation: `slideUp 0.25s ease-out ${
                                i * 0.1
                              }s both`,
                            }}
                          >
                            {/* Header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "1rem",
                                paddingBottom: "0.75rem",
                                borderBottom:
                                  "1px solid rgba(160, 179, 168, 0.2)",
                              }}
                            >
                              <span style={{ fontSize: "1.5rem" }}>
                                {section.icon}
                              </span>

                              <h3
                                style={{
                                  fontSize: "1.125rem",
                                  fontWeight: 600,
                                  margin: 0,
                                  flex: 1,
                                }}
                              >
                                {section.title}
                              </h3>

                              <span
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  background: section.color,
                                  color: "#fff",
                                  borderRadius: "9999px",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                }}
                              >
                                {section.items.length}
                              </span>
                            </div>

                            {/* Items */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                              }}
                            >
                              {section.items.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    padding: "1rem",
                                    background: "#0a120d",
                                    border:
                                      "1px solid rgba(160, 179, 168, 0.2)",
                                    borderRadius: "0.625rem",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <div
                                    style={{ display: "flex", gap: "0.75rem" }}
                                  >
                                    {(section.type === "task" ||
                                      section.type === "deadline") && (
                                      <div
                                        style={{
                                          width: "1.25rem",
                                          height: "1.25rem",
                                          border: "2px solid #c5d1cb",
                                          borderRadius: "0.25rem",
                                          marginTop: "2px",
                                          flexShrink: 0,
                                        }}
                                      />
                                    )}

                                    <div style={{ flex: 1 }}>
                                      <h4
                                        style={{
                                          fontSize: "1rem",
                                          fontWeight: 600,
                                          margin: "0 0 0.25rem 0",
                                        }}
                                      >
                                        {item.title}
                                      </h4>

                                      {item.description &&
                                        item.description.trim() !== "" && (
                                          <p
                                            style={{
                                              fontSize: "0.875rem",
                                              color: "#c5d1cb",
                                              margin: "0 0 0.5rem 0",
                                              lineHeight: "1.5",
                                            }}
                                          >
                                            {item.description}
                                          </p>
                                        )}

                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "0.5rem",
                                          fontSize: "0.75rem",
                                          color: "#a0b3a8",
                                        }}
                                      >
                                        {item.time && (
                                          <span>🕐 {item.time}</span>
                                        )}
                                        {"duration" in item &&
                                          item.duration && (
                                            <span>• {item.duration}</span>
                                          )}

                                        {"location" in item &&
                                          item.location && (
                                            <span>📍 {item.location}</span>
                                          )}
                                      </div>
                                    </div>

                                    {"priority" in item && item.priority && (
                                      <span
                                        style={{
                                          padding: "0.25rem 0.5rem",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.75rem",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                          alignSelf: "flex-start",
                                          ...(item.priority === "urgent"
                                            ? {
                                                background: "#ef4444",
                                                color: "#fff",
                                              }
                                            : item.priority === "high"
                                            ? {
                                                background:
                                                  "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                              }
                                            : item.priority === "medium"
                                            ? {
                                                background:
                                                  "rgba(245, 158, 11, 0.1)",
                                                color: "#f59e0b",
                                              }
                                            : {
                                                background:
                                                  "rgba(107, 125, 246, 0.1)",
                                                color: "#6b7df6",
                                              }),
                                        }}
                                      >
                                        {item.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Dashboard>
    </>
  );
};
