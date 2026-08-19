/**
 * SBIHM Diploma in Hotel & Hospitality Management Landing Page — script.js
 * Plan D Media | 2026
 *
 * Modules:
 * 1.  Sticky header shadow on scroll
 * 2.  Mobile nav drawer
 * 3.  Smooth scroll with offset for sticky header
 * 4.  Animated count-up stats
 * 5.  Testimonial carousel
 * 6.  FAQ accordion
 * 7.  Lead form validation + submission
 * 8.  Brochure download modal
 * 9.  WhatsApp button bounce (CSS-driven; JS pause on hover)
 * 10. Exit-intent modal
 * 11. Scroll-to-top button
 * 12. DataLayer / GTM event tracking
 */

'use strict';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pushEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

/* ─── Webhook Notification Helper ─────────────────────────────────────────── */
// Posts lead data to Google Apps Script webhook (Sheets + email)
async function sendEmailNotification(formDataObj, formName) {
  const WEBHOOK = 'https://script.google.com/macros/s/AKfycbzh_Px44nbxPtRvFY1vdHKBOEdveZvXH4Is3n8NypeXlhKS24MdVRqw8p63gB_UL1Xz/exec';
  const fd = new FormData();
  fd.append('form_name', formName);
  Object.entries(formDataObj).forEach(([k, v]) => fd.append(k, String(v)));
  await fetch(WEBHOOK, { method: 'POST', body: fd });
}

/* ─── 1. Sticky header shadow ─────────────────────────────────────────────── */

(function initStickyHeader() {
  const header = $('#site-header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── 2. Mobile nav drawer ────────────────────────────────────────────────── */

(function initMobileDrawer() {
  const hamburger = $('#hamburger');
  const drawer = $('#mobile-drawer');
  const closeBtn = $('#drawer-close');
  const backdrop = $('#drawer-backdrop');
  const drawerLinks = $$('.mobile-drawer__link');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeDrawer() {
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    const isOpen = drawer.getAttribute('aria-hidden') === 'false';
    isOpen ? closeDrawer() : openDrawer();
  });

  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  backdrop && backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  const mobileBrochureTrigger = $('#brochure-trigger-mobile');
  mobileBrochureTrigger && mobileBrochureTrigger.addEventListener('click', () => {
    closeDrawer();
    openBrochureModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
      closeDrawer();
    }
  });
})();

/* ─── 3. Smooth scroll with header offset ────────────────────────────────── */

(function initSmoothScroll() {
  function getHeaderOffset() {
    const header = $('#site-header');
    return header ? header.offsetHeight + 8 : 72;
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();

    const offset = getHeaderOffset();
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    if (prefersReducedMotion()) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top, behavior: 'smooth' });
    }

    /* Update focus for accessibility */
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });

    /* Track apply CTA clicks */
    const track = link.dataset.track;
    if (track) {
      pushEvent(track, {
        cta_location: link.dataset.ctaLocation || 'unknown',
        course: 'Diploma'
      });
    }
  });
})();

/* ─── 4. Animated count-up stats ─────────────────────────────────────────── */

