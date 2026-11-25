const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

document.addEventListener('DOMContentLoaded', () => {
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const backToTop = $('#backToTop');
  const mobileMenu = $('#mobileMenu');
  const menuToggle = $('.menu-toggle');
  const menuClose = $('.mobile-menu__close');
  const toast = $('#toast');
  let toastTimer;

  // Compact header, reading progress, and back-to-top control.
  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle('is-scrolled', scrollTop > 18);
    backToTop?.classList.toggle('is-visible', scrollTop > 700);

    if (progress) {
      const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
      progress.style.width = `${ratio * 100}%`;
    }
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Accessible mobile navigation.
  const setMenu = (open) => {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(true);
    window.setTimeout(() => $('#mobileMenu a')?.focus(), 120);
  });
  menuClose?.addEventListener('click', () => {
    setMenu(false);
    menuToggle?.focus();
  });
  $$('#mobileMenu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

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
    fallback.style.opacity = '0';
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  };

  $$('[data-copy-email]').forEach((button) => {
    button.addEventListener('click', () => {
      const email = button.dataset.copyEmail;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(() => {
          fallbackCopy(email);
          showToast();
        });
        return;
      }

      fallbackCopy(email);
      showToast();
    });
  });

  // Typing role sequence retained from the original portfolio.
  const typingElement = $('#typing');
  const roles = ['Python Functioner', 'JavaScript Functioner', 'AI Researcher', 'Frontend Enhancer'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typingElement && !reduceMotion) {
    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    const typeRole = () => {
      const role = roles[roleIndex];
      typingElement.textContent = role.slice(0, characterIndex);

      if (!deleting && characterIndex < role.length) {
        characterIndex += 1;
        window.setTimeout(typeRole, 85);
        return;
      }

      if (!deleting && characterIndex === role.length) {
        deleting = true;
        window.setTimeout(typeRole, 1500);
        return;
      }

      if (deleting && characterIndex > 0) {
        characterIndex -= 1;
        window.setTimeout(typeRole, 42);
        return;
      }

      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      window.setTimeout(typeRole, 420);
    };

    window.setTimeout(typeRole, 450);
  }

  // Reveal content as it enters the viewport.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Highlight the section currently in view.
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
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  // Keep keyboard focus in the mobile panel while it is open.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu?.classList.contains('is-open')) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
