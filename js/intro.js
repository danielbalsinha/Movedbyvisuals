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
  const fullText = title.textContent;

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

if (hero && title) {
  const eyebrow = hero.querySelector('.eyebrow');
  const lead = hero.querySelector('.lead');
  const button = hero.querySelector('.button');

  reveal(hero.querySelector('.hero-portrait'), 50);
  reveal(eyebrow, 100);
  setTimeout(() => {
    typeTitle(() => {
      reveal(lead, 100);
      reveal(button, 350);
    });
  }, 500);

  // ao trocar PT/EN, o título volta a ser escrito
  document.addEventListener('languagechange', () => typeTitle());
}
