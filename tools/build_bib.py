#!/usr/bin/env python3
"""Rebuild data/publications/library.bib from data/publications/entries/*.md.

Each entry file is Markdown frontmatter (id, year) followed by a raw BibTeX
entry as the body. This script concatenates the bodies, newest year first,
into library.bib. Run automatically by .github/workflows/build-bib.yml;
never edit library.bib by hand. Uses only the Python standard library.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENTRIES = ROOT / "data" / "publications" / "entries"
TARGET = ROOT / "data" / "publications" / "library.bib"

HEADER = (
    "% AUTO-GENERATED from data/publications/entries/ — do not edit by hand.\n"
    "% Add or edit publications via the CMS (/admin/) or by editing the entry\n"
    "% files; .github/workflows/build-bib.yml regenerates this file.\n"
)


def split_frontmatter(text):
    m = re.match(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", text, re.DOTALL)
    if not m:
        return "", text
    return m.group(1), m.group(2)


def main():
    entries = []
    for path in sorted(ENTRIES.glob("*.md")):
        fm, body = split_frontmatter(path.read_text())
        body = body.strip()
        if not body.startswith("@"):
            print(f"WARNING: {path.name} body does not look like BibTeX; skipped", file=sys.stderr)
            continue
        ym = re.search(r"^year:\s*['\"]?(\d{4})", fm, re.MULTILINE)
        year = int(ym.group(1)) if ym else 0
        entries.append((year, path.name, body))

    entries.sort(key=lambda e: (-e[0], e[1]))
    out = HEADER + "\n" + "\n\n".join(body for _, _, body in entries) + "\n"
    TARGET.write_text(out)
    print(f"Wrote {TARGET.relative_to(ROOT)} with {len(entries)} entries")


if __name__ == "__main__":
    main()
