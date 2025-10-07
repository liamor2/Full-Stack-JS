import type { Contact } from "@full-stack-js/shared";
type ContactResponse = Contact;
import { Box, Button } from "@mui/material";

import ContactCard from "./ContactCard.js";

interface Props {
  contacts: ContactResponse[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  pending?: boolean;
}

const ContactsGrid = ({
  contacts,
  onDelete,
  onEdit,
  pending = false,
}: Props) => (
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
        key={(contact as any)._id ?? (contact as any).id}
        contact={contact}
        action={
          <>
            <Button
              color="primary"
              size="small"
              variant="outlined"
              onClick={() =>
                onEdit?.((contact as any)._id ?? (contact as any).id)
              }
              disabled={pending}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              color="error"
              size="small"
              variant="outlined"
              onClick={() =>
                onDelete((contact as any)._id ?? (contact as any).id)
              }
              disabled={pending}
            >
              Delete
            </Button>
          </>
        }
      />
    ))}
  </Box>
);

export default ContactsGrid;