(function initCountUp() {
  const stats = $$('[data-target]');
  if (!stats.length || prefersReducedMotion()) {
    /* Just show final values without animation */
    stats.forEach(el => {
      el.textContent = Number(el.dataset.target).toLocaleString('en-IN') + (el.dataset.suffix || '');
    });
    return;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuart(progress) * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;

      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  stats.forEach(el => observer.observe(el));
})();

/* ─── 5. Testimonials — data + carousel ──────────────────────────────────── */

/* TODO-CLIENT: supply DIPLOMA-BATCH testimonials before publishing.
   The reference page's testimonials are BHM-batch alumni and must not be presented
   as diploma outcomes. While this array is empty the whole #testimonials section
   stays hidden. To launch it, add entries shaped like:
   { initials: 'AB', name: 'Student Name', role: 'Diploma Batch 2025 • Placed at …', quote: '…' } */
const DIPLOMA_TESTIMONIALS = [];

(function renderTestimonials() {
  const section = $('#testimonials');
  const track = $('#testimonials-track');
  if (!section || !track) return;

  if (!DIPLOMA_TESTIMONIALS.length) {
    section.setAttribute('hidden', '');
    return;
  }

  section.removeAttribute('hidden');
  const total = DIPLOMA_TESTIMONIALS.length;

  track.innerHTML = DIPLOMA_TESTIMONIALS.map((t, i) => `
    <article class="testimonial-card" role="group" aria-roledescription="slide"
      aria-label="Testimonial ${i + 1} of ${total}">
      <div class="testimonial-card__photo" aria-hidden="true">
        <div class="testimonial-card__photo-placeholder" aria-hidden="true">${t.initials}</div>
      </div>
      <div class="testimonial-card__body">
        <div class="testimonial-card__stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote class="testimonial-card__quote">${t.quote}</blockquote>
        <footer class="testimonial-card__footer">
          <strong class="testimonial-card__name">${t.name}</strong>
          <span class="testimonial-card__role">${t.role}</span>
        </footer>
      </div>
    </article>`).join('');
})();

(function initCarousel() {
  const carousel = $('#testimonials-carousel');
  const track = $('#testimonials-track');
  const prevBtn = $('#carousel-prev');
  const nextBtn = $('#carousel-next');
  const dotsWrap = $('#carousel-dots');

  if (!carousel || !track) return;

  const slides = $$('.testimonial-card', track);
  if (!slides.length) return;
  let current = 0;
  let autoTimer = null;
  const INTERVAL = 6000;

  /* Build dot buttons */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.dataset.index = i;
    if (i === 0) dot.classList.add('active');
    dotsWrap && dotsWrap.appendChild(dot);
  });

  const dots = $$('.carousel-dot', dotsWrap);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function startAuto() {
    if (prefersReducedMotion()) return;
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  dotsWrap && dotsWrap.addEventListener('click', e => {
    const dot = e.target.closest('.carousel-dot');
    if (dot) { goTo(parseInt(dot.dataset.index, 10)); startAuto(); }
  });

  /* Pause on hover */
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);

  /* Touch/swipe support */
  let touchStartX = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  }, { passive: true });

  /* Keyboard navigation */
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); stopAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); }
  });

  /* Init */
  goTo(0);
  startAuto();
})();

/* ─── 6. FAQ accordion ────────────────────────────────────────────────────── */

(function initFAQ() {
  const faqList = $('#faq-list');
  if (!faqList) return;

  function openItem(item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    item.classList.add('faq-item--open');
    btn.setAttribute('aria-expanded', 'true');
    answer.removeAttribute('hidden');
    answer.classList.remove('faq-answer--hidden');
  }

  function closeItem(item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    item.classList.remove('faq-item--open');
    btn.setAttribute('aria-expanded', 'false');
    answer.setAttribute('hidden', '');
    answer.classList.add('faq-answer--hidden');
  }

  faqList.addEventListener('click', e => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;

    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('faq-item--open');

    /* Close all first */
    $$('.faq-item', faqList).forEach(closeItem);

    /* Toggle clicked item */
    if (!isOpen) openItem(item);
  });

  /* Keyboard: arrow keys to navigate between items */
  faqList.addEventListener('keydown', e => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;

    const items = $$('.faq-item', faqList);
    const current = items.findIndex(item => item.contains(btn));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[current + 1];
      next && next.querySelector('.faq-question').focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[current - 1];
      prev && prev.querySelector('.faq-question').focus();
    }
  });
})();

/* ─── 7. Lead form validation + submission ────────────────────────────────── */

