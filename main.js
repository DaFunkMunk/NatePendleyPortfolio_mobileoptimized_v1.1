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
    const phraseSequence = [
      'A Houston developer who wrangles data by day',
      'lassos bugs by night',
      'and leaves teams with faster',
      'cleaner workflows'
    ];

    if (!nameEl) {
      await wait(introAndGapSec * 1000);
      startTyping();
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
      startTyping();
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
  const BRAND_SCROLL_OFFSET = -180; // tweak this to reposition the profile card
  const SECTION_SCROLL_OFFSETS = {
    default: -100,
    '#about': -160,
    '#experience': -100,
    '#projects': -100,
    '#contact': -120,
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
    if (!hash) return SECTION_SCROLL_OFFSETS.default;
    return (
      SECTION_SCROLL_OFFSETS[hash.toLowerCase()] ??
      SECTION_SCROLL_OFFSETS[hash] ??
      SECTION_SCROLL_OFFSETS.default
    );
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
  };

  const navLinks = document.querySelectorAll('.site-nav__menu a[href^="#"]');
  navLinks.forEach((link) => link.addEventListener('click', handleSectionLinkClick));

  const heroAnchors = document.querySelectorAll('.hero__scroll[href^="#"]');
  heroAnchors.forEach((anchor) => anchor.addEventListener('click', handleSectionLinkClick));
