import { Box, TextField, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneInputField from "./PhoneInputField.js";
import type { ChangeEvent } from "react";
import { getCountryOption } from "../utils/phoneCountries.js";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

interface Props {
  readonly phones?: any[];
  readonly phoneErrors?: Record<number, string>;
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
  phoneErrors,
  onPhoneChange,
  onAddPhone,
  onRemovePhone,
}: Props) {
  const getDisplayNumber = (number?: string, iso?: string) => {
    if (!number) return "";
    const trimmedIso = iso ? iso.toUpperCase() : undefined;
    try {
      const parsed = parsePhoneNumberFromString(
        number,
        trimmedIso as CountryCode | undefined,
      );
      if (parsed) {
        return parsed.formatNational();
      }
    } catch {
      /* ignore parse errors */
    }

    const option = trimmedIso ? getCountryOption(trimmedIso) : undefined;
    if (option?.dialCode && number.startsWith(option.dialCode)) {
      return number.slice(option.dialCode.length).trimStart();
    }
    return number.startsWith("+") && option?.dialCode
      ? number.replace(option.dialCode, "").trimStart()
      : number;
  };

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
            {(() => {
              const iso =
                typeof p?.country === "string" ? p.country : undefined;
              const trimmedIso = iso ? iso.toUpperCase() : undefined;
              const countryOption = trimmedIso
                ? getCountryOption(trimmedIso)
                : undefined;
              const displayValue = getDisplayNumber(p?.number, trimmedIso);

              const buildInternationalNumber = (
                inputValue: string,
                targetIso?: string,
                targetDialCode?: string,
              ) => {
                const normalizedInput = inputValue.trim();
                if (!normalizedInput) return "";
                const uppercaseIso = targetIso
                  ? targetIso.toUpperCase()
                  : undefined;
                try {
                  const parsed = parsePhoneNumberFromString(
                    normalizedInput,
                    uppercaseIso as CountryCode | undefined,
                  );
                  if (parsed?.isValid()) {
                    return parsed.number;
                  }
                } catch {
                  /* ignore parse errors */
                }

                const digitsOnly = normalizedInput.replace(/[^\d]/g, "");
                if (!digitsOnly) return "";
                const dial = targetDialCode ?? countryOption?.dialCode;
                return dial ? `${dial}${digitsOnly}` : digitsOnly;
              };

              return (
                <PhoneInputField
                  value={displayValue}
                  countryCode={trimmedIso}
                  onChange={(phone: string) => {
                    const nextNumber = buildInternationalNumber(
                      phone,
                      trimmedIso,
                      countryOption?.dialCode,
                    );
                    if (nextNumber !== (p?.number ?? "")) {
                      onPhoneChange(idx, "number", nextNumber);
                    }
                  }}
                  onCountryChange={(nextIso, dialCode) => {
                    const uppercaseNextIso = nextIso.toUpperCase();
                    const nextNumber = buildInternationalNumber(
                      displayValue,
                      uppercaseNextIso,
                      dialCode,
                    );
                    if (nextNumber !== (p?.number ?? "")) {
                      onPhoneChange(idx, "number", nextNumber);
                    }
                    if (uppercaseNextIso !== (trimmedIso ?? undefined)) {
                      onPhoneChange(idx, "country", uppercaseNextIso);
                    }
                  }}
                  fullWidth
                  error={Boolean(phoneErrors?.[idx])}
                  helperText={phoneErrors?.[idx]}
                />
              );
            })()}
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
