import { Box, TextField, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneInputField from "./PhoneInputField.js";
import type { ChangeEvent } from "react";

interface Props {
  readonly phones?: any[];
  readonly onPhoneChange: (
    index: number,
    field: string,
    value?: string,
  ) => void;
  readonly onAddPhone: () => void;
  readonly onRemovePhone: (index: number) => void;
}

export default function ContactPhones({
  phones = [],
  onPhoneChange,
  onAddPhone,
  onRemovePhone,
}: Props) {
  return (
    <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
      {phones.map((p: any, idx: number) => (
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
                onPhoneChange(idx, "number", phoneVal);
                onPhoneChange(
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onPhoneChange(idx, "label", e.target.value)
            }
            margin="dense"
            sx={{ gridColumn: { md: "2 / 3" } }}
          />
          <TextField
            label="Note"
            value={p?.note ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onPhoneChange(idx, "note", e.target.value)
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
              onClick={() => onRemovePhone(idx)}
              size="small"
              aria-label="remove-phone"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Button
        onClick={onAddPhone}
        sx={{ mt: 1 }}
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        disabled={phones.some((pp) => !pp?.number)}
      >
        Add phone
      </Button>
    </Box>
  );
}
