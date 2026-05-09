const mockToastLoading = jest.fn(() => "upload-toast");
const mockToastDismiss = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    loading: (...args: unknown[]) => mockToastLoading(...args),
    dismiss: (...args: unknown[]) => mockToastDismiss(...args),
  },
}));

import type { AxiosProgressEvent } from "axios";
import {
  UploadProgressToastKind,
  withUploadProgressToast,
} from "@/lib/upload-progress-toast";

function progressEvent(
  loaded: number,
  total: number | undefined,
  progress: number | undefined,
): AxiosProgressEvent {
  return {
    loaded,
    total,
    progress,
    bytes: loaded,
    lengthComputable: total !== undefined,
    upload: true,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("withUploadProgressToast", () => {
  it("updates the sonner toast with upload percentage and finalizing state", async () => {
    await expect(
      withUploadProgressToast(
        UploadProgressToastKind.ProductImage,
        async (onUploadProgress) => {
          onUploadProgress(progressEvent(50, 100, 0.5));
          onUploadProgress(progressEvent(100, 100, 1));
          return "done";
        },
      ),
    ).resolves.toBe("done");

    expect(mockToastLoading).toHaveBeenNthCalledWith(
      1,
      "Uploading product photo - 0%",
      { description: "Starting upload" },
    );
    expect(mockToastLoading).toHaveBeenNthCalledWith(
      2,
      "Uploading product photo - 50%",
      { id: "upload-toast", description: "50% uploaded" },
    );
    expect(mockToastLoading).toHaveBeenNthCalledWith(
      3,
      "Uploading product photo - 100%",
      { id: "upload-toast", description: "Finalizing photo" },
    );
    expect(mockToastDismiss).toHaveBeenCalledWith("upload-toast");
  });

  it("shows uploaded megabytes in the title when the browser does not provide a total size", async () => {
    await expect(
      withUploadProgressToast(
        UploadProgressToastKind.ProductPhotos,
        async (onUploadProgress) => {
          onUploadProgress(progressEvent(1024 * 1024, undefined, undefined));
          return "done";
        },
      ),
    ).resolves.toBe("done");

    expect(mockToastLoading).toHaveBeenNthCalledWith(
      1,
      "Uploading product photos - 0%",
      { description: "Starting upload" },
    );
    expect(mockToastLoading).toHaveBeenNthCalledWith(
      2,
      "Uploading product photos - 1.0 MB",
      { id: "upload-toast", description: "1.0 MB uploaded" },
    );
  });

  it("dismisses the progress toast when the upload task fails", async () => {
    await expect(
      withUploadProgressToast(
        UploadProgressToastKind.JournalPhoto,
        async (onUploadProgress) => {
          onUploadProgress(progressEvent(25, 100, 0.25));
          throw new Error("upload failed");
        },
      ),
    ).rejects.toThrow("upload failed");

    expect(mockToastDismiss).toHaveBeenCalledWith("upload-toast");
  });
});
