import type { Contact } from "@full-stack-js/shared";
type ContactResponse = Contact;
import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth.js";
import { fetchUser } from "../api/users.js";

interface ContactCardProps {
  contact: ContactResponse;
  action?: ReactNode;
}

const ContactCard = ({ contact, action }: ContactCardProps) => {
  const { token } = useAuth();
  const ownerId =
    (contact as any).createdBy ?? (contact as any).owner ?? undefined;
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  // Simple in-memory cache shared across instances
  const cache = (ContactCard as any)._ownerEmailCache as
    | Map<string, string>
    | undefined;
  if (!cache) {
    (ContactCard as any)._ownerEmailCache = new Map<string, string>();
  }

  useEffect(() => {
    let mounted = true;
    if (!ownerId) {
      setOwnerEmail(null);
      return;
    }
    const map: Map<string, string> = (ContactCard as any)._ownerEmailCache;
    const cached = map.get(ownerId);
    if (cached) {
      setOwnerEmail(cached);
      return;
    }

    (async () => {
      try {
        const user = await fetchUser(ownerId, token ?? null);
        if (!mounted) return;
        const email = (user as any).email ?? null;
        if (email) map.set(ownerId, email);
        setOwnerEmail(email);
      } catch {
        if (!mounted) return;
        setOwnerEmail(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ownerId, token]);

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
              {contact.name}
            </Typography>
            {contact.email ? (
              <Typography variant="body2" color="text.secondary">
                {contact.email}
              </Typography>
            ) : null}
            {contact.phone ? (
              <Typography variant="body2" color="text.secondary">
                {contact.phone}
              </Typography>
            ) : null}
            {contact.address ? (
              <Typography variant="body2" color="text.secondary">
                {contact.address}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.disabled">
              Owner: {ownerEmail ?? "-"}
            </Typography>
          </Stack>
          {action}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
