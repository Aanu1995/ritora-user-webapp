import { http, HttpResponse } from "msw";
import {
  mockSkinProfileAccessLogs,
  mockSkinProfile,
  mockSkinProfileOptions,
} from "@/test/skin-profile-fixtures";
import type { SkinProfileInput } from "@/types/skin-profile";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  preferredLanguage: "en",
  createdAt: "2024-01-01T00:00:00.000Z",
};

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "test@example.com" && body.password === "TestPass1") {
      return HttpResponse.json({
        accessToken: "mock-access-token",
        user: mockUser,
      });
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.post(`${API}/auth/register`, () => {
    return HttpResponse.json(
      {
        accessToken: "mock-access-token",
        user: { ...mockUser, emailVerified: false },
      },
      { status: 201 },
    );
  }),

  http.post(`${API}/auth/google`, () => {
    return HttpResponse.json({
      accessToken: "mock-access-token",
      user: mockUser,
    });
  }),

  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({ accessToken: "mock-refreshed-token" });
  }),

  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out" });
  }),

  http.post(`${API}/auth/logout-all`, () => {
    return HttpResponse.json({ message: "All sessions revoked" });
  }),

  http.get(`${API}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.get(`${API}/auth/sessions`, () => {
    return HttpResponse.json([
      {
        id: "session-1",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastUsedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
  }),

  http.post(`${API}/auth/verify-email`, () => {
    return HttpResponse.json({ message: "Email verified successfully" });
  }),

  http.post(`${API}/auth/resend-verification`, () => {
    return HttpResponse.json({ message: "Verification link sent" });
  }),

  http.post(`${API}/auth/forgot-password`, () => {
    return HttpResponse.json({ message: "Reset link sent" });
  }),

  http.post(`${API}/auth/reset-password`, () => {
    return HttpResponse.json({ message: "Password reset successfully" });
  }),

  http.get(`${API}/skin-profile`, () => {
    return HttpResponse.json(mockSkinProfile);
  }),

  http.get(`${API}/skin-profile/options`, () => {
    return HttpResponse.json(mockSkinProfileOptions);
  }),

  http.get(`${API}/skin-profile/access-logs`, () => {
    return HttpResponse.json(mockSkinProfileAccessLogs);
  }),

  http.post(`${API}/skin-profile`, async ({ request }) => {
    const body = (await request.json()) as Partial<SkinProfileInput>;
    return HttpResponse.json(
      { ...mockSkinProfile, ...body, id: "new-profile-1" },
      { status: 201 },
    );
  }),

  http.patch(`${API}/skin-profile`, async ({ request }) => {
    const body = (await request.json()) as Partial<SkinProfileInput>;
    return HttpResponse.json({ ...mockSkinProfile, ...body });
  }),
];
