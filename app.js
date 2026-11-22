/* ==========================================================================
   startpage — app
   No build step, no dependencies. Settings live in localStorage.
   ========================================================================== */
(() => {
  'use strict';

  // ------------------------------------------------------------- constants
  const STORE_KEY = 'startpage.prefs.v1';
  const HISTORY_KEY = 'startpage.history.v1';
  const WEATHER_KEY = 'startpage.weather.v1';
  const MAX_BOOKMARKS = 96;
  const MAX_HISTORY = 30;
  const WEATHER_TTL = 30 * 60 * 1000;

  // No engine is chosen by default: the first visit asks which one to use.
  const ENGINES = {
    google: 'https://www.google.com/search?udm=14&q={query}',
    duckduckgo: 'https://duckduckgo.com/?q={query}',
    startpage: 'https://www.startpage.com/sp/search?query={query}',
  };
  const ENGINE_NAMES = { google: 'Google', duckduckgo: 'DuckDuckGo', startpage: 'Startpage' };
  const FALLBACK_ENGINE = ENGINES.duckduckgo;

  const DEFAULT_BOOKMARKS = [
    { key: 'g', name: 'GitHub', url: 'https://github.com/' },
    { key: 'y', name: 'YouTube', url: 'https://www.youtube.com/' },
    { key: 't', name: 'Twitch', url: 'https://www.twitch.tv/' },
    { key: 'p', name: 'Prime Video', url: 'https://www.primevideo.com/' },
    { key: 'tt', name: 'TikTok', url: 'https://www.tiktok.com/en/' },
    { key: 'i', name: 'Instagram', url: 'https://instagram.com/' },
    { key: 'x', name: 'X', url: 'https://x.com/' },
    { key: 'r', name: 'Reddit', url: 'https://www.reddit.com/' },
    { key: '4', name: '4chan', url: 'https://boards.4chan.org/' },
    { key: 'gg', name: 'gg.deals', url: 'https://gg.deals/' },
    { key: 'c', name: 'cs.rin.ru', url: 'https://cs.rin.ru/forum/' },
    { key: 'f', name: 'FMHY', url: 'https://fmhy.net/' },
    { key: 'm', name: 'Megathread', url: 'https://www.reddit.com/r/Piracy/wiki/megathread/' },
    { key: 'pm', name: 'Proton', url: 'https://account.proton.me/apps/' },
    { key: 'gm', name: 'Gmail', url: 'https://mail.google.com/' },
    { key: 'n', name: 'Notes', url: 'https://keep.google.com/u/1/' },
    { key: 'd', name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
  ];

  const DEFAULTS = {
    v: 1,
    search: { template: '', newTab: false, suggest: true, history: true },
    look: {
      background: 'transparent', color: '#0d0d12', image: '', imageBlur: 0, dim: 0,
      accent: '#8b7bff', glass: 8, columns: 'auto', icons: 'site', keys: true, hints: true, motion: true,
    },
    clock: { show: true, seconds: false, h12: false, date: true, greeting: true, name: '' },
    weather: { city: '', units: 'celsius', place: null },
    bookmarks: DEFAULT_BOOKMARKS,
  };

  const ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5s1.2-6 3.6-8.5Z"/></svg>',
    history: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4.5l3 2"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2m-7 0 .8 12h8.4L17 7"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/></svg>',
    partly: '<svg viewBox="0 0 24 24"><path d="M8 3.5v1.2M3.8 5.3l.9.9M2.5 9.5h1.2M12.2 5.3l-.9.9"/><path d="M5.3 12a3.5 3.5 0 1 1 6.5-2.2"/><path d="M8.5 20h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1A3 3 0 0 0 8.5 20Z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M7 19h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 19Z"/></svg>',
    fog: '<svg viewBox="0 0 24 24"><path d="M6.5 13a4 4 0 0 1 .8-6.6 6 6 0 0 1 10.4 2.1A3.8 3.8 0 0 1 19 13"/><path d="M4 16.5h16M6.5 20h11"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 15Z"/><path d="m9 18-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/></svg>',
    snow: '<svg viewBox="0 0 24 24"><path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 15Z"/><path d="M8.5 19h.01M12 20.5h.01M15.5 19h.01M10 22h.01M14 22h.01" stroke-width="2.4"/></svg>',
    storm: '<svg viewBox="0 0 24 24"><path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 15Z"/><path d="m12.5 15-2 3.5h3l-2 3.5"/></svg>',
  };

  // ---------------------------------------------------------------- helpers
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  const svg = name => {
    const span = el('span');
    span.innerHTML = ICONS[name]; // static, trusted markup only
    return span.firstElementChild;
  };
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const clone = v => JSON.parse(JSON.stringify(v));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
    del(key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } },
  };

  /** Merge saved values onto defaults, keeping only known keys of the right type. */
  function merge(base, saved) {
    const out = clone(base);
    if (!isObj(saved)) return out;
    for (const [k, def] of Object.entries(base)) {
      if (!(k in saved)) continue;
      const v = saved[k];
      if (k === 'bookmarks') {
        if (Array.isArray(v)) out.bookmarks = v.slice(0, MAX_BOOKMARKS).map(b => ({
          key: String(b?.key ?? '').slice(0, 8), name: String(b?.name ?? '').slice(0, 40), url: String(b?.url ?? '').slice(0, 2000),
        }));
      } else if (k === 'place') {
        out.place = isObj(v) && Number.isFinite(v.lat) && Number.isFinite(v.lon) ? { name: String(v.name || ''), lat: v.lat, lon: v.lon } : null;
      } else if (isObj(def)) {
        out[k] = merge(def, v);
      } else if (typeof v === typeof def || (def === null)) {
        out[k] = v;
      }
    }
    return out;
  }

  const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
  const setPath = (obj, path, value) => {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((o, k) => o[k], obj)[last] = value;
  };

  /** Turn typed text into an http(s) URL if it clearly is one, else null. */
  function safeUrl(value) {
    const text = String(value || '').trim();
    if (!text || /\s/.test(text) || /[<>"\\]/.test(text)) return null;
    let candidate = text;
    if (!/^https?:\/\//i.test(candidate)) {
      if (/^[a-z][a-z\d+.-]*:/i.test(candidate) && !/^[^/:]+:\d+(?:[/?#]|$)/.test(candidate)) return null;
      const host = candidate.split(/[/?#]/)[0].replace(/:\d+$/, '');
      const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
      const tld = host.split('.').pop();
      if (host !== 'localhost' && !ipv4 && !(host.includes('.') && /^[a-z\u00a1-\uffff-]{2,}$/i.test(tld))) return null;
      candidate = (ipv4 || host === 'localhost' ? 'http://' : 'https://') + candidate;
    }
    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname) return null;
      return url.href;
    } catch { return null; }
  }

  function validTemplate(template) {
    const t = String(template || '').trim();
    if (!/^https?:\/\//i.test(t) || !t.includes('{query}')) return false;
    const host = t.match(/^https?:\/\/([^/?#]*)/i)?.[1] || '';
    return !host.includes('{query}') && !!safeUrl(t.replaceAll('{query}', 'test'));
  }

  function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } }

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }

  function hue(text) { let h = 0; for (const ch of text) h = (h * 31 + ch.codePointAt(0)) % 360; return h; }

  // ------------------------------------------------------------------ state
  let prefs = merge(DEFAULTS, storage.get(STORE_KEY));
  let history = Array.isArray(storage.get(HISTORY_KEY)) ? storage.get(HISTORY_KEY).filter(s => typeof s === 'string').slice(0, MAX_HISTORY) : [];
  let bookmarks = [];      // validated, ready to render
  let bookmarkErrors = []; // per raw index
  let actions = [];
  let selected = 0;
  let composing = false;

  const saveBadge = debounce(() => $('saved-badge').classList.remove('show'), 1400);
  function save() {
    const ok = storage.set(STORE_KEY, prefs);
    const badge = $('saved-badge');
    badge.textContent = ok ? 'Saved' : 'Could not save (storage blocked)';
    badge.classList.add('show');
    saveBadge();
  }

  function validateBookmarks() {
    const seen = new Map();
    bookmarks = [];
    bookmarkErrors = prefs.bookmarks.map((b, i) => {
      const key = b.key.trim().toLowerCase();
      const name = b.name.trim();
      const url = safeUrl(b.url);
      if (!key && !name && !b.url.trim()) return 'Empty: fill it in or remove it.';
      if (!/^[a-z0-9]{1,8}$/.test(key)) return 'Key: 1–8 letters or numbers.';
      if (seen.has(key)) return `Key "${key}" is already used by ${prefs.bookmarks[seen.get(key)].name || 'another bookmark'}.`;
      if (!name) return 'Give it a name.';
      if (!url) return 'Enter a valid http(s) address.';
      seen.set(key, i);
      bookmarks.push({ key, name, url });
      return '';
    });
  }

  // ------------------------------------------------------------------- look
  const backdrop = $('backdrop');
  const bgImage = $('bg-image');
  bgImage.addEventListener('load', () => bgImage.classList.add('ready'));
  bgImage.addEventListener('error', () => bgImage.classList.remove('ready'));

  function applyLook() {
    const { look } = prefs;
    const root = document.documentElement.style;
    const accent = /^#[0-9a-f]{6}$/i.test(look.accent) ? look.accent : DEFAULTS.look.accent;
    root.setProperty('--accent', accent);
    root.setProperty('--on-accent', luminance(accent) > .45 ? '#0b0b10' : '#ffffff');
    root.setProperty('--glass', String(look.glass / 100));
    root.setProperty('--dim', String(look.dim / 100));
    root.setProperty('--img-blur', `${look.imageBlur}px`);
    root.setProperty('--bg-color', look.color);

    backdrop.dataset.mode = look.background;
    const src = look.background === 'image' ? safeUrl(look.image) : null;
    if (src && bgImage.getAttribute('src') !== src) { bgImage.classList.remove('ready'); bgImage.src = src; }
    if (!src) { bgImage.classList.remove('ready'); bgImage.removeAttribute('src'); }

    $('grid').style.gridTemplateColumns = look.columns === 'auto' ? '' : `repeat(${look.columns}, minmax(0, 1fr))`;
    document.body.classList.toggle('no-keys', !look.keys);
    document.body.classList.toggle('no-hints', !look.hints);
    document.body.classList.toggle('no-motion', !look.motion);

    for (const s of document.querySelectorAll('.swatch[data-accent]')) s.classList.toggle('active', s.dataset.accent.toLowerCase() === accent.toLowerCase());
  }

  // ------------------------------------------------------------------ icons
  function iconSources(url) {
    const mode = prefs.look.icons;
    if (mode === 'off') return [];
    let u;
    try { u = new URL(url); } catch { return []; }
    const isPrivate = u.hostname === 'localhost' || /^(10|127|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(u.hostname);
    const site = `${u.origin}/favicon.ico`;
    const ddg = `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`;
    if (mode === 'duckduckgo' && !isPrivate) return [ddg, site];
    return isPrivate ? [site] : [site, ddg];
  }

  function iconFor(bookmark) {
    const mono = el('span', 'mono', [...bookmark.name][0]?.toUpperCase() || '?');
    mono.style.setProperty('--h', String(hue(bookmark.name.toLowerCase())));
    const sources = iconSources(bookmark.url);
    if (!sources.length) return mono;
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.draggable = false;
    let i = 0;
    const wrap = el('span', 'icon-slot');
    wrap.style.display = 'contents';
    img.onerror = () => {
      i += 1;
      if (i < sources.length) img.src = sources[i];
      else img.replaceWith(mono);
    };
    // Some sites return a 1x1 placeholder or a broken tiny image: treat as missing.
    img.onload = () => { if (img.naturalWidth < 8) img.onerror(); };
    img.src = sources[0];
    wrap.append(img);
    return wrap;
  }

  // ------------------------------------------------------------------- grid
  const grid = $('grid');
  const cards = new Map(); // key -> { a, name, key, bookmark }

  function renderGrid() {
    grid.replaceChildren();
    cards.clear();
    if (!bookmarks.length) {
      const empty = el('div', 'empty');
      empty.append(el('div', '', 'No bookmarks yet.'));
      const btn = el('button', 'btn', 'Add bookmarks');
      btn.type = 'button';
      btn.addEventListener('click', () => openSettings('bookmarks'));
      empty.append(btn);
      grid.append(empty);
      return;
    }
    bookmarks.forEach((b, i) => {
      const a = el('a', 'card');
      a.href = b.url;
      a.style.setProperty('--i', String(i));
      a.dataset.key = b.key;
      a.rel = 'noopener noreferrer';
      if (prefs.search.newTab) a.target = '_blank';
      a.setAttribute('aria-label', `${b.name}, key ${b.key}`);
      const icon = el('span', 'card-icon');
      icon.append(iconFor(b));
      const name = el('span', 'card-name', b.name);
      const key = el('kbd', 'card-key', b.key);
      a.append(icon, name, key);
      grid.append(a);
      cards.set(b.key, { a, name, key, bookmark: b });
    });
    // The entry animation only plays on first paint; later re-renders are instant.
    if (grid.dataset.ready) for (const { a } of cards.values()) a.style.animation = 'none';
    grid.dataset.ready = '1';
    filterGrid();
  }

  grid.addEventListener('pointermove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  function highlight(node, text, needle) {
    node.replaceChildren();
    const at = needle ? text.toLowerCase().indexOf(needle) : -1;
    if (at < 0) { node.textContent = text; return; }
    node.append(text.slice(0, at), el('mark', '', text.slice(at, at + needle.length)), text.slice(at + needle.length));
  }

  function score(b, q) {
    if (!q) return 0;
    const name = b.name.toLowerCase();
    if (b.key === q) return 100;
    if (b.key.startsWith(q)) return 80 - b.key.length;
    if (name.startsWith(q)) return 70;
    if (name.split(/[\s.\-]+/).some(w => w.startsWith(q))) return 60;
    if (q.length < 2) return 0; // single letters: only keys and word starts, no mid-word noise
    if (name.includes(q)) return 50;
    if (hostOf(b.url).includes(q)) return 30;
    return 0;
  }

  function filterGrid() {
    const raw = $('q').value.trim();
    const q = raw.toLowerCase().replace(/^\?/, '');
    const forced = raw.startsWith('?');
    grid.classList.toggle('filtering', !!q);
    let matches = 0;
    for (const { a, name, key, bookmark } of cards.values()) {
      const s = forced ? 0 : score(bookmark, q);
      a.classList.toggle('match', s > 0);
      a.classList.toggle('exact', s === 100);
      if (s > 0) matches += 1;
      highlight(name, bookmark.name, s > 0 && s !== 30 ? q : '');
      highlight(key, bookmark.key, s >= 80 ? q : '');
    }
    return matches;
  }

  // ----------------------------------------------------------------- search
  const input = $('q');
  const form = $('search-form');
  const list = $('suggestions');

  function searchUrl(query) {
    const t = validTemplate(prefs.search.template) ? prefs.search.template.trim() : FALLBACK_ENGINE;
    return t.replaceAll('{query}', encodeURIComponent(query));
  }

  function engineName() {
    const t = validTemplate(prefs.search.template) ? prefs.search.template.trim() : FALLBACK_ENGINE;
    const found = Object.entries(ENGINES).find(([, url]) => url === t);
    if (found) return ENGINE_NAMES[found[0]];
    return hostOf(t.replaceAll('{query}', 'x')) || 'Search';
  }

  function buildActions(raw) {
    const text = raw.trim();
    if (!text) return [];
    const out = [];
    const forced = text.startsWith('?');
    const query = forced ? text.slice(1).trim() : text;
    if (!query) return [];
    const q = query.toLowerCase();
    const search = { type: 'search', query, url: searchUrl(query), label: query, sub: engineName(), icon: 'search' };

    if (forced) {
      out.push(search);
    } else {
      const ranked = bookmarks.map(b => ({ b, s: score(b, q) })).filter(x => x.s > 0).sort((x, y) => y.s - x.s);
      const exact = ranked[0]?.s === 100 ? ranked[0].b : null;
      const address = safeUrl(query);
      if (exact) out.push({ type: 'bookmark', bookmark: exact, url: exact.url, label: exact.name, sub: hostOf(exact.url) });
      else if (address) out.push({ type: 'url', url: address, label: address.replace(/^https?:\/\//, '').replace(/\/$/, ''), sub: 'Go to address', icon: 'globe' });
      else out.push(search);

      for (const { b } of ranked) {
        if (b === exact || out.length >= 6) continue;
        out.push({ type: 'bookmark', bookmark: b, url: b.url, label: b.name, sub: b.key, needle: q });
      }
      if (out[0] !== search) out.push(search);
    }

    if (prefs.search.history) {
      let n = 0;
      for (const h of history) {
        if (n >= 3 || out.length >= 9) break;
        if (h.toLowerCase() === q || !h.toLowerCase().includes(q)) continue;
        out.push({ type: 'search', query: h, url: searchUrl(h), label: h, sub: 'Recent', icon: 'history', needle: q, history: true });
        n += 1;
      }
    }
    return out;
  }

  function renderSuggestions() {
    actions = buildActions(input.value);
    selected = Math.min(selected, Math.max(0, actions.length - 1));
    const primary = actions[selected] || actions[0];

    form.classList.toggle('has-query', actions.length > 0);
    form.classList.toggle('is-bookmark', primary?.type === 'bookmark');
    $('hint-text').textContent = !primary ? engineName()
      : primary.type === 'bookmark' ? `Open ${primary.label}`
      : primary.type === 'url' ? 'Go to address'
      : engineName();

    const show = prefs.search.suggest && actions.length > 0 && document.activeElement === input;
    list.hidden = !show;
    input.setAttribute('aria-expanded', String(show));
    if (!show) { list.replaceChildren(); input.removeAttribute('aria-activedescendant'); return; }

    list.replaceChildren(...actions.map((action, i) => {
      const li = el('li', 'sugg');
      li.id = `sugg-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === selected));
      const icon = el('span', 'sugg-icon');
      icon.append(action.type === 'bookmark' ? iconFor(action.bookmark) : svg(action.icon));
      const label = el('span', 'sugg-label');
      if (action.type === 'search' && !action.history) label.append('Search ', el('mark', '', `“${action.label}”`));
      else highlight(label, action.label, action.needle || '');
      const sub = el('span', 'sugg-sub');
      if (action.type === 'bookmark' && action.sub === action.bookmark.key) sub.append(el('kbd', '', action.sub));
      else sub.textContent = action.sub;
      li.append(icon, label, sub, el('span', 'sugg-enter', '↵'));
      li.addEventListener('pointerdown', e => e.preventDefault()); // keep input focus
      li.addEventListener('click', e => run(action, e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1));
      li.addEventListener('auxclick', e => { if (e.button === 1) run(action, true); });
      li.addEventListener('pointerenter', () => select(i, false));
      return li;
    }));
    input.setAttribute('aria-activedescendant', `sugg-${selected}`);
  }

  function select(i, scroll = true) {
    if (!actions.length) return;
    selected = (i + actions.length) % actions.length;
    for (const [n, li] of [...list.children].entries()) li.setAttribute('aria-selected', String(n === selected));
    input.setAttribute('aria-activedescendant', `sugg-${selected}`);
    const primary = actions[selected];
    form.classList.toggle('is-bookmark', primary.type === 'bookmark');
    $('hint-text').textContent = primary.type === 'bookmark' ? `Open ${primary.label}` : primary.type === 'url' ? 'Go to address' : engineName();
    if (scroll) list.children[selected]?.scrollIntoView({ block: 'nearest' });
  }

  function run(action, newTab = false) {
    if (!action) return;
    if (action.type === 'search' && prefs.search.history) {
      history = [action.query, ...history.filter(h => h.toLowerCase() !== action.query.toLowerCase())].slice(0, MAX_HISTORY);
      storage.set(HISTORY_KEY, history);
    }
    if (newTab || prefs.search.newTab) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
      input.value = '';
      update();
    } else {
      location.assign(action.url);
    }
  }

  function update() {
    selected = 0;
    const matches = filterGrid();
    renderSuggestions();
    $('hero').classList.toggle('compact', !!input.value.trim());
    $('status').textContent = input.value.trim() ? `${matches} matching bookmark${matches === 1 ? '' : 's'}` : '';
  }

  input.addEventListener('input', update);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('blur', () => setTimeout(renderSuggestions, 0));
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; update(); });
  form.addEventListener('submit', e => e.preventDefault());

  input.addEventListener('keydown', e => {
    if (e.isComposing || composing) return;
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        run(actions[selected] || actions[0], e.ctrlKey || e.metaKey || e.shiftKey || e.altKey);
        break;
      case 'ArrowDown':
        if (actions.length) { e.preventDefault(); select(selected + 1); }
        break;
      case 'ArrowUp':
        if (actions.length) { e.preventDefault(); select(selected - 1); }
        break;
      case 'Tab':
        if (actions.length > 1 && !list.hidden) { e.preventDefault(); select(selected + (e.shiftKey ? -1 : 1)); }
        break;
      case 'Delete':
        if (e.shiftKey && actions[selected]?.history) {
          e.preventDefault();
          const gone = actions[selected].query;
          history = history.filter(h => h !== gone);
          storage.set(HISTORY_KEY, history);
          renderSuggestions();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (input.value) { input.value = ''; update(); } else input.blur();
        break;
    }
  });

  // Type anywhere: send printable keys to the search box.
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); openSettings(); return; }
    if (dialog.open || welcome.open || e.defaultPrevented || e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t === input || t.matches?.('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'Escape') { input.value = ''; update(); return; }
    if (e.key === ' ' && t.closest?.('a, button')) return;
    if (e.key.length === 1) {
      e.preventDefault();
      input.focus();
      input.value += e.key;
      update();
    } else if (e.key === 'Backspace' && input.value) {
      e.preventDefault();
      input.focus();
      input.value = input.value.slice(0, -1);
      update();
    }
  });

  // Coming back via the back button: start fresh.
  window.addEventListener('pageshow', e => {
    if (e.persisted) { input.value = ''; update(); }
    input.focus({ preventScroll: true });
  });

  // ------------------------------------------------------------------ clock
  const clockEl = $('clock');
  let clockTimer;
  let lastParts = '';

  function renderClock() {
    const { clock } = prefs;
    const now = new Date();
    $('hero').hidden = !clock.show && !clock.date && !clock.greeting && !weatherVisible();
    clockEl.hidden = !clock.show;

    if (clock.show) {
      let h = now.getHours();
      let ampm = '';
      if (clock.h12) { ampm = h < 12 ? 'am' : 'pm'; h = h % 12 || 12; }
      const hh = clock.h12 ? String(h) : String(h).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const sig = `${hh}:${mm}:${clock.seconds ? ss : ''}:${ampm}`;
      if (sig !== lastParts) {
        const prev = lastParts.split(':');
        const layoutChanged = prev.length !== 4 || prev[0].length !== hh.length || !!prev[2] !== clock.seconds || prev[3] !== ampm;
        if (layoutChanged) {
          clockEl.replaceChildren();
          const digits = s => [...s].map(c => el('span', 'd', c));
          clockEl.append(...digits(hh), el('span', 'colon', ':'), ...digits(mm));
          if (clock.seconds) { const sec = el('span', 'sec'); sec.append(...digits(ss)); clockEl.append(sec); }
          if (ampm) clockEl.append(el('span', 'ampm', ampm));
        } else {
          const chars = [...hh, ...mm, ...(clock.seconds ? ss : '')];
          clockEl.querySelectorAll('.d').forEach((d, i) => {
            if (d.textContent !== chars[i]) {
              d.textContent = chars[i];
              d.classList.remove('tick');
              void d.offsetWidth; // restart animation
              d.classList.add('tick');
            }
          });
        }
        lastParts = sig;
      }
      clockEl.classList.toggle('pulse', !clock.seconds);
      clockEl.setAttribute('aria-label', now.toLocaleTimeString());
    }

    const hour = now.getHours();
    const greet = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const name = clock.name.trim();
    $('greeting').textContent = clock.greeting ? (name ? `${greet}, ${name}` : greet) : '';
    $('greeting').hidden = !clock.greeting;
    const date = $('date');
    date.hidden = !clock.date;
    date.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    date.dateTime = now.toISOString().slice(0, 10);
    $('date-sep').hidden = !(clock.greeting && clock.date);
    $('weather').querySelector('.meta-sep').hidden = !(clock.greeting || clock.date);
    $('meta').hidden = !clock.greeting && !clock.date && !weatherVisible();
  }

  function startClock() {
    clearTimeout(clockTimer);
    lastParts = '';
    const loop = () => {
      renderClock();
      clockTimer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
    };
    loop();
  }

  // ---------------------------------------------------------------- weather
  const weatherEl = $('weather');
  const weatherVisible = () => !weatherEl.hidden;

  function describe(code, isDay) {
    if (code === 0) return [isDay ? 'sun' : 'moon', 'Clear'];
    if (code === 1) return [isDay ? 'sun' : 'moon', 'Mostly clear'];
    if (code === 2) return ['partly', 'Partly cloudy'];
    if (code === 3) return ['cloud', 'Overcast'];
    if (code === 45 || code === 48) return ['fog', 'Fog'];
    if (code >= 51 && code <= 57) return ['rain', 'Drizzle'];
    if (code >= 61 && code <= 67) return ['rain', 'Rain'];
    if (code >= 71 && code <= 77) return ['snow', 'Snow'];
    if (code >= 80 && code <= 82) return ['rain', 'Showers'];
    if (code === 85 || code === 86) return ['snow', 'Snow showers'];
    if (code >= 95) return ['storm', 'Thunderstorm'];
    return ['cloud', ''];
  }

  function showWeather(data, place) {
    const [icon, label] = describe(data.code, data.isDay);
    $('weather-icon').replaceChildren(svg(icon));
    const text = $('weather-text');
    text.replaceChildren(el('span', 'weather-temp', `${Math.round(data.temp)}°`), ` ${label ? label.toLowerCase() + ' in ' : ''}${place.name}`);
    weatherEl.hidden = false;
    weatherEl.title = `Feels like ${Math.round(data.feels)}° · updated ${new Date(data.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    renderClock();
  }

  async function loadWeather(force = false) {
    const { weather } = prefs;
    if (!weather.city.trim()) { weatherEl.hidden = true; renderClock(); return; }
    if (!weather.place) { weatherEl.hidden = true; renderClock(); geocode(); return; }
    const place = weather.place;
    const cacheId = `${place.lat},${place.lon},${weather.units}`;
    const cached = storage.get(WEATHER_KEY);
    if (!force && cached?.id === cacheId && Date.now() - cached.t < WEATHER_TTL) { showWeather(cached, place); return; }
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,apparent_temperature,weather_code,is_day&temperature_unit=${weather.units}&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      const c = json.current;
      const data = { id: cacheId, t: Date.now(), temp: c.temperature_2m, feels: c.apparent_temperature, code: c.weather_code, isDay: !!c.is_day };
      storage.set(WEATHER_KEY, data);
      showWeather(data, place);
    } catch {
      if (cached?.id === cacheId) showWeather(cached, place);
      else { weatherEl.hidden = true; renderClock(); }
    }
  }

  const geocode = debounce(async () => {
    const status = $('weather-status');
    const city = prefs.weather.city.trim();
    status.classList.remove('error', 'ok');
    if (!city) {
      prefs.weather.place = null; save(); loadWeather();
      status.textContent = 'Leave empty to hide the weather. Data from Open-Meteo (free, no account), refreshed every 30 minutes.';
      return;
    }
    status.textContent = 'Looking up…';
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const json = await res.json();
      const hit = json.results?.[0];
      if (!hit) throw new Error('not found');
      if (prefs.weather.city.trim() !== city) return; // typed on meanwhile
      prefs.weather.place = { name: hit.name, lat: hit.latitude, lon: hit.longitude };
      save();
      status.textContent = `Found ${hit.name}${hit.admin1 ? ', ' + hit.admin1 : ''}${hit.country ? ', ' + hit.country : ''}.`;
      status.classList.add('ok');
      loadWeather(true);
    } catch {
      status.textContent = `Couldn't find "${city}". Try another spelling.`;
      status.classList.add('error');
    }
  }, 700);

  setInterval(() => loadWeather(), WEATHER_TTL);

  // --------------------------------------------------------------- settings
  const dialog = $('settings');
  const tabs = [...document.querySelectorAll('[role="tab"]')];

  function openSettings(tab) {
    if (welcome.open) return;
    if (tab) selectTab(`tab-${tab}`);
    if (!dialog.open) {
      dialog.classList.remove('closing');
      syncControls();
      renderEditor();
      dialog.showModal();
      requestAnimationFrame(moveIndicator);
    }
  }

  function closeSettings() {
    if (!dialog.open || dialog.classList.contains('closing')) return;
    dialog.classList.add('closing');
    const done = () => { dialog.classList.remove('closing'); dialog.close(); };
    if (!prefs.look.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, 200);
  }

  $('open-settings').addEventListener('click', () => openSettings());
  $('close-settings').addEventListener('click', closeSettings);
  dialog.addEventListener('cancel', e => { e.preventDefault(); closeSettings(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) closeSettings(); });
  dialog.addEventListener('close', () => {
    validateBookmarks(); renderGrid(); update();
    if (!prefs.search.template.trim()) openWelcome(); // e.g. after a reset
    else input.focus({ preventScroll: true });
  });

  function moveIndicator() {
    const active = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    const ind = $('tab-indicator');
    if (!active || !active.offsetWidth) return;
    ind.style.width = `${active.offsetWidth}px`;
    ind.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function selectTab(id) {
    for (const t of tabs) {
      const on = t.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    }
    moveIndicator();
  }
  for (const t of tabs) {
    t.addEventListener('click', () => selectTab(t.id));
    t.addEventListener('keydown', e => {
      const i = tabs.indexOf(t);
      const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (next == null) return;
      e.preventDefault();
      const target = tabs[(next + tabs.length) % tabs.length];
      selectTab(target.id);
      target.focus();
    });
  }
  window.addEventListener('resize', moveIndicator);

  // Generic binding: <input data-pref="look.glass"> etc.
  const controls = [...document.querySelectorAll('[data-pref]')];

  function syncControls() {
    for (const c of controls) {
      const v = getPath(prefs, c.dataset.pref);
      if (c.type === 'checkbox') c.checked = !!v;
      else if (c.type === 'radio') c.checked = c.value === v;
      else c.value = v ?? '';
      if (c.type === 'range') paintRange(c);
    }
    syncDependents();
  }

  function paintRange(c) {
    const p = ((c.value - c.min) / (c.max - c.min)) * 100;
    c.style.setProperty('--p', `${p}%`);
  }

  function syncDependents() {
    for (const out of document.querySelectorAll('[data-out]')) out.textContent = `${getPath(prefs, out.dataset.out)}${out.dataset.unit || ''}`;
    for (const node of document.querySelectorAll('[data-show]')) {
      const [path, want] = node.dataset.show.split('=');
      const v = getPath(prefs, path);
      node.hidden = String(v) !== want.split('|').find(w => w === String(v));
    }
    const tpl = $('search-template');
    const ok = validTemplate(prefs.search.template);
    tpl.classList.toggle('invalid', !ok);
    const help = $('template-help');
    help.classList.toggle('error', !ok);
    help.replaceChildren();
    if (ok) help.append('Example: ', el('code', '', searchUrl('hello world').replace(/^https?:\/\//, '')));
    else help.append('Needs to start with http(s):// and contain ', el('code', '', '{query}'), '. Falling back to DuckDuckGo.');
    for (const chip of document.querySelectorAll('[data-engine]')) chip.classList.toggle('active', ENGINES[chip.dataset.engine] === prefs.search.template.trim());
  }

  function onControl(c) {
    const path = c.dataset.pref;
    let v;
    if (c.type === 'checkbox') v = c.checked;
    else if (c.type === 'radio') { if (!c.checked) return; v = c.value; }
    else if (c.type === 'range') { v = Number(c.value); paintRange(c); }
    else v = c.value;
    setPath(prefs, path, v);
    save();
    syncDependents();

    const area = path.split('.')[0];
    if (area === 'look') {
      applyLook();
      if (path === 'look.icons') renderGrid();
    } else if (area === 'clock') {
      startClock();
    } else if (area === 'weather') {
      if (path === 'weather.city') geocode();
      else loadWeather(true);
    } else if (path === 'search.newTab') {
      renderGrid();
    }
  }

  for (const c of controls) c.addEventListener(c.type === 'checkbox' || c.type === 'radio' || c.tagName === 'SELECT' ? 'change' : 'input', () => onControl(c));

  for (const chip of document.querySelectorAll('[data-engine]')) {
    chip.addEventListener('click', () => {
      prefs.search.template = ENGINES[chip.dataset.engine];
      save();
      syncControls();
      update();
    });
  }

  for (const sw of document.querySelectorAll('.swatch[data-accent]')) {
    sw.addEventListener('click', () => {
      prefs.look.accent = sw.dataset.accent;
      save();
      applyLook();
      syncControls();
    });
  }

  $('clear-history').addEventListener('click', e => {
    history = [];
    storage.del(HISTORY_KEY);
    e.currentTarget.textContent = 'History cleared';
    setTimeout(() => { $('clear-history').textContent = 'Clear search history'; }, 1600);
  });

  // ------------------------------------------------------- bookmark editor
  const editor = $('editor');
  const refreshGrid = debounce(() => { renderGrid(); }, 250);

  function renderEditor(focusIndex, focusField = 'k') {
    validateBookmarks();
    editor.replaceChildren(...prefs.bookmarks.map((b, i) => {
      const row = el('div', 'bm-row');
      row.dataset.index = String(i);

      const grip = el('button', 'grip', '⠿');
      grip.type = 'button';
      grip.setAttribute('aria-label', `Reorder ${b.name || 'bookmark'} (arrow keys)`);
      grip.addEventListener('pointerdown', () => { row.draggable = true; });
      grip.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        const to = i + (e.key === 'ArrowUp' ? -1 : 1);
        if (to < 0 || to >= prefs.bookmarks.length) return;
        const [moved] = prefs.bookmarks.splice(i, 1);
        prefs.bookmarks.splice(to, 0, moved);
        save();
        renderEditor();
        editor.children[to]?.querySelector('.grip')?.focus();
        refreshGrid();
      });

      const mk = (cls, field, placeholder, label, extra = {}) => {
        const inp = el('input', cls);
        inp.type = 'text';
        inp.value = b[field];
        inp.placeholder = placeholder;
        inp.spellcheck = false;
        inp.autocapitalize = 'off';
        inp.setAttribute('aria-label', label);
        Object.assign(inp, extra);
        inp.addEventListener('input', () => {
          prefs.bookmarks[i][field] = field === 'key' ? inp.value.toLowerCase().replace(/[^a-z0-9]/g, '') : inp.value;
          if (field === 'key' && inp.value !== prefs.bookmarks[i].key) inp.value = prefs.bookmarks[i].key;
          save();
          validateBookmarks();
          paintErrors();
          refreshGrid();
        });
        return inp;
      };
      const key = mk('k', 'key', 'key', 'Bookmark key', { maxLength: 8 });
      const name = mk('n', 'name', 'Name', 'Bookmark name', { maxLength: 40 });
      const url = mk('u', 'url', 'https://…', 'Bookmark address', { maxLength: 2000, inputMode: 'url' });

      const del = el('button', 'icon-btn del');
      del.type = 'button';
      del.setAttribute('aria-label', `Remove ${b.name || 'bookmark'}`);
      del.append(svg('trash'));
      del.addEventListener('click', () => {
        prefs.bookmarks.splice(i, 1);
        save();
        renderEditor();
        const next = editor.children[Math.min(i, editor.children.length - 1)];
        (next?.querySelector('.del') || $('add-bookmark')).focus();
        refreshGrid();
      });

      const err = el('p', 'err');
      row.append(grip, key, name, del, url, err);
      return row;
    }));
    paintErrors();
    if (focusIndex != null) {
      const row = editor.children[focusIndex];
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      row?.querySelector(`.${focusField}`)?.focus();
    }
  }

  function paintErrors() {
    [...editor.children].forEach((row, i) => {
      const msg = bookmarkErrors[i] || '';
      row.classList.toggle('has-error', !!msg);
      row.querySelector('.err').textContent = msg;
      const b = prefs.bookmarks[i];
      row.querySelector('.k').classList.toggle('invalid', !!msg && /^Key/.test(msg));
      row.querySelector('.u').classList.toggle('invalid', !!msg && /address/.test(msg) && !!b.url.trim());
    });
  }

  // Drag-and-drop reordering
  let dragRow = null;
  editor.addEventListener('dragstart', e => {
    dragRow = e.target.closest('.bm-row');
    if (!dragRow) return;
    dragRow.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragRow.dataset.index);
  });
  editor.addEventListener('dragover', e => {
    if (!dragRow) return;
    e.preventDefault();
    const over = e.target.closest('.bm-row');
    if (!over || over === dragRow) return;
    const r = over.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    over[after ? 'after' : 'before'](dragRow);
  });
  editor.addEventListener('drop', e => e.preventDefault());
  editor.addEventListener('dragend', () => {
    if (!dragRow) return;
    const order = [...editor.children].map(r => Number(r.dataset.index));
    prefs.bookmarks = order.map(i => prefs.bookmarks[i]);
    dragRow = null;
    save();
    renderEditor();
    refreshGrid();
  });
  editor.addEventListener('pointerup', () => { for (const r of editor.children) r.draggable = false; });

  $('add-bookmark').addEventListener('click', () => {
    if (prefs.bookmarks.length >= MAX_BOOKMARKS) return;
    prefs.bookmarks.push({ key: '', name: '', url: '' });
    save();
    renderEditor(prefs.bookmarks.length - 1);
  });

  // ------------------------------------------------------------------- data
  const dataStatus = msg => { $('data-status').textContent = msg; };

  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ ...prefs, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = el('a');
    a.href = URL.createObjectURL(blob);
    a.download = `startpage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    dataStatus('Backup downloaded.');
  });

  $('import').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isObj(data)) throw new Error('not an object');
      // Also accept the old startpage format: { version, engine, customSearchUrl, bookmarks }
      if (data.engine && !data.search) {
        data.search = { template: data.engine === 'custom' && data.customSearchUrl ? data.customSearchUrl : (ENGINES[data.engine] || '') };
      }
      prefs = merge(DEFAULTS, data);
      save();
      applyAll();
      syncControls();
      renderEditor();
      dataStatus(`Imported ${prefs.bookmarks.length} bookmarks and settings.`);
    } catch {
      dataStatus('That file is not a valid startpage backup.');
    }
  });

  let resetArmed;
  $('reset').addEventListener('click', e => {
    const btn = e.currentTarget;
    if (!btn.classList.contains('armed')) {
      btn.classList.add('armed');
      btn.textContent = 'Click again to erase all settings';
      resetArmed = setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Reset everything'; }, 3500);
      return;
    }
    clearTimeout(resetArmed);
    btn.classList.remove('armed');
    btn.textContent = 'Reset everything';
    prefs = clone(DEFAULTS);
    history = [];
    storage.del(HISTORY_KEY);
    storage.del(WEATHER_KEY);
    save();
    applyAll();
    syncControls();
    renderEditor();
    dataStatus('Everything is back to defaults.');
  });

  // ---------------------------------------------------- first-run engine pick
  const welcome = $('welcome');
  const welcomeForm = $('welcome-form');
  const welcomeTemplate = $('welcome-template');

  function welcomeChoice() {
    const choice = welcomeForm.elements.engine.value;
    return choice === 'custom' ? welcomeTemplate.value.trim() : ENGINES[choice] || '';
  }

  function syncWelcome() {
    const custom = welcomeForm.elements.engine.value === 'custom';
    $('welcome-custom').hidden = !custom;
    const typed = welcomeTemplate.value.trim();
    const ok = validTemplate(welcomeChoice());
    const bad = custom && !!typed && !ok;
    const help = $('welcome-help');
    help.classList.toggle('error', bad);
    welcomeTemplate.classList.toggle('invalid', bad);
    help.replaceChildren();
    if (bad) help.append('Needs to start with http(s):// and contain ', el('code', '', '{query}'), '.');
    else help.append('Put ', el('code', '', '{query}'), ' where the search terms go.');
    $('welcome-save').disabled = !ok;
  }

  function openWelcome() {
    if (welcome.open) return;
    welcomeForm.reset();
    syncWelcome();
    welcome.showModal();
  }

  for (const radio of welcomeForm.elements.engine) {
    radio.addEventListener('change', () => {
      syncWelcome();
      if (radio.value === 'custom') welcomeTemplate.focus();
    });
  }
  welcomeTemplate.addEventListener('input', syncWelcome);
  // A choice is needed. Chrome ignores a cancelled 'cancel' before the first click, so also stop
  // the Escape key itself and reopen if the dialog gets closed anyway.
  welcome.addEventListener('keydown', e => { if (e.key === 'Escape') e.preventDefault(); });
  welcome.addEventListener('cancel', e => e.preventDefault());
  welcome.addEventListener('close', () => { if (!prefs.search.template.trim()) setTimeout(openWelcome); });
  welcomeForm.addEventListener('submit', e => {
    e.preventDefault();
    const template = welcomeChoice();
    if (!validTemplate(template)) return;
    prefs.search.template = template;
    save();
    welcome.close();
    update();
    input.focus({ preventScroll: true });
  });

  // ------------------------------------------------------------------- boot
  function applyAll() {
    validateBookmarks();
    applyLook();
    renderGrid();
    startClock();
    loadWeather();
    update();
  }

  applyAll();
  if (!prefs.search.template.trim()) openWelcome();
  else input.focus({ preventScroll: true });
})();
