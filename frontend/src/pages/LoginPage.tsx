import type { Login } from "@full-stack-js/shared";
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

const initialState: Login = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState<Login>(initialState);
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: Location } | undefined)?.from?.pathname ??
    "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (field: keyof Login, value: string) => {
    setForm((prev: Login) => ({ ...prev, [field]: value }));
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
