# MDL Lab Website

A responsive static laboratory website for GitHub Pages. There is no database, CMS, build step, or server-side runtime. All maintainable content lives in small Markdown files under `data/`; publications are imported from BibTeX.

## Local preview

Browsers do not allow the site to load Markdown reliably when `index.html` is opened directly. Start a local web server from this directory:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Content model

Each content area follows the same pattern:

- Its `index.md` controls the section heading, description, display order, and list of content files.
- Each item has its own Markdown file, so one edit changes one person, project, research direction, profile, or article.
- A `|` inside selected title fields creates an intentional line break on the page.
- HTML files contain fallback copy for first paint, but the Markdown files are the source of truth and replace it when the page loads.

| Markdown unit | What it controls |
| --- | --- |
| `data/site/brand.md` | Lab name, full name, logo, browser title, and institution line |
| `data/site/navigation.md` | Header/footer navigation labels and order |
| `data/site/hero.md` | Homepage hero copy and image |
| `data/site/about.md` | Lab introduction and quotation |
| `data/site/application.md` | Homepage Application teaser and local-page button |
| `data/application/index.md` | Complete independent Application page |
| `data/site/contact.md` | Address, campus link, and research-profile links |
| `data/site/footer.md` | Footer description, heading, copyright, and hosting line |
| `data/people/index.md` | People section copy, filters, current/alumni status, and display order |
| `data/people/<person-id>/index.md` | One person's profile |
| `data/people/<person-id>/photo.*` | That person's local portrait |
| `data/research/index.md` | Research section copy and direction order |
| `data/research/<research-id>/index.md` | One research direction's metadata and description |
| `data/research/<research-id>/visual.*` | That research direction's local card image |
| `data/projects/index.md` | Projects section copy and project order |
| `data/projects/items/*.md` | One project per file |
| `data/publications/index.md` | Publications section copy, BibTeX path, and profile-card order |
| `data/publications/profiles/*.md` | One external publication profile per file |
| `data/publications/library.bib` | Publication records rendered on the website |
| `data/news/index.md` | News archive copy, button label, and article list |
| `data/news/<article-id>/index.md` | One complete news article per folder |
| `data/news/<article-id>/*` | Images and downloads belonging to that article |

## Adding or editing one item

Edit the relevant Markdown file directly. To add an ordinary item, copy a nearby file, give it a unique filename, and add its relative path under `items:` in that section's `index.md`:

```markdown
---
items:
  - "items/existing-item.md"
  - "items/new-item.md"
---
```

The order of those paths is the display order unless a page explicitly sorts by date or year.

## Managing people and portraits

People use the same folder-per-entry structure as news. A person's ID is their lowercase, hyphenated name without a numeric prefix:

```text
data/people/jun-sakuma/
├── index.md
└── photo.svg
```

The profile Markdown contains the person's name, role, category, profile link, and photo filename:

```markdown
---
id: "jun-sakuma"
name: "Jun Sakuma"
initials: "JS"
photo: "photo.jpg"
photo_alt: "Jun Sakuma portrait"
role: "Professor, Science Tokyo · Team Director, RIKEN AIP"
category: "faculty"
url: "https://example.com/profile"
---
```

Every migrated folder currently includes its own `photo.svg` placeholder because official portraits were not available in the source material. Replace that file with an approved `photo.jpg`, `photo.png`, or other web image and update the `photo:` field. Keep the image inside the same person's folder.

Employment status is controlled only in `data/people/index.md`. Put the profile path under exactly one list:

```markdown
current:
  - "jun-sakuma/index.md"
  - "new-member/index.md"
alumni:
  - "former-member/index.md"
```

To move someone to the alumni archive, remove their path from `current:`, add it to `alumni:`, and replace the current `role`/`category` fields in their profile with `period` and `detail`. Do not place the same ID in both lists.

### Automatic student year

Student profiles store the degree program and enrollment date instead of a manually maintained `M1`, `M2`, `D1`, or `D2` value:

```markdown
role: "Master's Student"
program: "masters"
enrollment_date: "2025-04-01"
affiliation: "Science Tokyo"
category: "student"
```

Supported `program` values are `masters`, `doctoral`, and `bachelors`. The website calculates the current `M`, `D`, or `B` year from the visitor's current date. April enrollment is shown as `Spring`; September or later is shown as `Fall`. The same fields can be used for research assistants who are also enrolled students. When a student graduates, move their profile path from `current:` to `alumni:` in `data/people/index.md` and record the graduation date with `period:`.

## Managing research directions

Each direction has the same folder-based package structure as people and news:

