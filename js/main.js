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
  initHomeHeroCarousel();
  initAboutHeroCarousel();
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

  document.querySelectorAll('.reveal, .reveal-slide').forEach(el => observer.observe(el));
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

/* ---- Hero Split Layout — Visual Carousel (auto-advancing, dot-controlled) ----
   Right-panel image carousel for .hero--split. Auto-advances on the same
   3s cadence as the old .hero__carousel, and is also manually controllable
   via .hero__visual-dot clicks — clicking a dot restarts the auto-advance
   timer so it doesn't immediately jump away from the chosen slide. */
function initHeroVisualCarousel() {
  const AUTO_ADVANCE_MS = 3700;
  const SLIDE_DURATION_MS = 840;

  document.querySelectorAll('.hero__panel-visual').forEach(panel => {
    const carousel = panel.querySelector('.hero__visual-carousel');
    const slides = Array.from(panel.querySelectorAll('.hero__visual-slide'));
    const dots = Array.from(panel.querySelectorAll('.hero__visual-dot'));
    if (slides.length < 2 || !dots.length) return;

    // Opt-in directional slide, set per project via a modifier class
    // on .hero__visual-carousel — otherwise falls back to crossfade.
    let direction = null;
    if (carousel && carousel.classList.contains('hero__visual-carousel--slide-btt')) direction = 'btt';
    else if (carousel && carousel.classList.contains('hero__visual-carousel--slide-rtl')) direction = 'rtl';
    else if (carousel && carousel.classList.contains('hero__visual-carousel--slide-ttb')) direction = 'ttb';

    let current = 0;
    let timer = null;
    let animating = false;

    function goTo(index) {
      if (index === current) return;

      if (direction) {
        if (animating) return;
        animating = true;

        const outgoing = slides[current];
        const incoming = slides[index];
        const exitClass = 'is-exit-' + direction;

        outgoing.classList.remove('is-active');
        outgoing.classList.add(exitClass);
        incoming.classList.add('is-active');

        window.setTimeout(() => {
          // Snap back to the resting position instantly — removing the
          // exit class alone would fall back to the resting transform
          // with the transition still enabled, animating the hidden
          // slide visibly back through the frame.
          outgoing.classList.add('no-transition');
          outgoing.classList.remove(exitClass);
          void outgoing.offsetWidth; // force reflow so the snap applies before re-enabling the transition
          outgoing.classList.remove('no-transition');
          animating = false;
        }, SLIDE_DURATION_MS);
      } else {
        slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      }

      current = index;
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    }

    function startAutoAdvance() {
      clearInterval(timer);
      timer = setInterval(() => {
        goTo((current + 1) % slides.length);
      }, AUTO_ADVANCE_MS);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startAutoAdvance();
      });
    });

    // Initialize slide 0 / dot 0 directly (goTo bails out early when
    // index === current, so it can't perform the initial sync itself).
    slides[0].classList.add('is-active');
    dots[0].classList.add('is-active');
    dots[0].setAttribute('aria-selected', 'true');

    startAutoAdvance();
  });
}

/* ---- Home Hero Carousel — vertical slide transition ----
   Auto-advances upward every 3.75s; the Back/Next buttons in the left
   panel drive it manually. Next always slides the incoming image up
   from the bottom; Back reverses direction, sliding the previous
   image down from the top. Distinct from the dot/crossfade carousel
   used on project-page heroes (initHeroVisualCarousel). */
function initHomeHeroCarousel() {
  const root = document.querySelector('[data-home-carousel]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.home-hero-carousel__slide'));
  if (slides.length < 2) return;

  const backBtn = document.querySelector('[data-home-carousel-back]');
  const nextBtn = document.querySelector('[data-home-carousel-next]');

  const DURATION = 700;
  const INTERVAL = 3750;

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  let animating = false;
  let timer = null;

  function goTo(index, direction) {
    if (animating || index === current) return;
    animating = true;

    const outgoing = slides[current];
    const incoming = slides[index];

    if (direction === 'back') {
      // Snap the incoming slide to the top edge instantly, before animating in.
      incoming.classList.add('no-transition', 'is-enter-top');
      void incoming.offsetWidth; // force reflow so the snap applies before the transition below
      incoming.classList.remove('no-transition');
    }

    outgoing.classList.remove('is-active');
    outgoing.classList.add(direction === 'next' ? 'is-exit-up' : 'is-exit-down');
    incoming.classList.remove('is-enter-top');
    incoming.classList.add('is-active');

    window.setTimeout(() => {
      // Snap back to the resting position instantly — removing the exit
      // class alone would fall back to the base transform with the
      // transition still enabled, animating the hidden slide visibly
      // back through the frame.
      outgoing.classList.add('no-transition');
      outgoing.classList.remove('is-exit-up', 'is-exit-down');
      void outgoing.offsetWidth; // force reflow so the snap applies before re-enabling the transition
      outgoing.classList.remove('no-transition');
      animating = false;
    }, DURATION);

    current = index;
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo((current + 1) % slides.length, 'next'), INTERVAL);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goTo((current + 1) % slides.length, 'next');
      restartTimer();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goTo((current - 1 + slides.length) % slides.length, 'back');
      restartTimer();
    });
  }

  restartTimer();
}

