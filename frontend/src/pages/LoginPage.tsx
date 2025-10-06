import type { LoginRequest } from "@full-stack-js/shared";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type ChangeEvent, FormEvent, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  Navigate,
  useLocation,
  type Location,
} from "react-router-dom";

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

  const handleChange =
    (field: keyof LoginRequest) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 } }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700} textAlign="center">
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Login to manage your contacts and shared network.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
              autoComplete="current-password"
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress color="inherit" size={20} />
              ) : undefined
            }
            sx={{ mt: 1 }}
          >
            Log in
          </Button>

          <Box textAlign="center">
            <Link component={RouterLink} to="/" underline="hover">
              Back to landing
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
