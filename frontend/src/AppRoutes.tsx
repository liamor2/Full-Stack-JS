import { Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.js";
import DashboardPage from "./pages/DashboardPage.js";
import LandingPage from "./pages/LandingPage.js";
import LoginPage from "./pages/LoginPage.js";
import RegisterPage from "./pages/RegisterPage.js";

const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <DashboardPage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export default routes;
