import type { RegisterRequest } from "@full-stack-js/shared";
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface Props {
  form: RegisterRequest;
  onChange: (field: keyof RegisterRequest, value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const RegisterForm = ({ form, onChange, onSubmit, loading = false }: Props) => (
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
        Create account
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Register to manage your contacts and share with others.
      </Typography>
    </Stack>

    <Stack spacing={2}>
      <TextField
        label="Username"
        value={form.username ?? ""}
        onChange={(e) => onChange("username", e.target.value)}
        required
      />
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
        autoComplete="new-password"
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
      Create account
    </Button>
  </Stack>
);

export default RegisterForm;
