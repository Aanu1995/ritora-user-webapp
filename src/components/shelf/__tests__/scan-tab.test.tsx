import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ApiError } from "@/lib/api-error";
import {
  BarcodeScannerStatus,
  CatalogueSource,
  DataProvenance,
  LookupConfidence,
  ProductCategory,
} from "@/types/shelf";

const mockUseBarcodeScanner = jest.fn();
const mockUseResolveBarcodeMutation = jest.fn();

jest.mock("@/hooks/use-barcode-scanner", () => ({
  useBarcodeScanner: () => mockUseBarcodeScanner(),
}));

jest.mock("@/hooks/use-shelf", () => ({
  useResolveBarcodeMutation: () => mockUseResolveBarcodeMutation(),
}));

import { ScanTab } from "@/components/shelf/add-product/scan-tab";

beforeEach(() => {
  mockUseBarcodeScanner.mockReset();
  mockUseResolveBarcodeMutation.mockReset();
});

describe("ScanTab", () => {
  it("renders the explicit start state and fallback action", async () => {
    const user = userEvent.setup();
    const onSwitchToManual = jest.fn();
    const start = jest.fn();

    mockUseBarcodeScanner.mockReturnValue({
      detectedBarcode: null,
      error: null,
      isSupported: true,
      start,
      status: BarcodeScannerStatus.Inactive,
      videoRef: { current: null },
      retry: jest.fn(),
    });
    mockUseResolveBarcodeMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      reset: jest.fn(),
    });

    renderWithProviders(
      <ScanTab onResolved={jest.fn()} onSwitchToManual={onSwitchToManual} />,
    );

    expect(
      screen.getByText(/tap start to turn on the camera scanner/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start camera/i }));
    expect(start).toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: /try search instead/i }),
    );
    expect(onSwitchToManual).toHaveBeenCalled();
  });

  it("resolves a detected barcode and forwards the lookup result", async () => {
    const onResolved = jest.fn();
    const mutate = jest.fn(
      (
        _barcode: string,
        options?: {
          onSuccess?: (value: {
            identity: { brand: string; name: string };
            guidance: Record<string, never>;
            manufacturer: { brand: string };
            provenance: DataProvenance;
            source: CatalogueSource;
            confidence: LookupConfidence;
            reviewRequired: boolean;
            warnings: never[];
            evidence: never[];
          }) => void;
        },
      ) => {
        options?.onSuccess?.({
          identity: {
            brand: "CeraVe",
            name: "Resurfacing Retinol Serum",
            category: ProductCategory.Serum,
          },
          guidance: {},
          manufacturer: {
            brand: "CeraVe",
          },
          provenance: DataProvenance.BarcodeLookup,
          source: CatalogueSource.OpenBeautyFacts,
          confidence: LookupConfidence.Low,
          reviewRequired: true,
          warnings: [],
          evidence: [],
        });
      },
    );

    mockUseBarcodeScanner.mockReturnValue({
      detectedBarcode: "3337875597227",
      error: null,
      isSupported: true,
      start: jest.fn(),
      status: BarcodeScannerStatus.Detected,
      videoRef: { current: null },
      retry: jest.fn(),
    });
    mockUseResolveBarcodeMutation.mockReturnValue({
      mutate,
      isPending: false,
      reset: jest.fn(),
    });

    renderWithProviders(
      <ScanTab onResolved={onResolved} onSwitchToManual={jest.fn()} />,
    );

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        "3337875597227",
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    expect(screen.queryByText(/captured barcode/i)).not.toBeInTheDocument();
    expect(screen.queryByText("3337875597227")).not.toBeInTheDocument();

    expect(onResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: expect.objectContaining({
          brand: "CeraVe",
          name: "Resurfacing Retinol Serum",
        }),
        provenance: DataProvenance.BarcodeLookup,
        source: CatalogueSource.OpenBeautyFacts,
      }),
    );
  });

  it("shows the broader blocked-camera guidance when the browser cannot start a granted camera", () => {
    mockUseBarcodeScanner.mockReturnValue({
      detectedBarcode: null,
      error: null,
      isSupported: true,
      start: jest.fn(),
      status: BarcodeScannerStatus.SystemBlocked,
      videoRef: { current: null },
      retry: jest.fn(),
    });
    mockUseResolveBarcodeMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      reset: jest.fn(),
    });

    renderWithProviders(
      <ScanTab onResolved={jest.fn()} onSwitchToManual={jest.fn()} />,
    );

    expect(
      screen.getByText(
        /if site permission is already allowed, check your device privacy settings/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows a catalogue lookup message when barcode lookup fails without an HTTP response", async () => {
    const mutate = jest.fn(
      (
        _barcode: string,
        options?: {
          onError?: (error: unknown) => void;
        },
      ) => {
        options?.onError?.(new ApiError("Failed to fetch barcode lookup"));
      },
    );

    mockUseBarcodeScanner.mockReturnValue({
      detectedBarcode: "3337875597227",
      error: null,
      isSupported: true,
      start: jest.fn(),
      status: BarcodeScannerStatus.Detected,
      videoRef: { current: null },
      retry: jest.fn(),
    });
    mockUseResolveBarcodeMutation.mockReturnValue({
      mutate,
      isPending: false,
      reset: jest.fn(),
    });

    renderWithProviders(
      <ScanTab onResolved={jest.fn()} onSwitchToManual={jest.fn()} />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/catalogue lookup didn't complete/i),
      ).toBeInTheDocument();
    });
  });
});
