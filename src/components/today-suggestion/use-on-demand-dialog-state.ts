"use client";

import { useState } from "react";

let fallbackRequestCounter = 0;

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
  const cryptoObject = globalThis.crypto;
  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID();
  }
  if (cryptoObject?.getRandomValues) {
    const values = cryptoObject.getRandomValues(new Uint32Array(2));
    return `quick-${values[0].toString(36)}-${values[1].toString(36)}`;
  }
  fallbackRequestCounter += 1;
  return `quick-${fallbackRequestCounter.toString(36)}`;
}
