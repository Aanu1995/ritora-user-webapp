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
