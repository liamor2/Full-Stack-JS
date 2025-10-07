import type { Register } from "@full-stack-js/shared";
import { Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.js";
import RegisterForm from "../components/RegisterForm.js";
import useAuth from "../hooks/useAuth.js";

const initial: Register = {
  email: "",
  password: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState<Register>(initial);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof Register, value: string) => {
    setForm((prev: Register) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      let message = "Failed to register";
      if (err && typeof err === "object") {
        const details = (err as any).details ?? (err as any).body?.details;
        if (Array.isArray(details) && details.length > 0) {
          message = details.map((d: any) => d.message).join(", ");
        } else if (err instanceof Error) {
          message = err.message;
        } else if ((err as any).message) {
          message = (err as any).message;
        } else if ((err as any).error) {
          message = (err as any).error;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message || "Failed to register");
    }
  };

  return (
    <AuthShell
      error={error}
      altText="Already have an account? Log in"
      altTo="/login"
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <RegisterForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </AuthShell>
  );
};

export default RegisterPage;
