const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const backToTop = document.querySelector('.back-to-top');
const applicationContainer = document.querySelector('[data-content="application"]');

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
})[character]);

const safeURL = (value = '#') => {
  const url = String(value).trim();
  return /^(#|\/|https?:\/\/|mailto:)/i.test(url) ? escapeHTML(url) : '#';
};

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

const renderApplication = (documentData) => {
  const application = documentData.meta;
  document.title = `${application.title} · MDL Lab`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = application.summary;

  applicationContainer.innerHTML = `
    <article class="news-post-article application-article">
      <a class="news-post-back" href="index.html#home"><span>←</span> ${escapeHTML(application.back_label)}</a>
      <header class="news-post-header">
        <div class="news-post-meta">
          <time datetime="${escapeHTML(application.updated_iso)}">${escapeHTML(application.updated_label)}</time>
          <span>${escapeHTML(application.eyebrow)}</span>
        </div>
        <h1>${escapeHTML(application.title)}</h1>
        <p>${escapeHTML(application.summary)}</p>
      </header>
      <div class="news-post-body">${documentData.html}</div>
      <div class="application-official-link">
        <a class="button button-light" href="${safeURL(application.official_url)}">${escapeHTML(application.official_label)} <span>↗</span></a>
      </div>
      <footer class="news-post-footer">
        <a href="index.html#home"><span>←</span> ${escapeHTML(application.footer_label)}</a>
      </footer>
    </article>`;
};

ContentParser.loadMarkdownDocument('data/application/index.md')
  .then(renderApplication)
  .catch((error) => {
    console.error(error);
    applicationContainer.innerHTML = '<p class="loading-state data-error">Application information is temporarily unavailable.</p>';
  });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('open')) closeMenu();
});
