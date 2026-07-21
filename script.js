const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const backToTop = document.querySelector('.back-to-top');
const navLinks = [...document.querySelectorAll('.primary-nav a')];

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

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 30);
  backToTop.classList.toggle('visible', y > 700);
}, { passive: true });

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -45px' });

const observeReveals = () => {
  document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => revealObserver.observe(element));
};

observeReveals();

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const target = href.startsWith('#') ? href.slice(1) : '';
      const matchesHome = entry.target.id === 'about' && target === 'home';
      const matchesNews = entry.target.id === 'news' && href === 'news.html';
      link.classList.toggle('active', target === entry.target.id || matchesHome || matchesNews);
    });
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

const studentProgramPrefixes = {
  masters: 'M',
  doctoral: 'D',
  bachelors: 'B'
};

const studentRole = (person, today = new Date()) => {
  if (!person.program || !person.enrollment_date) return person.role;
  const match = String(person.enrollment_date).match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  const prefix = studentProgramPrefixes[person.program];
  if (!match || !prefix) return person.role;

  const enrollmentYear = Number(match[1]);
  const enrollmentMonth = Number(match[2]);
  const elapsedMonths = (today.getFullYear() - enrollmentYear) * 12 + (today.getMonth() + 1 - enrollmentMonth);
  const year = Math.max(1, Math.floor(elapsedMonths / 12) + 1);
  const term = enrollmentMonth >= 9 ? 'Fall' : 'Spring';
  const affiliation = person.affiliation ? ` · ${person.affiliation}` : '';
  return `${person.role}, ${prefix}${year} ${term}${affiliation}`;
};

const renderResearch = (collection) => {
  const config = collection.index.meta;
  const items = collection.items.map((document) => ({ ...document.meta, id: document.id, basePath: document.basePath, description: document.body.trim() }));
  const section = document.querySelector('#research');
  section.querySelector('.section-heading .eyebrow').innerHTML = `<span></span> ${escapeHTML(config.eyebrow)}`;
  section.querySelector('.section-heading h2').textContent = config.title;
  section.querySelector('.section-top > p').textContent = config.description;
  const container = document.querySelector('[data-content="research"]');
  container.innerHTML = items.map((item) => `
    <article class="research-card card-${escapeHTML(item.theme)} reveal">
      <div class="research-visual">
        <img src="${safeURL(`${item.basePath}${item.image}`)}" alt="${escapeHTML(item.image_alt)}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-index">${escapeHTML(item.index)} <span></span></div>
        <h3>${escapeHTML(item.title)}</h3>
        <p class="card-en">${escapeHTML(item.label)}</p>
        <p>${escapeHTML(item.description)}</p>
        <a href="${safeURL(item.url)}" aria-label="${escapeHTML(config.card_link_label)}: ${escapeHTML(item.title)}">${escapeHTML(config.card_link_label)} <span>↗</span></a>
      </div>
    </article>`).join('');

  container.querySelectorAll('.research-visual img').forEach((image) => {
    image.addEventListener('error', () => { image.hidden = true; });
  });
};

const renderProjects = (collection) => {
  const config = collection.index.meta;
  const projects = collection.items.map((document) => ({ ...document.meta, id: document.id }));
  const heading = document.querySelector('.projects-heading');
  heading.querySelector('.eyebrow').innerHTML = `<span></span> ${escapeHTML(config.eyebrow)}`;
  heading.querySelector('h3').textContent = config.title;
  heading.querySelector(':scope > p').textContent = config.description;
  const container = document.querySelector('[data-content="projects"]');
  container.innerHTML = projects.map((project, index) => `
    <article class="project-item reveal project-${escapeHTML(project.status)}">
      <span class="project-number">${String(index + 1).padStart(2, '0')}</span>
      <div>
        <span class="project-status">${escapeHTML(project.status === 'active' ? config.active_label : config.completed_label)} · ${escapeHTML(project.period)}</span>
        <h4>${escapeHTML(project.title)}</h4>
        <p>${escapeHTML(project.program)} · ${escapeHTML(project.role)}</p>
      </div>
    </article>`).join('');
};

