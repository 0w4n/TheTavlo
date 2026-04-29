import MigrationDialog from "#components/MigrationDialog";
import AuthService from "#core/auth/app/auth.service";
import { FirebaseAuthRepository } from "#core/auth/infraestructure/authRepository.firebase";
import { FirebaseMigrationRepository } from "#core/auth/infraestructure/migrationRepository.firebase";
import { AuthProvider } from "#core/auth/presentation/context/authContext";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import LoadingPage from "#components/pages/LoadingPage";
import { useMemo } from "react";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { PanelsProvider } from "#features/panels/presentation/context/panelsContext";
import { WidgetsProvider } from "#features/widgets/presentation/context/widgetsContext";
import { FirebasePanelsRepository } from "#features/panels/infraestructure/panelRepository.firebase";
import { FirebaseWidgetRepository } from "#features/widgets/infraestructure/widgetRepository.firebase";
import { PanelsService } from "#features/panels/app/panels.service";
import { WidgetService } from "#features/widgets/app/widget.service";
import { RouterProvider, Navigate, Outlet } from "react-router-dom";
import { appRouter } from "#core/routing/appRouter";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { GlobalContextProvider } from "#core/globalContext/context/globalContext";
import { InvitationService } from "#features/invitations/app/invitation.service";
import { FirebaseInvitationRepository } from "#features/invitations/infraestructure/invitationRepository.firebase";
import { InvitationProvider } from "#features/invitations/presentation/context/invitationContext";
// import ComposeProviders from "#core/providers/composeProviders";

export default function App() {
  const authRepository = new FirebaseAuthRepository(firebaseService.auth);
  const migrationRepository = new FirebaseMigrationRepository(
    firebaseService.firestore,
  );
  const authService = new AuthService(authRepository, migrationRepository);

  return (
    <>
      <AuthProvider authService={authService}>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </>
  );
}

export function ProtectedLayout() {
  console.log("🔥 ProtectedLayout rendered");

  const { state } = useAuth();
  console.info("ProtectedLayout - state:", state);

  // Loader mientras se inicializa auth
  if (!state.initialized) {
    console.log("init");
    return <LoadingPage />;
  }

  // Migración pendiente
  if (state.migrationPending) {
    console.log("migration");
    return <MigrationDialog />;
  }

  // ❗ No autenticado → redirigir a /login
  if (!state.user) {
    console.log("notInit");
    return <Navigate to="/login" replace />;
  }

  const user = state.user;

  if (!user) return;

  // Usuario autenticado
  // const themeRepository = new FirebaseThemeRepository(
  //   firebaseService.firestore,
  //   () => user,
  // );

  // Panels
  const panelsRepository = new FirebasePanelsRepository(
    firebaseService.firestore,
    () => user,
  );

  const panelsService = new PanelsService(panelsRepository);

  return (
    <>
      {/* <ThemeProvider themeRepository={themeRepository}> */}
      <PanelsProvider panelsService={panelsService}>
        <GlobalContextProvider>
          <ProviderApp />
        </GlobalContextProvider>
      </PanelsProvider>
      {/* </ThemeProvider> */}
    </>
  );
}

function ProviderApp() {
  const globalContext = useGlobalContext();
  console.log("ProviderApp: ", globalContext);

  // Widgets
  const widgetRepository = useMemo(() => {
    return new FirebaseWidgetRepository(
      firebaseService.firestore,
      () => globalContext,
    );
  }, [globalContext]);

  const widgetService = useMemo(() => {
    console.log("[VERBOSE] widgetService");
    return new WidgetService(widgetRepository);
  }, [widgetRepository]);

  const invitationRepository = useMemo(() => {
    console.log("[VERBOSE] invaitationRepository");
    return new FirebaseInvitationRepository(
      firebaseService.firestore,
      () => globalContext,
    );
  }, [globalContext]);

  const invitationService = useMemo(() => {
    console.log("[VERBOSE] invitationService");
    return new InvitationService(invitationRepository);
  }, [invitationRepository]);

  return (
    <>
      {/* <EventsProvider>
              <ExamsProvider> */}
      <InvitationProvider invitationService={invitationService}>
        <WidgetsProvider widgetService={widgetService}>
          <Outlet />
        </WidgetsProvider>
      </InvitationProvider>
      {/* </ExamsProvider>
            </EventsProvider> */}
    </>
  );
}
