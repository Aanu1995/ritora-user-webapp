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

describe('schedule message parity', () => {
  it('keeps the English and Swedish schedule keys aligned', () => {
    const englishKeys = new Set(collectKeys(enMessages.schedule as MessageTree));
    const swedishKeys = new Set(collectKeys(svMessages.schedule as MessageTree));

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
