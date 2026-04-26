import '@testing-library/jest-dom';
import React from 'react';
import defaultMessages from './messages/en.json';

type MessageLeaf = string | readonly MessageLeaf[] | MessageTree;
interface MessageTree {
  readonly [key: string]: MessageLeaf;
}

type IntlContextValue = {
  locale: string;
  messages: MessageTree;
};

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

  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

jest.mock('next-intl', () => ({
  useTranslations:
    (namespace?: string) => (key: string, values?: Record<string, string | number>) => {
      return formatMessage(
        resolveMessage(
          currentIntl.messages,
          namespace ? `${namespace}.${key}` : key,
        ),
        values,
      );
    },
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
