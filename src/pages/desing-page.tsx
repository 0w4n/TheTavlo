import React, { useState } from "react";
import { FormField } from "#components/molecules/formfield";
import { Badge } from "#components/atoms/badge";
import { Modal } from "#components/molecules/modal";
import { Dropdown } from "#components/molecules/dropdown";
import { Tooltip } from "#components/molecules/tooltip";
import { Button } from "#components/atoms/button";
import { Card } from "#components/molecules/card";
import { Alert } from "#components/molecules/alert";
import { Header } from "#components/organisms/header";
import { Dashboard } from "#components/organisms/dashboard";
import { EmptyState } from "#components/organisms/emptystate";
import Icon from "#shared/ui/atoms/icons";

// Icons
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

const CopyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.667 7.5h-7.5a1.667 1.667 0 0 0-1.667 1.667v7.5a1.667 1.667 0 0 0 1.667 1.666h7.5a1.667 1.667 0 0 0 1.666-1.666v-7.5a1.667 1.667 0 0 0-1.666-1.667z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.167 12.5h-.834a1.666 1.666 0 0 1-1.666-1.667v-7.5a1.667 1.667 0 0 1 1.666-1.666h7.5a1.667 1.667 0 0 1 1.667 1.666v.834"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 5h15M6.667 5V3.333a1.667 1.667 0 0 1 1.666-1.666h3.334a1.667 1.667 0 0 1 1.666 1.666V5m2.5 0v11.667a1.667 1.667 0 0 1-1.666 1.666H5.833a1.667 1.667 0 0 1-1.666-1.666V5h11.666z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.5 12.5v3.333a1.667 1.667 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5M5.833 8.333L10 12.5l4.167-4.167M10 12.5V2.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18.333a8.333 8.333 0 1 0 0-16.666 8.333 8.333 0 0 0 0 16.666z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.575 7.5a2.5 2.5 0 0 1 4.85.833c0 1.667-2.5 2.5-2.5 2.5M10 14.167h.008"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 6.667A5 5 0 0 0 5 6.667c0 5.833-2.5 7.5-2.5 7.5h15s-2.5-1.667-2.5-7.5zM11.433 17.5a1.667 1.667 0 0 1-2.866 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.167 12.5a1.333 1.333 0 0 0 .266 1.467l.05.05a1.617 1.617 0 1 1-2.283 2.283l-.05-.05a1.333 1.333 0 0 0-2.25.95v.133a1.617 1.617 0 0 1-3.233 0V17.2a1.333 1.333 0 0 0-.875-1.217 1.333 1.333 0 0 0-1.459.267l-.05.05a1.617 1.617 0 1 1-2.283-2.283l.05-.05A1.333 1.333 0 0 0 2.8 11.7H2.667a1.617 1.617 0 0 1 0-3.233H2.8a1.333 1.333 0 0 0 1.217-.875 1.333 1.333 0 0 0-.267-1.459l-.05-.05a1.617 1.617 0 1 1 2.283-2.283l.05.05a1.333 1.333 0 0 0 1.459.267H7.5a1.333 1.333 0 0 0 .8-1.217V2.667a1.617 1.617 0 0 1 3.233 0V2.8a1.333 1.333 0 0 0 2.25.95l.05-.05a1.617 1.617 0 1 1 2.283 2.283l-.05.05a1.333 1.333 0 0 0-.266 1.459V7.5a1.333 1.333 0 0 0 1.217.8h.133a1.617 1.617 0 0 1 0 3.233H17.2a1.333 1.333 0 0 0-1.033.967z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.333 15.833A1.667 1.667 0 0 1 16.667 17.5H3.333a1.667 1.667 0 0 1-1.666-1.667V4.167A1.667 1.667 0 0 1 3.333 2.5h5l1.667 2.5h6.667a1.667 1.667 0 0 1 1.666 1.667v9.166z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.667 1.667H5A1.667 1.667 0 0 0 3.333 3.333v13.334A1.667 1.667 0 0 0 5 18.333h10a1.667 1.667 0 0 0 1.667-1.666V6.667l-5-5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.667 1.667v5h5M13.333 10.833H6.667M13.333 14.167H6.667M8.333 7.5H6.667"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// const InboxIcon = () => (
//   <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M16.667 10.833H13.333L11.667 13.333H8.333L6.667 10.833H3.333M16.667 10.833V15.833A1.667 1.667 0 0 1 15 17.5H5A1.667 1.667 0 0 1 3.333 15.833V10.833M16.667 10.833L15 2.5H5L3.333 10.833"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

