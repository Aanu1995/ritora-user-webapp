import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProviders } from '@/test/utils';
import { cropImageFileToSquare } from '@/components/skin-journal/crop-image-file';
import { JournalPhotoUpload } from '../journal-photo-upload';

jest.mock('@/components/skin-journal/crop-image-file', () => ({
  cropImageFileToSquare: jest.fn(),
}));

function getFrontFileInput(): HTMLInputElement {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
  const input = document.querySelector<HTMLInputElement>(
    'input[data-angle="head_on"]',
  );
  expect(inputs).toHaveLength(3);
  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
}

describe('JournalPhotoUpload', () => {
  beforeEach(() => {
    jest.mocked(cropImageFileToSquare).mockReset();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn(() => 'blob:skin-journal-photo'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    });
  });

  it('requires explicit skin-progress processing consent when a photo is selected', () => {
    const onConsentChange = jest.fn();

    renderWithProviders(
      <JournalPhotoUpload
        photos={{
          head_on: new File(['face'], 'face.jpg', { type: 'image/jpeg' }),
        }}
        onPhotoAngleChange={jest.fn()}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
        photoProcessingConsent={false}
        onPhotoProcessingConsentChange={onConsentChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /analysis/i });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(onConsentChange).toHaveBeenCalledWith(true);
  });

  it('shows the current journal photo in edit mode before a replacement is selected', () => {
    renderWithProviders(
      <JournalPhotoUpload
        photos={{}}
        existingPhotos={[
          {
            angle: 'head_on',
            photo_url: 'https://example.com/current.webp',
            width: null,
            height: null,
          },
        ]}
        existingPhotoAlt="Current journal photo"
        onPhotoAngleChange={jest.fn()}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('img', { name: /current journal photo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /replace/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /tap to choose a photo/i }),
    ).not.toBeInTheDocument();
  });

  it('releases the preview object URL when the parent clears the selected photo', async () => {
    const onPhotoChange = jest.fn();
    const file = new File(['face'], 'face.jpg', { type: 'image/jpeg' });

    const { rerender } = renderWithProviders(
      <JournalPhotoUpload
        photos={{}}
        onPhotoAngleChange={(_angle, nextPhoto) => onPhotoChange(nextPhoto)}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    const input = getFrontFileInput();

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);

    rerender(
      <JournalPhotoUpload
        photos={{ head_on: file }}
        onPhotoAngleChange={(_angle, nextPhoto) => onPhotoChange(nextPhoto)}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    rerender(
      <JournalPhotoUpload
        photos={{}}
        onPhotoAngleChange={(_angle, nextPhoto) => onPhotoChange(nextPhoto)}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(
        'blob:skin-journal-photo',
      ),
    );
  });

  it('does not render angle selection controls in the photo flow', () => {
    renderWithProviders(
      <JournalPhotoUpload
        photos={{}}
        onPhotoAngleChange={jest.fn()}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    expect(screen.queryByText(/angle/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /head-on/i }),
    ).not.toBeInTheDocument();
  });

  it('validates selected photo type before creating a preview', () => {
    const onPhotoChange = jest.fn();
    const invalidFile = new File(['not-a-photo'], 'notes.txt', {
      type: 'text/plain',
    });

    renderWithProviders(
      <JournalPhotoUpload
        photos={{}}
        onPhotoAngleChange={(_angle, nextPhoto) => onPhotoChange(nextPhoto)}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [invalidFile] },
    });

    expect(screen.getByText(/choose a jpg/i)).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(onPhotoChange).not.toHaveBeenCalled();
  });

  it('keeps the current selected photo when a replacement fails validation', () => {
    const onPhotoChange = jest.fn();
    const validFile = new File(['face'], 'face.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['not-a-photo'], 'notes.txt', {
      type: 'text/plain',
    });

    function TestUploader() {
      const [photos, setPhotos] = useState<{ head_on?: File | null }>({});
      const handlePhotoChange = (nextPhoto: File | null) => {
        onPhotoChange(nextPhoto);
        setPhotos({ head_on: nextPhoto });
      };

      return (
        <JournalPhotoUpload
          photos={photos}
          onPhotoAngleChange={(_angle, nextPhoto) =>
            handlePhotoChange(nextPhoto)
          }
          isPreRoutine
          onPreRoutineChange={jest.fn()}
        />
      );
    }

    renderWithProviders(<TestUploader />);

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [validFile] },
    });

    expect(onPhotoChange).toHaveBeenCalledWith(validFile);
    expect(
      screen.getByRole('img', { name: /front journal photo/i }),
    ).toBeInTheDocument();

    onPhotoChange.mockClear();
    jest.mocked(URL.revokeObjectURL).mockClear();

    fireEvent.change(input, {
      target: { files: [invalidFile] },
    });

    expect(screen.getByText(/choose a jpg/i)).toBeInTheDocument();
    expect(onPhotoChange).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(
      'blob:skin-journal-photo',
    );
    expect(
      screen.getByRole('img', { name: /front journal photo/i }),
    ).toBeInTheDocument();
  });

  it('lets the user crop a selected photo before upload', async () => {
    const user = userEvent.setup();
    const onPhotoChange = jest.fn();
    const originalFile = new File(['wide-face'], 'wide-face.jpg', {
      type: 'image/jpeg',
    });
    const croppedFile = new File(['cropped-face'], 'wide-face-cropped.webp', {
      type: 'image/webp',
    });
    jest.mocked(cropImageFileToSquare).mockResolvedValue(croppedFile);

    function TestUploader() {
      const [photos, setPhotos] = useState<{ head_on?: File | null }>({});
      const handlePhotoChange = (nextPhoto: File | null) => {
        onPhotoChange(nextPhoto);
        setPhotos({ head_on: nextPhoto });
      };

      return (
        <JournalPhotoUpload
          photos={photos}
          onPhotoAngleChange={(_angle, nextPhoto) =>
            handlePhotoChange(nextPhoto)
          }
          isPreRoutine
          onPreRoutineChange={jest.fn()}
        />
      );
    }

    renderWithProviders(<TestUploader />);

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [originalFile] },
    });

    await user.click(screen.getByRole('button', { name: /crop photo/i }));

    expect(
      screen.getByRole('heading', { name: /crop photo/i }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/zoom/i), {
      target: { value: '1.5' },
    });
    fireEvent.change(screen.getByLabelText(/move left or right/i), {
      target: { value: '20' },
    });

    await user.click(screen.getByRole('button', { name: /^apply$/i }));

    await waitFor(() =>
      expect(cropImageFileToSquare).toHaveBeenCalledWith(
        originalFile,
        'blob:skin-journal-photo',
        expect.objectContaining({
          zoom: 1.5,
          offsetX: 20,
        }),
      ),
    );
    expect(onPhotoChange).toHaveBeenLastCalledWith(croppedFile);
  });

  it('lets the user drag the crop preview to reposition the photo', async () => {
    const user = userEvent.setup();
    const onPhotoChange = jest.fn();
    const originalFile = new File(['wide-face'], 'wide-face.jpg', {
      type: 'image/jpeg',
    });
    const croppedFile = new File(['cropped-face'], 'wide-face-cropped.webp', {
      type: 'image/webp',
    });
    jest.mocked(cropImageFileToSquare).mockResolvedValue(croppedFile);

    function TestUploader() {
      const [photos, setPhotos] = useState<{ head_on?: File | null }>({});
      const handlePhotoChange = (nextPhoto: File | null) => {
        onPhotoChange(nextPhoto);
        setPhotos({ head_on: nextPhoto });
      };

      return (
        <JournalPhotoUpload
          photos={photos}
          onPhotoAngleChange={(_angle, nextPhoto) =>
            handlePhotoChange(nextPhoto)
          }
          isPreRoutine
          onPreRoutineChange={jest.fn()}
        />
      );
    }

    renderWithProviders(<TestUploader />);

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [originalFile] },
    });

    await user.click(screen.getByRole('button', { name: /crop photo/i }));

    const dragSurface = screen.getByLabelText(/drag photo to adjust crop/i);
    fireEvent.pointerDown(dragSurface, {
      clientX: 50,
      clientY: 50,
      pointerId: 1,
    });
    fireEvent.pointerMove(dragSurface, {
      clientX: 90,
      clientY: 30,
      pointerId: 1,
    });
    fireEvent.pointerUp(dragSurface, { pointerId: 1 });

    await user.click(screen.getByRole('button', { name: /^apply$/i }));

    await waitFor(() =>
      expect(cropImageFileToSquare).toHaveBeenCalledWith(
        originalFile,
        'blob:skin-journal-photo',
        expect.objectContaining({
          offsetX: 20,
          offsetY: -10,
        }),
      ),
    );
  });

  it('lets the user zoom the crop preview directly', async () => {
    const user = userEvent.setup();
    const originalFile = new File(['wide-face'], 'wide-face.jpg', {
      type: 'image/jpeg',
    });
    const croppedFile = new File(['cropped-face'], 'wide-face-cropped.webp', {
      type: 'image/webp',
    });
    jest.mocked(cropImageFileToSquare).mockResolvedValue(croppedFile);

    function TestUploader() {
      const [photos, setPhotos] = useState<{ head_on?: File | null }>({});

      return (
        <JournalPhotoUpload
          photos={photos}
          onPhotoAngleChange={(_angle, nextPhoto) =>
            setPhotos({ head_on: nextPhoto })
          }
          isPreRoutine
          onPreRoutineChange={jest.fn()}
        />
      );
    }

    renderWithProviders(<TestUploader />);

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [originalFile] },
    });

    await user.click(screen.getByRole('button', { name: /crop photo/i }));

    fireEvent.wheel(screen.getByLabelText(/drag photo to adjust crop/i), {
      deltaY: -120,
    });

    await user.click(screen.getByRole('button', { name: /^apply$/i }));

    await waitFor(() =>
      expect(cropImageFileToSquare).toHaveBeenCalledWith(
        originalFile,
        'blob:skin-journal-photo',
        expect.objectContaining({
          zoom: 1.1,
        }),
      ),
    );
  });

  it('ignores an in-flight crop result after the uploader unmounts', async () => {
    const user = userEvent.setup();
    const onPhotoChange = jest.fn();
    const originalFile = new File(['wide-face'], 'wide-face.jpg', {
      type: 'image/jpeg',
    });
    const croppedFile = new File(['cropped-face'], 'wide-face-cropped.webp', {
      type: 'image/webp',
    });
    let resolveCrop!: (file: File) => void;
    jest.mocked(cropImageFileToSquare).mockImplementation(
      () =>
        new Promise<File>((resolve) => {
          resolveCrop = resolve;
        }),
    );

    function TestUploader() {
      const [photos, setPhotos] = useState<{ head_on?: File | null }>({});
      const handlePhotoChange = (nextPhoto: File | null) => {
        onPhotoChange(nextPhoto);
        setPhotos({ head_on: nextPhoto });
      };

      return (
        <JournalPhotoUpload
          photos={photos}
          onPhotoAngleChange={(_angle, nextPhoto) =>
            handlePhotoChange(nextPhoto)
          }
          isPreRoutine
          onPreRoutineChange={jest.fn()}
        />
      );
    }

    const { unmount } = renderWithProviders(<TestUploader />);

    const input = getFrontFileInput();
    fireEvent.change(input, {
      target: { files: [originalFile] },
    });

    await user.click(screen.getByRole('button', { name: /crop photo/i }));
    await user.click(screen.getByRole('button', { name: /^apply$/i }));

    unmount();

    await act(async () => {
      resolveCrop(croppedFile);
      await Promise.resolve();
    });

    expect(onPhotoChange).toHaveBeenCalledTimes(1);
    const [selectedPhoto] = onPhotoChange.mock.calls[0] as [File];
    expect(selectedPhoto.name).toBe(originalFile.name);
  });
});
