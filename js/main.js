/* ==========================================================================
   Main JS — Navigation, Contact Form, Active Link
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveLink();
  initContactForms();
  initScrollNav();
  initScrollReveal();
  initThemeScroll();
  initProjectThemeScroll();
  initViewToggle();
  initCardCarousels();
  initImageExpand();
  initHeroTabs();
  initHeroCarousel();
  initHeroVisualCarousel();
  initCaseStudyProgress();
  initStatCounters();
  initVideoPlaceholders();
});

/* ---- Mobile Navigation Toggle ---- */
function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  const nav = document.querySelector('.nav');

  if (!toggle || !links) return;

  // Set initial ARIA state
  toggle.setAttribute('aria-expanded', 'false');
  links.setAttribute('aria-hidden', 'true');

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    links.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // If the nav was hidden by scroll-hide, bring it back when menu opens
    if (isOpen && nav) {
      nav.style.transform = '';
    }
  });

  // Close menu when a link is clicked
  links.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      links.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Highlight Active Nav Link ---- */
function initActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav__link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    // Match exact page or index
    if (currentPath.endsWith(href) ||
        (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/portfolio/')))) {
      link.classList.add('nav__link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---- Contact Form Handling ---- */
function initContactForms() {
  document.querySelectorAll('.contact__form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

      // Basic validation
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('has-error');
        }
      });

      // Email validation
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        valid = false;
        emailField.classList.add('has-error');
      }

      if (!valid) return;

      // Show success message
      const msg = form.querySelector('.form-message');
      if (msg) {
        msg.textContent = 'Thank you! Your message has been sent.';
        msg.className = 'form-message form-message--success';
      }

      form.reset();

      // Hide after 5s
      setTimeout(() => {
        if (msg) msg.className = 'form-message';
      }, 5000);
    });
  });
}

/* ---- Hide/Show Nav on Scroll + Shadow ---- */
function initScrollNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;
  const threshold = 80;

  window.addEventListener('scroll', () => {
    // Never hide nav while the mobile menu is open
    if (document.querySelector('.nav__links.is-open')) return;

    const currentScroll = window.scrollY;

    // Hide nav on scroll down past threshold, reveal on scroll up.
    // calc(-100% - 20px) clears the floating top gap too so it fully disappears.
    if (currentScroll > threshold && currentScroll > lastScroll) {
      nav.style.transform = 'translateY(calc(-100% - 20px))';
    } else {
      nav.style.transform = '';
    }

    // Increase glass opacity slightly when scrolled over content via CSS class
    // (inline style overrides on .nav would bypass the ::before glass layer)
    nav.classList.toggle('is-scrolled', currentScroll > 50);

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---- Light Theme Scroll Transition — section--light-trigger (About/Resume) ---- */
function initThemeScroll() {
  const sections = document.querySelectorAll('.section--light-trigger');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-light');
      } else {
        if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove('is-light');
        }
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -8% 0px'
  });

  sections.forEach(s => observer.observe(s));
}

/* ---- Project Page — Full body light theme, same trigger as About/Resume ---- */
function initProjectThemeScroll() {
  // Only runs on project pages (hero--project present)
  const heroEl = document.querySelector('.hero--project');
  if (!heroEl) return;

  // Target the first section *inside* the active tab panel so that both the
  // tabs-strip and the content sections are on-screen simultaneously when the
  // observer fires — giving a uniform dark→light transition across both areas.
  const panel = document.querySelector('.hero--project ~ .tab-panel');
  const firstSection =
    (panel ? panel.querySelector('section') : null) ||
    document.querySelector('.hero--project ~ .tabs-strip') ||
    document.querySelector('.hero--project + * + *, .hero--project ~ .section');
  if (!firstSection) return;

  // Observer 1 — content section entering viewport → go light.
  // The exit-from-bottom path (top > 0) handles slow upward scrolls where
  // the section fully clears the viewport bottom before the hero reappears.
  const contentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.body.classList.add('theme--light');
      } else {
        if (entry.boundingClientRect.top > 0) {
          document.body.classList.remove('theme--light');
        }
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -8% 0px'
  });

  // Observer 2 — hero re-entering viewport → always go dark immediately.
  // This catches the case where the first content section is still partially
  // in the viewport when the user scrolls back into the hero, which would
  // prevent Observer 1's exit-from-bottom path from ever firing.
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.body.classList.remove('theme--light');
      }
    });
  }, { threshold: 0.01 });

  contentObserver.observe(firstSection);
  heroObserver.observe(heroEl);
}

