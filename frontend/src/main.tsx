import { CssBaseline, ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import routes from "./AppRoutes.js";
import AppLayout from "./components/AppLayout.js";
import { AuthProvider } from "./context/AuthContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";
import theme from "./theme.js";

const router = createBrowserRouter(routes, {
  future: { v7_startTransition: true },
} as any);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <AppLayout>
            <RouterProvider router={router} />
          </AppLayout>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
