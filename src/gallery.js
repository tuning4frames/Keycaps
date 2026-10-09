import { LAYOUT_60, KEYMAP_60, MODS, COLORWAYS } from './config.js';
import { BOARDS } from './boards.js';

const FONT = "'Lexend', 'Inter', system-ui, -apple-system, sans-serif";

const INK = '#f5f5f6';
const DIM = '#d7d7dc';
const FILL = '#101012';

function ensureFont() {
  if (document.querySelector('link[data-lexend]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-lexend', '1');
  link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function h(tag, style, parent) {
  const n = document.createElement(tag);
  if (style) Object.assign(n.style, style);
  if (parent) parent.appendChild(n);
  return n;
}

function sq(n, r) {
  n.style.borderRadius = r + 'px';
  try { n.style.setProperty('corner-shape', 'squircle'); } catch {}
  return n;
}

function segBox(parent, extra) {
  const n = h('div', Object.assign({
    background: FILL, padding: '2px',
    display: 'flex', alignItems: 'center',
    height: '31px', boxSizing: 'border-box', flexShrink: '0',
    fontFamily: FONT, userSelect: 'none'
  }, extra || {}), parent);
  return sq(n, 15);
}

function segPad(parent, extra) {
  const n = h('div', Object.assign({
    display: 'flex', alignItems: 'center',
    fontSize: '12px', fontWeight: '500',
    padding: '5px 9px', whiteSpace: 'nowrap'
  }, extra || {}), parent);
  return sq(n, 11);
}

function pill(text, parent, onClick) {
  const outer = segBox(parent, { cursor: 'pointer' });
  const inner = segPad(outer, { fontWeight: '600', color: INK });
  inner.textContent = text;
  outer.addEventListener('mouseenter', () => { outer.style.background = '#1c1c21'; });
  outer.addEventListener('mouseleave', () => { outer.style.background = FILL; });
  outer.addEventListener('click', onClick);
  return outer;
}

function pillSolid(text, parent, onClick) {
  const outer = segBox(parent, { cursor: 'pointer', background: INK });
  const inner = segPad(outer, { fontWeight: '600', color: '#0b0b0d' });
  inner.textContent = text;
  outer.addEventListener('mouseenter', () => { outer.style.background = '#ffffff'; });
  outer.addEventListener('mouseleave', () => { outer.style.background = INK; });
  outer.addEventListener('click', onClick);
  return outer;
}

const U = 12;
const GAP = 2;
const KEY = U - GAP;

function swatchFor(cw, code) {
  const o = cw.override || {};
  if (o[code] && cw.swatches[o[code]]) return cw.swatches[o[code]];
  if (MODS.indexOf(code) >= 0 && cw.swatches.mods) return cw.swatches.mods;
  return cw.swatches.base;
}

function caseFor(cw) {
  if (cw.swatches.mods) return cw.swatches.mods.background;
  return cw.swatches.base.background;
}

export function openGalleryPanel(app, refresh) {
  ensureFont();
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    zIndex: '60', background: '#070709', display: 'flex',
    flexDirection: 'column', fontFamily: FONT, userSelect: 'none',
    boxSizing: 'border-box', color: '#f4f4f5'
  });
  document.body.appendChild(overlay);

  const brand = h('div', {
    position: 'fixed', top: '16px', left: '18px', zIndex: '40',
    display: 'flex', alignItems: 'baseline', gap: '8px',
    fontFamily: FONT, userSelect: 'none', pointerEvents: 'none'
  }, overlay);
  h('span', { fontSize: '14px', fontWeight: '700', color: '#fff' }, brand).textContent = 'keycaps';
  const brandSub = h('span', { fontSize: '11px', fontFamily: FONT, color: DIM }, brand);
  const paintBrand = () => {
    const b = BOARDS[app.boardId];
    brandSub.textContent = (b ? b.label : 'Custom') + ' · ' + app.colorway.label;
  };
  paintBrand();

  const topActions = h('div', {
    position: 'fixed', top: '14px', right: '16px', zIndex: '40',
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: FONT, userSelect: 'none'
  }, overlay);
  pill('shot', topActions, () => app.screenshot());
  pill('reset cam', topActions, () => app.resetCamera());
  pill('clear paint', topActions, () => app.clearPaint());
  pill('edit layout', topActions, () => { close(); app.openEditor(() => refresh()); });
  pillSolid('done', topActions, () => close());

  const sub = h('div', {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
    padding: '62px 20px 0 20px', flexShrink: '0'
  }, overlay);
  const title = h('span', { fontSize: '14px', fontWeight: '700', letterSpacing: '0.01em' }, sub);
  title.textContent = 'Gallery';
  const count = h('span', {
    fontSize: '11px', color: '#a1a1aa', flexShrink: '0',
    background: '#1d1d22', padding: '4px 10px', borderRadius: '99px'
  }, sub);

  const grid = document.createElement('div');
  Object.assign(grid.style, {
    flex: '1', overflowY: 'auto', display: 'flex', flexWrap: 'wrap',
    gap: '16px', padding: '16px 24px 24px 24px', justifyContent: 'center', alignContent: 'flex-start'
  });
  overlay.appendChild(grid);
  const ids = Object.keys(COLORWAYS).filter((id) => id.indexOf('custom_') !== 0);
  count.textContent = ids.length + (ids.length === 1 ? ' colorway' : ' colorways');
  const cards = [];
  function paintActive() {
    for (const c of cards) {
      const on = c.id === app.colorway.id;
      c.shell.style.outline = on ? '2px solid #f4f4f5' : 'none';
      c.shell.style.outlineOffset = on ? '3px' : '0px';
    }
  }
  for (const id of ids) {
    const cw = COLORWAYS[id];
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '240px', background: 'transparent',
      padding: '12px', cursor: 'pointer', boxSizing: 'border-box',
      flexShrink: '0'
    });
    const shell = document.createElement('div');
    const caseColor = caseFor(cw);
    Object.assign(shell.style, {
      position: 'relative',
      border: '4px solid ' + caseColor, borderRadius: '6px', padding: '4px',
      width: 'fit-content', margin: '0 auto 10px auto', background: '#08080a'
    });
    el.appendChild(shell);
    const bed = document.createElement('div');
    Object.assign(bed.style, {
      position: 'relative', width: (15 * U - GAP) + 'px', height: (5 * U - GAP) + 'px',
      borderRadius: '2px', overflow: 'hidden'
    });
    shell.appendChild(bed);
    let row = -1;
    let lastY = null;
    for (let i = 0; i < LAYOUT_60.layout.length; i++) {
      const e = LAYOUT_60.layout[i];
      if (e.y !== lastY) {
        row++;
        lastY = e.y;
      }
      const sw = swatchFor(cw, KEYMAP_60[i]);
      const kd = document.createElement('div');
      const w = e.w || 1;
      Object.assign(kd.style, {
        position: 'absolute',
        left: (e.x * U) + 'px',
        top: (row * U) + 'px',
        width: (w * U - GAP) + 'px',
        height: KEY + 'px',
        borderRadius: '2px',
        background: sw.background,
        boxSizing: 'border-box'
      });
      bed.appendChild(kd);
    }
    const name = document.createElement('div');
    Object.assign(name.style, {
      fontSize: '12px', fontWeight: '600', color: '#f5f5f6',
      textAlign: 'center', margin: '0',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    });
    name.textContent = cw.label;
    el.appendChild(name);
    el.addEventListener('click', () => {
      app.setColorway(id);
      refresh();
      paintActive();
      paintBrand();
    });
    grid.appendChild(el);
    cards.push({ id: id, el: el, shell: shell });
  }
  paintActive();
  function close() {
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
    refresh();
  }
  function onKey(e) {
    if (e.key !== 'Escape' || e.isComposing) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    close();
  }
  document.addEventListener('keydown', onKey, true);
}