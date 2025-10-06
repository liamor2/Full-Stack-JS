import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

type NotifyFn = (message: string, severity?: AlertColor, ms?: number) => void;

const NotificationContext = createContext<{ notify: NotifyFn } | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const [duration, setDuration] = useState<number | null>(4000);

  const notify = useCallback<NotifyFn>((msg, sev = "info", ms = 4000) => {
    setMessage(msg);
    setSeverity(sev);
    setDuration(ms ?? 4000);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration ?? 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx.notify;
}

export default NotificationContext;
