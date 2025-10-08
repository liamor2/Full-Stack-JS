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
  Alert,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import PhoneInputField from "./PhoneInputField.js";
import { ApiError } from "../api/client.js";
import { ContactZ } from "@full-stack-js/shared";

function formatDetails(details: unknown): string | null {
  if (details === undefined || details === null) return null;
  if (Array.isArray(details))
    return details.map((d: any) => d?.message || String(d)).join("; ");
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details);
  } catch {
    return null;
  }
}

function formatApiError(e: ApiError): string {
  const body: any = e.body ?? e.details ?? {};
  const msg = body?.message || body?.error;
  if (msg) return msg;
  const details = body?.details ?? e.details;
  const formatted = formatDetails(details);
  return formatted ?? e.message ?? "Request failed";
}

function formatError(e: unknown): string {
  if (e instanceof ApiError) return formatApiError(e);
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object") {
    try {
      return JSON.stringify(e);
    } catch {
      return "Failed to submit";
    }
  }
  if (e == null) return "Failed to submit";
  return String(e);
}

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
  phones: undefined,
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
  const [nonFieldError, setNonFieldError] = useState<string | null>(null);

  useEffect(() => {
    const base = { ...emptyValues, ...(initialValues ?? {}) } as any;
    if (initialValues && (initialValues as any).phone && !base.phones) {
      base.phones = [
        {
          number: (initialValues as any).phone,
        },
      ];
    }
    if (Array.isArray(base.phones)) {
      base.phones = base.phones.map((p: any) => ({
        ...(p || {}),
        _tmpId:
          p?._tmpId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
    }
    setValues(base);
  }, [initialValues]);

  const handleChange =
    (field: keyof ContactCreate) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev: Partial<ContactCreate>) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handlePhoneFieldChange = useCallback(
    (index: number, field: string, value?: string) => {
      setValues((prev) => {
        const phones = Array.isArray((prev as any).phones)
          ? [...((prev as any).phones as any[])]
          : [];
        while (phones.length <= index) phones.push({ number: "" });
        const current = phones[index] ? phones[index][field] : undefined;
        if ((current ?? undefined) === (value ?? undefined)) return prev;
        phones[index] = { ...phones[index], [field]: value };
        return { ...prev, phones };
      });
    },
    [],
  );

  const handleAddPhone = useCallback(() => {
    setValues((prev) => {
      const phones = Array.isArray((prev as any).phones)
        ? [...((prev as any).phones as any[])]
        : [];
      phones.push({
        number: "",
        _tmpId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
      return { ...prev, phones };
    });
  }, []);

  const handleRemovePhone = useCallback((index: number) => {
    setValues((prev) => {
      const phones = Array.isArray((prev as any).phones)
        ? [...((prev as any).phones as any[])]
        : [];
      phones.splice(index, 1);
      return { ...prev, phones };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const payload: any = { ...values };
    if (payload.phone && !payload.phones) {
      payload.phones = [{ number: payload.phone }];
      delete payload.phone;
    }
    for (const key of ["email", "phone", "address", "note", "deletedAt"]) {
      if (
        payload[key] === "" ||
        payload[key] === undefined ||
        payload[key] === null ||
        (Array.isArray(payload[key]) && payload[key].length === 0)
      ) {
        delete payload[key];
      }
    }
    if (Array.isArray(payload.phones)) {
      payload.phones = payload.phones.map((p: any) => {
        if (!p || typeof p !== "object") return p;
        const { _tmpId, ...rest } = p;
        return rest;
      });
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
          setNonFieldError(issue.message);
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setNonFieldError(null);
      await onSubmit(payload as Partial<ContactCreate & ContactUpdate>);
    } catch (err) {
      setNonFieldError(formatError(err));
      return;
    }
  };

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
            <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
              {(values.phones ?? []).map((p: any, idx: number) => (
                <Box
                  key={p?._tmpId ?? idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 40px" },
                    gap: 1,
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ gridColumn: "1 / 2" }}>
                    <PhoneInputField
                      value={p?.number}
                      onChange={(phoneOrEvent: any, country?: string) => {
                        const phoneVal =
                          typeof phoneOrEvent === "string"
                            ? phoneOrEvent
                            : (phoneOrEvent?.target?.value ?? "");
                        handlePhoneFieldChange(idx, "number", phoneVal);
                        handlePhoneFieldChange(
                          idx,
                          "country",
                          typeof country === "string"
                            ? country.toUpperCase()
                            : undefined,
                        );
                      }}
                      defaultCountry="FR"
                      fullWidth
                    />
                  </Box>
                  <TextField
                    label="Label"
                    value={p?.label ?? ""}
                    onChange={(e) =>
                      handlePhoneFieldChange(idx, "label", e.target.value)
                    }
                    margin="dense"
                    sx={{ gridColumn: { md: "2 / 3" } }}
                  />
                  <TextField
                    label="Note"
                    value={p?.note ?? ""}
                    onChange={(e) =>
                      handlePhoneFieldChange(idx, "note", e.target.value)
                    }
                    margin="dense"
                    sx={{ gridColumn: { md: "3 / 4" } }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      color="error"
                      onClick={() => handleRemovePhone(idx)}
                      size="small"
                      aria-label="remove-phone"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}

              <Button
                onClick={handleAddPhone}
                sx={{ mt: 1 }}
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                disabled={((values.phones ?? []) as any[]).some(
                  (pp) => !pp?.number,
                )}
              >
                Add phone
              </Button>
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
