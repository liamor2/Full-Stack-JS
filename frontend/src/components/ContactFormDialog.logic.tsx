import {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ContactZ } from "@full-stack-js/shared";
import { ApiError } from "../api/client.js";

export type Contact = import("@full-stack-js/shared").Contact;
export type ContactCreate = Omit<
  Contact,
  "createdAt" | "updatedAt" | "deleted"
> & {
  firstName?: string;
  lastName?: string;
  owner?: string;
};
export type ContactUpdate = Partial<ContactCreate>;

export interface ContactFormDialogProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<ContactCreate & ContactUpdate>;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (
    values: Partial<ContactCreate & ContactUpdate>,
  ) => Promise<void> | void;
}

function formatDetails(details: unknown): string | null {
  if (details === undefined || details === null) return null;
  if (Array.isArray(details))
    return details.map((d: any) => d?.message || String(d)).join("; ");
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details);
  } catch {
    return null;
  }
}

function formatApiError(e: ApiError): string {
  const body: any = e.body ?? e.details ?? {};
  const msg = body?.message || body?.error;
  if (msg) return msg;
  const details = body?.details ?? e.details;
  const formatted = formatDetails(details);
  return formatted ?? e.message ?? "Request failed";
}

export function formatError(e: unknown): string {
  if (e instanceof ApiError) return formatApiError(e);
  if (e instanceof Error) return e.message;
  if (e == null) return "Failed to submit";

  const primitiveToString = (v: unknown) => {
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "symbol") return v.toString();
    return null;
  };

  const prim = primitiveToString(e);
  if (prim !== null) return prim;

  try {
    return JSON.stringify(e);
  } catch {
    try {
      const t = (e as any)?.toString?.();
      if (typeof t === "string" && t !== "[object Object]") return t;
    } catch {
      /* ignore */
    }
    return "Failed to submit";
  }
}

const emptyValues: Partial<ContactCreate> = {
  name: "",
  email: "",
  phones: undefined,
  address: "",
  note: "",
};

export function useContactFormDialog(params: {
  initialValues?: Partial<ContactCreate & ContactUpdate>;
  onSubmit: (
    values: Partial<ContactCreate & ContactUpdate>,
  ) => Promise<void> | void;
}) {
  const { initialValues, onSubmit } = params;

  const [values, setValues] = useState<Partial<ContactCreate>>(emptyValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactCreate, string>>
  >({});
  const [nonFieldError, setNonFieldError] = useState<string | null>(null);

  useEffect(() => {
    const base = { ...emptyValues, ...(initialValues ?? {}) } as any;
    if (initialValues && (initialValues as any).phone && !base.phones) {
      base.phones = [
        {
          number: (initialValues as any).phone,
        },
      ];
    }
    if (Array.isArray(base.phones)) {
      base.phones = base.phones.map((p: any) => ({
        ...(p || {}),
        _tmpId:
          p?._tmpId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
    }
    setValues(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleChange =
    (field: keyof ContactCreate) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev: Partial<ContactCreate>) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handlePhoneFieldChange = useCallback(
    (index: number, field: string, value?: string) => {
      setValues((prev) => {
        const phones = Array.isArray((prev as any).phones)
          ? [...((prev as any).phones as any[])]
          : [];
        while (phones.length <= index) phones.push({ number: "" });
        const current = phones[index] ? phones[index][field] : undefined;
        if ((current ?? undefined) === (value ?? undefined)) return prev;
        phones[index] = { ...phones[index], [field]: value };
        return { ...prev, phones };
      });
    },
    [],
  );

  const handleAddPhone = useCallback(() => {
    setValues((prev) => {
      const phones = Array.isArray((prev as any).phones)
        ? [...((prev as any).phones as any[])]
        : [];
      phones.push({
        number: "",
        _tmpId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
      return { ...prev, phones };
    });
  }, []);

  const handleRemovePhone = useCallback((index: number) => {
    setValues((prev) => {
      const phones = Array.isArray((prev as any).phones)
        ? [...((prev as any).phones as any[])]
        : [];
      phones.splice(index, 1);
      return { ...prev, phones };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const payload: any = { ...values };
    if (payload.phone && !payload.phones) {
      payload.phones = [{ number: payload.phone }];
      delete payload.phone;
    }
    for (const key of ["email", "phone", "address", "note", "deletedAt"]) {
      if (
        payload[key] === "" ||
        payload[key] === undefined ||
        payload[key] === null ||
        (Array.isArray(payload[key]) && payload[key].length === 0)
      ) {
        delete payload[key];
      }
    }
    if (Array.isArray(payload.phones)) {
      payload.phones = payload.phones.map((p: any) => {
        if (!p || typeof p !== "object") return p;
        const { _tmpId, ...rest } = p;
        return rest;
      });
    }

    const result = ContactZ.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactCreate, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ContactCreate | undefined;
        if (path) {
          fieldErrors[path] = issue.message;
        } else {
          fieldErrors.name = issue.message;
          setNonFieldError(issue.message);
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setNonFieldError(null);
      await onSubmit(payload as Partial<ContactCreate & ContactUpdate>);
    } catch (err) {
      setNonFieldError(formatError(err));
      return;
    }
  };

  return {
    values,
    setValues,
    errors,
    nonFieldError,
    handleChange,
    handlePhoneFieldChange,
    handleAddPhone,
    handleRemovePhone,
    handleSubmit,
  } as const;
}