(function initLeadForm() {
  const form = $('#apply-form');
  const submitBtn = $('#submit-btn');
  const formWrap = $('#apply-form-wrap');
  const thankyou = $('#apply-thankyou');
  const nameField = thankyou && $('#thankyou-name', thankyou);
  const errBanner = $('#form-error-message');

  if (!form) return;

  const validators = {
    name: v => v.trim().length >= 2 ? null : 'Please enter your full name.',
    phone: v => /^[6-9][0-9]{9}$/.test(v.replace(/\s/g, '')) ? null : 'Please enter a valid 10-digit Indian mobile number.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.',
  };

  function validateField(fieldName, value) {
    return validators[fieldName] ? validators[fieldName](value) : null;
  }

  function showFieldError(input, message) {
    const errId = input.id ? `error-${input.name}` : null;
    const errEl = errId ? $(`#${errId}`) : null;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(input) {
    const errId = input.id ? `error-${input.name}` : null;
    const errEl = errId ? $(`#${errId}`) : null;
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    if (errEl) errEl.textContent = '';
  }

  /* Blur-time validation */
  $$('input, select', form).forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.name || input.type === 'radio' || input.type === 'checkbox') return;
      const err = validateField(input.name, input.value);
      err ? showFieldError(input, err) : clearFieldError(input);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        const err = validateField(input.name, input.value);
        err ? showFieldError(input, err) : clearFieldError(input);
      }
    });
  });

  function getCampusValue() {
    const checked = form.querySelector('input[name="campus"]:checked');
    return checked ? checked.value : '';
  }

  function validateAll() {
    let valid = true;
    const errors = [];

    ['name', 'phone', 'email'].forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      const err = validateField(name, input.value);
      if (err) {
        showFieldError(input, err);
        if (valid) { input.focus(); }
        valid = false;
        errors.push(err);
      } else {
        clearFieldError(input);
      }
    });

    if (!getCampusValue()) {
      const errEl = $('#error-campus');
      if (errEl) errEl.textContent = 'Please select a preferred campus.';
      valid = false;
      errors.push('Please select a campus.');
    } else {
      const errEl = $('#error-campus');
      if (errEl) errEl.textContent = '';
    }

    return valid;
  }

  function setButtonLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Submitting…' : 'Apply Now & Get Brochure →';
  }

  function showError(message) {
    if (!errBanner) return;
    errBanner.textContent = message;
    errBanner.removeAttribute('hidden');
    errBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    if (!errBanner) return;
    errBanner.setAttribute('hidden', '');
    errBanner.textContent = '';
  }

  /* Check honeypot */
  function isBot() {
    const hp = form.querySelector('#hp-website');
    return hp && hp.value.length > 0;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideError();

    if (isBot()) {
      /* Silently succeed for bots */
      setButtonLoading(true);
      return;
    }

    if (!validateAll()) return;

    const formData = {
      name: form.querySelector('[name="name"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      campus: getCampusValue(),
      source: form.querySelector('[name="source"]').value || 'not_specified',
      whatsapp_optin: form.querySelector('#field-whatsapp-optin')?.checked ?? false,
      course: 'Diploma',
      timestamp: new Date().toISOString(),
    };

    console.log('[SBIHM Lead Form]', formData);

    setButtonLoading(true);

    try {
      await sendEmailNotification(formData, 'Main Apply Form');

      /* Push GTM event */
      pushEvent('lead_submit', {
        course: 'Diploma',
        campus: formData.campus,
        source: formData.source,
      });

      /* Redirect to thank-you page */
      window.location.href = 'thankyou.html';

    } catch (err) {
      setButtonLoading(false);
      showError('Something went wrong. Please try again or WhatsApp us directly at +91 7003872527.');
    }
  });
})();

/* ─── 7b. Hero Enquiry Form (in-hero form) ────────────────────────────────── */

