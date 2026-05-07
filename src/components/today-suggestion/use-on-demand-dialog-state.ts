"use client";

import { useState } from "react";

export function useOnDemandDialogState() {
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const openDialog = () => {
    setRequestId(createOnDemandRequestId());
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    setRequestId(null);
  };
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeDialog();
      return;
    }
    setRequestId((current) => current ?? createOnDemandRequestId());
    setOpen(true);
  };

  return {
    open,
    requestId,
    openDialog,
    closeDialog,
    handleOpenChange,
  };
}

function createOnDemandRequestId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `quick-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
