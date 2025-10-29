const outline = document.getElementById('outline');
  if (outline) {
    const w = outline.getComputedTextLength ? outline.getComputedTextLength() : 0;
    const dash = Math.max(Math.ceil(w * 6), 2400);
    outline.setAttribute('pathLength', dash);
    outline.style.setProperty('--len', dash);
    outline.style.strokeDasharray = dash;
    outline.style.strokeDashoffset = dash;
  }

  const nameEl = document.getElementById('name');
  const statement = document.getElementById('statement');
  const rootStyles = getComputedStyle(document.documentElement);
  const navEl = document.getElementById('siteNav');
  const navBrand = document.querySelector('.site-nav__brand');
  const isMobileScreen = () => window.matchMedia('(max-width: 1024px)').matches;

  const toSeconds = (varName, fallback = 0) => {
    const raw = rootStyles.getPropertyValue(varName);
    if (!raw) return fallback;
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return fallback;
    const match = trimmed.match(/^(-?\d*\.?\d+)(ms|s)?$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || 's';
      return unit === 'ms' ? value / 1000 : value;
    }
    const numeric = parseFloat(trimmed);
    return Number.isNaN(numeric) ? fallback : numeric;
  };

  const getVarString = (varName, fallback = '') => {
    const raw = rootStyles.getPropertyValue(varName);
    return raw ? raw.trim() || fallback : fallback;
  };

  const traceDur = toSeconds('--traceDur');
  const fillFadeDur = toSeconds('--fillFadeDur');
  const statementGap = toSeconds('--statementGap');
  const typeDur = toSeconds('--typeDur', 8);
  const howdyDelay = toSeconds('--howdyDelay');
  const howdyFadeDur = toSeconds('--howdyFadeDur');
  const nameFadeDur = toSeconds('--nameFadeDur');
  const nameHold = toSeconds('--nameHold', 1.2);
  const nameCycleGap = toSeconds('--nameCycleGap', 0.2);
  const nameBaseFontSize = getVarString('--nameBaseFontSize', '200px');
  const namePhraseFontSize = getVarString('--namePhraseFontSize', nameBaseFontSize);
  const fillStartFraction = parseFloat(rootStyles.getPropertyValue('--fillStartFraction')) || 0;

  const fillStart = howdyDelay + traceDur * fillStartFraction; // mirrors the CSS calc()
  const howdyEnd = Math.max(howdyDelay + traceDur, fillStart + fillFadeDur);
  const howdyFadeComplete = howdyEnd + howdyFadeDur;
  document.documentElement.style.setProperty('--howdyFinish', `${howdyEnd}s`); // keeps CSS delays readable

  const introAndGapSec = nameFadeDur + nameHold + nameFadeDur + statementGap + nameCycleGap;
  const statementStartSec = howdyFadeComplete + introAndGapSec;
  document.documentElement.style.setProperty('--statementDelay', `${statementStartSec}s`);

  const nameFadeMs = Math.max(nameFadeDur * 1000, 0);
  const nameHoldMs = Math.max(nameHold * 1000, 0);
  const nameGapMs = Math.max(nameCycleGap * 1000, 0);
  const statementGapMs = Math.max(statementGap * 1000, 0);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));

  let typingStarted = false;
  let fullStatementText = '';

  if (statement) {
    fullStatementText = statement.textContent.trim();
    statement.textContent = '';
  }

  if (nameEl) {
    nameEl.classList.remove('is-visible');
  }

  const startTyping = () => {
    if (!statement || typingStarted) return;
    typingStarted = true;

    if (isMobileScreen()) {
      statement.textContent = '';
      statement.style.opacity = 0;
      statement.style.borderRight = '2px solid transparent';
      return;
    }

    statement.style.opacity = 1;
    let index = 0;
    const chars = fullStatementText.length || 1;
    const interval = Math.max((typeDur * 1000) / chars, 20);
    const typer = setInterval(() => {
      index += 1;
      statement.textContent = fullStatementText.slice(0, index);
      if (index >= chars) {
        clearInterval(typer);
        statement.style.borderRight = '2px solid transparent';
      }
    }, interval);
  };

  const fadeInName = async () => {
    if (!nameEl) return;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        nameEl.classList.add('is-visible');
        setTimeout(resolve, nameFadeMs);
      });
    });
  };

  const fadeOutName = async () => {
    if (!nameEl) return;
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        nameEl.classList.remove('is-visible');
        setTimeout(resolve, nameFadeMs);
      });
    });
  };

  const runNameTimeline = async () => {
    const introText = "I'm Nate.";
    const phraseSequence = isMobileScreen() ? [
      'A Houston developer',
      'wrangling data by day',
      'lassos bugs by night',
      'building faster',
      'cleaner workflows'
    ] : [
      'A Houston developer who wrangles data by day',
      'lassos bugs by night',
      'building faster',
      'cleaner workflows'
    ];

    if (!nameEl) {
      await wait(introAndGapSec * 1000);
      if (!isMobileScreen()) {
        startTyping();
      }
      return;
    }

    nameEl.textContent = introText;
    nameEl.style.fontSize = nameBaseFontSize;

    await fadeInName();
    await wait(nameHoldMs);
    await fadeOutName();
    await wait(statementGapMs + nameGapMs);

    for (const phrase of phraseSequence) {
      nameEl.textContent = phrase;
      nameEl.style.fontSize = namePhraseFontSize;
      if (!isMobileScreen()) {
        startTyping();
      }
      await fadeInName();
      await wait(nameHoldMs);
      await fadeOutName();
      await wait(nameGapMs);
    }

    nameEl.textContent = introText;
    nameEl.style.fontSize = nameBaseFontSize;
    await fadeInName();
  };

  const kickoff = async () => {
    await wait(howdyFadeComplete * 1000);
    if (navEl) {
      navEl.classList.add('site-nav--visible');
    }
    await runNameTimeline();
  };

  kickoff();

  const NAV_SCROLL_TRIGGER = 120;
  const updateNavOnScroll = () => {
    if (!navEl) return;
    if (window.scrollY > NAV_SCROLL_TRIGGER) {
      navEl.classList.add('site-nav--scrolled');
    } else {
      navEl.classList.remove('site-nav--scrolled');
    }
  };

  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  updateNavOnScroll();

  const MOBILE_BRAND_QUERY = '(max-width: 1024px)';
  const BRAND_SCROLL_OFFSET = -150; // tweak this to reposition the profile card
  const SECTION_SCROLL_OFFSETS_DESKTOP = {
    default: -150,
    '#about': -150,
    '#experience': -120,
    '#projects': -140,
    '#contact': -120,
  };

  const SECTION_SCROLL_OFFSETS_MOBILE = {
    default: -110,
    '#about': -160,
    '#experience': -160,
    '#projects': -160,
    '#contact': -90,
  };

  const scrollWithOffset = (element, offset = 0) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const targetTop = rect.top + window.scrollY + offset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const boundedTop = Math.min(Math.max(targetTop, 0), Math.max(maxScroll, 0));
    window.scrollTo({ top: boundedTop, behavior: 'smooth' });
  };


  if (navBrand) {
    navBrand.addEventListener('click', (event) => {
      const target = event.target;
      const isInteractiveChild = target.closest('a, button, [role=\"button\"], [role=\"link\"], [aria-controls]');
      if (isInteractiveChild && isInteractiveChild !== navBrand) {
        return;
      }

      if (window.matchMedia(MOBILE_BRAND_QUERY).matches) {
        event.preventDefault();
        const profileCard = document.querySelector('#profile-card');
        if (profileCard) {
          scrollWithOffset(profileCard, BRAND_SCROLL_OFFSET);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  const getSectionOffset = (hash) => {
    const isMobile = window.matchMedia(MOBILE_BRAND_QUERY).matches;
    const sectionOffsets = isMobile ? SECTION_SCROLL_OFFSETS_MOBILE : SECTION_SCROLL_OFFSETS_DESKTOP;
    if (!hash) return sectionOffsets.default;
    return (
      sectionOffsets[hash.toLowerCase()] ??
      sectionOffsets[hash] ??
      sectionOffsets.default
    );
  };

  const navLinks = document.querySelectorAll('.site-nav__menu a[href^="#"]');
  const sidebarLinks = document.querySelectorAll('.content__nav a[href^="#"]');

  const sectionLinkData = Array.from(navLinks)
    .map((link, index) => {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return null;
      const target = document.querySelector(hash);
      if (!target) return null;
      return { link, hash, target, order: index };
    })
    .filter(Boolean);

  const setActiveNavLink = (hash) => {
    sectionLinkData.forEach(({ link, hash: linkHash }) => {
      link.classList.toggle('is-active', hash && linkHash.toLowerCase() === hash.toLowerCase());
    });
  };

  const handleSectionLinkClick = (event) => {
    const link = event.currentTarget;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const offset = getSectionOffset(href);
    scrollWithOffset(target, offset);
    setActiveNavLink(href);
  };

  navLinks.forEach((link) => link.addEventListener('click', handleSectionLinkClick));
  sidebarLinks.forEach((link) => link.addEventListener('click', handleSectionLinkClick));

  if (sectionLinkData.length) {
    const sectionState = new Map(sectionLinkData.map(({ target }) => [target, false]));

    const resolveActiveSection = () => {
      const visibleSections = sectionLinkData
        .filter(({ target }) => sectionState.get(target))
        .sort((a, b) => a.order - b.order);

      if (visibleSections.length) {
        const active = visibleSections[visibleSections.length - 1];
        setActiveNavLink(active.hash);
        return;
      }

      const firstSection = sectionLinkData[0]?.target;
      if (firstSection) {
        const firstTop = firstSection.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY + 40 < firstTop) {
          setActiveNavLink(null);
          return;
        }
      }

      const lastSection = sectionLinkData[sectionLinkData.length - 1];
      if (lastSection) {
        setActiveNavLink(lastSection.hash);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionState.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
        });
        resolveActiveSection();
      },
      {
        rootMargin: '-55% 0px -35% 0px',
        threshold: [0, 0.25, 0.5],
      }
    );

    sectionLinkData.forEach(({ target }) => observer.observe(target));
    window.addEventListener('scroll', resolveActiveSection, { passive: true });
    resolveActiveSection();
  }

  const heroAnchors = document.querySelectorAll('.hero__scroll[href^="#"]');
  heroAnchors.forEach((anchor) => anchor.addEventListener('click', handleSectionLinkClick));

  const projectModal = document.getElementById('projectImageModal');
  const projectModalImage = projectModal?.querySelector('.project-image-modal__image');
  const projectModalClose = projectModal?.querySelector('.project-image-modal__close');
  const projectImageButtons = document.querySelectorAll('.project-card__preview');
  let modalCloseTimer = null;
  let lastFocusedBeforeModal = null;

  const clearModalCloseTimer = () => {
    if (modalCloseTimer) {
      clearTimeout(modalCloseTimer);
      modalCloseTimer = null;
    }
  };

  const closeProjectModal = () => {
    if (!projectModal) return;

    clearModalCloseTimer();
    projectModal.classList.remove('is-visible');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('project-image-modal-open');

    modalCloseTimer = setTimeout(() => {
      projectModal.hidden = true;
      if (projectModalImage) {
        projectModalImage.src = '';
        projectModalImage.alt = '';
      }

      if (lastFocusedBeforeModal) {
        lastFocusedBeforeModal.focus();
        lastFocusedBeforeModal = null;
      }
    }, 260);
  };

  const openProjectModal = (source, altText = '') => {
    if (!projectModal || !projectModalImage || !source) return;

    clearModalCloseTimer();
    lastFocusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    projectModalImage.src = source;
    projectModalImage.alt = altText;

    projectModal.hidden = false;
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('project-image-modal-open');

    requestAnimationFrame(() => {
      projectModal.classList.add('is-visible');
      projectModalClose?.focus();
    });
  };

  projectImageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetImg = button.querySelector('img');
      const fullImageSrc = button.getAttribute('data-full-image') || targetImg?.getAttribute('src') || '';
      const altText = targetImg?.getAttribute('alt') || '';
      openProjectModal(fullImageSrc, altText);
    });
  });

  if (projectModal) {
    projectModal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const dismissTrigger = target.closest('[data-modal-dismiss="true"]');
      if (dismissTrigger || target === projectModal) {
        event.preventDefault();
        closeProjectModal();
      }
    });
  }

  projectModalClose?.addEventListener('click', (event) => {
    event.preventDefault();
    closeProjectModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal && !projectModal.hidden) {
      event.preventDefault();
      closeProjectModal();
    }
  });

  const contactForm = document.getElementById('contactForm');
  const contactStatus = contactForm?.querySelector('.contact-form__status');
  const contactPhoneOptIn = document.getElementById('contactPhoneOptIn');
  const contactPhoneWrapper = contactForm?.querySelector('[data-phone-wrapper]');
  const contactPhoneInput = document.getElementById('contactPhone');
  const contactPreferredTime = document.getElementById('contactPreferredTime');
  const contactSubmittedAt = document.getElementById('contactSubmittedAt');
  const contactRevealButtons = document.querySelectorAll('.contact-reveal__trigger');
  const contactSubmitButton = contactForm?.querySelector('.contact-form__submit');

  const setContactStatus = (message = '', type = 'info') => {
    if (!contactStatus) return;
    contactStatus.textContent = message;
    if (message) {
      contactStatus.dataset.status = type;
    } else {
      contactStatus.removeAttribute('data-status');
    }
  };

  const togglePhoneFields = (shouldShow) => {
    if (!contactPhoneWrapper) return;
    contactPhoneWrapper.hidden = !shouldShow;
    if (contactPhoneInput) {
      contactPhoneInput.required = shouldShow;
      if (!shouldShow) {
        contactPhoneInput.value = '';
      }
    }
    if (!shouldShow && contactPreferredTime) {
      contactPreferredTime.selectedIndex = 0;
    }
  };

  const formatPhoneNumber = (input = '') => {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return digits;
  };

  const formReadyTimestamp = Date.now();

  if (contactSubmittedAt) {
    contactSubmittedAt.value = '';
  }

  if (contactPhoneOptIn) {
    togglePhoneFields(contactPhoneOptIn.checked);
    contactPhoneOptIn.addEventListener('change', () => {
      togglePhoneFields(contactPhoneOptIn.checked);
    });
  }

  contactRevealButtons.forEach((button) => {
    const labelEl = button.querySelector('.contact-reveal__label');
    const valueEl = button.querySelector('.contact-reveal__value');
    const revealType = button.dataset.reveal;

    if (!labelEl || !valueEl) return;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      if (!isExpanded) {
        if (revealType === 'email') {
          const user = valueEl.dataset.user || '';
          const domain = valueEl.dataset.domain || '';
          if (user && domain) {
            const email = `${user}@${domain}`;
            labelEl.textContent = 'Email';
            valueEl.textContent = email;
            button.dataset.href = `mailto:${email}`;
            button.setAttribute('aria-expanded', 'true');
            button.title = 'Click again to start an email';
          }
        } else if (revealType === 'phone') {
          const phoneDigits = valueEl.dataset.phone || '';
          if (phoneDigits) {
            const formatted = formatPhoneNumber(phoneDigits);
            labelEl.textContent = 'Phone';
            valueEl.textContent = formatted;
            const sanitized = phoneDigits.replace(/\D/g, '');
            const telLink = sanitized.length === 10 ? `tel:+1${sanitized}` : `tel:${sanitized}`;
            button.dataset.href = telLink;
            button.setAttribute('aria-expanded', 'true');
            button.title = 'Click again to start a call';
          }
        }
        return;
      }

      const href = button.dataset.href;
      if (href && (href.startsWith('mailto:') || href.startsWith('tel:'))) {
        window.location.href = href;
      }
    });
  });

  if (contactForm) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('contact') === 'success') {
      setContactStatus('Thanks for reaching out! I’ll review your note and follow up shortly.', 'info');
      params.delete('contact');
      const hash = window.location.hash;
      const paramString = params.toString();
      try {
        const nextUrl = `${window.location.pathname}${paramString ? `?${paramString}` : ''}${hash}`;
        window.history.replaceState({}, document.title, nextUrl);
      } catch (err) {
        // no-op if replaceState is not available
      }
    }

    contactForm.addEventListener('submit', (event) => {
      const elapsed = Date.now() - formReadyTimestamp;
      setContactStatus('', 'info');

      if (elapsed < 1500) {
        event.preventDefault();
        setContactStatus('Looks like that was a little fast—add a bit more detail before submitting.', 'error');
        return;
      }

      if (contactPhoneOptIn?.checked) {
        const phoneValue = contactPhoneInput?.value.trim() || '';
        if (!phoneValue || phoneValue.replace(/\D/g, '').length < 10) {
          event.preventDefault();
          setContactStatus('Please share a phone number so I can call you back.', 'error');
          contactPhoneInput?.focus();
          return;
        }
      }

      if (contactSubmittedAt) {
        contactSubmittedAt.value = new Date().toISOString();
      }

      contactSubmitButton?.setAttribute('disabled', 'disabled');
      setContactStatus('Sending your request…', 'info');
    });
  }