(function initHeroForm() {
  const form = $('#hero-enquiry-form');
  const submitBtn = $('#hf-submit-btn');
  const formContainer = $('#hero-form-container');
  const successEl = $('#hero-form-success');

  if (!form) return;

  /* ── Validators ── */
  const validators = {
    fullname: v => v.trim().length >= 2 ? null : 'Please enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.',
    phone: v => /^[6-9][0-9]{9}$/.test(v.replace(/\s/g, '')) ? null : 'Enter a valid 10-digit mobile number.',
  };

  /* ── Helpers ── */
  function setError(groupId, message) {
    const group = $(`#${groupId}`);
    const errEl = $(`#err-${groupId.replace('field-', '')}`);
    if (group) group.classList.add('hero-form__group--error');
    if (errEl) errEl.textContent = message || '';
  }

  function clearError(groupId) {
    const group = $(`#${groupId}`);
    const errEl = $(`#err-${groupId.replace('field-', '')}`);
    if (group) group.classList.remove('hero-form__group--error');
    if (errEl) errEl.textContent = '';
  }

  function validateField(name, value) {
    return validators[name] ? validators[name](value) : null;
  }

  function getCampusValues() {
    return $$('input[name="campus"]:checked', form).map(el => el.value);
  }

  /* ── Blur-time validation ── */
  $$('input:not([type="checkbox"]), select', form).forEach(input => {
    input.addEventListener('blur', () => {
      const name = input.name;
      const groupId = `field-${name === 'fullname' ? 'fullname' : name}`;
      const err = validateField(name, input.value);
      err ? setError(groupId, err) : clearError(groupId);
    });

    input.addEventListener('input', () => {
      const name = input.name;
      const groupId = `field-${name === 'fullname' ? 'fullname' : name}`;
      const group = $(`#${groupId}`);
      if (group && group.classList.contains('hero-form__group--error')) {
        const err = validateField(name, input.value);
        err ? setError(groupId, err) : clearError(groupId);
      }
    });
  });

  /* Phone field — digits only */
  const phoneInput = $('#hf-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  /* Campus checkboxes — clear error when any is checked */
  $$('input[name="campus"]', form).forEach(cb => {
    cb.addEventListener('change', () => {
      if (getCampusValues().length > 0) {
        clearError('field-campus');
      }
    });
  });

  /* WhatsApp checkbox — clear error when checked */
  const waCheckbox = $('#hf-whatsapp');
  if (waCheckbox) {
    waCheckbox.addEventListener('change', () => {
      if (waCheckbox.checked) clearError('field-whatsapp');
    });
  }

  /* ── Full validation ── */
  function validateAll() {
    let firstInvalid = null;
    let valid = true;

    /* Text/select fields */
    const fieldMap = [
      { name: 'fullname', group: 'field-fullname' },
      { name: 'email', group: 'field-email' },
      { name: 'phone', group: 'field-phone' },
    ];

    fieldMap.forEach(({ name, group }) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      const err = validateField(name, input.value);
      if (err) {
        setError(group, err);
        if (!firstInvalid) firstInvalid = input;
        valid = false;
      } else {
        clearError(group);
      }
    });

    /* Campus (at least one checkbox) */
    if (getCampusValues().length === 0) {
      setError('field-campus', 'Please select at least one campus.');
      valid = false;
      if (!firstInvalid) firstInvalid = form.querySelector('input[name="campus"]');
    } else {
      clearError('field-campus');
    }

    /* WhatsApp opt-in */
    if (!waCheckbox || !waCheckbox.checked) {
      setError('field-whatsapp', 'Please agree to receive updates on WhatsApp.');
      valid = false;
      if (!firstInvalid) firstInvalid = waCheckbox;
    } else {
      clearError('field-whatsapp');
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  /* ── Submit ── */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateAll()) return;

    /* Collect data */
    const formData = {
      fullname: form.querySelector('[name="fullname"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      campus: getCampusValues().join(', '),
      whatsapp_optin: true,
      course: 'Diploma',
      source: 'hero_form',
      timestamp: new Date().toISOString(),
    };

    console.log('[SBIHM Hero Form]', formData);

    /* Loading state */
    submitBtn.classList.add('hero-form__submit--loading');
    submitBtn.disabled = true;

    try {
      await sendEmailNotification(formData, 'Hero Enquiry Form');

      /* Push GTM event */
      pushEvent('hero_lead_submit', {
        course: 'Diploma',
        campus: formData.campus,
      });

      /* Redirect to thank-you page */
      window.location.href = 'thankyou.html';

    } catch (err) {
      submitBtn.classList.remove('hero-form__submit--loading');
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or WhatsApp us at +91 7003872527.');
    }
  });

  /* ── Toast dismiss logic ── */
  function dismissToast() {
    if (!successEl || successEl.hasAttribute('hidden')) return;
    successEl.classList.add('toast--dismissing');
    successEl.addEventListener('animationend', () => {
      successEl.setAttribute('hidden', '');
      successEl.classList.remove('toast--dismissing');
    }, { once: true });
  }

  const toastCloseBtn = $('#toast-close-btn');
  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      clearTimeout(window.__toastTimer);
      dismissToast();
    });
  }

  /* Pause auto-dismiss on hover */
  if (successEl) {
    successEl.addEventListener('mouseenter', () => {
      clearTimeout(window.__toastTimer);
      const progressBar = successEl.querySelector('.success-toast__progress');
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    });

    successEl.addEventListener('mouseleave', () => {
      const progressBar = successEl.querySelector('.success-toast__progress');
      if (progressBar) progressBar.style.animationPlayState = 'running';
      window.__toastTimer = setTimeout(() => dismissToast(), 4000);
    });
  }
})();

/* ─── 8. Brochure download modal ──────────────────────────────────────────── */

function openBrochureModal() {
  const modal = $('#brochure-modal');
  if (!modal) return;

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  const firstInput = modal.querySelector('input');
  firstInput && firstInput.focus();

  pushEvent('brochure_download_modal_open', { course: 'Diploma' });
}

