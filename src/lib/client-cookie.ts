type ClientCookieOptions = {
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
};

function shouldUseSecureCookie(secure?: boolean): boolean {
  if (secure !== undefined) {
    return secure;
  }

  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setClientCookie(
  name: string,
  value: string,
  options: ClientCookieOptions = {},
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const segments = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? '/'}`,
    `SameSite=${options.sameSite ?? 'Lax'}`,
  ];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (shouldUseSecureCookie(options.secure)) {
    segments.push('Secure');
  }

  document.cookie = segments.join('; ');
}
