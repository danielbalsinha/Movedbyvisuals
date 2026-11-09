// Ano automático no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Vídeo do início: garantir que toca sozinho, sem som e em loop.
// Alguns browsers bloqueiam o autoplay; nesse caso arranca no 1.º scroll, clique ou toque.
const showreel = document.querySelector('.showreel video');
if (showreel) {
  showreel.muted = true;
  showreel.defaultMuted = true;
  const tryPlay = () => {
    if (showreel.paused) showreel.play().catch(() => {});
  };
  tryPlay();
  showreel.addEventListener('canplay', tryPlay);
  ['scroll', 'click', 'touchstart', 'keydown', 'mousemove'].forEach((ev) =>
    window.addEventListener(ev, tryPlay, { passive: true })
  );
  document.addEventListener('visibilitychange', tryPlay);
  new IntersectionObserver((entries) => {
    entries.forEach((e) => e.isIntersecting && tryPlay());
  }).observe(showreel);
}

// Serviços: abrir/fechar suave, só um aberto de cada vez
const services = document.querySelectorAll('.service');
const reduceMotionServices = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function animateService(service, open) {
  const body = service.querySelector('.service-body');
  if (!body) { service.open = open; return; }
  if (service._anim) service._anim.cancel();

  if (reduceMotionServices) { service.open = open; return; }

  if (open) {
    service.open = true;
    const h = body.offsetHeight;
    const pb = getComputedStyle(body).paddingBottom;
    service._anim = body.animate(
      [{ height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-8px)' },
       { height: `${h}px`, paddingBottom: pb, opacity: 1, transform: 'translateY(0)' }],
      { duration: 550, easing: EASE }
    );
  } else {
    const h = body.offsetHeight;
    const pb = getComputedStyle(body).paddingBottom;
    // fecho mais rápido e com "fill" para não haver um salto no fim
    service._anim = body.animate(
      [{ height: `${h}px`, paddingBottom: pb, opacity: 1 }, { height: '0px', paddingBottom: '0px', opacity: 0 }],
      { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
    );
  }
  service.classList.toggle('is-opening', open);
}

services.forEach((service) => {
  const summary = service.querySelector('summary');
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    const willOpen = !service.open || service.classList.contains('is-closing');
    if (willOpen) {
      services.forEach((other) => { if (other !== service && other.open) closeService(other); });
      service.classList.remove('is-closing');
      animateService(service, true);
    } else {
      closeService(service);
    }
  });
});

function closeService(service) {
  service.classList.add('is-closing');
  animateService(service, false);
  if (service._anim) {
    const anim = service._anim;
    anim.onfinish = () => {
      service.open = false;
      service.classList.remove('is-closing');
      anim.cancel(); // tira o "fill" depois de fechado
    };
  } else {
    service.classList.remove('is-closing');
  }
}

/*
  FORMULÁRIO DE CONTACTO — Web3Forms (web3forms.com)
  As mensagens chegam ao email com que criaste a chave.
  Cola a tua "Access Key" entre as aspas abaixo.
*/
const WEB3FORMS_KEY = 'da62465d-fb22-4e4a-b104-6ff8ac2f593d';

const contactForm = document.getElementById('contact-form');
const formMessage = document.querySelector('.form-message');