function closeBrochureModal() {
  const modal = $('#brochure-modal');
  if (!modal) return;

  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

(function initBrochureModal() {
  const triggers = [
    '#brochure-trigger',
    '#brochure-trigger-hero',
    '#brochure-trigger-programme',
    '#brochure-trigger-thankyou',
  ];

  triggers.forEach(sel => {
    const el = $(sel);
    el && el.addEventListener('click', openBrochureModal);
  });

  const closeBtn = $('#brochure-modal-close');
  const backdrop = $('#brochure-modal-backdrop');
  const form = $('#brochure-form');

  closeBtn && closeBtn.addEventListener('click', closeBrochureModal);
  backdrop && backdrop.addEventListener('click', closeBrochureModal);

  document.addEventListener('keydown', e => {
    const modal = $('#brochure-modal');
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeBrochureModal();
  });

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl = $('#brochure-name');
    const phoneEl = $('#brochure-phone');
    const emailEl = $('#brochure-email');

    let valid = true;

    if (!nameEl.value.trim()) {
      $(`#brochure-error-name`).textContent = 'Please enter your name.';
      nameEl.classList.add('error');
      valid = false;
    } else {
      $(`#brochure-error-name`).textContent = '';
      nameEl.classList.remove('error');
    }

    if (!/^[6-9][0-9]{9}$/.test(phoneEl.value.replace(/\s/g, ''))) {
      $(`#brochure-error-phone`).textContent = 'Please enter a valid 10-digit mobile number.';
      phoneEl.classList.add('error');
      valid = false;
    } else {
      $(`#brochure-error-phone`).textContent = '';
      phoneEl.classList.remove('error');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      $(`#brochure-error-email`).textContent = 'Please enter a valid email address.';
      emailEl.classList.add('error');
      valid = false;
    } else {
      $(`#brochure-error-email`).textContent = '';
      emailEl.classList.remove('error');
    }

    if (!valid) return;

    console.log('[SBIHM Brochure Lead]', {
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      email: emailEl.value.trim(),
      course: 'Diploma',
    });

    pushEvent('brochure_download', { course: 'Diploma' });

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      await sendEmailNotification({
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        email: emailEl.value.trim(),
        course: 'Diploma'
      }, 'Brochure Download Form');

      if (submitBtn) {
        submitBtn.textContent = 'Download Brochure ↓';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
    }

    // Trigger brochure PDF download
    // TODO-CLIENT: confirm assets/campus/download.pdf IS the diploma brochure.
    // If it is the BHM brochure, replace the PDF before go-live.
    const link = document.createElement('a');
    link.href = 'assets/campus/download.pdf';
    link.download = 'SBIHM-Diploma-Brochure-2026-27.pdf';
    link.click();

    closeBrochureModal();
  });
})();

/* ─── 10. Exit-intent modal ───────────────────────────────────────────────── */

(function initExitIntent() {
  /* Desktop only, after 30s on page, once per session */
  if (window.innerWidth < 768) return;
  if (sessionStorage.getItem('sbihm_exit_shown')) return;

  const modal = $('#exit-modal');
  const closeBtn = $('#exit-modal-close');
  const backdrop = $('#exit-modal-backdrop');
  const form = $('#exit-form');

  if (!modal) return;

  let pageTime = 0;
  const MIN_TIME = 30000; // 30 seconds

  const timer = setInterval(() => {
    pageTime += 1000;
    if (pageTime >= MIN_TIME) clearInterval(timer);
  }, 1000);

  function openExitModal() {
    if (sessionStorage.getItem('sbihm_exit_shown')) return;
    if (modal.hasAttribute('hidden') === false) return;

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('sbihm_exit_shown', '1');

    const firstInput = modal.querySelector('input');
    firstInput && setTimeout(() => firstInput.focus(), 100);
  }

  function closeExitModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  document.addEventListener('mouseleave', e => {
    if (e.clientY <= 0 && pageTime >= MIN_TIME) {
      openExitModal();
    }
  });

  closeBtn && closeBtn.addEventListener('click', closeExitModal);
  backdrop && backdrop.addEventListener('click', closeExitModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeExitModal();
  });

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl = $('#exit-name');
    const emailEl = $('#exit-email');
    let valid = true;

    if (!nameEl.value.trim()) {
      $(`#exit-error-name`).textContent = 'Please enter your name.';
      nameEl.classList.add('error');
      valid = false;
    } else {
      $(`#exit-error-name`).textContent = '';
      nameEl.classList.remove('error');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      $(`#exit-error-email`).textContent = 'Please enter a valid email.';
      emailEl.classList.add('error');
      valid = false;
    } else {
      $(`#exit-error-email`).textContent = '';
      emailEl.classList.remove('error');
    }

    if (!valid) return;

    console.log('[SBIHM Exit Intent Lead]', {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
    });

    pushEvent('exit_intent_lead', { course: 'Diploma' });

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      await sendEmailNotification({
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        source: 'Exit Intent'
      }, 'Exit Intent Form');

      if (submitBtn) {
        submitBtn.textContent = 'Get the Guide →';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
    }

    // Trigger career guide PDF download
    closeExitModal();
  });
})();

