'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type FilePreviewSelection = {
  selectedFile: File | null;
  previewUrl: string | null;
  hasSelection: boolean;
  selectFile: (file: File | null) => void;
  clearSelection: () => void;
};

export function useFilePreviewSelection(): FilePreviewSelection {
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const clearSelection = useCallback(() => {
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = null;
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [revokePreviewUrl]);

  const selectFile = useCallback(
    (file: File | null) => {
      if (!file) {
        clearSelection();
        return;
      }

      revokePreviewUrl(previewUrlRef.current);
      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      setSelectedFile(file);
      setPreviewUrl(nextPreviewUrl);
    },
    [clearSelection, revokePreviewUrl],
  );

  useEffect(() => {
    return () => {
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [revokePreviewUrl]);

  return {
    selectedFile,
    previewUrl,
    hasSelection: selectedFile !== null,
    selectFile,
    clearSelection,
  };
}
