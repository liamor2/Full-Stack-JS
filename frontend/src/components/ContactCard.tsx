import type { ContactResponse } from "@full-stack-js/shared";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ContactCardProps {
  contact: ContactResponse;
  action?: ReactNode;
}

const ContactCard = ({ contact, action }: ContactCardProps) => {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={600}>
              {contact.firstName} {contact.lastName}
            </Typography>
            {contact.email ? (
              <Typography variant="body2" color="text.secondary">
                {contact.email}
              </Typography>
            ) : null}
            {contact.phoneNumber ? (
              <Typography variant="body2" color="text.secondary">
                {contact.phoneNumber}
              </Typography>
            ) : null}
            {contact.address ? (
              <Typography variant="body2" color="text.secondary">
                {contact.address}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.disabled">
              Owner: {contact.owner}
            </Typography>
          </Stack>
          {action}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
