import { Box, TextField } from "@mui/material";
import React from "react";
import PhoneInput from "react-headless-phone-input";
import TinyFlag from "tiny-flag-react";
import type { ChangeEvent } from "react";

interface PhoneInputFieldProps {
  value?: string;
  onChange: (phone: string, country?: string) => void;
  defaultCountry?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  margin?: "none" | "dense" | "normal";
}

const PhoneInputField = ({
  value,
  onChange,
  defaultCountry = "FR",
  label = "Phone number",
  error = false,
  helperText,
  fullWidth = true,
  margin = "dense",
}: PhoneInputFieldProps) => {
  const handleFallbackChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next === value) return;
    onChange(next);
  };

  const handleInnerChange = (phone: string, country?: string) => {
    if (phone === value) return;
    onChange(phone, country);
  };

  return (
    <PhoneInput
      value={value ?? ""}
      onChange={handleInnerChange}
      defaultCountry={defaultCountry}
    >
      {(phoneProps: any) => {
        const countryIso = (
          phoneProps?.country ?? defaultCountry
        ).toUpperCase();

        const inputProps = phoneProps.getInputProps
          ? phoneProps.getInputProps({
              label,
              style: {
                flex: 1,
                border: "none",
                outline: "none",
                height: 40,
                paddingLeft: 8,
              },
            })
          : {
              value: value ?? "",
              onChange: handleFallbackChange,
            };

        const {
          value: _v,
          onChange: _o,
          label: _l,
          ...rest
        } = inputProps || {};

        return (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
              <TinyFlag country={countryIso} />
            </Box>
            <TextField
              value={inputProps.value}
              onChange={inputProps.onChange}
              label={inputProps.label ?? label}
              fullWidth={fullWidth}
              margin={margin}
              error={error}
              helperText={helperText}
              slotProps={{
                htmlInput: {
                  ...rest,
                },
              }}
            />
          </Box>
        );
      }}
    </PhoneInput>
  );
};

export default React.memo(PhoneInputField);
