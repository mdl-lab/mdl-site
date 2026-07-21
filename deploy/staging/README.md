# Basic-auth staging (tamagotake)

For design previews before the public launch. GitHub Pages cannot do Basic
authentication, so access-restricted previews are served here instead (same
nginx + Basic auth pattern as kpro).

Layout: `staging.mdl.comp.isct.ac.jp` → host nginx (443, certbot) → 127.0.0.1:8095 →
an nginx:alpine container serving a checkout of this repository.

## Initial setup (on tamagotake)

```bash
# 1. Place the repository
sudo mkdir -p /opt/mdl-site && sudo chown "$USER" /opt/mdl-site
git clone https://github.com/mdl-lab/mdl-site.git /opt/mdl-site

# 2. Create the Basic auth user (you will be prompted for a password)
sudo apt-get install -y apache2-utils
htpasswd -c /opt/mdl-site/deploy/staging/htpasswd mdl

# 3. Start the container
cd /opt/mdl-site/deploy/staging && sudo docker compose up -d
curl -s http://127.0.0.1:8095/healthz   # → ok

# 4. Add the virtual host to the host nginx
sudo cp /opt/mdl-site/deploy/staging/staging.mdl.comp.isct.ac.jp.conf \
        /etc/nginx/sites-available/mdl-staging
sudo ln -s /etc/nginx/sites-available/mdl-staging /etc/nginx/sites-enabled/mdl-staging
sudo nginx -t && sudo systemctl reload nginx

# 5. DNS: point an A record for staging.mdl.comp.isct.ac.jp at 131.112.16.160

# 6. Obtain a certificate (after DNS propagates)
sudo certbot --nginx -d staging.mdl.comp.isct.ac.jp
```

## Updating the preview

Staging serves the checkout directly, so just pull:

```bash
cd /opt/mdl-site && git pull
```

To automate, add to crontab (every 5 minutes):

```
*/5 * * * * cd /opt/mdl-site && git pull -q
```

## Decommissioning (after launch)

```bash
cd /opt/mdl-site/deploy/staging && sudo docker compose down
sudo rm /etc/nginx/sites-enabled/mdl-staging && sudo nginx -t && sudo systemctl reload nginx
```

Also remove the staging DNS record and `/opt/mdl-site` if no longer needed.

## Notes

- Never commit the `htpasswd` file (already in `.gitignore`)
- This is only an **access-restricted preview**. While the repository is public,
  the source remains readable by anyone (never commit unpublished material to main)
