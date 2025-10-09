import { useEffect, useRef, useState } from "react";
import { Box, TextField, MenuItem, Button, Stack } from "@mui/material";

const FIELDS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  // { value: "note", label: "Note" },
];

interface Props {
  onSearch: (criteria: Record<string, unknown>) => void;
  onClear?: () => void;
  debounceMs?: number;
}

const ContactsSearchBar = ({ onSearch, onClear, debounceMs = 300 }: Props) => {
  const [field, setField] = useState<string>("name");
  const [q, setQ] = useState<string>("");

  const onSearchRef = useRef(onSearch);
  const onClearRef = useRef(onClear);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  const handleSearch = () => {
    if (!q.trim()) return onClearRef.current?.();
    onSearchRef.current({ [field]: q.trim() });
  };

  const handleClear = () => {
    setQ("");
    onClearRef.current?.();
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (!q.trim()) {
        onClearRef.current?.();
      } else {
        onSearchRef.current({ [field]: q.trim() });
      }
    }, debounceMs);

    return () => clearTimeout(id);
  }, [q, field, debounceMs]);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          select
          value={field}
          onChange={(e) => setField(e.target.value)}
          size="small"
          sx={{ width: 140 }}
        >
          {FIELDS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          placeholder={`Search ${field}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <Button variant="text" onClick={handleClear} size="small">
          Clear
        </Button>
      </Stack>
    </Box>
  );
};

export default ContactsSearchBar;
