import { ProtectedLayout } from "../../App";
import panelsLoader from "./loaders/panel.loader";
import HomePage from "#pages/HomePage";
import LoginPage from "#pages/LoginPage";
import TestPage from "#pages/desing-page";
import { TheTavloDashboard } from "#pages/desing";
import CommingPage from "#pages/Comming";
import PanelsPage from "#pages/PanelsPage";


export const routes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path:"/home",
        element: <HomePage />,
      },
      {
        path: "/home/:id",
        loader: panelsLoader,
        element: <PanelsPage/>
      }
    ],
  },
  {
    path: "/",
    element: <CommingPage />,
  },
  {
    path: "/dev",
    element: <TestPage />,
  },
  {
    path: "/dash",
    element: <TheTavloDashboard />,
  },
];