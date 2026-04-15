import '@testing-library/jest-dom';
import React from 'react';
import messages from './messages/en.json';

type MessageLeaf = string | readonly MessageLeaf[] | MessageTree;
interface MessageTree {
  readonly [key: string]: MessageLeaf;
}

function resolveMessage(path: string): string {
  const value = path.split('.').reduce<MessageLeaf | undefined>(
    (current, key) =>
      current && typeof current === 'object' && !Array.isArray(current)
        ? (current as MessageTree)[key]
        : undefined,
    messages as unknown as MessageTree,
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
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) =>
    formatMessage(resolveMessage(namespace ? `${namespace}.${key}` : key), values),
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next-intl/server', () => ({
  getTranslations: async (namespace?: string) => (key: string, values?: Record<string, string | number>) =>
    formatMessage(resolveMessage(namespace ? `${namespace}.${key}` : key), values),
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
