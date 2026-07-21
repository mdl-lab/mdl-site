const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const backToTop = document.querySelector('.back-to-top');

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

const renderNewsArchive = (collection) => {
  const config = collection.index.meta;
  const news = { items: collection.items.sort((a, b) => String(b.date).localeCompare(String(a.date))) };
  document.querySelector('.news-page-hero .eyebrow').innerHTML = `<span></span> ${escapeHTML(config.archive_eyebrow)}`;
  document.querySelector('#news-page-title').textContent = config.archive_title || config.title;
  document.querySelector('.news-page-hero > .site-shell > p:last-child').textContent = config.archive_description || config.description;
  document.title = `${config.archive_title || config.title} · MDL Lab`;
  const container = document.querySelector('[data-content="news-archive"]');
  container.innerHTML = news.items.map((item) => {
    const articleURL = `news-post.html?post=${encodeURIComponent(item.id)}`;
    return `
    <article class="news-entry" id="${escapeHTML(item.id)}">
      <div class="news-entry-meta">
        <time datetime="${escapeHTML(item.year)}">${escapeHTML(item.year)}</time>
        <span>${escapeHTML(item.type)}</span>
      </div>
      <div class="news-entry-content">
        <h2><a href="${articleURL}">${escapeHTML(item.title)}</a></h2>
        <p>${escapeHTML(item.summary)}</p>
        <a class="news-entry-link" href="${articleURL}">${escapeHTML(config.read_label)} <span>→</span></a>
      </div>
    </article>`;
  }).join('');
};

ContentParser.loadMarkdownCollection('data/news/index.md')
  .then(renderNewsArchive)
  .catch((error) => {
    console.error(error);
    document.querySelector('[data-content="news-archive"]').innerHTML = '<p class="loading-state data-error">News is temporarily unavailable.</p>';
  });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('open')) closeMenu();
});
