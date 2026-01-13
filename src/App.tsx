import MigrationDialog from "#components/MigrationDialog";
import AuthService from "#core/auth/app/auth.service";
import { FirebaseAuthRepository } from "#core/auth/infraestructure/authRepository.firebase";
import { FirebaseMigrationRepository } from "#core/auth/infraestructure/migrationRepository.firebase";
import { AuthProvider } from "#core/auth/presentation/context/authContext";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import LoadingPage from "#pages/LoadingPage";
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
import { ThemeProvider } from "#shared/themes/presentation/context/themeContext";
import { FirebaseThemeRepository } from "#shared/themes/infraestructure/themeRepository.firebase";
import useGlobalContext from "#core/globalContext/useGlobalContext";
import GlobalContextProvider from "#core/globalContext/globalContext";
import ComposeProviders from "#core/providers/composeProviders";

export default function App() {
  const authRepository = new FirebaseAuthRepository(firebaseService.auth);
  const migrationRepository = new FirebaseMigrationRepository(
    firebaseService.firestore
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

  // Usuario autenticado
  const themeRepository = new FirebaseThemeRepository(
    firebaseService.firestore,
    () => state.user
  );

  return (
    <ThemeProvider themeRepository={themeRepository}>
      <GlobalContextProvider>
        <ProviderApp />
      </GlobalContextProvider>
    </ThemeProvider>
  );
}

function ProviderApp() {
  console.log("Pre-provider");
  const globalContext = useGlobalContext();
  console.log("AuthenticatedApp: ", globalContext);

  // Panels
  const panelsRepository = useMemo(() => {
    return new FirebasePanelsRepository(
      firebaseService.firestore,
      () => globalContext
    );
  }, [globalContext]);

  const panelsService = useMemo(() => {
    console.log("[VERBOSE] panelsService");
    return new PanelsService(panelsRepository);
  }, [panelsRepository]);

  // Widgets
  const widgetRepository = useMemo(() => {
    return new FirebaseWidgetRepository(
      firebaseService.firestore,
      () => globalContext
    );
  }, [globalContext]);

  const widgetService = useMemo(() => {
    console.log("[VERBOSE] panelsService");
    return new WidgetService(widgetRepository);
  }, [widgetRepository]);

  return (
    <>
      {/* <EventsProvider>
              <ExamsProvider> */}
      <PanelsProvider panelsService={panelsService}>
        <WidgetsProvider widgetService={widgetService}>
          <Outlet />
        </WidgetsProvider>
      </PanelsProvider>
      {/* </ExamsProvider>
            </EventsProvider> */}
    </>
  );
}
