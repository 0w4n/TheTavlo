import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { withReturnTo } from "#core/routing/returnTo";
import { Button } from "#components/atoms/button";
import LoadingPage from "#components/pages/LoadingPage";
import {
  InvitationApiClient,
  parsePanelDocPath,
  type InvitationAccessResponse,
} from "../../infraestructure/invitationApiClient";

import "./invitationGate.css";

/**
 * `/invitation/:invitationId?token=...` — la única pantalla de toda la app
 * que debe funcionar SIN sesión (ver Q5 de la conversación de
 * invitaciones): un link privado se resuelve igual, y recién si hace falta
 * aceptar/rechazar mandamos a `/login` con `returnTo` de vuelta acá mismo.
 */
export default function InvitationGate() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { state: authState } = useAuth();

  const [access, setAccess] = useState<InvitationAccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUrl = `/invitation/${invitationId}?token=${token}`;

  useEffect(() => {
    if (!invitationId || !token) {
      setLoading(false);
      return;
    }
    // Esperamos a que Firebase Auth resuelva su estado inicial: si
    // llamamos a resolveAccess antes, perdemos la sesión (aunque exista)
    // y una invitación privada se ve como "not-invited" por error.
    if (authState.status === "initializing") return;

    let cancelled = false;
    setLoading(true);
    InvitationApiClient.resolveAccess({ invitationId, token })
      .then((result) => {
        if (!cancelled) setAccess(result);
      })
      .catch(() => {
        if (!cancelled) setAccess({ kind: "not-found" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, token, authState.status]);

  const goToPanel = (path: { path: string } | null) => {
    const parsed = parsePanelDocPath(path?.path);
    if (!parsed) return;
    navigate(
      `/shared/${parsed.ownerAccountType}/${parsed.ownerId}/${parsed.panelId}`,
      { replace: true },
    );
  };

  const handleRespond = async (response: "accept" | "reject") => {
    if (!invitationId) return;
    setResponding(true);
    setActionError(null);
    try {
      await InvitationApiClient.respond({ invitationId, token, response });
      if (response === "accept" && access && "invitation" in access) {
        goToPanel(access.invitation.targetRef);
        return;
      }
      const refreshed = await InvitationApiClient.resolveAccess({ invitationId, token });
      setAccess(refreshed);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No se pudo procesar tu respuesta.",
      );
    } finally {
      setResponding(false);
    }
  };

  if (!invitationId || !token) {
    return (
      <InvitationMessage
        title="Enlace inválido"
        description="Falta información en el enlace de invitación."
      />
    );
  }

  if (loading || authState.status === "initializing") {
    return <LoadingPage />;
  }

  if (!access) {
    return (
      <InvitationMessage
        title="Algo salió mal"
        description="No pudimos comprobar esta invitación. Intenta de nuevo."
      />
    );
  }

  switch (access.kind) {
    case "not-found":
      return (
        <InvitationMessage
          title="Invitación no encontrada"
          description="Este enlace no existe o ya no es válido."
        />
      );

    case "expired":
      return (
        <InvitationMessage
          title="Invitación vencida"
          description="Pídele a quien te invitó que te comparta un enlace nuevo."
        />
      );

    case "revoked":
      return (
        <InvitationMessage
          title="Invitación revocada"
          description="Quien te invitó canceló el acceso."
        />
      );

    case "public":
      return (
        <InvitationMessage
          title="Te invitaron a un panel"
          description="Cualquiera con este enlace puede verlo."
        >
          <Button
            variant="primary"
            label="Entrar al panel"
            onClick={() => goToPanel(access.invitation.targetRef)}
          />
        </InvitationMessage>
      );

    case "private-accepted":
      return (
        <InvitationMessage title="Ya tienes acceso a este panel">
          <Button
            variant="primary"
            label="Entrar al panel"
            onClick={() => goToPanel(access.invitation.targetRef)}
          />
        </InvitationMessage>
      );

    case "private-rejected":
      return (
        <InvitationMessage
          title="Ya rechazaste esta invitación"
          description="Si cambiaste de opinión, pídele a quien te invitó que la vuelva a mandar."
        />
      );

    case "not-invited": {
      if (authState.status !== "authenticated") {
        return (
          <InvitationMessage
            title="Inicia sesión para continuar"
            description="Esta invitación es privada — necesitamos saber quién eres antes de mostrártela."
          >
            <Button
              variant="primary"
              label="Iniciar sesión"
              onClick={() => navigate(withReturnTo("/login", currentUrl))}
            />
          </InvitationMessage>
        );
      }
      return (
        <InvitationMessage
          title="Esta invitación no es para tu cuenta"
          description="Pídele a quien te invitó que revise el correo con el que te agregó."
        />
      );
    }

    case "private-pending": {
      if (authState.status !== "authenticated") {
        return (
          <InvitationMessage
            title="Inicia sesión para continuar"
            description="Necesitas iniciar sesión para aceptar o rechazar esta invitación."
          >
            <Button
              variant="primary"
              label="Iniciar sesión"
              onClick={() => navigate(withReturnTo("/login", currentUrl))}
            />
          </InvitationMessage>
        );
      }

      // Q4: una cuenta anónima ("guests") no puede aceptar — debe completar
      // el registro primero (mismo flujo que MigrationDialog ya cubre).
      if (authState.user.accountType === "guests") {
        return (
          <InvitationMessage
            title="Completa tu cuenta primero"
            description="Estás en modo invitado. Antes de aceptar esta invitación, termina de crear tu cuenta."
          >
            <Button variant="secondary" label="Volver" onClick={() => navigate("/home")} />
          </InvitationMessage>
        );
      }

      return (
        <InvitationMessage title="Te invitaron a colaborar" description="¿Aceptas la invitación?">
          {actionError && <p className="invitation-gate__error">{actionError}</p>}
          <div className="invitation-gate__actions">
            <Button
              variant="ghost"
              label="Rechazar"
              disabled={responding}
              onClick={() => handleRespond("reject")}
            />
            <Button
              variant="primary"
              label="Aceptar"
              disabled={responding}
              onClick={() => handleRespond("accept")}
            />
          </div>
        </InvitationMessage>
      );
    }

    default:
      return null;
  }
}

function InvitationMessage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="invitation-gate">
      <div className="invitation-gate__card">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </div>
  );
}
