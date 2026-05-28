import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';
import svMessages from '../../../messages/sv.json';

type MessageNode = string | MessageTree;
type MessageTree = {
  [key: string]: MessageNode;
};

type LandingMessages = {
  landing: {
    howItWorks: {
      visuals: {
        shelf: {
          items: Array<{
            badgeTone?: string;
            shape: string;
            tone: string;
          }>;
        };
        dayPlan: {
          slots: Array<{
            daypart: string;
            state: string;
          }>;
        };
      };
    };
    features: {
      items: Array<{ key: string }>;
      visuals: {
        suggestions: {
          slots: Array<{
            daypart: string;
            state: string;
          }>;
        };
        smartPicks: {
          picks: Array<{
            shape: string;
            tierTone?: string;
            tone: string;
          }>;
        };
      };
    };
  };
};

const landingFeatureKeys = [
  'suggestions',
  'community',
  'journal',
  'ingredients',
  'quickCheck',
  'smartPicks',
  'shelf',
  'climate',
] as const;
const landingDayparts = ['morning', 'noon', 'evening'] as const;
const landingStates = ['ready', 'locked', 'done'] as const;
const bottleShapes = ['pump', 'dropper', 'tube', 'jar'] as const;
const bottleTones = [
  'green',
  'cream',
  'aqua',
  'blush',
  'amber',
  'lavender',
] as const;

function collectKeys(
  value: MessageNode,
  prefix = '',
  output: string[] = [],
): string[] {
  if (typeof value === 'string') {
    output.push(prefix);
    return output;
  }

  Object.entries(value).forEach(([key, child]) => {
    collectKeys(child, prefix ? `${prefix}.${key}` : key, output);
  });

  return output;
}

function collectFeatureKeys(messages: typeof enMessages): Set<string> {
  const featureMessages = {
    schedule: messages.schedule,
    settings: {
      timeZone: messages.settings.timeZone,
      timeZoneMismatch: messages.settings.timeZoneMismatch,
    },
    common: {
      close: messages.common.close,
      processing: messages.common.processing,
      timeZoneSelect: messages.common.timeZoneSelect,
    },
  } satisfies MessageTree;

  return new Set(collectKeys(featureMessages));
}

function expectAllowedValues(
  values: string[],
  allowedValues: readonly string[],
): void {
  expect(values.filter((value) => !allowedValues.includes(value))).toEqual([]);
}

function assertLandingStructuredTokens(messages: LandingMessages): void {
  expect(messages.landing.features.items.map((item) => item.key)).toEqual(
    landingFeatureKeys,
  );

  const shelfItems = messages.landing.howItWorks.visuals.shelf.items;
  expectAllowedValues(
    shelfItems.map((item) => item.shape),
    bottleShapes,
  );
  expectAllowedValues(
    shelfItems.map((item) => item.tone),
    bottleTones,
  );
  expectAllowedValues(
    shelfItems
      .map((item) => item.badgeTone)
      .filter((value): value is string => Boolean(value)),
    ['finished'],
  );

  const dayPlanSlots = messages.landing.howItWorks.visuals.dayPlan.slots;
  const suggestionSlots = messages.landing.features.visuals.suggestions.slots;
  expectAllowedValues(
    [...dayPlanSlots, ...suggestionSlots].map((slot) => slot.daypart),
    landingDayparts,
  );
  expectAllowedValues(
    [...dayPlanSlots, ...suggestionSlots].map((slot) => slot.state),
    landingStates,
  );

  const smartPicks = messages.landing.features.visuals.smartPicks.picks;
  expectAllowedValues(
    smartPicks.map((pick) => pick.shape),
    bottleShapes,
  );
  expectAllowedValues(
    smartPicks.map((pick) => pick.tone),
    bottleTones,
  );
  expectAllowedValues(
    smartPicks
      .map((pick) => pick.tierTone)
      .filter((value): value is string => Boolean(value)),
    ['mid', 'luxe'],
  );
}

describe('schedule/timezone message parity', () => {
  it('keeps the English, Swedish, and Spanish feature keys aligned', () => {
    const englishKeys = collectFeatureKeys(enMessages);
    const swedishKeys = collectFeatureKeys(svMessages);
    const spanishKeys = collectFeatureKeys(esMessages);

    const onlyEnglish = [...englishKeys]
      .filter((key) => !swedishKeys.has(key) || !spanishKeys.has(key))
      .sort();
    const onlySwedish = [...swedishKeys]
      .filter((key) => !englishKeys.has(key))
      .sort();
    const onlySpanish = [...spanishKeys]
      .filter((key) => !englishKeys.has(key))
      .sort();

    expect({ onlyEnglish, onlySwedish, onlySpanish }).toEqual({
      onlyEnglish: [],
      onlySwedish: [],
      onlySpanish: [],
    });
  });
});

describe('landing structured message tokens', () => {
  it('keeps render-control tokens unlocalized across languages', () => {
    assertLandingStructuredTokens(enMessages as LandingMessages);
    assertLandingStructuredTokens(svMessages as LandingMessages);
    assertLandingStructuredTokens(esMessages as LandingMessages);
  });
});