/* ---- Scroll Reveal — IntersectionObserver ---- */
function initScrollReveal() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Auto-tag elements for reveal
  const selectors = [
    '.prose h2', '.prose h3', '.prose p', '.prose ul',
    '.hero__meta', '.hero__subtitle',
    '.image-grid__item', '.hero__image',
    '.section__header', '.section__eyebrow', '.section__title', '.section__subtitle',
    '.project-card', '.next-project',
    '.contact'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  elements.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  // Stagger image grid items
  document.querySelectorAll('.image-grid').forEach(grid => {
    grid.classList.add('reveal-stagger');
  });

  // Observe
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- Project Grid / List View Toggle ---- */
function initViewToggle() {
  const grid    = document.getElementById('projects-grid');
  const btnGrid = document.getElementById('view-grid');
  const btnList = document.getElementById('view-list');

  if (!grid || !btnGrid || !btnList) return;

  const MOBILE_BP = 640;

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function setView(view) {
    const isList = view === 'list';
    grid.classList.toggle('projects-grid--list', isList);
    btnGrid.classList.toggle('view-btn--active', !isList);
    btnList.classList.toggle('view-btn--active', isList);
    btnGrid.setAttribute('aria-pressed', String(!isList));
    btnList.setAttribute('aria-pressed', String(isList));
    localStorage.setItem('projectsView', view);
  }

  function syncMobileState() {
    if (isMobile()) {
      // Disable list toggle and force grid view on mobile
      btnList.classList.add('view-btn--disabled');
      btnList.setAttribute('aria-disabled', 'true');
      setView('grid');
    } else {
      btnList.classList.remove('view-btn--disabled');
      btnList.removeAttribute('aria-disabled');
      // Restore saved preference when returning to desktop
      const saved = localStorage.getItem('projectsView');
      if (saved === 'list') setView('list');
    }
  }

  btnGrid.addEventListener('click', () => setView('grid'));
  btnList.addEventListener('click', () => setView('list'));

  // Run on load and on every resize
  syncMobileState();
  window.addEventListener('resize', syncMobileState);
}

/* ---- Image Expand on Hover ---- */
function initImageExpand() {
  const expandables = document.querySelectorAll('.img-expand');
  if (!expandables.length) return;

  let overlay = null;

  expandables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      overlay = document.createElement('div');
      overlay.className = 'img-expand-overlay';

      // Mirror content: if img exists use it, otherwise replicate placeholder
      const img = el.querySelector('img');
      if (img) {
        const clone = img.cloneNode(true);
        clone.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        overlay.appendChild(clone);
      } else {
        const label = el.dataset.label || '';
        const span = document.createElement('span');
        span.className = 'img-expand-overlay__label';
        span.textContent = label;
        overlay.appendChild(span);
      }

      document.body.appendChild(overlay);
      // Force reflow before adding class so transition fires
      overlay.getBoundingClientRect();
      overlay.classList.add('is-visible');
    });

    el.addEventListener('mouseleave', () => {
      if (!overlay) return;
      const leaving = overlay;
      leaving.classList.remove('is-visible');
      leaving.addEventListener('transitionend', () => leaving.remove(), { once: true });
      overlay = null;
    });
  });
}

/* ---- Hero Tab Switching ---- */
function initHeroTabs() {
  const tabGroups = document.querySelectorAll('.hero-tabs');
  if (!tabGroups.length) return;

  tabGroups.forEach(tabGroup => {
    const tabs = Array.from(tabGroup.querySelectorAll('.hero-tab'));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;

        // Update tab ARIA states
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');

        // Show / hide panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
          if (panel.id === `panel-${targetId}`) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });

        // Scroll to just below hero so user sees new content
        const hero = document.querySelector('.hero');
        if (hero) {
          const offset = hero.offsetTop + hero.offsetHeight;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });
  });
}

