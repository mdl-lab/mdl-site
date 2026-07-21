(function () {
  'use strict';

  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);

  const safeURL = (value = '#') => {
    const url = String(value).trim();
    const supportedProtocol = /^(#|\/|\.\.?\/|https?:\/\/|mailto:)/i.test(url);
    const relativePath = url && !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//');
    return supportedProtocol || relativePath ? escapeHTML(url) : '#';
  };

  const resolveContentURL = (value, basePath = '') => {
    const url = String(value).trim();
    if (/^(#|\/|[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
    return `${basePath}${url}`;
  };

  const renderInlineMarkdown = (source = '', basePath = '') => {
    const links = [];
    const images = [];
    const withImageTokens = String(source).replace(/!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)/g, (_match, alt, url, title) => {
      const token = `MDLLABIMAGETOKEN${images.length}END`;
      images.push({ alt, url, title });
      return token;
    });
    const withTokens = withImageTokens.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      const token = `MDLLABLINKTOKEN${links.length}END`;
      links.push({ label, url });
      return token;
    });

    let html = escapeHTML(withTokens)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    links.forEach((link, index) => {
      const token = `MDLLABLINKTOKEN${index}END`;
      html = html.replace(token, `<a href="${safeURL(resolveContentURL(link.url, basePath))}">${escapeHTML(link.label)} <b aria-hidden="true">↗</b></a>`);
    });
    images.forEach((item, index) => {
      const token = `MDLLABIMAGETOKEN${index}END`;
      const title = item.title ? ` title="${escapeHTML(item.title)}"` : '';
      html = html.replace(token, `<img class="markdown-inline-image" src="${safeURL(resolveContentURL(item.url, basePath))}" alt="${escapeHTML(item.alt)}"${title} loading="lazy">`);
    });

    return html;
  };

  const renderMarkdown = (source = '', basePath = '') => {
    const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    let list = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '), basePath)}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!list.length) return;
      blocks.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item, basePath)}</li>`).join('')}</ul>`);
      list = [];
    };

    lines.forEach((line) => {
      const heading = line.match(/^(#{2,4})\s+(.+)$/);
      const listItem = line.match(/^[-*]\s+(.+)$/);
      const image = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)\s*$/);
      const quote = line.match(/^>\s+(.+)$/);

      if (image) {
        flushParagraph();
        flushList();
        const caption = image[3] ? `<figcaption>${escapeHTML(image[3])}</figcaption>` : '';
        blocks.push(`<figure><img src="${safeURL(resolveContentURL(image[2], basePath))}" alt="${escapeHTML(image[1])}" loading="lazy">${caption}</figure>`);
      } else if (heading) {
        flushParagraph();
        flushList();
        const level = heading[1].length;
        blocks.push(`<h${level}>${renderInlineMarkdown(heading[2], basePath)}</h${level}>`);
      } else if (quote) {
        flushParagraph();
        flushList();
        blocks.push(`<blockquote>${renderInlineMarkdown(quote[1], basePath)}</blockquote>`);
      } else if (listItem) {
        flushParagraph();
        list.push(listItem[1]);
      } else if (!line.trim()) {
        flushParagraph();
        flushList();
      } else {
        flushList();
        paragraph.push(line.trim());
      }
    });

    flushParagraph();
    flushList();
    return blocks.join('');
  };

  const unquote = (value = '') => {
    const trimmed = String(value).trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        return JSON.parse(trimmed);
      } catch (_error) {
        return trimmed.slice(1, -1);
      }
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  };

  const parseMarkdownDocument = (source, fallbackId = '', basePath = '') => {
    const text = String(source).replace(/\r\n?/g, '\n');
    const frontMatter = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const meta = {};
    let body = text;

    if (frontMatter) {
      let currentListKey = '';
      frontMatter[1].split('\n').forEach((line) => {
        const listItem = line.match(/^\s+-\s+(.+)$/);
        if (listItem && currentListKey && Array.isArray(meta[currentListKey])) {
          meta[currentListKey].push(unquote(listItem[1]));
          return;
        }
        const separator = line.indexOf(':');
        if (separator < 0) return;
        const key = line.slice(0, separator).trim().toLowerCase();
        const value = line.slice(separator + 1).trim();
        if (!key) return;
        if (!value) {
          meta[key] = [];
          currentListKey = key;
        } else {
          meta[key] = unquote(value);
          currentListKey = '';
        }
      });
      body = text.slice(frontMatter[0].length).trim();
    }

    return {
      id: meta.id || fallbackId.replace(/\.md$/i, ''),
      basePath,
      date: meta.date || meta.year || '',
      year: meta.year || String(meta.date || '').slice(0, 4),
      type: meta.category || meta.type || 'NEWS',
      title: meta.title || 'Untitled news item',
      summary: meta.summary || '',
      meta,
      body,
      html: renderMarkdown(body, basePath)
    };
  };

  const findTopLevelComma = (text) => {
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === '"') quoted = !quoted;
      if (quoted) continue;
      if (character === '{') depth += 1;
      if (character === '}') depth -= 1;
      if (character === ',' && depth === 0) return index;
    }
    return -1;
  };

  const readBalancedValue = (text, start, opener, closer) => {
    let depth = 1;
    let index = start + 1;
    let escaped = false;
    for (; index < text.length; index += 1) {
      const character = text[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === opener) depth += 1;
      if (character === closer) depth -= 1;
      if (depth === 0) break;
    }
    return { value: text.slice(start + 1, index), end: index + 1 };
  };

  const parseBibFields = (source) => {
    const fields = {};
    let index = 0;

    while (index < source.length) {
      while (/[\s,]/.test(source[index] || '')) index += 1;
      const nameStart = index;
      while (/[\w-]/.test(source[index] || '')) index += 1;
      const name = source.slice(nameStart, index).toLowerCase();
      while (/\s/.test(source[index] || '')) index += 1;
      if (!name || source[index] !== '=') {
        index += 1;
        continue;
      }
      index += 1;
      const parts = [];

      while (index < source.length) {
        while (/\s/.test(source[index] || '')) index += 1;
        const character = source[index];

        if (character === '{') {
          const result = readBalancedValue(source, index, '{', '}');
          parts.push(result.value);
          index = result.end;
        } else if (character === '"') {
          let end = index + 1;
          let escaped = false;
          for (; end < source.length; end += 1) {
            if (!escaped && source[end] === '"') break;
            escaped = !escaped && source[end] === '\\';
            if (source[end] !== '\\') escaped = false;
          }
          parts.push(source.slice(index + 1, end));
          index = end + 1;
        } else {
          const start = index;
          while (index < source.length && !/[,#]/.test(source[index])) index += 1;
          parts.push(source.slice(start, index).trim());
        }

        while (/\s/.test(source[index] || '')) index += 1;
        if (source[index] !== '#') break;
        index += 1;
      }

      fields[name] = parts.join('').trim();
      while (index < source.length && source[index] !== ',') index += 1;
      if (source[index] === ',') index += 1;
    }

    return fields;
  };

  const normalizeLatex = (value = '') => String(value)
    .replace(/\\(?:textit|emph|textbf|mathrm|mathbf)\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/~/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/--/g, '–')
    .replace(/\\[a-zA-Z]+\s*/g, '')
    .trim();

  const normalizeAuthors = (value = '') => normalizeLatex(value)
    .split(/\s+and\s+/i)
    .map((author) => {
      const parts = author.split(',').map((part) => part.trim());
      return parts.length > 1 ? `${parts.slice(1).join(' ')} ${parts[0]}`.trim() : author.trim();
    })
    .filter(Boolean)
    .join(', ');

  const parseBibTeX = (source = '') => {
    const input = String(source).replace(/^\s*%.*$/gm, '');
    const entries = [];
    let cursor = 0;

    while (cursor < input.length) {
      const at = input.indexOf('@', cursor);
      if (at < 0) break;
      const typeMatch = input.slice(at + 1).match(/^\s*([a-zA-Z]+)\s*([({])/);
      if (!typeMatch) {
        cursor = at + 1;
        continue;
      }

      const type = typeMatch[1].toLowerCase();
      const opener = typeMatch[2];
      const closer = opener === '{' ? '}' : ')';
      const openAt = at + 1 + typeMatch[0].lastIndexOf(opener);
      const result = readBalancedValue(input, openAt, opener, closer);
      cursor = result.end;
      if (['comment', 'preamble', 'string'].includes(type)) continue;

      const comma = findTopLevelComma(result.value);
      if (comma < 0) continue;
      const key = result.value.slice(0, comma).trim();
      const fields = parseBibFields(result.value.slice(comma + 1));
      const year = normalizeLatex(fields.year || '');
      let venue = normalizeLatex(fields.abbr || fields.shortvenue || fields.journal || fields.booktitle || fields.publisher || type);
      if (year && venue && !venue.includes(year)) venue = `${venue} ${year}`;
      const doi = normalizeLatex(fields.doi || '');
      const url = normalizeLatex(fields.url || '') || (doi ? `https://doi.org/${doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')}` : '#');

      entries.push({
        key,
        type,
        title: normalizeLatex(fields.title || key),
        authors: normalizeAuthors(fields.author || ''),
        year,
        venue,
        url
      });
    }

    return entries.sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || a.title.localeCompare(b.title));
  };

  const loadText = async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.text();
  };

  const directoryOf = (path) => path.slice(0, path.lastIndexOf('/') + 1);

  const fallbackIdFor = (path) => {
    const parts = path.split('/').filter(Boolean);
    const filename = parts[parts.length - 1] || '';
    if (/^index\.md$/i.test(filename) && parts.length > 1) return parts[parts.length - 2];
    return filename.replace(/\.md$/i, '');
  };

  const loadMarkdownDocument = async (path) => {
    const source = await loadText(path);
    return parseMarkdownDocument(source, fallbackIdFor(path), directoryOf(path));
  };

  const loadMarkdownCollection = async (indexPath, listKey = 'items') => {
    const index = await loadMarkdownDocument(indexPath);
    const entries = Array.isArray(index.meta[listKey]) ? index.meta[listKey] : [];
    const directory = directoryOf(indexPath);
    const items = await Promise.all(entries.map((entry) => loadMarkdownDocument(`${directory}${entry}`)));
    return { index, items };
  };

  window.ContentParser = {
    loadMarkdownCollection,
    loadMarkdownDocument,
    loadText,
    parseBibTeX,
    parseMarkdownDocument,
    renderMarkdown
  };
})();
