/*
  LISTAS DE ESCOLHA MODERNAS
  Substitui o aspeto das listas <select> do formulário (Do que precisas? / Para quando? / Orçamento)
  por um menu personalizado. As opções continuam a ser as linhas <option> no index.html.
*/
(function () {
  const selects = document.querySelectorAll('#contact-form select');
  const all = [];

  function closeAll(except) {
    all.forEach((c) => { if (c !== except) c.close(); });
  }

  selects.forEach((select) => {
    const wrap = document.createElement('div');
    wrap.className = 'cselect';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('cselect-native');
    select.tabIndex = -1;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cselect-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="cselect-label"></span><span class="cselect-chev" aria-hidden="true"></span>';

    const list = document.createElement('ul');
    list.className = 'cselect-list';
    list.setAttribute('role', 'listbox');

    wrap.appendChild(btn);
    wrap.appendChild(list);

    let active = -1;
    const options = () => [...select.options].filter((o) => o.value !== '');

    function render() {
      const sel = select.options[select.selectedIndex];
      btn.querySelector('.cselect-label').textContent = sel ? sel.textContent : '';
      wrap.classList.toggle('is-empty', !select.value);
      list.innerHTML = '';
      options().forEach((o, i) => {
        const li = document.createElement('li');
        li.className = 'cselect-option';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(o.value === select.value));
        li.textContent = o.textContent;
        li.addEventListener('click', () => choose(i));
        li.addEventListener('mousemove', () => setActive(i));
        list.appendChild(li);
      });
    }

    function setActive(i) {
      active = i;
      [...list.children].forEach((li, k) => li.classList.toggle('is-active', k === i));
      const li = list.children[i];
      if (li) li.scrollIntoView({ block: 'nearest' });
    }

    function choose(i) {
      const o = options()[i];
      if (!o) return;
      select.value = o.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      render();
      close();
      btn.focus();
    }

    function open() {
      closeAll(api);
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      const idx = options().findIndex((o) => o.value === select.value);
      setActive(idx >= 0 ? idx : 0);
    }

    function close() {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => (wrap.classList.contains('is-open') ? close() : open()));
    btn.addEventListener('keydown', (e) => {
      const n = options().length;
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        if (!wrap.classList.contains('is-open')) { open(); return; }
        setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (wrap.classList.contains('is-open')) { e.preventDefault(); choose(active); }
      } else if (e.key === 'Escape') {
        close();
      }
    });

    // mostrar o aviso "campo obrigatório" no botão
    select.addEventListener('invalid', () => {
      wrap.classList.add('is-invalid');
      btn.focus();
    });
    select.addEventListener('change', () => wrap.classList.remove('is-invalid'));

    const api = { close, render };
    all.push(api);
    render();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cselect')) closeAll();
  });
  document.addEventListener('languagechange', () => all.forEach((c) => c.render()));
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('reset', () => setTimeout(() => all.forEach((c) => c.render()), 0));
})();