const renderPeople = (collection) => {
  const config = collection.index.meta;
  const people = collection.items.map((document) => ({ ...document.meta, id: document.id, basePath: document.basePath }));
  const section = document.querySelector('#people');
  section.querySelector('.section-heading .eyebrow').innerHTML = `<span></span> ${escapeHTML(config.eyebrow)}`;
  section.querySelector('.section-heading h2').innerHTML = escapeHTML(config.title).replace('|', '<br>');
  section.querySelector('.people-top > div:last-child > p').textContent = config.description;
  const container = document.querySelector('[data-content="people"]');
  const filterContainer = section.querySelector('.filter-tabs');
  filterContainer.innerHTML = config.filters.map((filter, index) => {
    const [value, label] = filter.split('|');
    return `<button class="${index === 0 ? 'active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-people-filter="${escapeHTML(value)}">${escapeHTML(label)}</button>`;
  }).join('');
  container.innerHTML = people.map((person, index) => `
    <article class="person-card reveal${index > 7 ? ' is-extra' : ''}" data-person="${escapeHTML(person.category)}">
      <div class="portrait">
        <span aria-hidden="true">${escapeHTML(person.initials)}</span>
        <img src="${safeURL(`${person.basePath}${person.photo}`)}" alt="${escapeHTML(person.photo_alt)}" loading="${index < 4 ? 'eager' : 'lazy'}">
        <i></i>
      </div>
      <div class="person-info">
        <p>${escapeHTML(studentRole(person))}</p>
        <h3>${escapeHTML(person.name)}</h3>
        <a href="${safeURL(person.url)}" aria-label="View ${escapeHTML(person.name)}'s profile">→</a>
      </div>
    </article>`).join('');

  container.querySelectorAll('.portrait img').forEach((image) => {
    image.addEventListener('error', () => { image.hidden = true; });
  });

  const peopleTabs = document.querySelectorAll('[data-people-filter]');
  const peopleCards = container.querySelectorAll('[data-person]');
  const expandButton = document.querySelector('[data-people-expand]');

  expandButton.addEventListener('click', () => {
    const expanded = expandButton.getAttribute('aria-expanded') === 'true';
    expandButton.setAttribute('aria-expanded', String(!expanded));
    container.classList.toggle('expanded', !expanded);
    expandButton.innerHTML = expanded
      ? `${escapeHTML(config.expand_label.replace('{count}', people.length))} <span>↓</span>`
      : `${escapeHTML(config.collapse_label)} <span>↑</span>`;
  });

  peopleTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.peopleFilter;
      peopleTabs.forEach((button) => {
        const selected = button === tab;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
      });
      container.classList.toggle('filtering', filter !== 'all');
      peopleCards.forEach((card) => {
        card.classList.toggle('filtered-out', filter !== 'all' && card.dataset.person !== filter);
      });
    });
  });
};

const renderAlumni = (collection) => {
  const config = collection.index.meta;
  const alumni = collection.items.map((document) => ({ ...document.meta, id: document.id }));
  const container = document.querySelector('[data-content="alumni"]');
  const toggle = document.querySelector('[data-alumni-toggle]');
  const heading = document.querySelector('.alumni-heading');
  heading.querySelector('.eyebrow').innerHTML = `<span></span> ${escapeHTML(config.alumni_eyebrow)}`;
  heading.querySelector('h3').textContent = config.alumni_title;
  toggle.innerHTML = `${escapeHTML(config.alumni_button)} <span>↓</span>`;
  const groups = alumni.reduce((all, person) => {
    const year = String(person.period).slice(0, 4);
    if (!all[year]) all[year] = [];
    all[year].push(person);
    return all;
  }, {});

  container.innerHTML = Object.entries(groups).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)).map(([year, people]) => `
    <section class="alumni-year">
      <h4>${escapeHTML(year)}</h4>
      <ul>
        ${people.map((person) => `
          <li>
            <span>${escapeHTML(person.period)}</span>
            ${person.url ? `<a href="${safeURL(person.url)}">${escapeHTML(person.name)} ↗</a>` : `<strong>${escapeHTML(person.name)}</strong>`}
            <small>${escapeHTML(person.detail)}${person.history?.length ? ` · ${person.history.map((event) => escapeHTML(event.replace('|', ': '))).join(' · ')}` : ''}</small>
          </li>`).join('')}
      </ul>
    </section>`).join('');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    container.classList.toggle('open', !expanded);
    toggle.innerHTML = expanded
      ? `${escapeHTML(config.alumni_button)} <span>↓</span>`
      : `${escapeHTML(config.alumni_close_button)} <span>↑</span>`;
  });
};

