import type { ContactCreate, ContactResponse } from "@full-stack-js/shared";
import { useCallback, useEffect, useState } from "react";

import {
  createContact,
  deleteContact,
  fetchContacts,
} from "../api/contacts.js";

import useAuth from "./useAuth.js";

const useContacts = () => {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ownerId = user?.id;

  const loadContacts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContacts(token);
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
      if (!token || !ownerId) return;
      if (!values.firstName || !values.lastName) {
        setError("First and last name are required");
        return;
      }
      setPending(true);
      setError(null);
      setFeedback(null);
      try {
        const payload: ContactCreate = {
          firstName: values.firstName,
          lastName: values.lastName,
          owner: ownerId,
          email: values.email || undefined,
          phoneNumber: values.phoneNumber || undefined,
          address: values.address || undefined,
        };
        const created = await createContact(payload, token);
        setContacts((prev) => [created, ...prev]);
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
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
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
  } as const;
};

export default useContacts;
