import type { LoginRequest } from "@full-stack-js/shared";
import { Alert } from "@mui/material";
import { useState } from "react";
import {
  useNavigate,
  Navigate,
  useLocation,
  type Location,
} from "react-router-dom";

import AuthShell from "../components/AuthShell.js";
import LoginForm from "../components/LoginForm.js";
import useAuth from "../hooks/useAuth.js";

const initialState: LoginRequest = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState<LoginRequest>(initialState);
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: Location } | undefined)?.from?.pathname ??
    "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (field: keyof LoginRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to login";
      setError(message || "Failed to login");
    }
  };

  return (
    <AuthShell error={error} altText="Create an account" altTo="/register">
      {error ? <Alert severity="error">{error}</Alert> : null}

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </AuthShell>
  );
};

export default LoginPage;
