import { Resend } from "resend";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.INVITATION_EMAIL_FROM ?? "TheTavlo <invitaciones@thetavlo.app>";

export async function sendInvitationEmail(params: {
  to: string;
  panelName: string;
  inviterName: string;
  acceptUrl: string;
}): Promise<void> {
  const { to, panelName, inviterName, acceptUrl } = params;
  const resend = getClient();

  if (!resend) {
    // No bloqueamos el flujo en dev/local sin API key configurada —
    // solo dejamos rastro para poder probar el flujo manualmente.
    console.warn(`[resend] RESEND_API_KEY no configurada. Link para ${to}: ${acceptUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} te invitó a colaborar en "${panelName}" en TheTavlo`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <p><strong>${inviterName}</strong> te invitó a colaborar en el panel <strong>${panelName}</strong> de TheTavlo.</p>
        <p>
          <a href="${acceptUrl}" style="background:#0d8f5f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            Abrir invitación
          </a>
        </p>
        <p style="color:#6b7280;font-size:12px">Si no esperabas este correo, puedes ignorarlo.</p>
      </div>
    `,
  });

  if (error) {
    // No relanzamos como TRPCError acá: quien llama decide si el fallo de
    // email debe abortar la invitación o solo advertirse (hoy: advertir,
    // la invitación ya quedó creada en Firestore de todas formas).
    console.error("[resend] Error enviando invitación:", error);
  }
}