/* ─── 11. Scroll-to-top button ────────────────────────────────────────────── */

(function initScrollToTop() {
  const btn = $('#scroll-to-top');
  if (!btn) return;

  function onScroll() {
    const shouldShow = window.scrollY > 600;
    if (shouldShow) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  }

  btn.addEventListener('click', () => {
    if (prefersReducedMotion()) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── 12. Event tracking — click delegation ───────────────────────────────── */

(function initTracking() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-track]');
    if (!el) return;

    const track = el.dataset.track;

    switch (track) {
      case 'phone_click':
        pushEvent('phone_click', { course: 'Diploma' });
        break;
      case 'whatsapp_click':
        pushEvent('whatsapp_click', { course: 'Diploma' });
        break;
      case 'apply_cta_click':
        pushEvent('apply_cta_click', {
          course: 'Diploma',
          cta_location: el.dataset.ctaLocation || 'unknown',
        });
        break;
    }
  });
})();

/* ─── Active nav highlighting on scroll ───────────────────────────────────── */

(function initNavHighlight() {
  const sections = $$('section[id], div[id="apply"]');
  const navLinks = $$('.site-nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${id}`);
        link.setAttribute('aria-current', href === `#${id}` ? 'page' : 'false');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(sec => observer.observe(sec));
})();

// ────────────────────────────────────────────────────────────────
// SBIHM Lead Capture - Google Apps Script Webhook submission
// Replaces legacy FormSubmit / PHP mail() flow
// Deployed: May 2026
// ────────────────────────────────────────────────────────────────
(function () {
  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzh_Px44nbxPtRvFY1vdHKBOEdveZvXH4Is3n8NypeXlhKS24MdVRqw8p63gB_UL1Xz/exec';
  const THANK_YOU_URL = 'thankyou.html';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[6-9][0-9]{9}$/; // 10-digit Indian mobile, starts 6–9

  /* Resolve the inline error <span> for a given field, working for both
     the hero form (.hero-form__error inside .hero-form__group) and the
     footer form (aria-describedby="error-*" / .form-error inside .form-field). */
  function fieldErrorEl(form, input) {
    const desc = input.getAttribute('aria-describedby');
    if (desc) {
      const el = document.getElementById(desc);
      if (el) return el;
    }
    const group = input.closest('.hero-form__group, .form-field, fieldset');
    return group ? group.querySelector('.hero-form__error, .form-error') : null;
  }

  function markInvalid(form, input, msg) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    const group = input.closest('.hero-form__group');
    if (group) group.classList.add('hero-form__group--error');
    const el = fieldErrorEl(form, input);
    if (el) el.textContent = msg;
  }

  function clearInvalid(form, input) {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    const group = input.closest('.hero-form__group');
    if (group) group.classList.remove('hero-form__group--error');
    const el = fieldErrorEl(form, input);
    if (el) el.textContent = '';
  }

  /* Validate a single lead form. Blocks submission until every mandatory
     field is filled and phone/email are well-formed. Shows inline errors
     and focuses the first invalid field. Returns true only when valid. */
  function validateLeadForm(form) {
    let firstInvalid = null;
    const fail = (input, msg) => {
      markInvalid(form, input, msg);
      if (!firstInvalid) firstInvalid = input;
    };

    const seenGroups = new Set();

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (input.disabled || input.type === 'hidden') return;
      if (input.name === 'website') return; // honeypot — ignore

      const name = input.name || '';
      const type = (input.type || '').toLowerCase();

      /* Radio / checkbox groups: required if any member carries `required`
         (footer campus radios, hero campus checkboxes). At least one checked. */
      if (type === 'radio' || type === 'checkbox') {
        if (!name || seenGroups.has(name)) return;
        const members = Array.prototype.slice.call(
          form.querySelectorAll('input[name="' + name + '"]')
        );
        if (!members.some(function (m) { return m.required; })) return; // optional group
        seenGroups.add(name);
        if (members.some(function (m) { return m.checked; })) {
          members.forEach(function (m) { clearInvalid(form, m); });
        } else {
          fail(members[0], 'Please select an option.');
        }
        return;
      }

      const val = (input.value || '').trim();

      if (input.required && !val) {
        fail(input, 'This field is required.');
        return;
      }
      if (!val) { clearInvalid(form, input); return; } // optional & empty is fine

      if (name === 'phone' || type === 'tel') {
        if (!PHONE_RE.test(val.replace(/\s/g, ''))) {
          fail(input, 'Enter a valid 10-digit mobile number (starts 6–9).');
          return;
        }
      }
      if (name === 'email' || type === 'email') {
        if (!EMAIL_RE.test(val)) {
          fail(input, 'Please enter a valid email address.');
          return;
        }
      }
      clearInvalid(form, input);
    });

    if (firstInvalid) {
      try { firstInvalid.focus(); } catch (err) { /* noop */ }
    }
    return !firstInvalid;
  }

  const forms = document.querySelectorAll('.sbihm-lead-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      /* ── Validation gate ── block empty/invalid submissions entirely.
         No POST, no redirect until the form's own fields are valid. */
      if (!validateLeadForm(form)) return;

      const submitBtn = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );
      const originalLabel = submitBtn
        ? (submitBtn.tagName === 'INPUT' ? submitBtn.value : submitBtn.textContent)
        : null;

      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = 'Submitting...';
        } else {
          submitBtn.textContent = 'Submitting...';
        }
      }

      const formData = new FormData(form);

      /* Multi-select campus fix: checkboxes post as campus[] so every ticked box
         survives; join them into a single `campus` value for the Sheet column. */
      const campusValues = formData.getAll('campus[]');
      if (campusValues.length) {
        formData.delete('campus[]');
        formData.append('campus', campusValues.join(', '));
      }

      formData.append('page', window.location.href);
      formData.append('form_id', form.id || 'unknown');
      formData.append('submitted_at', new Date().toISOString());

      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData
          // Note: do NOT set Content-Type header — FormData sets the
          // correct multipart boundary automatically. Setting it
          // manually breaks the request.
        });

        // Apps Script web apps return opaque responses to cross-origin
        // POSTs. We treat any non-throw as success because the request
        // reached Google's servers. The Sheet write + email happen
        // server-side regardless of what the browser can read back.
        window.location.href = THANK_YOU_URL;

      } catch (error) {
        console.error('SBIHM form submission error:', error);
        alert(
          'Sorry, the form could not be submitted right now. ' +
          'Please call our admissions team or try again in a moment.'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = originalLabel;
          } else {
            submitBtn.textContent = originalLabel;
          }
        }
      }
    });
  });
})();

