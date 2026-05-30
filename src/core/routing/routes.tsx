import { ProtectedLayout } from "../../App";
import panelsLoader from "./loaders/panel.loader";
import HomePage from "#components/pages/HomePage";
import LoginPage from "#components/pages/LoginPage";
import CommingPage from "#components/pages/Comming";
import PanelsPage from "#components/pages/PanelsPage";
import ErrorPage from "#components/pages/error";
import { Navigate } from "react-router-dom";
// import invitationsLoader from "./loaders/invitation.loader";

export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/home",
        ErrorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage />},
          {
            path: ":pid/*",
            loader: panelsLoader,
            element: <PanelsPage />,
            ErrorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  // {
  //   path: "/invitation/:invitacionId",
  //   loader: invitationsLoader,
  //   element: ,
  //   ErrorElement: <ErrorPage />,
  // },
  {
    path: "*",
    element: <CommingPage />,
  },
  // Development routes commented out due to type errors
  // {
  //   path: "/dev",
  //   element: <TestPage />,
  // },
  // {
  //   path: "/dash",
  //   element: <TheTavloDashboard />,
  // },
];
