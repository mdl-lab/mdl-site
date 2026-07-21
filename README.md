# mdl-site

Repository for the MDL lab website (https://mdl.comp.isct.ac.jp).

## Architecture

- **Hosting**: GitHub Pages (serves the root of the `main` branch as-is; no build step)
- **Domain**: `mdl.comp.isct.ac.jp` (set via the `CNAME` file + the repository's Pages settings)
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (Decap CMS compatible; edit in the browser at `/admin/` → commits directly to this repository)

```
index.html              … Top page (currently a placeholder redirect; replace freely)
CNAME                   … Custom domain for GitHub Pages (do not delete)
.nojekyll               … Disables Jekyll processing (serves plain HTML)
robots.txt              … Currently denies all crawlers (replace at launch)
admin/index.html        … Loads Sveltia CMS
admin/config.yml        … CMS configuration (Decap-compatible format; collections are placeholders)
content/news/           … News posts (Markdown, managed by the CMS)
content/publications/   … Publication entries (Markdown, managed by the CMS)
assets/uploads/         … Images etc. uploaded via the CMS
deploy/staging/         … Basic-auth staging environment for tamagotake (optional)
```

## CMS authentication (no OAuth relay)

No OAuth relay server is used. On the `/admin/` login screen, each editor chooses
**"Sign In with Token"** and logs in with their own GitHub Personal Access Token.

- Only GitHub accounts with **write access to this repository** can edit
- The login screen links to GitHub's token-generation page with the required scopes
  pre-selected (use a fine-grained token scoped to mdl-lab/mdl-site; re-issue when it
  expires — default 90 days)
- If one-click GitHub login is ever wanted, deploy an OAuth relay (a self-hosted
  container or the Cloudflare Workers based
  [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) and add
  `base_url` to the backend section of `admin/config.yml`

## Access restriction until launch (important)

**GitHub Pages cannot do Basic authentication** (it is static hosting with no
server-side processing; access-controlled Pages is Enterprise-only). Also, while the
repository is public, **everything is readable from the repository itself no matter
how the site hides it**. Pre-launch protection therefore relies on the combination of:

1. **The top page is a temporary redirect to the old site** (current `index.html`) —
   ordinary visitors see nothing new
2. **`robots.txt` denies all crawlers + `noindex` on each page** — stays out of search engines
3. **Never commit content that must stay confidential (e.g. unpublished work) to `main`** —
   this is the only reliable protection
4. For a **Basic-auth protected design preview**, use the staging environment on
   tamagotake instead of GitHub Pages (see `deploy/staging/`; same nginx + Basic auth
   pattern as kpro)

## Launch procedure (handover notes)

The current `index.html` is a **temporary redirect to the old site (Google Sites)**.
DNS already points to GitHub Pages, but visitors still end up on the old site, so the
site effectively looks unpublished.

- **To launch**:
  1. Replace `index.html` with the real top page
  2. Replace `robots.txt` with a crawler-allowing version (`User-agent: *` + empty
     `Disallow:`) and remove the `<meta name="robots" content="noindex">` tags
     (keeping `admin/` noindexed is fine)
  3. Push to `main` (live within tens of seconds)
- **To roll back**: restore the redirect version of `index.html` and push

## Content notes (handover)

- The `collections:` section in `admin/config.yml` is a sample. Change the field
  structure freely once the site design is decided
- No static site generator is used at the moment. To display the Markdown under
  `content/` on the top page, the HTML author should choose either: ① fetch and render
  it with client-side JS, or ② introduce an SSG (e.g. Eleventy) + GitHub Actions.
  If an SSG is introduced, switch the Pages source to GitHub Actions

## DNS

`mdl.comp.isct.ac.jp` points to the official GitHub Pages IPs via **four A records**
(185.199.108.153 / 109.153 / 110.153 / 111.153).
**Do not use a CNAME** — the same name has an MX record
(mail: filter.nap.gsic.titech.ac.jp), and adding a CNAME alongside it would invalidate
the entire zone. Never touch the MX record.

- Previous setup: A 131.112.16.160 (tamagotake; 301-redirected to Google Sites)
- `kpro.mdl.comp.isct.ac.jp` has its own independent A record and is unaffected