/* ─── Callback popup (5-second / 40%-scroll trigger) ─────────────────────── */
// Shows once per session. Submission is handled by the shared .sbihm-lead-form
// webhook handler above (form_id: apply-form-popup-diploma, source: popup-diploma).

(function initCallbackPopup() {
  const modal = $('#callback-popup');
  if (!modal) return;

  const closeBtn = $('#callback-popup-close');
  const backdrop = $('#callback-popup-backdrop');
  const SESSION_KEY = 'sbihm_diploma_popup_shown';

  function anotherModalOpen() {
    return $$('.modal:not([hidden])').some(m => m !== modal) ||
      ($('#mobile-drawer') && $('#mobile-drawer').getAttribute('aria-hidden') === 'false');
  }

  function openPopup() {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!modal.hasAttribute('hidden')) return;
    if (anotherModalOpen()) return;

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem(SESSION_KEY, '1');
    pushEvent('callback_popup_open', { course: 'Diploma' });

    const firstInput = modal.querySelector('input:not([type="hidden"])');
    firstInput && setTimeout(() => firstInput.focus(), 100);
  }

  function closePopup() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* Trigger 1: 5 seconds on page */
  const timer = setTimeout(openPopup, 5000);

  /* Trigger 2: 40% scroll depth */
  function onScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= 0.4) {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      openPopup();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  closeBtn && closeBtn.addEventListener('click', closePopup);
  backdrop && backdrop.addEventListener('click', closePopup);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closePopup();
  });
})();
