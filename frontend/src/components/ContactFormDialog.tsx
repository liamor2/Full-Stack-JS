import type { Contact } from "@full-stack-js/shared";
type ContactCreate = Omit<Contact, "createdAt" | "updatedAt" | "deleted"> & {
  firstName?: string;
  lastName?: string;
  owner?: string;
};
type ContactUpdate = Partial<ContactCreate>;
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import PhoneInputField from "./PhoneInputField.js";
import { ContactZ } from "@full-stack-js/shared";

interface ContactFormDialogProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<ContactCreate & ContactUpdate>;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (
    values: Partial<ContactCreate & ContactUpdate>,
  ) => Promise<void> | void;
}

const emptyValues: Partial<ContactCreate> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  note: "",
};

const ContactFormDialog = ({
  open,
  mode = "create",
  initialValues,
  pending = false,
  onClose,
  onSubmit,
}: ContactFormDialogProps) => {
  const [values, setValues] = useState<Partial<ContactCreate>>(emptyValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactCreate, string>>
  >({});

  useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
  }, [initialValues]);

  const handleChange =
    (field: keyof ContactCreate) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev: Partial<ContactCreate>) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handlePhoneChange = useCallback((phone: string, country?: string) => {
    setValues((prev) => {
      if (prev.phone === phone) return prev;
      return {
        ...prev,
        phone,
      };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const payload: any = { ...values };
    for (const key of ["email", "phone", "address", "note"]) {
      if (
        payload[key] === "" ||
        payload[key] === undefined ||
        payload[key] === null
      ) {
        delete payload[key];
      }
    }

    const result = ContactZ.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactCreate, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ContactCreate | undefined;
        if (path) {
          fieldErrors[path] = issue.message;
        } else {
          fieldErrors.name = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(values as Partial<ContactCreate & ContactUpdate>);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "edit" ? "Edit contact" : "New contact"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
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
            />
            <TextField
              label="Email"
              type="email"
              value={values.email ?? ""}
              onChange={handleChange("email")}
              fullWidth
              margin="dense"
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneInputField
                value={values.phone}
                onChange={handlePhoneChange}
                defaultCountry="FR"
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Box>
            <TextField
              label="Address"
              value={values.address ?? ""}
              onChange={handleChange("address")}
              fullWidth
              multiline
              rows={3}
              margin="dense"
              sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
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
