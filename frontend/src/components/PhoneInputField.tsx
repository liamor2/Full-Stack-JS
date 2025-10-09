import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import TinyFlag from "tiny-flag-react";
import type { ChangeEvent } from "react";
import {
  getCountryOption,
  getPhoneCountries,
} from "../utils/phoneCountries.js";

interface PhoneInputFieldProps {
  value?: string;
  countryCode?: string;
  onChange: (phone: string) => void;
  onCountryChange?: (countryIso: string, dialCode: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  margin?: "none" | "dense" | "normal";
}

const PhoneInputField = ({
  value,
  countryCode,
  onChange,
  onCountryChange,
  label = "Phone number",
  error = false,
  helperText,
  fullWidth = true,
  margin = "dense",
}: PhoneInputFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState("");

  const selectedCountry = getCountryOption(countryCode);
  const filteredCountries = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return getPhoneCountries();
    return getPhoneCountries().filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.iso.toLowerCase().includes(lower) ||
        c.dialCode.replace("+", "").startsWith(lower.replace("+", "")),
    );
  }, [query]);

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next === value) return;
    onChange(next);
  };

  const handleCountrySelect = (iso: string, dialCode: string) => {
    setAnchorEl(null);
    onCountryChange?.(iso, dialCode);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
      <IconButton
        aria-label="select-country"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={{ border: 1, borderColor: "divider" }}
      >
        {selectedCountry ? (
          <TinyFlag country={selectedCountry.iso} />
        ) : (
          <SearchIcon fontSize="small" />
        )}
      </IconButton>
      <TextField
        value={value ?? ""}
        onChange={handleNumberChange}
        label={label}
        fullWidth={fullWidth}
        margin={margin}
        error={error}
        helperText={helperText}
        slotProps={{
          input: {
            startAdornment: selectedCountry ? (
              <Typography component="span" sx={{ mr: 1, fontWeight: 500 }}>
                {selectedCountry.dialCode}
              </Typography>
            ) : undefined,
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: { sx: { minWidth: 260 } },
          list: { sx: { maxHeight: 320 } },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            label="Search"
            size="small"
            fullWidth
            autoFocus
          />
        </Box>
        {filteredCountries.map((country) => (
          <MenuItem
            key={country.iso}
            selected={country.iso === selectedCountry?.iso}
            onClick={() => handleCountrySelect(country.iso, country.dialCode)}
          >
            <ListItemIcon>
              <TinyFlag country={country.iso} />
            </ListItemIcon>
            <ListItemText
              primary={country.name}
              secondary={country.dialCode}
              slotProps={{
                primary: { noWrap: true },
                secondary: { noWrap: true },
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default React.memo(PhoneInputField);
