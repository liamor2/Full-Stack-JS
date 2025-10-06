import type { ContactCreate, ContactResponse } from "@full-stack-js/shared";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Snackbar,
  Stack,
  Toolbar,
  Typography,
  Alert,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createContact,
  deleteContact,
  fetchContacts,
} from "../api/contacts.js";
import ContactCard from "../components/ContactCard.js";
import ContactFormDialog from "../components/ContactFormDialog.js";
import useAuth from "../hooks/useAuth.js";

const DashboardPage = () => {
  const { token, user, logout } = useAuth();
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ownerId = user?.id;

  const loadContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContacts(token);
      setContacts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch contacts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleCreate = useCallback(
    async (values: Partial<ContactCreate>) => {
      if (!token || !ownerId) return;
      if (!values.firstName || !values.lastName) {
        setError("First and last name are required");
        return;
      }
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        const payload: ContactCreate = {
          firstName: values.firstName,
          lastName: values.lastName,
          owner: ownerId,
          email: values.email || undefined,
          phoneNumber: values.phoneNumber || undefined,
          address: values.address || undefined,
        };
        const created = await createContact(payload, token);
        setContacts((prev) => [created, ...prev]);
        setDialogOpen(false);
        setFeedback("Contact created successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create contact";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [token, ownerId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        await deleteContact(id, token);
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
        setFeedback("Contact deleted");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete contact";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [token],
  );

  const hasContacts = contacts.length > 0;

  const greeting = useMemo(() => {
    if (!user) return "";
    return user.username ?? user.email;
  }, [user]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Contact Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {greeting}
          </Typography>
          <IconButton color="inherit" onClick={logout} aria-label="Logout">
            <LogoutRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

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
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={pending}
          >
            Add contact
          </Button>
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
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "repeat(auto-fill, minmax(260px, 1fr))",
                md: "repeat(auto-fill, minmax(300px, 1fr))",
              },
            }}
          >
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                action={
                  <Button
                    color="error"
                    size="small"
                    variant="outlined"
                    onClick={() => handleDelete(contact.id)}
                    disabled={pending}
                  >
                    Delete
                  </Button>
                }
              />
            ))}
          </Box>
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No contacts yet
            </Typography>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Create your first contact
            </Button>
          </Stack>
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
