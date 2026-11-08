/*
  MARCAÇÃO DE REUNIÕES COM O CAL.COM
  - CAL_LINK: o teu link do Cal.com (sem "https://cal.com/").
  - As marcações vão para o calendário que escolheste nas definições do Cal.com.
*/
const CAL_LINK = 'moved-visuals-1wjgzd/60min';
const CAL_NS = 'mbv';

(function () {
  const card = document.querySelector('.contact-card');
  const panel = document.getElementById('booking');
  const holder = document.getElementById('booking-cal');
  const title = panel && panel.querySelector('.booking-title');
  if (!card || !panel || !holder) return;

  let lastName = '';

  // código oficial do Cal.com para pôr o calendário dentro do site (só carrega quando é preciso)
  function loadCal() {
    if (window.Cal) return;
    (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
    window.Cal('init', CAL_NS, { origin: 'https://cal.com' });
    window.Cal.ns[CAL_NS]('ui', {
      theme: 'dark',
      cssVarsPerTheme: { dark: { 'cal-brand': '#ffb347', 'cal-bg': '#141416', 'cal-bg-muted': '#1b1b1e' } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
  }

  function setTitle() {
    title.textContent = lastName ? t('book.thanks').replace('{name}', lastName.split(' ')[0]) : t('book.title');
  }

  function open(prefill) {
    prefill = prefill || {};
    lastName = prefill.name || '';
    setTitle();
    loadCal();
    // um calendário novo de cada vez, para levar o nome/email certos
    holder.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'booking-cal-inner';
    holder.appendChild(el);
    const config = { layout: 'month_view', theme: 'dark' };
    if (prefill.name) config.name = prefill.name;
    if (prefill.email) config.email = prefill.email;
    if (prefill.notes) config.notes = prefill.notes;
    window.Cal.ns[CAL_NS]('inline', { elementOrSelector: el, calLink: CAL_LINK, config });

    panel.hidden = false;
    card.classList.add('is-booking');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function close() {
    panel.hidden = true;
    card.classList.remove('is-booking');
    holder.innerHTML = '';
    lastName = '';
  }

  document.querySelectorAll('[data-book-open]').forEach((b) => b.addEventListener('click', () => open()));
  document.querySelectorAll('[data-book-close]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('languagechange', () => { if (!panel.hidden) setTitle(); });

  window.openBooking = open;
})();
