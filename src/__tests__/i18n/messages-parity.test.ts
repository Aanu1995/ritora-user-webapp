import enMessages from '../../../messages/en.json';
import svMessages from '../../../messages/sv.json';

type MessageNode = string | MessageTree;
type MessageTree = {
  [key: string]: MessageNode;
};

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

describe('schedule/timezone message parity', () => {
  it('keeps the English and Swedish feature keys aligned', () => {
    const englishKeys = collectFeatureKeys(enMessages);
    const swedishKeys = collectFeatureKeys(svMessages);

    const onlyEnglish = [...englishKeys]
      .filter((key) => !swedishKeys.has(key))
      .sort();
    const onlySwedish = [...swedishKeys]
      .filter((key) => !englishKeys.has(key))
      .sort();

    expect({ onlyEnglish, onlySwedish }).toEqual({
      onlyEnglish: [],
      onlySwedish: [],
    });
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
      'Smarta val är redo',
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