```text
data/research/ai-security-privacy/
├── index.md
└── visual.svg
```

The direction's `index.md` controls its title, label, theme, link, local image, image description, and body copy. Add or reorder direction paths under `items:` in `data/research/index.md`:

```markdown
items:
  - "ai-security-privacy/index.md"
  - "dependable-ai/index.md"
```

Keep each image in the same direction folder and update `image:` when replacing it with an approved SVG, JPG, PNG, or WebP file.

## Editing the Application page

The header navigation, utility bar, footer link, and homepage Application button all open `application.html`. That page renders `data/application/index.md` using the same Markdown system as a news article.

Edit its front matter to change the title, summary, update label, official admissions link, or navigation labels. Edit the Markdown body to change requirements and guidance. Headings, lists, links, blockquotes, inline formatting, and images are supported.

## Adding news

Create one folder under `data/news/`, keeping its Markdown and images together:

```text
data/news/papers-2026/
├── index.md
└── group-photo.jpg
```

Example `index.md`:

```markdown
---
id: papers-2026
date: 2026-07-21
year: 2026
category: PUBLICATIONS
title: Three papers accepted at ICML 2026
summary: Three MDL Lab papers have been accepted at ICML 2026.
---

We are pleased to share the news.

![The team after the announcement](group-photo.jpg "MDL Lab members")

## Accepted papers

- **ICML 2026** — [Paper title](https://example.com/paper)
```

Then add the article path to `data/news/index.md`:

```markdown
items:
  - "papers-2026/index.md"
```

News is sorted automatically by the front-matter `date`, newest first. The `summary` is shown on the homepage and news archive; clicking the item opens its independent article page. Article Markdown supports headings, paragraphs, bold and italic text, links, lists, blockquotes, inline code, and responsive images. Relative image paths resolve from that article's folder.

## Importing publications from BibTeX

One publication = one file under `data/publications/entries/`. Each file is a small
frontmatter block followed by the raw BibTeX entry:

```markdown
---
id: example2026
year: 2026
---
@inproceedings{example2026,
  title = {Paper Title},
  author = {Sakuma, Jun and Example, Alice},
  booktitle = {International Conference on Machine Learning},
  year = {2026},
  doi = {10.0000/example},
  abbr = {ICML 2026}
}
```

Add entries either via the CMS (`/admin/` → Publications → paste the BibTeX block)
or by creating the file directly. On push, `.github/workflows/build-bib.yml`
concatenates all entries into `data/publications/library.bib` (newest year first)
and commits it. **Never edit `library.bib` by hand — it is auto-generated.**
When previewing locally right after editing entries, run `python3 tools/build_bib.py`
to regenerate it without waiting for CI.

The browser parser extracts the title, authors, year, venue, DOI or URL, sorts entries by year, and renders the publication list. The optional `abbr` field supplies the short venue badge; without it, `journal` or `booktitle` is used.

To change the BibTeX filename, section description, or external profile cards, edit `data/publications/index.md` and the files under `data/publications/profiles/`.

## Publishing changes

Preview the affected page locally, then commit and push the changed Markdown, image, or BibTeX files. GitHub Actions republishes the site automatically.

For first-time GitHub Pages setup:

1. Create a GitHub repository, for example `mdl-lab`.
2. Push this directory to its `main` branch.
3. Open **Repository Settings → Pages**.
4. Choose **GitHub Actions** under **Build and deployment**.
5. Wait for “Deploy MDL Lab website to GitHub Pages” in the **Actions** tab.

The project URL will normally be `https://YOUR-USERNAME.github.io/mdl-lab/`. Add a custom domain later under **Repository Settings → Pages → Custom domain**.

## Project structure

```text
.
├── .github/workflows/pages.yml
├── assets/
├── data/
│   ├── site/*.md
│   ├── application/index.md
│   ├── people/{index.md,<person-id>/{index.md,photo.*}}
│   ├── research/{index.md,<research-id>/{index.md,visual.*}}
│   ├── projects/{index.md,items/*.md}
│   ├── publications/{index.md,library.bib,profiles/*.md}
│   └── news/{index.md,<article-id>/index.md}
├── content-parser.js
├── site-content.js
├── script.js
├── news.js
├── news-post.js
├── application.js
├── index.html
├── news.html
├── news-post.html
├── application.html
└── styles.css
```

The initial content was migrated from the public Sakuma Lab Google Site in July 2026. Review names, roles, project dates, and application details with the laboratory before production launch. See `MIGRATION.md` for the source inventory and editorial notes.
