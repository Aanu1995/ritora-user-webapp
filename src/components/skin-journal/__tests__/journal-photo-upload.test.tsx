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
        angle="head_on"
        onAngleChange={jest.fn()}
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

  it('releases the preview object URL when the parent clears the selected photo', async () => {
    const onPhotoChange = jest.fn();
    const file = new File(['face'], 'face.jpg', { type: 'image/jpeg' });

    const { rerender } = renderWithProviders(
      <JournalPhotoUpload
        photo={null}
        onPhotoChange={onPhotoChange}
        angle="head_on"
        onAngleChange={jest.fn()}
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
        angle="head_on"
        onAngleChange={jest.fn()}
        isPreRoutine
        onPreRoutineChange={jest.fn()}
      />,
    );

    rerender(
      <JournalPhotoUpload
        photo={null}
        onPhotoChange={onPhotoChange}
        angle="head_on"
        onAngleChange={jest.fn()}
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
});