export default function TestPage() {
  const [showContent, setShowContent] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación simple
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es requerido";
    if (!formData.email) newErrors.email = "El email es requerido";
    if (!formData.email.includes("@")) newErrors.email = "Email inválido";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Formulario enviado correctamente!");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
  const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);

  return (
    <div
      style={{
        padding: "3rem",
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "var(--color-bg-primary)",
      }}
      className="holita"
    >
      <h1
        style={{
          fontSize: "var(--font-size-3xl)",
          fontWeight: "var(--font-weight-bold)",
          marginBottom: "var(--spacing-8)",
          color: "var(--color-text-primary)",
        }}
      >
        Sistema de Diseño
      </h1>

      {/* ALERT SECTION */}
      <section style={{ marginBottom: "var(--spacing-16)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          Alert Component
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-4)",
          }}
        >
          {showAlert && (
            <Alert
              variant="info"
              title="Información"
              dismissible
              onDismiss={() => setShowAlert(false)}
            >
              Este es un mensaje informativo que puedes cerrar haciendo clic en
              la X.
            </Alert>
          )}

          <Alert variant="success" title="¡Éxito!">
            Tu operación se completó correctamente. Los cambios se han guardado.
          </Alert>

          <Alert variant="warning">
            Ten en cuenta que esta acción no se puede deshacer.
          </Alert>

          <Alert variant="error" title="Error crítico" dismissible>
            Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de
            nuevo más tarde o contacta con soporte.
          </Alert>

          <Alert variant="info">
            Mensaje simple sin título, solo con contenido informativo.
          </Alert>
        </div>
      </section>

      {/* CARD SECTION */}
      <section style={{ marginBottom: "var(--spacing-16)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          Card Component
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--spacing-6)",
          }}
        >
          {/* Card básica */}
          <Card variant="default">
            <Card.Header>
              <h3 className="card__title">Card Básica</h3>
              <p className="card__subtitle">Variante por defecto</p>
            </Card.Header>
            <Card.Body>
              Esta es una card con la variante por defecto, que incluye un borde
              sutil y una sombra base.
            </Card.Body>
            <Card.Footer>
              <Button variant="secondary" size="sm">
                Cancelar
              </Button>
              <Button variant="primary" size="sm">
                Aceptar
              </Button>
            </Card.Footer>
          </Card>

          {/* Card elevada */}
          <Card variant="elevated">
            <Card.Header>
              <h3 className="card__title">Card Elevada</h3>
              <Badge variant="primary">Destacado</Badge>
            </Card.Header>
            <Card.Body>
              Card con mayor elevación, perfecta para contenido importante que
              necesita destacar sobre el resto.
            </Card.Body>
          </Card>

          {/* Card outlined */}
          <Card variant="outlined">
            <Card.Header>
              <h3 className="card__title">Card Outlined</h3>
            </Card.Header>
            <Card.Body>
              Card con solo borde, sin sombra. Ideal para un diseño más
              minimalista.
            </Card.Body>
          </Card>

          {/* Card flat */}
          <Card variant="flat">
            <Card.Header>
              <h3 className="card__title">Card Flat</h3>
            </Card.Header>
            <Card.Body>
              Card sin decoración, con fondo alternativo. Perfecta para
              secciones informativas.
            </Card.Body>
          </Card>

          {/* Card interactiva */}
          <Card
            variant="default"
            interactive
            onClick={() => alert("Card clickeada!")}
          >
            <Card.Header>
              <h3 className="card__title">Card Interactiva</h3>
              <Badge variant="accent" size="sm">
                Clickeable
              </Badge>
            </Card.Header>
            <Card.Body>
              Esta card es clickeable. Pasa el cursor sobre ella para ver el
              efecto hover.
            </Card.Body>
          </Card>

          {/* Card con contenido complejo */}
          <Card variant="elevated">
            <Card.Header>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3 className="card__title">Proyecto Alpha</h3>
                  <p className="card__subtitle">Actualizado hace 2 horas</p>
                </div>
                <Badge variant="success" dot>
                  Activo
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <p style={{ marginBottom: "var(--spacing-3)" }}>
                Desarrollo de la nueva plataforma de gestión. El proyecto avanza
                según lo planificado.
              </p>
              <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                <Badge variant="info" size="sm">
                  React
                </Badge>
                <Badge variant="accent" size="sm">
                  TypeScript
                </Badge>
                <Badge variant="primary" size="sm">
                  CSS
                </Badge>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button variant="ghost" size="sm">
                Ver detalles
              </Button>
              <Button variant="primary" size="sm">
                Editar
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </section>

      {/* FORMFIELD SECTION */}
      <section>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          FormField Component
        </h2>

        <Card variant="elevated">
          <Card.Header>
            <h3 className="card__title">Formulario de Registro</h3>
            <p className="card__subtitle">
              Completa todos los campos requeridos
            </p>
          </Card.Header>
          <Card.Body>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-5)",
              }}
            >
              {/* Input básico */}
              <FormField
                label="Nombre completo"
                type="input"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e: any) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                errorMessage={errors.name}
                required
              />

              {/* Input con validación */}
              <FormField
                label="Email"
                type="input"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e: any) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                errorMessage={errors.email}
                helperText="Usaremos este email para enviarte notificaciones"
                required
              />

              {/* Select */}
              <FormField
                label="País"
                type="select"
                placeholder="Selecciona tu país"
                value={formData.country}
                onChange={(e: any) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                options={[
                  { value: "es", label: "España" },
                  { value: "mx", label: "México" },
                  { value: "ar", label: "Argentina" },
                  { value: "co", label: "Colombia" },
                  { value: "us", label: "Estados Unidos" },
                ]}
              />

              {/* Textarea */}
              <FormField
                label="Biografía"
                type="textarea"
                rows={4}
                placeholder="Cuéntanos algo sobre ti..."
                value={formData.bio}
                onChange={(e: any) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                helperText="Máximo 500 caracteres"
              />

              {/* Textarea auto-resize */}
              <FormField
                label="Comentarios adicionales"
                type="textarea"
                autoResize
                placeholder="El textarea se ajustará automáticamente al contenido..."
                helperText="Este campo crece automáticamente"
              />

              {/* Campo deshabilitado */}
              <FormField
                label="ID de usuario"
                type="input"
                value="USER-12345"
                disabled
                helperText="Este campo no puede ser editado"
              />
            </form>
          </Card.Body>
          <Card.Footer>
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" onClick={handleSubmit}>
              Enviar formulario
            </Button>
          </Card.Footer>
        </Card>
      </section>

      {/* MODAL SECTION */}
      <section style={{ marginBottom: "var(--spacing-16)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          Modal Component
        </h2>

        <div
          style={{ display: "flex", gap: "var(--spacing-4)", flexWrap: "wrap" }}
        >
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Abrir Modal Estándar
          </Button>
          <Button variant="secondary" onClick={() => setIsSmallModalOpen(true)}>
            Modal Pequeño
          </Button>
          <Button variant="ghost" onClick={() => setIsLargeModalOpen(true)}>
            Modal Grande
          </Button>
        </div>

        {/* Modal Estándar */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="md"
        >
          <Modal.Header>
            <h2 className="modal__title">Confirmar acción</h2>
            <p className="modal__subtitle">Esta acción no se puede deshacer</p>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que quieres continuar? Esta operación eliminará
              permanentemente los datos seleccionados y no podrás recuperarlos
              más tarde.
            </p>
            <Alert variant="warning" style={{ marginTop: "var(--spacing-4)" }}>
              Asegúrate de haber guardado una copia de respaldo antes de
              continuar.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>
              Confirmar eliminación
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Pequeño */}
        <Modal
          isOpen={isSmallModalOpen}
          onClose={() => setIsSmallModalOpen(false)}
          size="sm"
        >
          <Modal.Header>
            <h2 className="modal__title">Confirmación rápida</h2>
          </Modal.Header>
          <Modal.Body>
            <p>¿Confirmas esta acción?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSmallModalOpen(false)}
            >
              No
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSmallModalOpen(false)}
            >
              Sí
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Grande */}
        <Modal
          isOpen={isLargeModalOpen}
          onClose={() => setIsLargeModalOpen(false)}
          size="lg"
        >
          <Modal.Header>
            <h2 className="modal__title">Detalles del proyecto</h2>
            <p className="modal__subtitle">
              Información completa del proyecto Alpha
            </p>
          </Modal.Header>
          <Modal.Body>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-4)",
              }}
            >
              <Card variant="flat">
                <Card.Header>
                  <h3 className="card__title">Descripción</h3>
                </Card.Header>
                <Card.Body>
                  Este es un proyecto de desarrollo de una nueva plataforma de
                  gestión empresarial con características avanzadas de
                  automatización y análisis de datos.
                </Card.Body>
              </Card>

              <Card variant="flat">
                <Card.Header>
                  <h3 className="card__title">Equipo</h3>
                </Card.Header>
                <Card.Body>
                  <ul style={{ paddingLeft: "var(--spacing-4)" }}>
                    <li>Juan Pérez - Project Manager</li>
                    <li>María García - Lead Developer</li>
                    <li>Carlos López - UX Designer</li>
                    <li>Ana Martínez - QA Engineer</li>
                  </ul>
                </Card.Body>
              </Card>

              <Card variant="flat">
                <Card.Header>
                  <h3 className="card__title">Cronograma</h3>
                </Card.Header>
                <Card.Body>
                  Fase 1: Completada ✓<br />
                  Fase 2: En progreso (75%)
                  <br />
                  Fase 3: Pendiente
                </Card.Body>
              </Card>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setIsLargeModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsLargeModalOpen(false)}
            >
              Guardar cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </section>

      {/* DROPDOWN SECTION */}
      <section style={{ marginBottom: "var(--spacing-16)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          Dropdown Component
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--spacing-6)",
          }}
        >
          {/* Dropdown básico */}
          <Card variant="outlined">
            <Card.Body>
              <h3
                style={{
                  marginBottom: "var(--spacing-3)",
                  color: "var(--color-text-primary)",
                }}
              >
                Dropdown Básico
              </h3>
              <Dropdown trigger={<Button variant="secondary">Opciones</Button>}>
                <Dropdown.Item icon={<EditIcon />}>Editar</Dropdown.Item>
                <Dropdown.Item icon={<CopyIcon />}>Duplicar</Dropdown.Item>
                <Dropdown.Item icon={<DownloadIcon />}>Descargar</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item icon={<TrashIcon />} danger>
                  Eliminar
                </Dropdown.Item>
              </Dropdown>
            </Card.Body>
          </Card>

          {/* Dropdown con secciones */}
          <Card variant="outlined">
            <Card.Body>
              <h3
                style={{
                  marginBottom: "var(--spacing-3)",
                  color: "var(--color-text-primary)",
                }}
              >
                Con Secciones
              </h3>
              <Dropdown
                trigger={<Button variant="primary">Acciones</Button>}
                position="bottom-start"
              >
                <Dropdown.Item icon={<EditIcon />}>
                  Editar documento
                </Dropdown.Item>
                <Dropdown.Item icon={<CopyIcon />}>Crear copia</Dropdown.Item>
                <Dropdown.Divider label="Compartir" />
                <Dropdown.Item icon={<DownloadIcon />}>
                  Exportar PDF
                </Dropdown.Item>
                <Dropdown.Item icon={<DownloadIcon />}>
                  Exportar Word
                </Dropdown.Item>
                <Dropdown.Divider label="Peligro" />
                <Dropdown.Item icon={<TrashIcon />} danger>
                  Eliminar permanentemente
                </Dropdown.Item>
              </Dropdown>
            </Card.Body>
          </Card>

          {/* Dropdown con items deshabilitados */}
          <Card variant="outlined">
            <Card.Body>
              <h3
                style={{
                  marginBottom: "var(--spacing-3)",
                  color: "var(--color-text-primary)",
                }}
              >
                Con Items Deshabilitados
              </h3>
              <Dropdown
                trigger={<Button variant="ghost">Más opciones</Button>}
                position="bottom-end"
              >
                <Dropdown.Item icon={<EditIcon />}>Editar</Dropdown.Item>
                <Dropdown.Item icon={<CopyIcon />} disabled>
                  Duplicar (no disponible)
                </Dropdown.Item>
                <Dropdown.Item icon={<DownloadIcon />}>Descargar</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item icon={<TrashIcon />} danger disabled>
                  Eliminar (bloqueado)
                </Dropdown.Item>
              </Dropdown>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* TOOLTIP SECTION */}
      <section>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          Tooltip Component
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--spacing-6)",
          }}
        >
          {/* Posiciones */}
          <Card variant="flat">
            <Card.Header>
              <h3 className="card__title">Posiciones</h3>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "var(--spacing-8)",
                  padding: "var(--spacing-6)",
                }}
              >
                <Tooltip content="Tooltip arriba" position="top">
                  <Button variant="secondary" size="sm">
                    Top
                  </Button>
                </Tooltip>

                <div style={{ display: "flex", gap: "var(--spacing-8)" }}>
                  <Tooltip content="Tooltip a la izquierda" position="left">
                    <Button variant="secondary" size="sm">
                      Left
                    </Button>
                  </Tooltip>

                  <Tooltip content="Tooltip a la derecha" position="right">
                    <Button variant="secondary" size="sm">
                      Right
                    </Button>
                  </Tooltip>
                </div>

                <Tooltip content="Tooltip abajo" position="bottom">
                  <Button variant="secondary" size="sm">
                    Bottom
                  </Button>
                </Tooltip>
              </div>
            </Card.Body>
          </Card>

          {/* Tooltips informativos */}
          <Card variant="flat">
            <Card.Header>
              <h3 className="card__title">Tooltips Informativos</h3>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                  }}
                >
                  <span style={{ color: "var(--color-text-primary)" }}>
                    Usuario activo
                  </span>
                  <Tooltip
                    content="Este campo indica si el usuario tiene acceso activo al sistema"
                    position="right"
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        color: "var(--color-text-tertiary)",
                        cursor: "help",
                      }}
                    >
                      <HelpIcon />
                    </span>
                  </Tooltip>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                  }}
                >
                  <span style={{ color: "var(--color-text-primary)" }}>
                    Última conexión
                  </span>
                  <Tooltip
                    content="Fecha y hora de la última vez que el usuario inició sesión"
                    position="right"
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        color: "var(--color-text-tertiary)",
                        cursor: "help",
                      }}
                    >
                      <HelpIcon />
                    </span>
                  </Tooltip>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                  }}
                >
                  <span style={{ color: "var(--color-text-primary)" }}>
                    Nivel de permisos
                  </span>
                  <Tooltip
                    content="Determina qué acciones puede realizar el usuario en el sistema. Los niveles van de 1 (básico) a 5 (administrador)"
                    position="right"
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        color: "var(--color-text-tertiary)",
                        cursor: "help",
                      }}
                    >
                      <HelpIcon />
                    </span>
                  </Tooltip>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Tooltips con delays */}
          <Card variant="flat">
            <Card.Header>
              <h3 className="card__title">Diferentes Delays</h3>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-3)",
                }}
              >
                <Tooltip
                  content="Aparece inmediatamente"
                  position="top"
                  delay={0}
                >
                  <Button variant="ghost" size="sm">
                    Sin delay (0ms)
                  </Button>
                </Tooltip>

                <Tooltip
                  content="Aparece rápidamente"
                  position="top"
                  delay={200}
                >
                  <Button variant="ghost" size="sm">
                    Delay corto (200ms)
                  </Button>
                </Tooltip>

                <Tooltip content="Delay estándar" position="top" delay={500}>
                  <Button variant="ghost" size="sm">
                    Delay medio (500ms)
                  </Button>
                </Tooltip>

                <Tooltip
                  content="Aparece después de un segundo"
                  position="top"
                  delay={1000}
                >
                  <Button variant="ghost" size="sm">
                    Delay largo (1000ms)
                  </Button>
                </Tooltip>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>

      <section>
        <h2
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-6)",
            color: "var(--color-text-primary)",
          }}
        >
          TaskCard Component
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "repeat(auto, 1fr)",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "10px",
          }}
        >
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
          <div
            className="card-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--color-bg-tertiary)",
              border: "3px solid var(--color-bg-tertiary)",
              padding: "6px 10px",
              borderRadius: "14px",
              transition: "transform .15s ease, box-shadow .15s ease",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icon-tabler-refresh"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
            </svg>

            <div
              className="panel-content"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "spaceBetween",
                flex: "1",
                gap: "8px",
                background: "var(--color-bg-surface)",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <span>IOCYP</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right-dashed"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12h.5m3 0h1.5m3 0h6" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </div>
          </div>
        </div>
        {/* Toggle para demostración */}
        <div
          style={{
            padding: "var(--spacing-6)",
            display: "flex",
            gap: "var(--spacing-3)",
            borderBottom: "1px solid var(--color-divider)",
          }}
        >
          <Button
            variant={!showContent ? "primary" : "secondary"}
            onClick={() => setShowContent(false)}
          >
            Ver Dashboard Vacío
          </Button>
          <Button
            variant={showContent ? "primary" : "secondary"}
            onClick={() => setShowContent(true)}
          >
            Ver Dashboard con Contenido
          </Button>
        </div>

        {/* HEADER */}
        <Header
          logoText="TheTavlo"
          actions={[
            {
              icon: <SearchIcon />,
              label: "Search",
              onClick: () => console.log("Search"),
            },
            {
              icon: <BellIcon />,
              label: "Notifications",
              onClick: () => console.log("Notifications"),
            },
            {
              icon: <SettingsIcon />,
              label: "Settings",
              onClick: () => console.log("Settings"),
            },
          ]}
        />

        {/* DASHBOARD */}
        {!showContent ? (
          // Empty State
          <Dashboard
            isEmpty
            emptyState={
              <EmptyState
                icon={<FolderIcon />}
                title="Dashboard Vacío"
                description="Comienza agregando widgets para personalizar tu panel de control"
                action={
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowContent(true)}
                  >
                    Añade tu primer widget
                  </Button>
                }
                secondaryAction={
                  <Button variant="secondary" size="lg">
                    Ver ejemplos
                  </Button>
                }
              />
            }
          />
        ) : (
          // Dashboard con contenido
          <Dashboard>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-6)",
                marginTop: "var(--spacing-6)",
              }}
            >
              {/* Widget 1 */}
              <Card variant="elevated">
                <Card.Header>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 className="card__title">Proyectos</h3>
                    <Badge variant="primary">12</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-3)",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "rgba(13, 143, 95, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-primary-500)",
                      }}
                    >
                      <FolderIcon />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "var(--font-size-2xl)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--color-text-primary)",
                          margin: 0,
                        }}
                      >
                        12
                      </p>
                      <p
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-secondary)",
                          margin: 0,
                        }}
                      >
                        Activos
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Widget 2 */}
              <Card variant="elevated">
                <Card.Header>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 className="card__title">Documentos</h3>
                    <Badge variant="accent">48</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-3)",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "rgba(107, 125, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-accent-500)",
                      }}
                    >
                      <FileIcon />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "var(--font-size-2xl)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--color-text-primary)",
                          margin: 0,
                        }}
                      >
                        48
                      </p>
                      <p
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-secondary)",
                          margin: 0,
                        }}
                      >
                        Recientes
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Widget 3 */}
              <Card variant="elevated">
                <Card.Header>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 className="card__title">Tareas</h3>
                    <Badge variant="warning">5</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-3)",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-warning)",
                      }}
                    >
                      <Icon name="IconFolder" />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "var(--font-size-2xl)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--color-text-primary)",
                          margin: 0,
                        }}
                      >
                        5
                      </p>
                      <p
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--color-text-secondary)",
                          margin: 0,
                        }}
                      >
                        Pendientes
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Lista de acciones */}
              <Card variant="outlined" style={{ gridColumn: "span 2" }}>
                <Card.Header>
                  <h3 className="card__title">Actividad Reciente</h3>
                </Card.Header>
                <Card.Body>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-3)",
                    }}
                  >
                    {[
                      {
                        text: 'Documento "Propuesta Q4" actualizado',
                        time: "Hace 5 minutos",
                        badge: "success",
                      },
                      {
                        text: 'Nueva tarea asignada: "Revisión de diseño"',
                        time: "Hace 1 hora",
                        badge: "info",
                      },
                      {
                        text: 'Proyecto "Alpha" completado',
                        time: "Hace 2 horas",
                        badge: "success",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "var(--spacing-2)",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--color-bg-tertiary)",
                        }}
                      >
                        <span style={{ color: "var(--color-text-primary)" }}>
                          {item.text}
                        </span>
                        <span
                          style={{
                            color: "var(--color-text-tertiary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Dashboard>
        )}
      </section>
    </div>
  );
}