if (contactForm && formMessage) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = contactForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(contactForm));

    // texto da opção escolhida numa lista (ex: "Fotografia")
    const label = (name) => {
      const sel = contactForm.elements[name];
      return sel && sel.value ? sel.options[sel.selectedIndex].text : '';
    };

    // se o campo escondido vier preenchido, é um robô de spam
    if (data._honey) return;

    if (!WEB3FORMS_KEY || WEB3FORMS_KEY.startsWith('COLOCA')) {
      formMessage.textContent = t('form.nokey');
      return;
    }

    button.disabled = true;
    formMessage.textContent = t('form.sending');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Novo pedido no site — ${data.name}`,
          from_name: 'Site MovedByVisuals',
          replyto: data.email,
          Nome: data.name,
          Email: data.email,
          Serviço: label('service'),
          Prazo: label('timing'),
          Orçamento: label('budget') || '—',
          Mensagem: data.message,
        }),
      });
      const result = await response.json().catch(() => ({}));
      console.log('Web3Forms:', response.status, result);
      if (!response.ok || !result.success) throw new Error(result.message || `HTTP ${response.status}`);

      formMessage.textContent = t('form.success');
      // passo seguinte: mostrar o calendário já com o nome e o email preenchidos
      if (window.openBooking) window.openBooking({ name: data.name, email: data.email, notes: data.message });
      contactForm.reset();
      updateSelects();
    } catch (error) {
      console.error(error);
      formMessage.textContent = t('form.error');
    } finally {
      button.disabled = false;
    }
  });
}

// listas de escolha: cor cinzenta enquanto não se escolhe nada
function updateSelects() {
  document.querySelectorAll('#contact-form select').forEach((sel) => {
    sel.classList.toggle('is-empty', !sel.value);
  });
}
document.querySelectorAll('#contact-form select').forEach((sel) => sel.addEventListener('change', updateSelects));
updateSelects();

/*
  ANIMAÇÃO "SOBRE MIM"
  Os textos e a foto aparecem com fade + blur quando a secção entra no ecrã
  (ao fazer scroll ou ao clicar em "Sobre"). Voltam a animar sempre que se volta lá.
*/
const revealItems = document.querySelectorAll('.reveal');
revealItems.forEach((el, i) => {
  el.style.transitionDelay = el.classList.contains('reveal--photo') ? '0.15s' : `${0.1 + i * 0.12}s`;
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
revealItems.forEach((el) => revealObserver.observe(el));

/*
  FOTO DO INÍCIO (computador)
  Coloca a foto o mais perto possível do título, sem que o texto tape a cara.
  Na foto (img/about-me.webp) a cara ocupa de 39% a 89% da largura e de 17% a 74% da altura.
*/
const FACE = { left: 0.39, right: 0.89, top: 0.17, bottom: 0.74 };
const FACE_GAP = 24; // espaço (px) entre o fim do texto e a cara

/*
  A posição é sempre calculada com o texto em PORTUGUÊS (que é o mais largo),
  para a foto ficar exatamente no mesmo sítio em PT e em EN.
*/
function measurePT(hero) {
  const original = hero.querySelector(':scope > .container');
  const clone = original.cloneNode(true);
  clone.querySelectorAll('[data-i18n]').forEach((el) => {
    if (typeof PT !== 'undefined' && PT[el.dataset.i18n]) el.textContent = PT[el.dataset.i18n];
  });
  clone.querySelectorAll('[data-i18n-html]').forEach((el) => {
    if (typeof PT !== 'undefined' && PT[el.dataset.i18nHtml]) el.innerHTML = PT[el.dataset.i18nHtml];
  });
  Object.assign(clone.style, {
    position: 'absolute', top: `${original.offsetTop}px`, left: `${original.offsetLeft}px`,
    width: `${original.offsetWidth}px`, visibility: 'hidden', pointerEvents: 'none', margin: '0',
  });
  clone.setAttribute('aria-hidden', 'true');
  // medir sem as animações de entrada (posição final)
  clone.querySelectorAll('*').forEach((el) => { el.style.transform = 'none'; el.style.transition = 'none'; });
  hero.appendChild(clone);
  const lines = [];
  clone.querySelectorAll('.eyebrow, h1, .lead').forEach((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    [...range.getClientRects()].forEach((r) => { if (r.width > 0) lines.push({ top: r.top, bottom: r.bottom, right: r.right }); });
  });
  const btn = clone.querySelector('.button');
  const btnTop = btn ? btn.getBoundingClientRect().top : null;
  clone.remove();
  return { lines, btnTop };
}

function placePortrait() {
  const img = document.querySelector('.hero-portrait');
  const hero = document.querySelector('.hero');
  if (!img || !hero) return;

  img.style.height = '';
  img.style.top = '';
  img.style.bottom = '';
  if (window.innerWidth <= 1000 || !img.naturalWidth) {
    img.style.left = '';
    img.style.right = '';
    return;
  }

  const pt = measurePT(hero);
  const textRightAt = (top, bottom) =>
    pt.lines.reduce((m, r) => (r.bottom > top && r.top < bottom ? Math.max(m, r.right) : m), 0);

  const ratio = img.naturalWidth / img.naturalHeight;
  const heroRect = hero.getBoundingClientRect();
  const header = document.querySelector('.site-header');
  const minTop = (header ? header.getBoundingClientRect().height : 0) + 20; // a cabeça não fica por baixo do menu
  // o queixo fica logo acima do botão branco
  const chinY = pt.btnTop !== null ? pt.btnTop - 18 : heroRect.bottom - 40;

  let imgH = heroRect.height * 0.8;
  let imgTop = 0;
  let left = 0;

  for (let pass = 0; pass < 4; pass++) {
    imgH = Math.min(imgH, (chinY - (heroRect.top + minTop)) / (FACE.bottom - FACE.top));
    const imgW = imgH * ratio;
    imgTop = chinY - imgH * FACE.bottom;
    const faceLeft = textRightAt(imgTop + imgH * FACE.top, chinY) + FACE_GAP;
    const room = window.innerWidth - faceLeft;
    const needed = imgW * (FACE.right - 0.05 - FACE.left);
    if (needed > room && pass < 3) {
      imgH = Math.max(heroRect.height * 0.4, room / ((FACE.right - 0.05 - FACE.left) * ratio));
      continue;
    }
    left = faceLeft - imgW * FACE.left - heroRect.left;
    break;
  }

  img.style.height = `${Math.round(imgH)}px`;
  img.style.bottom = 'auto';
  img.style.top = `${Math.round(imgTop - heroRect.top)}px`;
  img.style.right = 'auto';
  img.style.left = `${Math.round(left)}px`;
}

window.addEventListener('load', placePortrait);
window.addEventListener('resize', placePortrait);
document.addEventListener('languagechange', () => requestAnimationFrame(placePortrait));
if (document.fonts) document.fonts.ready.then(placePortrait);
placePortrait();