/* ---- About Hero Carousel — directional ambient background loop ----
   Fully automatic, no manual controls. Each slide has a fixed
   data-direction (rtl/ttb/btt/ltr) determining which edge it enters
   from every time it becomes active; the outgoing slide exits along
   that same direction for a continuous push effect. Cycles through
   as many slides as exist, repeating the direction pattern. */
function initAboutHeroCarousel() {
  const root = document.querySelector('[data-about-carousel]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.about-hero-carousel__slide'));
  if (slides.length < 2) return;

  const DURATION = 800;
  const IMAGE_DWELL_MS = 4000;
  // How far ahead of a video's natural end to trigger the transition,
  // so it advances just before looping back to its own first frame.
  const VIDEO_END_LEAD_MS = 100;

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  let advanceTimer = null;

  function mediaFor(slide) {
    return slide.querySelector('img, video');
  }

  // Videos only play while their slide is the active one — no autoplay
  // attribute in the markup, so a slide further down the carousel isn't
  // silently burning through its runtime off-screen before its turn.
  function scheduleAdvance(slide) {
    clearTimeout(advanceTimer);
    const media = mediaFor(slide);

    if (!media || media.tagName === 'IMG') {
      advanceTimer = setTimeout(() => goTo((current + 1) % slides.length), IMAGE_DWELL_MS);
      return;
    }

    const video = media;
    video.currentTime = 0;
    video.play().catch(() => {});

    function armFromDuration() {
      const ms = Math.max(0, video.duration * 1000 - VIDEO_END_LEAD_MS);
      advanceTimer = setTimeout(() => goTo((current + 1) % slides.length), ms);
    }

    if (video.readyState >= 1 && isFinite(video.duration)) {
      armFromDuration();
    } else {
      video.addEventListener('loadedmetadata', armFromDuration, { once: true });
    }
  }

  function goTo(index) {
    const outgoing = slides[current];
    const incoming = slides[index];
    const direction = incoming.dataset.direction;
    const exitClass = 'is-exit-' + direction;

    const outgoingMedia = mediaFor(outgoing);
    if (outgoingMedia && outgoingMedia.tagName === 'VIDEO') {
      outgoingMedia.pause();
    }

    outgoing.classList.remove('is-active');
    outgoing.classList.add(exitClass);
    incoming.classList.add('is-active');

    window.setTimeout(() => {
      // Snap back to the resting position instantly — removing the
      // exit class alone would fall back to the slide's own baked-in
      // resting transform with the transition still enabled, animating
      // it visibly back through the frame.
      outgoing.classList.add('no-transition');
      outgoing.classList.remove(exitClass);
      void outgoing.offsetWidth; // force reflow so the snap applies before re-enabling the transition
      outgoing.classList.remove('no-transition');
    }, DURATION);

    current = index;
    scheduleAdvance(incoming);
  }

  scheduleAdvance(slides[current]);
}

/* ---- Card Image Carousel — manual nav only, no auto-advance ---- */
function initCardCarousels() {
  document.querySelectorAll('.card-carousel').forEach(carousel => {
    const track  = carousel.querySelector('.card-carousel__track');
    const slides = carousel.querySelectorAll('.card-carousel__slide');

    const card    = carousel.closest('.project-card');
    const btnPrev = card ? card.querySelector('.card-carousel__btn--prev') : null;
    const btnNext = card ? card.querySelector('.card-carousel__btn--next') : null;

    if (!track || !slides.length || !btnPrev || !btnNext) return;

    const total  = slides.length;
    let current  = 0;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    btnPrev.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      goTo(current - 1);
    });

    btnNext.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      goTo(current + 1);
    });
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
