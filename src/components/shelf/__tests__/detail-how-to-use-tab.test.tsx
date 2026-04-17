import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DetailHowToUseTab } from '@/components/shelf/detail/detail-how-to-use-tab';
import {
  ApplicationMethod,
  type ApplicationGuidance,
  PreferredTimeOfDay,
  Quantity,
} from '@/types/shelf';

const FULL: ApplicationGuidance = {
  applicationMethod: ApplicationMethod.Fingertips,
  quantity: Quantity.TwoToThreeDrops,
  steps: ['Cleanse first.', 'Pat gently.', 'Follow with moisturiser.'],
  cautions: ['Avoid eye area.', 'Use SPF during the day.'],
  waitMinutes: null,
};

describe('DetailHowToUseTab', () => {
  it('renders method, quantity, steps as an ordered list, and cautions', () => {
    renderWithProviders(
      <DetailHowToUseTab guidance={FULL} preferredTimeOfDay={null} />,
    );

    expect(screen.getByText(/fingertips/i)).toBeInTheDocument();
    expect(screen.getByText(/two to three drops/i)).toBeInTheDocument();
    expect(screen.getByText(/cleanse first/i)).toBeInTheDocument();
    expect(screen.getByText(/avoid eye area/i)).toBeInTheDocument();
    expect(screen.getByText(/use spf during the day/i)).toBeInTheDocument();
  });

  it('does not render any AM / PM / step chips', () => {
    renderWithProviders(
      <DetailHowToUseTab guidance={FULL} preferredTimeOfDay={null} />,
    );

    expect(screen.queryByText(/\bAM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bPM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^step \d+ of/i)).not.toBeInTheDocument();
  });

  it('renders the empty-state hint when guidance is empty', () => {
    renderWithProviders(
      <DetailHowToUseTab
        guidance={{
          applicationMethod: null,
          quantity: null,
          steps: [],
          cautions: [],
          waitMinutes: null,
        }}
        preferredTimeOfDay={null}
      />,
    );

    expect(screen.getByText(/no instructions yet/i)).toBeInTheDocument();
  });

  it('renders the wait-minutes line when present', () => {
    renderWithProviders(
      <DetailHowToUseTab
        guidance={{ ...FULL, waitMinutes: 10 }}
        preferredTimeOfDay={null}
      />,
    );

    expect(screen.getByText(/leave on for 10 minutes/i)).toBeInTheDocument();
  });

  it('renders the optional preferred-time hint when set', () => {
    renderWithProviders(
      <DetailHowToUseTab
        guidance={FULL}
        preferredTimeOfDay={PreferredTimeOfDay.Evening}
      />,
    );

    expect(
      screen.getByText(/prefer to use this in the evening/i),
    ).toBeInTheDocument();
  });
});
