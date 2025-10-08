import type { Contact } from "@full-stack-js/shared";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import ContactsGrid from "./ContactsGrid.js";
import useAuth from "../hooks/useAuth.js";
import { findContacts } from "../api/contacts.js";

type ContactResponse = Contact;

interface Props {
  criteria?: Record<string, unknown> | null;
  pageSize?: number;
  pending?: boolean;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

const InfiniteContacts = ({
  criteria = null,
  pageSize = 15,
  pending = false,
  onDelete,
  onEdit,
}: Props) => {
  const { token } = useAuth();
  const [items, setItems] = useState<ContactResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (pageIndex: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const offset = pageIndex * pageSize;
        const payload = {
          ...(criteria ?? {}),
          limit: pageSize,
          offset,
        } as Record<string, unknown>;
        const res = await findContacts(payload, token ?? null);
        if (!Array.isArray(res)) {
          setHasMore(false);
          return;
        }
        setItems((prev) => {
          const merged = [...prev, ...res];
          const map = new Map<string, ContactResponse>();
          for (const c of merged) {
            const id = (c as any)._id ?? (c as any).id;
            if (!id) continue;
            if (!map.has(id)) map.set(id, c);
          }
          return Array.from(map.values());
        });
        if (res.length < pageSize) setHasMore(false);
      } catch (err) {
        console.error("Failed to load contacts page", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [criteria, pageSize, token],
  );

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, [criteria]);

  useEffect(() => {
    if (!hasMore) return;
    if (items.length === 0 && !loading) {
      void loadPage(0);
      setPage(1);
    }
  }, [items.length, hasMore, loadPage, loading]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loading && hasMore) {
          void loadPage(page);
          setPage((p) => p + 1);
        }
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadPage, loading, hasMore, page]);

  if (!items.length && loading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box>
      {items.length === 0 ? (
        <Typography variant="body1">No contacts found.</Typography>
      ) : (
        <ContactsGrid
          contacts={items}
          onDelete={onDelete}
          onEdit={onEdit}
          pending={pending}
        />
      )}

      <Box ref={sentinelRef} sx={{ height: 1 }} />

      <Stack alignItems="center" sx={{ py: 2 }}>
        {loading ? <CircularProgress size={20} /> : null}
        {!loading && hasMore ? (
          <Button
            onClick={() => {
              void loadPage(page);
              setPage((p) => p + 1);
            }}
          >
            Load more
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
};

export default InfiniteContacts;
