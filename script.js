const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');

  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const backToTop = $('#backToTop');
  const mobileMenu = $('#mobileMenu');
  const menuToggle = $('.menu-toggle');
  const menuClose = $('.mobile-menu__close');
  const toast = $('#toast');
  const copyStatus = $('#copyStatus');
  const main = $('#main-content');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const onMediaQueryChange = (query, listener) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener);
    } else if (typeof query.addListener === 'function') {
      query.addListener(listener);
    }
  };
  let toastTimer;
  let copyTimer;
  let menuIsOpen = false;

  const menuBackground = [$('.skip-link'), $('.nav-shell'), main, $('.site-footer'), backToTop]
    .filter(Boolean);

  const setBackgroundInert = (inert) => {
    menuBackground.forEach((element) => {
      if (inert) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    });
  };

  // Compact header, compositor-friendly progress, and back-to-top control.
  let scrollRange = 1;
  let scrollFramePending = false;

  const measureScrollRange = () => {
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  const paintScrollUI = () => {
    const scrollTop = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollTop > 18);
    backToTop?.classList.toggle('is-visible', scrollTop > 700);

    if (progress) {
      const ratio = Math.min(Math.max(scrollTop / scrollRange, 0), 1);
      progress.style.transform = `scaleX(${ratio})`;
    }

    scrollFramePending = false;
  };

  const requestScrollPaint = () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    window.requestAnimationFrame(paintScrollUI);
  };

  measureScrollRange();
  paintScrollUI();
  window.addEventListener('scroll', requestScrollPaint, { passive: true });
  window.addEventListener('resize', measureScrollRange, { passive: true });

  if ('ResizeObserver' in window && main) {
    const resizeObserver = new ResizeObserver(measureScrollRange);
    resizeObserver.observe(main);
  }

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionQuery.matches ? 'auto' : 'smooth' });
    $('#home')?.focus({ preventScroll: true });
  });

  // Accessible modal navigation. Native dialog semantics provide focus containment.
  const setMenu = (open, restoreFocus = true) => {
    if (!mobileMenu || !menuToggle) return;

    if (open && !menuIsOpen) {
      menuIsOpen = true;
      mobileMenu.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation');
      document.body.classList.add('menu-open');
      setBackgroundInert(true);

      if (typeof mobileMenu.showModal === 'function') {
        mobileMenu.showModal();
      } else {
        mobileMenu.setAttribute('open', '');
      }

      window.requestAnimationFrame(() => menuClose?.focus());
      return;
    }

    if (!open && menuIsOpen) {
      menuIsOpen = false;
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
      setBackgroundInert(false);

      if (mobileMenu.open && typeof mobileMenu.close === 'function') {
        mobileMenu.close();
      } else {
        mobileMenu.removeAttribute('open');
      }

      if (restoreFocus) menuToggle.focus();
    }
  };

  menuToggle?.addEventListener('click', () => setMenu(!menuIsOpen));
  menuClose?.addEventListener('click', () => setMenu(false));

  mobileMenu?.addEventListener('close', () => {
    menuIsOpen = false;
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
    setBackgroundInert(false);

    if (mobileQuery.matches && document.activeElement === document.body) {
      menuToggle?.focus({ preventScroll: true });
    }
  });

  // Keep keyboard focus in the modal even if a browser's native dialog trap
  // briefly passes through the document body.
  mobileMenu?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      mobileMenu,
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !mobileMenu.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !mobileMenu.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileMenu?.addEventListener('click', (event) => {
    if (event.target === mobileMenu) setMenu(false);
  });

  const focusDestination = (target) => {
    if (!target) return;
    const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';
    const destination = target.matches(focusableSelector)
      ? target
      : target.querySelector('h1, h2, h3') || target;

    if (!destination.matches(focusableSelector)) {
      destination.setAttribute('tabindex', '-1');
    }
    destination.focus({ preventScroll: true });
  };

  $$('#mobileMenu a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.hash);
      setMenu(false, false);
      window.requestAnimationFrame(() => focusDestination(target));
    });
  });

  onMediaQueryChange(mobileQuery, (event) => {
    if (!event.matches && menuIsOpen) setMenu(false, false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuIsOpen) {
      event.preventDefault();
      setMenu(false);
    }
  });

  // The skip link should move keyboard focus, not only the document scroll position.
  $('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ behavior: motionQuery.matches ? 'auto' : 'smooth' });
  });

  // Same-page destinations become meaningful focus contexts.
  $$('a[href^="#"]').forEach((link) => {
    if (link.closest('#mobileMenu') || link.classList.contains('skip-link')) return;
    link.addEventListener('click', () => {
      const target = document.querySelector(link.hash);
      window.requestAnimationFrame(() => focusDestination(target));
    });
  });

  const showToast = () => {
    if (!toast) return;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const fallbackCopy = (text) => {
    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.top = '0';
    fallback.style.opacity = '0';
    document.body.appendChild(fallback);
    fallback.select();
    const copied = document.execCommand('copy');
    fallback.remove();
    return copied;
  };

  $$('[data-copy-email]').forEach((button) => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail;
      let copied = false;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(email);
          copied = true;
        } else {
          copied = fallbackCopy(email);
        }
      } catch {
        copied = fallbackCopy(email);
      }

      button.focus({ preventScroll: true });

      if (copied) {
        button.textContent = 'Copied';
        button.classList.add('is-copied');
        if (copyStatus) copyStatus.textContent = `Copied ${email} to the clipboard.`;
        showToast();
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          button.textContent = 'Copy email';
          button.classList.remove('is-copied');
        }, 2200);
      } else {
        if (copyStatus) copyStatus.textContent = 'Could not copy automatically. Use the email link or select the address manually.';
        button.textContent = 'Try again';
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => { button.textContent = 'Copy email'; }, 2200);
      }
    });
  });

  // Phrase-level role rotation preserves the interaction without flooding live regions.
  const typingElement = $('#typing');
  const roles = ['Python Developer', 'JavaScript Developer', 'AI & ML Learner', 'Frontend Developer'];
  let roleIndex = 0;
  let roleTimer;

  const scheduleRoleChange = () => {
    window.clearTimeout(roleTimer);
    if (!typingElement || motionQuery.matches || document.hidden) return;

    roleTimer = window.setTimeout(() => {
      typingElement.classList.add('is-changing');
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        typingElement.textContent = roles[roleIndex];
        typingElement.classList.remove('is-changing');
        scheduleRoleChange();
      }, 180);
    }, 2800);
  };

  scheduleRoleChange();

  onMediaQueryChange(motionQuery, () => {
    if (motionQuery.matches && typingElement) {
      window.clearTimeout(roleTimer);
      typingElement.classList.remove('is-changing');
      typingElement.textContent = roles[0];
    } else {
      scheduleRoleChange();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(roleTimer);
    else scheduleRoleChange();
  });

  // Reveal content only after the observer is ready; otherwise all content stays visible.
  const revealItems = $$('.reveal');
  let revealObserver;

  if ('IntersectionObserver' in window && !motionQuery.matches) {
    try {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          const bounds = entry.boundingClientRect;
          const withinViewport = bounds.top <= window.innerHeight + 80 && bounds.bottom >= -80;
          if (!entry.isIntersecting || !withinViewport) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px' });
    } catch {
      revealObserver = null;
    }
  }

  if (revealObserver) {
    document.documentElement.classList.add('motion-ready');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        revealItems.forEach((item) => revealObserver.observe(item));
      });
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Filter the project archive while preserving native hidden semantics.
  const filterButtons = $$('[data-project-filter]');
  const archiveItems = $$('.archive-item');
  const filterStatus = $('#filterStatus');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      archiveItems.forEach((item) => {
        const visible = filter === 'all' || item.dataset.projectCategory === filter;
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (filterStatus) {
        if (filter === 'all') {
          filterStatus.textContent = visibleCount === 1
            ? 'Showing 1 project'
            : `Showing all ${visibleCount} projects`;
        } else {
          const label = filter === 'python' ? 'Python' : filter === 'java' ? 'Java' : 'interface';
          const projectLabel = visibleCount === 1 ? 'project' : 'projects';
          filterStatus.textContent = visibleCount === 0
            ? `No ${label} projects found`
            : `Showing ${visibleCount} ${label} ${projectLabel}`;
        }
      }
    });
  });

  // Highlight the section currently in view across desktop and mobile navigation.
  const sectionLinks = $$('[data-section-link]');
  const trackedSections = sectionLinks
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);

  if ('IntersectionObserver' in window && trackedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          const isActive = link.dataset.sectionLink === entry.target.id;
          link.classList.toggle('is-active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-24% 0px -62% 0px', threshold: 0 });

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
