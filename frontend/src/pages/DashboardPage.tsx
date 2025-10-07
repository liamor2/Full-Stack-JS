import {
  Box,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { useMemo, useState } from "react";

import ContactFormDialog from "../components/ContactFormDialog.js";
import ContactsGrid from "../components/ContactsGrid.js";
import DashboardHeader from "../components/DashboardHeader.js";
import EmptyState from "../components/EmptyState.js";
import useAuth from "../hooks/useAuth.js";
import useContacts from "../hooks/useContacts.js";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const {
    contacts,
    loading,
    error,
    pending,
    feedback,
    setFeedback,
    handleCreate,
    handleDelete,
  } = useContacts();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const hasContacts = contacts.length > 0;

  const greeting = useMemo(() => {
    if (!user) return "";
    const first = (user as any).firstName;
    const last = (user as any).lastName;
    if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();
    return user.email;
  }, [user]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <DashboardHeader
        greeting={greeting}
        onLogout={logout}
        onAdd={() => setDialogOpen(true)}
        pending={pending}
      />

      <Container sx={{ py: 5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" fontWeight={700}>
            Your contacts
          </Typography>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <CircularProgress />
          </Stack>
        ) : hasContacts ? (
          <ContactsGrid
            contacts={contacts}
            onDelete={handleDelete}
            pending={pending}
          />
        ) : (
          <EmptyState onCreate={() => setDialogOpen(true)} />
        )}
      </Container>

      <ContactFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pending={pending}
        onSubmit={handleCreate}
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        message={feedback}
      />
    </Box>
  );
};

export default DashboardPage;