describe('Spanish visible copy localization', () => {
  it('localizes the language settings label', () => {
    expect(esMessages.settings.language.title).toBe('Idioma de visualización');
    expect(esMessages.settings.language.title).not.toBe(
      enMessages.settings.language.title,
    );
  });

  it('localizes shared settings timezone and notification copy', () => {
    expect(esMessages.settings.timeZone.current).toBe(
      'Zona horaria actual: {timeZone}',
    );
    expect(esMessages.settings.timeZone.deviceCurrent).toBe(
      'Este dispositivo está configurado en {timeZone}.',
    );
    expect(esMessages.settingsNotifications.leadTimeOption).toContain(
      '1 hora',
    );
    expect(esMessages.settingsNotifications.leadTimeOption).not.toContain(
      '1 hour',
    );
    expect(esMessages.settingsNotifications.quietHoursTzNote).toBe(
      'Las horas están en tu zona horaria · {timeZone}.',
    );
  });

  it('localizes dashboard greeting and climate metadata', () => {
    expect(esMessages.dashboard.greeting.morning).toBe(
      'Buenos días, {firstName}.',
    );
    expect(esMessages.dashboard.greeting.morning).not.toBe(
      enMessages.dashboard.greeting.morning,
    );
    expect(esMessages.currentContext.lastUpdated).toBe(
      'Última actualización {time}',
    );
    expect(esMessages.currentContext.lastUpdated).not.toBe(
      enMessages.currentContext.lastUpdated,
    );
    expect(esMessages.currentContext.weatherCondition.clear).toBe('Despejado');
    expect(esMessages.currentContext.weatherCondition.clear).not.toBe(
      enMessages.currentContext.weatherCondition.clear,
    );
  });
});

describe('Swedish navigation copy', () => {
  it('localizes the Community menu item', () => {
    expect(svMessages.sidebar.items.community).toBe('Gemenskap');
    expect(svMessages.sidebar.items.community).not.toBe(
      enMessages.sidebar.items.community,
    );
  });
});

describe('Swedish visible copy localization', () => {
  it.each([
    ['sidebar.navigation', svMessages.sidebar.navigation, 'Navigering'],
    ['sidebar.items.community', svMessages.sidebar.items.community, 'Gemenskap'],
    [
      'shelf.lookupWarning.community-data',
      svMessages.shelf.lookupWarning['community-data'],
      'Källan är gemenskapsbaserad',
    ],
    [
      'checkProduct.details.context.signals.skin_journal',
      svMessages.checkProduct.details.context.signals.skin_journal,
      'Huddagbok',
    ],
    [
      'checkProduct.result.nextActions.review_smart_picks',
      svMessages.checkProduct.result.nextActions.review_smart_picks,
      'Jämför med Smarta val innan du köper.',
    ],
    [
      'checkProduct.result.reasons.recent_journal_reaction',
      svMessages.checkProduct.result.reasons.recent_journal_reaction,
      'Nya huddagboksposter innehåller reaktionssignaler.',
    ],
    [
      'community.productEvidence.title',
      svMessages.community.productEvidence.title,
      'Gemenskapsbevis',
    ],
    [
      'community.forYou.patterns.similarUsers.title',
      svMessages.community.forYou.patterns.similarUsers.title,
      'Gemenskapsbevis rangordnas efter likhet, inte popularitet',
    ],
    [
      'community.forYou.patterns.routineContext.title',
      svMessages.community.forYou.patterns.routineContext.title,
      'Recensioner med rutinsammanhang rankas högre',
    ],
    [
      'community.forYou.patterns.safeFacets.title',
      svMessages.community.forYou.patterns.safeFacets.title,
      'Din privata profil förblir privat',
    ],
    [
      'community.submissions.title',
      svMessages.community.submissions.title,
      'Mina gemenskapsinlägg',
    ],
    [
      'community.eligibility.dialogTitle',
      svMessages.community.eligibility.dialogTitle,
      'Publicering i gemenskapen är inte tillgänglig ännu',
    ],
    [
      'community.toasts.guidelinesAccepted',
      svMessages.community.toasts.guidelinesAccepted,
      'Gemenskapsriktlinjer godkända.',
    ],
    [
      'settingsNotifications.smartPicksTitle',
      svMessages.settingsNotifications.smartPicksTitle,
      'Smarta val',
    ],
    [
      'settingsNotifications.smartPickReadyTitle',
      svMessages.settingsNotifications.smartPickReadyTitle,
      'Smarta val redo',
    ],
    [
      'notificationsPage.sourceSmartPicks',
      svMessages.notificationsPage.sourceSmartPicks,
      'Smarta val',
    ],
    ['smartPicks.page.title', svMessages.smartPicks.page.title, 'Smarta val'],
    [
      'smartPicks.page.mode.label',
      svMessages.smartPicks.page.mode.label,
      'Läge för Smarta val',
    ],
    [
      'smartPicks.page.wishlist.title',
      svMessages.smartPicks.page.wishlist.title,
      'Önskelista för Smarta val',
    ],
    [
      'journal.insightsTab.categories.essence',
      svMessages.journal.insightsTab.categories.essence,
      'essens',
    ],
    [
      'journal.insightsTab.categories.mask',
      svMessages.journal.insightsTab.categories.mask,
      'ansiktsmask',
    ],
  ] as const)('%s', (_key, actual, expected) => {
    expect(actual).toBe(expected);
  });
});
