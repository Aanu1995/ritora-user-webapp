import '@testing-library/jest-dom';
import React from 'react';
import defaultMessages from './messages/en.json';

process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??= 'support@getritora.com';

type MessageLeaf = string | readonly MessageLeaf[] | MessageTree;
interface MessageTree {
  readonly [key: string]: MessageLeaf;
}

type IntlContextValue = {
  locale: string;
  messages: MessageTree;
};

type TranslationValues = Record<
  string,
  string | number | ((chunks: React.ReactNode) => React.ReactNode)
>;

let currentIntl: IntlContextValue = {
  locale: 'en',
  messages: defaultMessages as unknown as MessageTree,
};

function resolveMessage(messages: MessageTree, path: string): string {
  const value = path.split('.').reduce<MessageLeaf | undefined>(
    (current, key) =>
      current && typeof current === 'object' && !Array.isArray(current)
        ? (current as MessageTree)[key]
        : undefined,
    messages,
  );

  return typeof value === 'string' ? value : path;
}

function formatMessage(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) {
    return template;
  }

  const withPlurals = template.replace(
    /\{(\w+), plural, one \{([^{}]*)\} other \{([^{}]*)\}\}/g,
    (_match, key: string, one: string, other: string) => {
      const rawValue = values[key];
      const count = Number(rawValue);
      const templateValue = count === 1 ? one : other;
      return templateValue.replaceAll('#', String(rawValue));
    },
  );

  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
    withPlurals,
  );
}

function createTranslator(namespace?: string) {
  const resolve = (key: string) =>
    resolveMessage(
      currentIntl.messages,
      namespace ? `${namespace}.${key}` : key,
    );

  const translate = (key: string, values?: Record<string, string | number>) =>
    formatMessage(resolve(key), values);

  translate.rich = (key: string, values?: TranslationValues) => {
    const scalarValues = Object.fromEntries(
      Object.entries(values ?? {}).filter(
        (entry): entry is [string, string | number] =>
          typeof entry[1] !== 'function',
      ),
    );

    return formatMessage(resolve(key).replace(/<\/?[^>]+>/g, ''), scalarValues);
  };

  return translate;
}

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => createTranslator(namespace),
  useLocale: () => currentIntl.locale,
  NextIntlClientProvider: ({
    children,
    locale = 'en',
    messages = defaultMessages,
    }: {
      children: React.ReactNode;
      locale?: string;
      messages?: MessageTree;
    }) => {
      currentIntl = {
        locale,
        messages: (messages ?? defaultMessages) as MessageTree,
      };
      return children;
    },
}));

jest.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => (key: string, values?: Record<string, string | number>) =>
    formatMessage(
      resolveMessage(
        defaultMessages as unknown as MessageTree,
        namespace ? `${namespace}.${key}` : key,
      ),
      values,
    ),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!global.ResizeObserver) {
  Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

if (!global.PointerEvent) {
  class PointerEventMock extends MouseEvent {}

  Object.defineProperty(global, 'PointerEvent', {
    writable: true,
    configurable: true,
    value: PointerEventMock,
  });
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = jest.fn(() => false);
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = jest.fn();
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = jest.fn();
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}
