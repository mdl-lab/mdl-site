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
    return /^(#|\/|\.\.?\/|https?:\/\/|mailto:|[a-z0-9][a-z0-9._/-]*$)/i.test(url) ? url : '#';
  };

  const lines = (value = '') => String(value).split('|').map(escapeHTML).join('<br>');

  const setEyebrow = (element, value) => {
    if (element && value) element.innerHTML = `<span></span> ${escapeHTML(value)}`;
  };

  const applyBrand = (documentData) => {
    const brand = documentData.meta;
    document.querySelectorAll('.brand-copy strong').forEach((element) => { element.textContent = brand.short_name; });
    document.querySelectorAll('.brand-copy small').forEach((element) => { element.textContent = brand.full_name; });
    document.querySelectorAll('.brand-mark img').forEach((image) => {
      image.src = safeURL(brand.logo);
      image.alt = brand.logo_alt;
    });
    document.querySelectorAll('.utility-inner > p').forEach((element) => {
      element.innerHTML = `${escapeHTML(brand.short_name)} <span>·</span> ${escapeHTML(brand.institutions)}`;
    });
    document.querySelectorAll('.language-switch').forEach((element) => {
      element.innerHTML = `${escapeHTML(brand.language)} <b>⌄</b>`;
    });
    if (document.body.dataset.page === 'home') {
      document.title = brand.site_title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = brand.meta_description;
    }
  };

  const applyHero = (documentData) => {
    const hero = documentData.meta;
    const section = document.querySelector('.hero');
    if (!section) return;
    setEyebrow(section.querySelector('.eyebrow'), hero.eyebrow);
    section.querySelector('h1').innerHTML = lines(hero.title);
    section.querySelector('.hero-lead').textContent = documentData.body;
    const media = section.querySelector('.hero-media');
    media.style.backgroundImage = `url("${safeURL(hero.image)}")`;
    media.setAttribute('aria-label', hero.image_alt);
  };

  const applyAbout = (documentData) => {
    const about = documentData.meta;
    const section = document.querySelector('.about');
    if (!section) return;
    setEyebrow(section.querySelector('.section-heading .eyebrow'), about.eyebrow);
    section.querySelector('.section-heading h2').innerHTML = lines(about.title);
    const content = documentData.html.replace('<p>', '<p class="lead-copy">');
    section.querySelector('.about-copy').innerHTML = `${content}<a class="text-link" href="${safeURL(about.link_url)}">${escapeHTML(about.link_label)} <span>→</span></a>`;
    section.querySelector('.about-note blockquote').innerHTML = lines(about.quote);
    section.querySelector('.about-note p').textContent = `— ${about.quote_attribution}`;
  };

  const applyApplication = (documentData) => {
    const application = documentData.meta;
    const section = document.querySelector('.join');
    if (!section) return;
    setEyebrow(section.querySelector('.eyebrow'), application.eyebrow);
    section.querySelector('h2').innerHTML = lines(application.title);
    const copy = section.querySelector('.join-copy');
    copy.innerHTML = `${documentData.html}<a class="button button-light" href="${safeURL(application.button_url)}">${escapeHTML(application.button_label)} <span>↗</span></a>`;
  };

  const applyContact = (documentData) => {
    const contact = documentData.meta;
    document.querySelectorAll('.site-footer').forEach((footer) => {
      const columns = footer.querySelectorAll('.footer-column');
      const access = columns[1];
      if (access) {
        access.innerHTML = `<h3>${escapeHTML(contact.heading)}</h3><p>${escapeHTML(contact.address_line_1)}<br>${escapeHTML(contact.address_line_2)}<br>${escapeHTML(contact.address_line_3)}</p><a href="${safeURL(contact.access_url)}">${escapeHTML(contact.access_label)} ↗</a>`;
      }
      const links = footer.querySelectorAll('.footer-social a');
      const profileHeading = footer.querySelector('.footer-social h3');
      if (profileHeading) profileHeading.textContent = contact.profiles_heading;
      if (links[0]) {
        links[0].href = safeURL(contact.scholar_url);
        links[0].textContent = contact.scholar_label;
      }
      if (links[1]) {
        links[1].href = safeURL(contact.dblp_url);
        links[1].textContent = contact.dblp_label;
      }
      if (links[2]) {
        links[2].href = safeURL(contact.riken_url);
        links[2].textContent = contact.riken_label;
      }
    });
  };

  const applyFooter = (documentData) => {
    const footer = documentData.meta;
    document.querySelectorAll('.footer-brand > p').forEach((element) => { element.textContent = footer.description; });
    document.querySelectorAll('.site-footer .footer-column:first-of-type h3').forEach((element) => { element.textContent = footer.explore_heading; });
    document.querySelectorAll('.footer-bottom').forEach((element) => {
      const paragraphs = element.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].textContent = footer.copyright;
      if (paragraphs[1]) paragraphs[1].textContent = footer.hosting;
    });
  };

  const applyNavigation = (documentData) => {
    const items = documentData.meta.items.map((item) => {
      const [key, label] = item.split('|');
      return { key, label };
    });
    const page = document.body.dataset.page;
    const urlFor = (key) => {
      if (key === 'news') return 'news.html';
      if (key === 'application') return 'application.html';
      if (page === 'home') return `#${key}`;
      return `index.html#${key}`;
    };
    const keyFor = (link) => {
      const href = link.getAttribute('href') || '';
      if (href.includes('news.html')) return 'news';
      if (href.includes('application.html') || href.endsWith('#application')) return 'application';
      return ['home', 'people', 'research', 'publications'].find((key) => href.endsWith(`#${key}`)) || '';
    };

    document.querySelectorAll('.primary-nav').forEach((navigation) => {
      const links = new Map([...navigation.querySelectorAll(':scope > a')].map((link) => [keyFor(link), link]));
      items.forEach(({ key, label }) => {
        const link = links.get(key);
        if (!link) return;
        link.href = urlFor(key);
        link.innerHTML = key === 'application' ? `${escapeHTML(label)} <span>↗</span>` : escapeHTML(label);
        navigation.append(link);
      });
    });

    document.querySelectorAll('.site-footer').forEach((footer) => {
      const explore = footer.querySelector('.footer-column');
      if (!explore) return;
      const heading = explore.querySelector('h3');
      const links = new Map([...explore.querySelectorAll('a')].map((link) => [keyFor(link), link]));
      explore.innerHTML = '';
      explore.append(heading);
      items.filter(({ key }) => key !== 'home').forEach(({ key, label }) => {
        const link = links.get(key) || document.createElement('a');
        link.href = urlFor(key);
        link.textContent = label;
        explore.append(link);
      });
    });

    const application = items.find(({ key }) => key === 'application');
    document.querySelectorAll('.utility-actions > a').forEach((link) => {
      if (application) link.textContent = application.label;
      link.href = urlFor('application');
    });
  };

  const ready = Promise.all([
    ContentParser.loadMarkdownDocument('data/site/brand.md'),
    ContentParser.loadMarkdownDocument('data/site/hero.md'),
    ContentParser.loadMarkdownDocument('data/site/about.md'),
    ContentParser.loadMarkdownDocument('data/site/application.md'),
    ContentParser.loadMarkdownDocument('data/site/contact.md'),
    ContentParser.loadMarkdownDocument('data/site/footer.md'),
    ContentParser.loadMarkdownDocument('data/site/navigation.md')
  ]).then(([brand, hero, about, application, contact, footer, navigation]) => {
    applyBrand(brand);
    applyHero(hero);
    applyAbout(about);
    applyApplication(application);
    applyContact(contact);
    applyFooter(footer);
    applyNavigation(navigation);
    return { brand, hero, about, application, contact, footer, navigation };
  }).catch((error) => {
    console.error(error);
    return null;
  });

  window.SiteContent = { ready };
})();
