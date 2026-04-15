// Preserve Node.js 20+ native Fetch API globals before jest-environment-jsdom
// overwrites them. Required by MSW v2.
// Runs in setupFiles (before the test environment is created).
const { TextDecoder, TextEncoder } = require('node:util');

const nodeGlobals = {
  fetch: globalThis.fetch,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  FormData: globalThis.FormData,
  Blob: globalThis.Blob,
  ReadableStream: globalThis.ReadableStream,
  structuredClone: globalThis.structuredClone,
};

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  fetch: { value: nodeGlobals.fetch, writable: true },
  Request: { value: nodeGlobals.Request, configurable: true },
  Response: { value: nodeGlobals.Response, configurable: true },
  Headers: { value: nodeGlobals.Headers },
  FormData: { value: nodeGlobals.FormData },
  Blob: { value: nodeGlobals.Blob },
  ReadableStream: { value: nodeGlobals.ReadableStream },
  structuredClone: { value: nodeGlobals.structuredClone },
});