const renderPublications = (collection, publications) => {
  const config = collection.index.meta;
  const sources = collection.items.map((document) => ({ ...document.meta, id: document.id }));
  const section = document.querySelector('#publications');
  section.querySelector('.section-heading .eyebrow').innerHTML = `<span></span> ${escapeHTML(config.eyebrow)}`;
  section.querySelector('.section-heading h2').textContent = config.title;
  section.querySelector('.section-top > p').textContent = config.description;
  const tagColors = ['teal', 'blue', 'gold'];
  const container = document.querySelector('[data-content="publications"]');
  container.innerHTML = `
    <p class="publication-intro">${escapeHTML(config.intro)}</p>
    <div class="selected-publications">
      <div class="selected-publications-heading">
        <span>${escapeHTML(config.record_label)}</span>
        <strong>${escapeHTML(config.paper_count_label.replace('{count}', publications.length))}</strong>
      </div>
      <div class="publication-list">
        ${publications.map((publication, index) => `
          <article class="publication-item reveal">
            <time datetime="${escapeHTML(publication.year)}">${escapeHTML(publication.year)}</time>
            <div>
              <span class="pub-tag tag-${tagColors[index % tagColors.length]}">${escapeHTML(publication.venue)}</span>
              <h3>${escapeHTML(publication.title)}</h3>
              <p>${escapeHTML(publication.authors)}</p>
            </div>
            <nav aria-label="Publication link">
              <a href="${safeURL(publication.url)}">${escapeHTML(config.paper_link_label)}</a>
              <a class="pub-arrow" href="${safeURL(publication.url)}" aria-label="Open ${escapeHTML(publication.title)}">↗</a>
            </nav>
          </article>`).join('')}
      </div>
    </div>
    <div class="publication-directory-title"><span>${escapeHTML(config.complete_label)}</span><p>${escapeHTML(config.complete_description)}</p></div>
    <div class="source-grid">
      ${sources.map((source) => `
        <a class="source-card reveal" href="${safeURL(source.url)}">
          <span class="source-mark">${escapeHTML(source.mark)}</span>
          <div><small>${escapeHTML(source.label)}</small><h3>${escapeHTML(source.name)}</h3><p>${escapeHTML(source.description)}</p></div>
          <b aria-hidden="true">↗</b>
        </a>`).join('')}
    </div>`;
};

const renderNews = (collection) => {
  const config = collection.index.meta;
  const news = { items: collection.items.sort((a, b) => String(b.date).localeCompare(String(a.date))) };
  const section = document.querySelector('#news');
  section.querySelector('.news-heading .eyebrow').innerHTML = `<span></span> ${escapeHTML(config.eyebrow)}`;
  section.querySelector('.news-heading h2').textContent = config.title;
  section.querySelector('.news-heading > p:not(.eyebrow)').textContent = config.description;
  section.querySelector('.news-heading .button').innerHTML = `${escapeHTML(config.button_label)} <span>→</span>`;
  const listContainer = document.querySelector('[data-content="news-list"]');

  listContainer.innerHTML = news.items.map((item) => {
    const articleURL = `news-post.html?post=${encodeURIComponent(item.id)}`;
    return `
    <article id="${escapeHTML(item.id)}">
      <time datetime="${escapeHTML(item.year)}"><strong>${escapeHTML(item.year)}</strong></time>
      <div class="news-list-copy">
        <span>${escapeHTML(item.type)}</span>
        <h3><a href="${articleURL}">${escapeHTML(item.title)}</a></h3>
        <p>${escapeHTML(item.summary)}</p>
      </div>
      <a href="${articleURL}" aria-label="${escapeHTML(config.read_label)}: ${escapeHTML(item.title)}">${escapeHTML(config.read_label)} <span>→</span></a>
    </article>`;
  }).join('');
};

const showDataError = (selectors) => {
  selectors.forEach((selector) => {
    const container = document.querySelector(selector);
    if (container) container.innerHTML = '<p class="loading-state data-error">Content is temporarily unavailable.</p>';
  });
};

const loadContent = async () => {
  const jobs = [
    ContentParser.loadMarkdownCollection('data/research/index.md').then(renderResearch).catch((error) => {
      console.error(error);
      showDataError(['[data-content="research"]']);
    }),
    ContentParser.loadMarkdownCollection('data/projects/index.md').then(renderProjects).catch((error) => {
      console.error(error);
      showDataError(['[data-content="projects"]']);
    }),
    Promise.all([
      ContentParser.loadMarkdownCollection('data/people/index.md', 'current'),
      ContentParser.loadMarkdownCollection('data/people/index.md', 'alumni')
    ]).then(([people, alumni]) => {
      renderPeople(people);
      renderAlumni(alumni);
    }).catch((error) => {
      console.error(error);
      showDataError(['[data-content="people"]', '[data-content="alumni"]']);
    }),
    ContentParser.loadMarkdownCollection('data/publications/index.md', 'profiles').then(async (collection) => {
      const config = collection.index.meta;
      const bibtex = await ContentParser.loadText(`data/publications/${config.bibtex}`);
      const publications = ContentParser.parseBibTeX(bibtex);
      if (!publications.length) throw new Error('No BibTeX publication entries found');
      renderPublications(collection, publications);
    }).catch((error) => {
      console.error(error);
      showDataError(['[data-content="publications"]']);
    }),
    ContentParser.loadMarkdownCollection('data/news/index.md').then(renderNews).catch((error) => {
      console.error(error);
      showDataError(['[data-content="news-list"]']);
    })
  ];

  await Promise.all(jobs);
  observeReveals();
};

loadContent();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('open')) closeMenu();
});
