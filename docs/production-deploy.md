# User Web Production Deployment

The Ritora user web app runs on the `ritoraWeb` Hetzner VPS as a systemd
service. GitHub Actions uploads each release over SSH, installs dependencies,
builds the Next.js app with production public variables, and restarts the app.

## Server Setup

Run once on `ritoraWeb` as `root`.

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential ca-certificates
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

adduser --disabled-password --gecos "" deploy
mkdir -p /opt/ritora/user-web/releases /etc/ritora
chown -R deploy:deploy /opt/ritora/user-web
```

Create `/etc/ritora/user-web.env`:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.getritora.com/api/v1
NEXT_PUBLIC_SITE_URL=https://getritora.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@getritora.com
NEXT_PUBLIC_PRODUCT_MEDIA_URL=https://your-product-media-cloudfront-domain
```

Then secure it:

```bash
chown root:deploy /etc/ritora/user-web.env
chmod 640 /etc/ritora/user-web.env
```

Install the service:

```bash
cp deploy/ritora-user-web.service /etc/systemd/system/ritora-user-web.service
systemctl daemon-reload
systemctl enable ritora-user-web
```

Allow the deploy user to restart only this service:

```bash
cat >/etc/sudoers.d/ritora-user-web-deploy <<'EOF'
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart ritora-user-web, /usr/bin/systemctl is-active --quiet ritora-user-web, /usr/bin/systemctl status ritora-user-web
EOF
chmod 440 /etc/sudoers.d/ritora-user-web-deploy
visudo -c
```

## Caddy

The web server should proxy the root domain to the app:

```caddyfile
getritora.com {
  reverse_proxy 127.0.0.1:3000
}
```

## GitHub Secrets

Add these secrets to the user web repository production environment:

```text
HETZNER_WEB_HOST
HETZNER_WEB_USER
HETZNER_WEB_SSH_KEY
```

`HETZNER_WEB_USER` can be `deploy`.
