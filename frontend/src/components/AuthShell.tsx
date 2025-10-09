import { Container, Paper, Stack, Link, Button } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

interface Props {
  children: ReactNode;
  error?: string | null;
  altText?: string;
  altTo?: string;
  loading?: boolean;
}

const AuthShell = ({ children, error, altText, altTo }: Props) => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 } }}>
        <Stack spacing={3}>
          {error ? <div style={{ marginBottom: 8 }}></div> : null}

          {children}

          <Stack spacing={1} alignItems="center">
            {altTo && altText ? (
              <Button component={RouterLink} to={altTo} variant="text">
                {altText}
              </Button>
            ) : null}
            <Link component={RouterLink} to="/" underline="hover">
              Back to landing
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AuthShell;
