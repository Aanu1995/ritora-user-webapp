import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { JournalPhotoUpload } from '../journal-photo-upload';

describe('JournalPhotoUpload', () => {
  beforeEach(() => {
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
        photo={new File(['face'], 'face.jpg', { type: 'image/jpeg' })}
        onPhotoChange={jest.fn()}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
        photoProcessingConsent={false}
        onPhotoProcessingConsentChange={onConsentChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /encrypted at rest/i,
    });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(onConsentChange).toHaveBeenCalledWith(true);
  });

  it('shows the current journal photo in edit mode before a replacement is selected', () => {
    renderWithProviders(
      <JournalPhotoUpload
        photo={null}
        existingPhotoUrl="https://example.com/current.webp"
        existingPhotoAlt="Current journal photo"
        onPhotoChange={jest.fn()}
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
        photo={null}
        onPhotoChange={onPhotoChange}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInstanceOf(HTMLInputElement);

    fireEvent.change(input as HTMLInputElement, {
      target: { files: [file] },
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);

    rerender(
      <JournalPhotoUpload
        photo={file}
        onPhotoChange={onPhotoChange}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    rerender(
      <JournalPhotoUpload
        photo={null}
        onPhotoChange={onPhotoChange}
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
        photo={null}
        onPhotoChange={jest.fn()}
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
        photo={null}
        onPhotoChange={onPhotoChange}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input as HTMLInputElement, {
      target: { files: [invalidFile] },
    });

    expect(screen.getByText(/choose a jpg/i)).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(onPhotoChange).toHaveBeenCalledWith(null);
  });
});