/* ---- Hero Right-Side Image Carousel ---- */
function initHeroCarousel() {
  const carousel = document.querySelector('.hero__carousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.hero__carousel-slide'));
  if (slides.length < 2) return;

  let current = 0;

  // Activate first slide immediately (no transition on initial paint)
  slides[0].classList.add('is-active');

  // Enable transitions after first paint so slide 0 doesn't animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      carousel.classList.add('hero__carousel--ready');
    });
  });

  function advance() {
    const prev = current;
    current = (current + 1) % slides.length;

    slides[prev].classList.remove('is-active');
    slides[prev].classList.add('is-exiting');
    slides[current].classList.add('is-active');

    // Clean up exiting class once animation completes
    slides[prev].addEventListener('transitionend', () => {
      slides[prev].classList.remove('is-exiting');
    }, { once: true });
  }

  setInterval(advance, 3000);
}

/* ---- Hero Split Layout — Visual Carousel (dot-controlled) ----
   Right-panel image carousel for .hero--split. Independent from
   initHeroCarousel (the old auto-advancing background carousel) —
   this one is manually controlled via .hero__visual-dot clicks. */
function initHeroVisualCarousel() {
  document.querySelectorAll('.hero__panel-visual').forEach(panel => {
    const slides = Array.from(panel.querySelectorAll('.hero__visual-slide'));
    const dots = Array.from(panel.querySelectorAll('.hero__visual-dot'));
    if (slides.length < 2 || !dots.length) return;

    function goTo(index) {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    goTo(0);
  });
}

/* ---- Card Image Carousel ---- */
function initCardCarousels() {
  // Per-card delays (ms): card 1 = 5s, card 2 = 3s, card 3 = 4s
  const DELAYS = [5000, 3000, 4000, 3500];
  // Stagger offsets so cards never fire in sync
  const START_OFFSETS = [0, 1200, 2400, 800];

  document.querySelectorAll('.card-carousel').forEach((carousel, idx) => {
    const track  = carousel.querySelector('.card-carousel__track');
    const slides = carousel.querySelectorAll('.card-carousel__slide');

    const card    = carousel.closest('.project-card');
    const btnPrev = card ? card.querySelector('.card-carousel__btn--prev') : null;
    const btnNext = card ? card.querySelector('.card-carousel__btn--next') : null;

    if (!track || !slides.length || !btnPrev || !btnNext) return;

    const delay  = DELAYS[idx] ?? 4000;
    const offset = START_OFFSETS[idx] ?? 0;
    const total  = slides.length;
    let current  = 0;
    let timer    = null;
    let paused   = false;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    function startAuto() {
      stopAuto();
      if (!paused) timer = setInterval(() => goTo(current + 1), delay);
    }

    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    btnPrev.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      goTo(current - 1);
      if (!paused) startAuto(); // reset timer on manual nav
    });

    btnNext.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      goTo(current + 1);
      if (!paused) startAuto();
    });

    // Pause on hover, resume on leave
    card.addEventListener('mouseenter', () => { paused = true;  stopAuto(); });
    card.addEventListener('mouseleave', () => { paused = false; startAuto(); });

    // Staggered kick-off so cards don't scroll in sync
    setTimeout(startAuto, offset);
  });
}

/* ---- Case Study Reading Progress Bar ---- */
function initCaseStudyProgress() {
  const bar = document.querySelector('.cs-progress');
  if (!bar) return;

  function update() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---- Stat Counter Animation ---- */
function initStatCounters() {
  const stats = document.querySelectorAll('.cs-stat__number[data-count]');
  if (!stats.length) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isDecimal = String(target).includes('.');
      const duration = 1600;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
        }
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => {
    // Store original text as fallback, hide until in view for cleaner entrance
    observer.observe(el);
  });
}

/* ---- Video Placeholder — .mov / mp4 inline player ---- */
function initVideoPlaceholders() {
  document.querySelectorAll('.cs-video[data-src]').forEach(wrapper => {
    const src = wrapper.dataset.src;
    const poster = wrapper.dataset.poster || '';
    const caption = wrapper.dataset.caption || '';

    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = 'metadata';
    if (poster) video.poster = poster;
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';

    wrapper.appendChild(video);

    // Auto-pause when scrolled out of view (polite playback)
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting && !video.paused) video.pause();
      });
    }, { threshold: 0.2 });
    obs.observe(wrapper);

    // If a caption sibling exists, populate it
    const cap = wrapper.nextElementSibling;
    if (cap && cap.classList.contains('cs-video__caption') && caption) {
      cap.textContent = caption;
    }
  });
}
