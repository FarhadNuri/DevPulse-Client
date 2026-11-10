import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

interface ConfirmContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ConfirmOptions>({
    title: "Confirm Action",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: string | ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      if (typeof options === "string") {
        setDialogState({
          title: "Confirm Action",
          message: options,
          confirmText: "Confirm",
          cancelText: "Cancel",
          variant: "danger",
        });
      } else {
        setDialogState({
          title: options.title || "Confirm Action",
          message: options.message,
          confirmText: options.confirmText || "Confirm",
          cancelText: options.cancelText || "Cancel",
          variant: options.variant || "danger",
        });
      }
      setOpen(true);
    });
  }, []);

  function handleConfirm() {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }

  function handleCancel() {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Custom Confirmation Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={handleCancel}
        >
          <div
            className="bg-bg-secondary border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCancel();
              if (e.key === "Enter") handleConfirm();
            }}
            tabIndex={-1}
          >
            {/* Header Icon + Title */}
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  dialogState.variant === "danger"
                    ? "bg-red-500/10 border-red-500/25 text-red-400"
                    : dialogState.variant === "warning"
                    ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                    : "bg-accent/10 border-accent/25 text-accent"
                }`}
              >
                {dialogState.variant === "danger" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : dialogState.variant === "warning" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-text-primary tracking-tight">
                  {dialogState.title}
                </h3>
                <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                  {dialogState.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/70">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border transition cursor-pointer font-medium"
              >
                {dialogState.cancelText}
              </button>

              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition shadow-sm cursor-pointer ${
                  dialogState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-500"
                    : dialogState.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-accent hover:bg-accent-hover"
                }`}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

