import { CircularProgress, Stack } from "@mui/material";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useNotification } from "../context/NotificationContext.js";
import useAuth from "../hooks/useAuth.js";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const notify = useNotification();

  const willRedirect =
    !loading && !isAuthenticated && location.pathname !== "/login";

  useEffect(() => {
    if (willRedirect) {
      notify("Please log in to continue", "info");
    }
  }, [willRedirect, notify]);

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "60vh" }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
