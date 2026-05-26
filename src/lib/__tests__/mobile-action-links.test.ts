import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('mobile action link association files', () => {
  it('publishes the iOS universal link association for supported auth actions', () => {
    const body = readFileSync(
      join(process.cwd(), 'public/.well-known/apple-app-site-association'),
      'utf8',
    );
    const association = JSON.parse(body) as {
      applinks: { details: Array<{ appID: string; paths: string[] }> };
    };

    expect(association.applinks.details).toEqual([
      {
        appID: '63GXMB43YT.com.getritora.ritora',
        paths: [
          '/reset-password',
          '/reset-password/*',
          '/verify-email',
          '/verify-email/*',
        ],
      },
    ]);
  });

  it('publishes Android app link ownership for the Ritora app id', () => {
    const body = readFileSync(
      join(process.cwd(), 'public/.well-known/assetlinks.json'),
      'utf8',
    );
    const statements = JSON.parse(body) as Array<{
      relation: string[];
      target: {
        namespace: string;
        package_name: string;
        sha256_cert_fingerprints: string[];
      };
    }>;

    expect(statements).toEqual([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.getritora.ritora',
          sha256_cert_fingerprints: [
            '0E:76:E6:BB:7A:35:F8:D3:99:E6:A9:E2:D2:2B:EF:68:39:35:76:D4:A7:2D:4F:56:31:42:AE:6E:63:55:50:C0',
          ],
        },
      },
    ]);
  });

  it('serves action-token pages and association files with security headers', () => {
    const nextConfig = readFileSync(
      join(process.cwd(), 'next.config.ts'),
      'utf8',
    );

    expect(nextConfig).toContain(
      "source: '/.well-known/apple-app-site-association'",
    );
    expect(nextConfig).toContain("source: '/.well-known/assetlinks.json'");
    expect(nextConfig).toContain("source: '/reset-password/:token*'");
    expect(nextConfig).toContain("source: '/verify-email/:token*'");
    expect(nextConfig).toContain("value: 'no-referrer'");
    expect(nextConfig).toContain("value: 'application/json'");
  });
});
