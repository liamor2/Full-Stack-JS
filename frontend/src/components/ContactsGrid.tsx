import type { ContactResponse } from "@full-stack-js/shared";
import { Box, Button } from "@mui/material";

import ContactCard from "./ContactCard.js";

interface Props {
  contacts: ContactResponse[];
  onDelete: (id: string) => void;
  pending?: boolean;
}

const ContactsGrid = ({ contacts, onDelete, pending = false }: Props) => (
  <Box
    sx={{
      display: "grid",
      gap: 3,
      gridTemplateColumns: {
        xs: "repeat(auto-fill, minmax(260px, 1fr))",
        md: "repeat(auto-fill, minmax(300px, 1fr))",
      },
    }}
  >
    {contacts.map((contact) => (
      <ContactCard
        key={contact.id}
        contact={contact}
        action={
          <Button
            color="error"
            size="small"
            variant="outlined"
            onClick={() => onDelete(contact.id)}
            disabled={pending}
          >
            Delete
          </Button>
        }
      />
    ))}
  </Box>
);

export default ContactsGrid;
