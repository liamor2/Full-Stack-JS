import {
  Box,
  Container,
  Snackbar,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { useMemo, useState } from "react";

import ContactFormDialog from "../components/ContactFormDialog.js";
import ContactsSearchBar from "../components/ContactsSearchBar.js";
import DashboardHeader from "../components/DashboardHeader.js";

import useAuth from "../hooks/useAuth.js";
import InfiniteContacts from "../components/InfiniteContacts.js";
import useContacts from "../hooks/useContacts.js";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const {
    contacts,
    error,
    pending,
    feedback,
    setFeedback,
    handleCreate,
    handleDelete,
    handleUpdate,
    loadContacts,
  } = useContacts();

  const [searchCriteria, setSearchCriteria] = useState<null | Record<
    string,
    unknown
  >>(null);

  const handleSearch = async (criteria: Record<string, unknown>) => {
    setSearchCriteria(criteria ?? null);
  };

  const handleClearSearch = () => {
    setSearchCriteria(null);
    void loadContacts();
  };

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<null | { id: string; values: any }>(
    null,
  );
  const [reloadKey, setReloadKey] = useState<number>(0);

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

        <ContactsSearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        <InfiniteContacts
          criteria={searchCriteria}
          pageSize={15}
          pending={pending}
          onDelete={handleDelete}
          onEdit={(id) => {
            const contact = contacts.find(
              (c) => (c as any)._id === id || (c as any).id === id,
            );
            setEditing(contact ? { id, values: contact } : null);
            setDialogOpen(true);
          }}
          reloadKey={reloadKey}
        />
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
            setReloadKey((k) => k + 1);
          } else {
            await handleCreate(values);
            setReloadKey((k) => k + 1);
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
