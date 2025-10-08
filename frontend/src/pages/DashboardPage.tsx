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
import ContactsSearchBar from "../components/ContactsSearchBar.js";
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
    handleUpdate,
    loadContacts,
  } = useContacts();
  const { token } = useAuth();

  const handleSearch = async (criteria: Record<string, unknown>) => {
    try {
      // dynamic import to avoid circular issues and keep code minimal here
      const { findContacts } = await import("../api/contacts.js");
      const results = await findContacts(criteria, token ?? null);
      // Update local contacts list
      // We can reuse setContacts via exposing it from the hook, but it's not returned here.
      // Use loadContacts when clearing to reload the full list.
      // Temporarily: set contacts via loadContacts replacement by directly updating via a small state.
      // Simpler approach: replace contacts by calling loadContacts helper exposed by hook in clear.
      // We'll set a local override state for search results.
      setSearchResults(results);
    } catch (err) {
      // ignore for now; the hook will surface global errors
      console.error("Search failed", err);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    void loadContacts();
  };

  const [searchResults, setSearchResults] = useState<null | typeof contacts>(
    null,
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<null | { id: string; values: any }>(
    null,
  );

  const hasContacts = contacts.length > 0;

  const greeting = useMemo(() => {
    if (!user) return "";
    const first = (user as any).firstName;
    const last = (user as any).lastName;
    if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();
    return user.email;
  }, [user]);

  let mainContent;
  if (loading) {
    mainContent = (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  } else if (hasContacts) {
    mainContent = (
      <ContactsGrid
        contacts={contacts}
        onDelete={handleDelete}
        onEdit={(id) => {
          const contact = contacts.find(
            (c) => (c as any)._id === id || (c as any).id === id,
          );
          setEditing(contact ? { id, values: contact } : null);
          setDialogOpen(true);
        }}
        pending={pending}
      />
    );
  } else {
    mainContent = <EmptyState onCreate={() => setDialogOpen(true)} />;
  }

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

        <ContactsSearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        {searchResults ? (
          <ContactsGrid
            contacts={searchResults}
            onDelete={handleDelete}
            onEdit={(id) => {
              const contact = searchResults.find(
                (c) => (c as any)._id === id || (c as any).id === id,
              );
              setEditing(contact ? { id, values: contact } : null);
              setDialogOpen(true);
            }}
            pending={pending}
          />
        ) : (
          mainContent
        )}
      </Container>

      <ContactFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "create"}
        initialValues={editing?.values}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        pending={pending}
        onSubmit={async (values) => {
          if (editing) {
            await handleUpdate(editing.id, values);
            setEditing(null);
          } else {
            await handleCreate(values);
          }
          setDialogOpen(false);
        }}
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
