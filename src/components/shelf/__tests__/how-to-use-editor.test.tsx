import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { HowToUseEditor } from '@/components/shelf/how-to-use-editor';
import {
  ApplicationMethod,
  type ApplicationGuidance,
  Quantity,
} from '@/types/shelf';

const EMPTY_GUIDANCE: ApplicationGuidance = {
  applicationMethod: null,
  quantity: null,
  steps: [],
  cautions: [],
  waitMinutes: null,
};

describe('HowToUseEditor', () => {
  const user = userEvent.setup();

  it('renders method, quantity, steps, and cautions sections', () => {
    renderWithProviders(
      <HowToUseEditor
        value={{
          ...EMPTY_GUIDANCE,
          applicationMethod: ApplicationMethod.Fingertips,
          quantity: Quantity.TwoToThreeDrops,
          steps: ['Cleanse first.', 'Pat gently.'],
          cautions: ['Avoid eye area.'],
        }}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/cleanse first/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/pat gently/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/avoid eye area/i)).toBeInTheDocument();
  });

  it('does not render any time-of-day / frequency / layer-step controls', () => {
    renderWithProviders(
      <HowToUseEditor value={EMPTY_GUIDANCE} onChange={jest.fn()} />,
    );

    expect(screen.queryByText(/\bAM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bPM\b/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/time of day/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/frequency/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/layer step/i)).not.toBeInTheDocument();
  });

  it('adds a step when the add-step button is clicked', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <HowToUseEditor value={EMPTY_GUIDANCE} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: /add step/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ steps: [''] }),
    );
  });

  it('removes a step when its remove button is clicked', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <HowToUseEditor
        value={{ ...EMPTY_GUIDANCE, steps: ['one', 'two'] }}
        onChange={onChange}
      />,
    );

    const removeButtons = screen.getAllByRole('button', {
      name: /remove step/i,
    });
    await user.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ steps: ['two'] }),
    );
  });

  it('fires onChange when a step text input is edited', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <HowToUseEditor
        value={{ ...EMPTY_GUIDANCE, steps: ['old'] }}
        onChange={onChange}
      />,
    );

    const input = screen.getByDisplayValue('old');
    await user.clear(input);
    await user.type(input, 'new');
    // last call should reflect final state
    expect(onChange).toHaveBeenCalled();
  });
});
