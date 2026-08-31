import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";

// ─── Paso 5: entrar ─────────────────────────────────────────────────────────

export default function StepAuth({
  onGoogle,
  onGuest,
  isLoading,
  errorMessage,
  success,
}: {
  onGoogle: () => void;
  onGuest: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  success: boolean;
}) {
  if (success) {
    return (
      <section
        aria-labelledby="onboarding-heading"
        className="onboarding__success"
      >
        <span className="onboarding__success-icon" aria-hidden="true">
          <Icon name="IconCheck" size={32} />
        </span>
        <h1 id="onboarding-heading" className="onboarding__title">
          Tu espacio está listo
        </h1>
        <p className="onboarding__subtitle">Te llevamos ahí en un segundo…</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="onboarding-heading">
      <p className="onboarding__eyebrow">Último paso</p>
      <h1 id="onboarding-heading" className="onboarding__title">
        Guardemos tu espacio
      </h1>
      <p className="onboarding__subtitle">
        Entrá como invitado y probá todo sin compromiso, o con Google si
        preferís tener tu cuenta desde ya.
      </p>

      {errorMessage && (
        <p role="alert" className="onboarding__error">
          {errorMessage}
        </p>
      )}

      <div className="onboarding__auth-actions">
        <Button
          variant="secondary"
          size="lg"
          icon="IconBrandGoogleFilled"
          label="Continuar con Google"
          onClick={onGoogle}
          disabled={isLoading}
          className="button__full-width"
        />
        <Button
          variant="secondary"
          size="lg"
          icon="IconSpy"
          label="Entrar como invitado"
          onClick={onGuest}
          disabled={isLoading}
          className="button__full-width"
        />
      </div>

      <p className="onboarding__reassurance">
        Sin tarjeta, sin compromiso. Si entrás como invitado, podés pasar tu
        cuenta a Google después sin perder nada.
      </p>
    </section>
  );
}
