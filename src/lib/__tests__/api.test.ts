jest.mock("@/i18n/config", () => ({
  getPreferredLocale: jest.fn(() => "sv"),
}));

jest.mock("@/lib/time-zone", () => ({
  getBrowserTimeZone: jest.fn(() => "Europe/Stockholm"),
}));

import { AxiosHeaders } from "axios";
import {
  applyRequestContext,
  buildMultipartRequestConfig,
  getAccessToken,
  isAllowedApiRequestUrl,
  isDevSelfReferentialApiBase,
  isSecureApiRequestUrl,
  setAccessToken,
  setUnauthorizedHandler,
  shouldSendCredentialCookies,
  warnIfDevApiTargetsFrontend,
} from "@/lib/api";

describe("applyRequestContext", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    setAccessToken(null);
    setUnauthorizedHandler(null);
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it("adds the preferred locale, browser timezone, and auth token to requests", () => {
    setAccessToken("access-token");

    const config = applyRequestContext({
      headers: {},
      url: "/schedule",
      baseURL: "http://localhost:3001/api/v1",
    } as never);

    expect(config.headers["Accept-Language"]).toBe("sv");
    expect(config.headers["x-timezone"]).toBe("Europe/Stockholm");
    expect(config.headers["x-time-zone"]).toBe("Europe/Stockholm");
    expect(config.headers.Authorization).toBe("Bearer access-token");
  });

  it("blocks insecure absolute API transport in production", () => {
    process.env.NODE_ENV = "production";

    expect(() =>
      applyRequestContext({
        headers: {},
        url: "/auth/me",
        baseURL: "http://api.ritora.com/api/v1",
      } as never),
    ).toThrow("Blocked insecure API transport in production");
  });

  it("allows loopback HTTP API transport in production for local QA and e2e", () => {
    process.env.NODE_ENV = "production";

    const config = applyRequestContext({
      headers: {},
      url: "/auth/me",
      baseURL: "http://localhost:3001/api/v1",
    } as never);

    expect(config.baseURL).toBe("http://localhost:3001/api/v1");
  });

  it("allows only configured API origins and blocks cross-origin API requests", () => {
    expect(isAllowedApiRequestUrl("/auth/me")).toBe(true);
    expect(
      isAllowedApiRequestUrl(
        "http://localhost:3001/api/v1/auth/me",
        "http://localhost:3001/api/v1",
      ),
    ).toBe(true);
    expect(
      isAllowedApiRequestUrl(
        "https://evil.example/api/v1/auth/me",
        "https://api.ritora.com/api/v1",
      ),
    ).toBe(false);
    expect(isAllowedApiRequestUrl("https://api.ritora.com/auth", "notaurl")).toBe(
      false,
    );
  });

  it("checks production transport security without blocking relative paths", () => {
    process.env.NODE_ENV = "production";

    expect(isSecureApiRequestUrl("/auth/me")).toBe(true);
    expect(
      isSecureApiRequestUrl(
        "https://api.ritora.com/api/v1/auth/me",
        "https://api.ritora.com/api/v1",
      ),
    ).toBe(true);
    expect(
      isSecureApiRequestUrl(
        "http://api.ritora.com/api/v1/auth/me",
        "http://api.ritora.com/api/v1",
      ),
    ).toBe(false);
    expect(
      isSecureApiRequestUrl(
        "http://[::1]:3001/api/v1/auth/me",
        "http://[::1]:3001/api/v1",
      ),
    ).toBe(true);
    expect(isSecureApiRequestUrl("http://[", "http://[")).toBe(false);
  });

  it("limits credential cookies to auth and language endpoints", () => {
    expect(shouldSendCredentialCookies("/auth/login")).toBe(true);
    expect(shouldSendCredentialCookies("/auth/account")).toBe(true);
    expect(shouldSendCredentialCookies("/api/v1/auth/refresh")).toBe(true);
    expect(shouldSendCredentialCookies("/schedule")).toBe(false);
    expect(shouldSendCredentialCookies(undefined)).toBe(false);
  });

  it("tracks access token state and dev self-referential API warnings", () => {
    setAccessToken("access-token");
    expect(getAccessToken()).toBe("access-token");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();

    process.env.NODE_ENV = "test";
    expect(isDevSelfReferentialApiBase("http://localhost:3001")).toBe(false);
    process.env.NODE_ENV = "development";
    expect(isDevSelfReferentialApiBase("http://localhost:3001")).toBe(true);

    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    warnIfDevApiTargetsFrontend();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("buildMultipartRequestConfig", () => {
  it("prevents the JSON default content type from overriding FormData", () => {
    const config = buildMultipartRequestConfig({
      headers: {
        "Content-Type": "application/json",
        "X-Trace": "trace-1",
      },
      timeout: 30000,
    });

    expect(config.timeout).toBe(30000);
    expect(config.headers).toBeInstanceOf(AxiosHeaders);
    const headers = config.headers as AxiosHeaders;

    expect(headers.get("Content-Type")).toBe(false);
    expect(headers.get("X-Trace")).toBe("trace-1");
  });
});
