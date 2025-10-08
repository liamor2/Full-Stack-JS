import type { Contact } from "@full-stack-js/shared";
type ContactResponse = Contact;
type ContactCreate = Omit<Contact, "createdAt" | "updatedAt" | "deleted"> & {
  owner?: string;
};
import { useCallback, useEffect, useState } from "react";

import {
  createContact,
  deleteContact,
  findContacts,
  updateContact,
} from "../api/contacts.js";

import useAuth from "./useAuth.js";

const useContacts = () => {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ownerId = (user as any)?._id ?? (user as any)?.id ?? undefined;

  const loadContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await findContacts({ limit: 15, offset: 0 }, token ?? null);
      setContacts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch contacts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleCreate = useCallback(
    async (values: Partial<ContactCreate>) => {
      if (!token) {
        setError("Not authenticated");
        return;
      }
      if (!ownerId) {
        setError("User id not available");
        return;
      }
      if (!values.name) {
        setError("Name is required");
        return;
      }
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        const payload: ContactCreate = {
          name: values.name || "",
          owner: ownerId,
          email: values.email || undefined,
          phone: values.phone || undefined,
          address: values.address || undefined,
          note: values.note || undefined,
        };
        const created = await createContact(payload, token);
        setContacts((prev: ContactResponse[]) => [created, ...prev]);
        setFeedback("Contact created successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create contact";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [token, ownerId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        await deleteContact(id, token);
        setContacts((prev: ContactResponse[]) =>
          prev.filter(
            (contact) =>
              (contact as any)._id !== id && (contact as any).id !== id,
          ),
        );
        setFeedback("Contact deleted");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete contact";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [token],
  );

  const handleUpdate = useCallback(
    async (id: string, values: Partial<ContactCreate>) => {
      if (!token) {
        setError("Not authenticated");
        return;
      }
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(values ?? {})) {
          if (v === undefined) continue;
          if (typeof v === "string" && v.trim() === "") continue;
          payload[k] = v;
        }

        const updated = await updateContact(id, payload as any, token);
        setContacts((prev) =>
          prev.map((c) =>
            (c as any)._id === id || (c as any).id === id ? updated : c,
          ),
        );
        setFeedback("Contact updated");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update contact";
        setError(message);
      } finally {
        setPending(false);
      }
    },
    [token],
  );

  return {
    contacts,
    loading,
    error,
    pending,
    feedback,
    setFeedback,
    loadContacts,
    handleCreate,
    handleDelete,
    setContacts,
    handleUpdate,
  } as const;
};

export default useContacts;
