const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const backToTop = document.querySelector('.back-to-top');
const articleContainer = document.querySelector('[data-content="news-post"]');

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
})[character]);

const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  primaryNav.classList.remove('open');
  document.body.style.overflow = '';
};

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  primaryNav.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 30);
  backToTop.classList.toggle('visible', y > 700);
}, { passive: true });

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const showNotFound = (config) => {
  document.title = 'Article not found · MDL Lab';
  articleContainer.innerHTML = `
    <section class="news-post-error">
      <p class="eyebrow"><span></span> ${escapeHTML(config.title)}</p>
      <h1>${escapeHTML(config.not_found_title)}</h1>
      <p>${escapeHTML(config.not_found_description)}</p>
      <a class="button button-dark" href="news.html">${escapeHTML(config.not_found_button)} <span>→</span></a>
    </section>`;
};

const renderArticle = (article, config) => {
  document.title = `${article.title} · MDL Lab`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', article.summary);

  articleContainer.innerHTML = `
    <article class="news-post-article">
      <a class="news-post-back" href="news.html"><span>←</span> ${escapeHTML(config.back_label)}</a>
      <header class="news-post-header">
        <div class="news-post-meta">
          <time datetime="${escapeHTML(article.date)}">${escapeHTML(article.date)}</time>
          <span>${escapeHTML(article.type)}</span>
        </div>
        <h1>${escapeHTML(article.title)}</h1>
        <p>${escapeHTML(article.summary)}</p>
      </header>
      <div class="news-post-body">${article.html}</div>
      <footer class="news-post-footer">
        <a href="news.html"><span>←</span> ${escapeHTML(config.all_label)}</a>
      </footer>
    </article>`;
};

const loadArticle = async () => {
  const manifest = await ContentParser.loadMarkdownDocument('data/news/index.md');
  const config = manifest.meta;
  const slug = new URLSearchParams(window.location.search).get('post') || '';
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    showNotFound(config);
    return;
  }

  const filename = manifest.meta.items.find((file) => {
    const folder = file.includes('/') ? file.split('/')[0] : file.replace(/\.md$/i, '');
    return folder === slug;
  });
  if (!filename) {
    showNotFound(config);
    return;
  }

  const articleResponse = await fetch(`data/news/${filename}`);
  if (!articleResponse.ok) throw new Error(`data/news/${filename} returned ${articleResponse.status}`);
  const basePath = `data/news/${filename.slice(0, filename.lastIndexOf('/') + 1)}`;
  const article = ContentParser.parseMarkdownDocument(await articleResponse.text(), slug, basePath);
  renderArticle(article, config);
};

loadArticle().catch((error) => {
  console.error(error);
  articleContainer.innerHTML = '<p class="loading-state data-error">The article is temporarily unavailable.</p>';
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('open')) closeMenu();
});
