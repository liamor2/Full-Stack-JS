import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  TextField,
} from "@mui/material";

import { useContactFormDialog } from "./ContactFormDialog.logic.js";
import ContactPhones from "./ContactPhones.js";

interface Props {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: any;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void> | void;
}

const ContactFormDialog = ({
  open,
  mode = "create",
  initialValues,
  pending = false,
  onClose,
  onSubmit,
}: Props) => {
  const {
    values,
    errors,
    nonFieldError,
    phoneErrors,
    handleChange,
    handlePhoneFieldChange,
    handleAddPhone,
    handleRemovePhone,
    handleSubmit,
  } = useContactFormDialog({ initialValues, onSubmit });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "edit" ? "Edit contact" : "New contact"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {nonFieldError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {nonFieldError}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            }}
          >
            <TextField
              autoFocus
              label="Name"
              value={values.name ?? ""}
              onChange={handleChange("name")}
              required
              fullWidth
              margin="dense"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              type="email"
              value={values.email ?? ""}
              onChange={handleChange("email")}
              fullWidth
              margin="dense"
              error={!!errors.email}
              helperText={errors.email}
            />

            <ContactPhones
              phones={values.phones ?? []}
              phoneErrors={phoneErrors}
              onPhoneChange={handlePhoneFieldChange}
              onAddPhone={handleAddPhone}
              onRemovePhone={handleRemovePhone}
            />

            <TextField
              label="Address"
              value={values.address ?? ""}
              onChange={handleChange("address")}
              fullWidth
              multiline
              rows={3}
              margin="dense"
              sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
              error={!!errors.address}
              helperText={errors.address}
            />
            <TextField
              label="Note"
              value={values.note ?? ""}
              onChange={handleChange("note")}
              fullWidth
              multiline
              rows={2}
              margin="dense"
              sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
              error={!!errors.note}
              helperText={errors.note}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            {mode === "edit" ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactFormDialog;
