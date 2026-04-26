const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const PRIVATE_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.localhost',
] as const;
const API_MEDIA_PATH_PREFIX = '/media/';

export function isSafeExternalUrl(value: string): boolean {
  return isSafeHttpUrl(value, { allowConfiguredApiMedia: false });
}

export function isSafeProductImageUrl(value: string): boolean {
  return isSafeHttpUrl(value, { allowConfiguredApiMedia: true });
}

function getConfiguredApiOrigin(): string | null {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
    ).origin;
  } catch {
    return null;
  }
}

function isSafeHttpUrl(
  value: string,
  options: { allowConfiguredApiMedia: boolean },
): boolean {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();

    if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }

    if (!hostname || parsed.username || parsed.password) {
      return false;
    }

    if (
      options.allowConfiguredApiMedia &&
      parsed.pathname.startsWith(API_MEDIA_PATH_PREFIX) &&
      parsed.origin === getConfiguredApiOrigin()
    ) {
      return true;
    }

    if (
      hostname === 'localhost' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname === '0:0:0:0:0:0:0:1'
    ) {
      return false;
    }

    if (PRIVATE_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
      return false;
    }

    if (isPrivateIpv4(hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.');

  if (parts.length !== 4 || !parts.every((part) => /^\d+$/.test(part))) {
    return false;
  }

  const octets = parts.map((part) => Number(part));
  const [first, second] = octets;

  if (octets.some((octet) => octet < 0 || octet > 255)) {
    return true;
  }

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}
