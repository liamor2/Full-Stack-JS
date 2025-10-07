import type { Login } from "@full-stack-js/shared";
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface Props {
  form: Login;
  onChange: (field: any, value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const LoginForm = ({ form, onChange, onSubmit, loading = false }: Props) => (
  <Stack
    spacing={3}
    component="form"
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
  >
    <Stack spacing={1}>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Login to manage your contacts and shared network.
      </Typography>
    </Stack>

    <Stack spacing={2}>
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => onChange("email", e.target.value)}
        required
        autoComplete="email"
      />
      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => onChange("password", e.target.value)}
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
        loading ? <CircularProgress color="inherit" size={20} /> : undefined
      }
      sx={{ mt: 1 }}
    >
      Log in
    </Button>

    {/* landing link moved to AuthShell wrapper */}
  </Stack>
);

export default LoginForm;
