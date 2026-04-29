import { ProtectedLayout } from "../../App";
import panelsLoader from "./loaders/panel.loader";
import HomePage from "#components/pages/HomePage";
import LoginPage from "#components/pages/LoginPage";
import CommingPage from "#components/pages/Comming";
import PanelsPage from "#components/pages/PanelsPage";

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
        children: [
          { index: true, element: <HomePage /> },
          {
            path: ":pid/*",
            loader: panelsLoader,
            element: <PanelsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <CommingPage />,
  },
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
