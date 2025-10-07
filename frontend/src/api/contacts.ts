import type { Contact } from "@full-stack-js/shared";

export type ContactResponse = Contact;
export type ContactCreate = Omit<
  Contact,
  "createdAt" | "updatedAt" | "deleted"
> & {
  firstName?: string;
  lastName?: string;
  owner?: string;
};
export type ContactUpdate = Partial<ContactCreate>;

import apiClient from "./client.js";

export async function fetchContacts(token: string) {
  return apiClient.get<ContactResponse[]>("/contacts", token);
}

export async function fetchContact(id: string, token: string) {
  return apiClient.get<ContactResponse>(`/contacts/${id}`, token);
}

export async function createContact(payload: ContactCreate, token: string) {
  return apiClient.post<ContactResponse, ContactCreate>(
    "/contacts",
    payload,
    token,
  );
}

export async function updateContact(
  id: string,
  payload: ContactUpdate,
  token: string,
) {
  return apiClient.patch<ContactResponse, ContactUpdate>(
    `/contacts/${id}`,
    payload,
    token,
  );
}

export async function deleteContact(id: string, token: string) {
  return apiClient.delete<ContactResponse>(`/contacts/${id}`, token);
}

export default {
  fetchContacts,
  fetchContact,
  createContact,
  updateContact,
  deleteContact,
};
