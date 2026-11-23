/*
  ANIMAÇÃO DE ENTRADA DO INÍCIO
  - A frase laranja aparece com fade + blur.
  - O título é "escrito" letra a letra, com um cursor à frente.
  - No fim, o texto de baixo e o botão aparecem com fade + blur.
  Velocidade da escrita: muda TYPE_SPEED (milissegundos por letra).
*/
const TYPE_SPEED = 70;

const hero = document.querySelector('.hero');
const title = hero && hero.querySelector('h1');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let typingTimer = null;

function reveal(el, delay) {
  if (el) setTimeout(() => el.classList.add('is-in'), delay);
}

// divide o título em letras (mantém <br> e o <em> laranja)
function splitTitle() {
  const chars = [];
  const fullText = title.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  function build(node, target) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const ch of child.textContent) {
          const span = document.createElement('span');
          span.className = 'tw-c';
          span.textContent = ch;
          target.appendChild(span);
          chars.push(span);
        }
      } else if (child.nodeName === 'BR') {
        target.appendChild(document.createElement('br'));
        chars.push('pause');
      } else {
        const copy = child.cloneNode(false);
        target.appendChild(copy);
        build(child, copy);
      }
    });
  }

  const fragment = document.createElement('div');
  build(title, fragment);
  title.innerHTML = '';
  title.append(...fragment.childNodes);
  title.setAttribute('aria-label', fullText);
  return chars;
}

function typeTitle(onDone) {
  clearTimeout(typingTimer);
  if (!title) return;

  const items = splitTitle();
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor typing';
  cursor.setAttribute('aria-hidden', 'true');
  title.classList.add('is-typing');

  if (reduceMotion) {
    items.forEach((c) => c !== 'pause' && c.classList.add('on'));
    if (onDone) onDone();
    return;
  }

  // cursor no início
  const first = items.find((c) => c !== 'pause');
  first.parentNode.insertBefore(cursor, first);

  let i = 0;
  function step() {
    if (i >= items.length) {
      cursor.classList.remove('typing');
      if (onDone) onDone();
      return;
    }
    const item = items[i++];
    if (item === 'pause') {
      typingTimer = setTimeout(step, TYPE_SPEED * 4);
      return;
    }
    item.classList.add('on');
    item.after(cursor);
    const jitter = TYPE_SPEED * (0.6 + Math.random() * 0.8); // ritmo humano
    typingTimer = setTimeout(step, jitter);
  }
  typingTimer = setTimeout(step, TYPE_SPEED * 3);
}

/*
  ECRÃ DE CARREGAMENTO
  1. Aparece uma bola no centro com um anel laranja a rodar.
  2. Quando a página está pronta, o logo aparece dentro da bola.
  3. A bola "explode" (rebenta para a frente com uma onda laranja) e o site aparece.
  Tempo mínimo a mostrar o logo: MIN_LOADER_TIME (milissegundos).
*/
const MIN_LOADER_TIME = 1200;

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function runLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  if (reduceMotion) { loader.remove(); return; }

  const start = performance.now();
  const logo = loader.querySelector('img');
  const portrait = hero && hero.querySelector('.hero-portrait');
  // espera pelo logo, pela foto e pelas letras (no máximo 3,5 s)
  const ready = Promise.all([
    logo && logo.decode ? logo.decode().catch(() => {}) : Promise.resolve(),
    portrait && portrait.decode ? portrait.decode().catch(() => {}) : Promise.resolve(),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ]);
  await Promise.race([logo && logo.decode ? logo.decode().catch(() => {}) : Promise.resolve(), wait(1500)]);
  loader.classList.add('is-ready'); // o logo aparece na bola
  await Promise.race([ready, wait(3500)]);
  const left = MIN_LOADER_TIME - (performance.now() - start);
  if (left > 0) await wait(left);

  loader.classList.add('is-exploding');
  await wait(450); // o site começa a aparecer enquanto a explosão acaba
  setTimeout(() => loader.remove(), 1000);
}

if (hero && title) {
  const eyebrow = hero.querySelector('.eyebrow');
  const lead = hero.querySelector('.lead');
  const button = hero.querySelector('.button');

  runLoader().catch(() => {
    const l = document.querySelector('.loader'); if (l) l.remove();
  }).then(() => {
    reveal(hero.querySelector('.hero-portrait'), 50);
    reveal(eyebrow, 100);
    setTimeout(() => {
      typeTitle(() => {
        reveal(lead, 100);
        reveal(button, 350);
      });
    }, 500);
  });

  // ao trocar PT/EN, o título volta a ser escrito
  document.addEventListener('languagechange', () => typeTitle());
}
