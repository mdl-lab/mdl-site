# Infrastructure notes (mdl-site)

Hosting/DNS/CMS-auth notes for https://mdl.comp.isct.ac.jp.
For the site itself (design, content model, how to edit content), see [README.md](README.md).

## Architecture

- **Hosting**: GitHub Pages, deployed by the GitHub Actions workflow
  `.github/workflows/pages.yml` on every push to `main` (no build step; the repo is
  uploaded as-is)
- **Domain**: `mdl.comp.isct.ac.jp` (`CNAME` file + the repository's Pages settings;
  HTTPS enforced, Let's Encrypt managed by GitHub)
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin/`
  (Decap-compatible; commits directly to this repository)
- **Branches**: `main` = what is live. `dev` = work in progress on the new design.
  **Merging `dev` into `main` is the publish button.**

## CMS authentication (no OAuth relay)

No OAuth relay server is used. On the `/admin/` login screen, each editor chooses
**"Sign In with Token"** and logs in with their own GitHub Personal Access Token.

- Only GitHub accounts with **write access to this repository** can edit
- Use a fine-grained token scoped to mdl-lab/mdl-site; re-issue when it expires
  (default 90 days)
- For one-click GitHub login later, deploy an OAuth relay (self-hosted container or
  the Cloudflare Workers based
  [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) and add
  `base_url` to the backend section of `admin/config.yml`
- `admin/config.yml` mirrors the content model under `data/` (news, people, section
  indexes). Publications are BibTeX (`data/publications/library.bib`) and are edited
  directly, not via the CMS. When new frontmatter keys are added to section index
  files, declare them in `admin/config.yml` as well — file entries rewrite the whole
  frontmatter on save

## Access restriction until launch (important)

**GitHub Pages cannot do Basic authentication** (static hosting, no server-side
processing; access-controlled Pages is Enterprise-only). While the repository is
public, everything is also readable from the repository itself. Pre-launch protection
relies on:

1. `main` serves only a **TBA placeholder** (`index.html`); the real site lives on `dev`
2. **`robots.txt` denies all crawlers** — stays out of search engines
3. **Never commit content that must stay confidential to any branch of a public repo**
4. For an access-restricted shared preview, use the Basic-auth staging on tamagotake
   (`deploy/staging/`); local preview works too: `python3 -m http.server` in a `dev`
   checkout

## Launch procedure

1. On `dev`: replace `robots.txt` with a crawler-allowing version
   (`User-agent: *` + empty `Disallow:`)
2. Merge `dev` into `main` and push — the Actions workflow deploys it
3. Rollback: `git revert` the merge commit on `main`

## DNS

`mdl.comp.isct.ac.jp` points to the official GitHub Pages IPs via **four A records**
(185.199.108.153 / 109.153 / 110.153 / 111.153).
**Do not use a CNAME** — the same name has an MX record
(mail: filter.nap.gsic.titech.ac.jp), and adding a CNAME alongside it would invalidate
the entire zone. Never touch the MX record.

- Previous setup: A 131.112.16.160 (tamagotake; 301-redirected to Google Sites)
- `kpro.mdl.comp.isct.ac.jp` has its own independent A record and is unaffected

## GitHub plan / repo visibility

mdl-lab is a free org: GitHub Pages requires the repo to stay **public** unless the
org is upgraded to GitHub Team (free via a verified GitHub Education teacher account:
Education dashboard → "Upgrade your academic organizations"). After upgrading, the
repo may be made private; the published site remains publicly accessible either way.
