import MigrationDialog from "#components/MigrationDialog";
import AuthService from "#core/auth/app/auth.service";
import { FirebaseAuthRepository } from "#core/auth/infraestructure/authRepository.firebase";
import { FirebaseMigrationRepository } from "#core/auth/infraestructure/migrationRepository.firebase";
import { AuthProvider } from "#core/auth/presentation/context/authContext";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import LoadingPage from "#components/pages/LoadingPage";
import { useEffect, useMemo } from "react";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { PanelsProvider } from "#features/panels/presentation/context/panelsContext";
import { WidgetsProvider } from "#features/widgets/presentation/context/widgetsContext";
import { FirebasePanelsRepository } from "#features/panels/infraestructure/panelRepository.firebase";
import { CachedPanelsRepository } from "#features/panels/infraestructure/panelRepository.cached";
import {
  clearPanelsCache,
  getPanelsCacheKey,
} from "#features/panels/infraestructure/panelsCache";
import { FirebaseWidgetRepository } from "#features/widgets/infraestructure/widgetRepository.firebase";
import { PanelsService } from "#features/panels/app/panels.service";
import { WidgetService } from "#features/widgets/app/widget.service";
import { RouterProvider, Navigate, Outlet } from "react-router-dom";
import { appRouter } from "#core/routing/appRouter";
import LandingPage from "#components/pages/LandingPage";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { GlobalContextProvider } from "#core/globalContext/context/globalContext";
import { InvitationService } from "#features/invitations/app/invitation.service";
import { FirebaseInvitationRepository } from "#features/invitations/infraestructure/invitationRepository.firebase";
import { InvitationProvider } from "#features/invitations/presentation/context/invitationContext";
import { FirebaseTaskRepository } from "#features/task/infraestructure/taskRepository.firebase";
import { TasksService } from "#features/task/app/task.service";
import { TasksProvider } from "#features/task/presentation/context/TasksContext";
import { EventsProvider } from "#features/events/presentation/context/eventContext";
import { FirebaseEventRepository } from "#features/events/infraestructure/eventRepository.firebase";
import { EventsService } from "#features/events/app/events.service";
import type { User } from "#core/auth/domain/user.entity";
import { AnnouncerProvider } from "#core/a11y/AnnouncerProvider";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
// import ComposeProviders from "#core/providers/composeProviders";

// thetavlo.com/ es la landing pública; toda la app vive bajo /app/*
// (ver appRouter.tsx: basename: "/app"). Estos son los prefijos que la app
// usaba ANTES de este cambio — alguien con uno de esos links guardado
// (o un correo de invitación viejo) debe seguir llegando a destino, no a
// la landing por error.
const LEGACY_APP_PREFIXES = ["/login", "/home", "/invitation", "/shared"];

function isAppRoute(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isLegacyAppPath(pathname: string): boolean {
  return LEGACY_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function App() {
  const { pathname, search } = window.location;
  const appRoute = isAppRoute(pathname);

  useEffect(() => {
    if (!appRoute && isLegacyAppPath(pathname)) {
      window.location.replace(`/app${pathname}${search}`);
    }
    // Se ejecuta una sola vez por carga de página — no hay routing de
    // cliente antes de este punto, así que pathname/search no cambian
    // durante la vida de este componente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!appRoute) {
    // Mientras se dispara el redirect de arriba, no mostramos la landing
    // ni por un instante (evita el parpadeo landing -> app).
    if (isLegacyAppPath(pathname)) return <LoadingPage />;
    return <LandingPage />;
  }

  return (
    <>
      <AuthenticatedApp />
      <SpeedInsights />
      <Analytics />
    </>
  );
}

function AuthenticatedApp() {
  const authRepository = useMemo(() => {
    return new FirebaseAuthRepository(firebaseService.auth);
  }, [firebaseService.auth]);
  const migrationRepository = useMemo(() => {
    return new FirebaseMigrationRepository(firebaseService.firestore);
  }, [firebaseService.firestore]);
  const authService = useMemo(() => {
    return new AuthService(authRepository, migrationRepository);
  }, [authRepository, migrationRepository]);

  return (
    <AnnouncerProvider>
      <AuthProvider authService={authService}>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </AnnouncerProvider>
  );
}

export function ProtectedLayout() {
  const { state } = useAuth();

  switch (state.status) {
    case "initializing":
      return <LoadingPage />;

    case "unauthenticated":
      return <Navigate to="/login" replace />;

    case "migration-pending":
      return <MigrationDialog />;

    case "error":
      return <div>{state.error}</div>;

    case "authenticated":
      return <AuthenticatedLayout user={state.user} />;
  }
}

function AuthenticatedLayout({ user }: { user: User }) {
  // Deps intencionalmente angostas: cacheKey solo debe cambiar si cambian
  // accountType/id, no en cada nueva referencia de `user`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cacheKey = useMemo(
    () => getPanelsCacheKey(user),
    [user.accountType, user.id],
  );

  const panelsService = useMemo(() => {
    const repository = new FirebasePanelsRepository(
      firebaseService.firestore,
      () => user,
    );
    // Caché progresiva en memoria: navegar por paneles ya visitados en esta
    // sesión no vuelve a leer Firestore. Ver panelsCache.ts.
    const cachedRepository = new CachedPanelsRepository(repository, cacheKey);

    return new PanelsService(cachedRepository);
  }, [user, cacheKey]);

  // Al cerrar sesión (o cambiar de usuario) este layout se desmonta —
  // limpiamos la caché de ESE usuario para no arrastrar datos viejos si
  // alguien vuelve a loguearse con otra cuenta en la misma pestaña.
  useEffect(() => {
    return () => clearPanelsCache(cacheKey);
  }, [cacheKey]);

  return (
    <PanelsProvider panelsService={panelsService}>
      <GlobalContextProvider>
        <ProviderApp />
      </GlobalContextProvider>
    </PanelsProvider>
  );
}

function ProviderApp() {
  const globalContext = useGlobalContext();
  console.log("GlobalContext:", globalContext);

  const widgetService = useMemo(() => {
    const widgetRepository = new FirebaseWidgetRepository(
      firebaseService.firestore,
      () => globalContext,
    );
    return new WidgetService(widgetRepository);
  }, [globalContext]);

  const invitationService = useMemo(() => {
    const invitationRepository = new FirebaseInvitationRepository(
      firebaseService.firestore,
      () => globalContext,
    );
    return new InvitationService(invitationRepository);
  }, [globalContext]);

  const eventService = useMemo(() => {
    const eventRepository = new FirebaseEventRepository(
      firebaseService.firestore,
      () => globalContext,
    );
    return new EventsService(eventRepository);
  }, [globalContext]);

  const taskService = useMemo(() => {
    const taskRepository = new FirebaseTaskRepository(
      firebaseService.firestore,
      () => globalContext,
    );
    return new TasksService(taskRepository);
  }, [globalContext]);

  return (
    <>
      {/*<ExamsProvider> */}
      <WidgetsProvider widgetService={widgetService}>
        <EventsProvider eventsService={eventService}>
          <InvitationProvider invitationService={invitationService}>
            <TasksProvider tasksService={taskService}>
              <Outlet />
            </TasksProvider>
          </InvitationProvider>
        </EventsProvider>
      </WidgetsProvider>
      {/* </ExamsProvider> */}
    </>
  );
}
