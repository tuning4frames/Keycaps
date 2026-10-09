import { LEGENDS } from './config.js';

const SNAP = 0.25;
const snapU = (v) => Math.round(v / SNAP) * SNAP;
const num = (v, fb) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

const FONT = "Lexend";

const INK = '#f5f5f6';
const DIM = '#d7d7dc';
const FAINT = '#a8a8b0';
const FILL = '#101012';

function ensureFont() {
  if (document.querySelector('link[data-lexend]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-lexend', '1');
  link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function ensureStyle() {
  if (document.querySelector('style[data-kf]')) return;
  const st = document.createElement('style');
  st.setAttribute('data-kf', '1');
  st.textContent =
    'input[type=color]{-webkit-appearance:none;appearance:none}' +
    'input[type=color]::-webkit-color-swatch-wrapper{padding:0}' +
    'input[type=color]::-webkit-color-swatch{border:none;border-radius:99px}' +
    'input[type=color]::-moz-color-swatch{border:none;border-radius:99px}' +
    '.kf-bar::-webkit-scrollbar{display:none}';
  document.head.appendChild(st);
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

function nakedBtn(text, parent, onClick, title) {
  const b = h('div', {
    fontSize: '12px', fontWeight: '500', color: DIM, cursor: 'pointer',
    padding: '4px', flexShrink: '0', fontFamily: FONT,
    display: 'flex', alignItems: 'center', height: '31px', boxSizing: 'border-box'
  }, parent);
  b.textContent = text;
  if (title) b.title = title;
  b.addEventListener('mouseenter', () => { b.style.color = '#fff'; });
  b.addEventListener('mouseleave', () => { b.style.color = DIM; });
  b.addEventListener('click', onClick);
  return b;
}
function cap(text, parent) {
  const n = h('span', {
    fontSize: '9px', fontWeight: '700', color: FAINT,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    fontFamily: FONT, flexShrink: '0'
  }, parent);
  n.textContent = text;
  return n;
}

function divider(parent) {
  return h('div', {
    width: '1px', height: '22px', background: 'rgba(255,255,255,0.28)', flexShrink: '0'
  }, parent);
}

function textBox(parent, width, placeholder, title) {
  const outer = segBox(parent);
  const input = h('input', {
    width: width + 'px', background: 'transparent', color: INK,
    border: '0', outline: 'none',
    fontSize: '12px', fontFamily: FONT, padding: '5px 9px',
    flexShrink: '0'
  }, outer);
  input.type = 'text';
  input.placeholder = placeholder;
  if (title) input.title = title;
  return input;
}

function stepper(parent, getLabel, onPrev, onNext) {
  const wrap = h('div', {
    display: 'flex', alignItems: 'center', gap: '1px',
    flexShrink: '0', height: '31px'
  }, parent);
  const prev = h('div', {
    fontSize: '15px', color: FAINT, cursor: 'pointer',
    padding: '4px 5px', fontFamily: FONT
  }, wrap);
  prev.textContent = '‹';
  const lab = h('div', {
    fontSize: '12px', fontWeight: '600', color: '#fff', cursor: 'default',
    minWidth: '30px', textAlign: 'center', fontFamily: FONT,
    whiteSpace: 'nowrap', padding: '4px'
  }, wrap);
  const next = h('div', {
    fontSize: '15px', color: FAINT, cursor: 'pointer',
    padding: '4px 5px', fontFamily: FONT
  }, wrap);
  next.textContent = '›';
  const paint = () => { lab.textContent = getLabel(); };
  prev.addEventListener('click', () => { onPrev(); });
  next.addEventListener('click', () => { onNext(); });
  prev.addEventListener('mouseenter', () => { prev.style.color = '#fff'; });
  prev.addEventListener('mouseleave', () => { prev.style.color = FAINT; });
  next.addEventListener('mouseenter', () => { next.style.color = '#fff'; });
  next.addEventListener('mouseleave', () => { next.style.color = FAINT; });
  paint();
  return { paint };
}

export function openLayoutEditor(app, onClose) {
  ensureFont();
  ensureStyle();

  const keymap = app.keys.board.keymap;
  const legends = (app.keys.custom && app.keys.custom.legends) || [];
  const keys = app.keys.layout.layout.map((k, i) => ({
    x: k.x || 0,
    y: k.y || 0,
    w: k.w || 1,
    h: k.h || 1,
    encoder: !!k.encoder,
    code: keymap[i] || 'KC_NO',
    legend: legends[i] || null,
  }));

  let dirty = false;
  let selected = -1;
  let scale = 48;
  let ox = 0;
  let oy = 0;

  const chipLabel = (k) => {
    if (k.encoder) return '◦';
    return k.legend || LEGENDS[k.code] || '';
  };

  const chipColors = (idx) => {
    let ci = -1;
    for (let i = 0; i <= idx; i++) if (!keys[i].encoder) ci++;
    const comp = app.keys.components[ci];
    if (comp && comp.swatch) return { bg: comp.swatch.background, fg: comp.swatch.color };
    const base = app.colorway.swatches.base;
    return { bg: base.background, fg: base.color };
  };

  const overlay = h('div', {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    zIndex: '60', background: '#0b0b0d', display: 'flex', flexDirection: 'column',
    fontFamily: FONT, userSelect: 'none', boxSizing: 'border-box', color: INK
  });
  document.body.appendChild(overlay);

  const canvasWrap = h('div', {
    flex: '1', position: 'relative', overflow: 'hidden', cursor: 'default',
    background: '#0b0b0d', minHeight: '0'
  }, overlay);
  const layer = h('div', { position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }, canvasWrap);

  h('div', {
    position: 'fixed', left: '0', right: '0', bottom: '0', height: '45vh',
    zIndex: '39', pointerEvents: 'none',
    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)'
  }, overlay);

  const brand = h('div', {
    position: 'fixed', top: '16px', left: '18px', zIndex: '40',
    display: 'flex', alignItems: 'baseline', gap: '8px',
    fontFamily: FONT, userSelect: 'none', pointerEvents: 'none'
  }, overlay);
  h('span', { fontSize: '14px', fontWeight: '700', color: '#fff' }, brand).textContent = 'keycaps';
  const brandSub = h('span', { fontSize: '11px', fontFamily: FONT, color: DIM }, brand);

  const topActions = h('div', {
    position: 'fixed', top: '14px', right: '16px', zIndex: '40',
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: FONT, userSelect: 'none'
  }, overlay);

  const bar = h('div', {
    position: 'fixed', left: '50%', bottom: '14px', transform: 'translateX(-50%)',
    zIndex: '40', display: 'flex', alignItems: 'center', gap: '10px',
    fontFamily: FONT, userSelect: 'none', maxWidth: '98vw',
    overflowX: 'auto', overflowY: 'visible', whiteSpace: 'nowrap',
    boxSizing: 'border-box', padding: '4px 6px',
    scrollbarWidth: 'none'
  }, overlay);
  bar.className = 'kf-bar';
  bar.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  pill('+ key', topActions, () => {
    const e = extents();
    keys.push({ x: 0, y: e.h, w: 1, h: 1, encoder: false, code: 'KC_NO', legend: null });
    selected = keys.length - 1;
    dirty = true;
    paintBrand();
    fit();
    renderChips();
    renderProps();
    preview();
  });
  pill('fit', topActions, () => {
    fit();
    keys.forEach((k, i) => { if (layer.children[i]) place(layer.children[i], k); });
  });
  pill('done', topActions, () => close());

  const paintBrand = () => {
    brandSub.textContent = 'layout editor · ' + keys.length + (keys.length === 1 ? ' key' : ' keys');
  };
  paintBrand();

  const extents = () => {
    let w = 1;
    let h = 1;
    for (const k of keys) {
      w = Math.max(w, k.x + k.w);
      h = Math.max(h, k.y + k.h);
    }
    return { w, h };
  };

  const fit = () => {
    const r = canvasWrap.getBoundingClientRect();
    const e = extents();
    scale = Math.max(20, Math.min(64, Math.min((r.width - 80) / e.w, (r.height - 80) / e.h)));
    ox = (r.width - e.w * scale) / 2;
    oy = (r.height - e.h * scale) / 2;
  };

  const place = (elm, k) => {
    elm.style.left = (ox + k.x * scale + 3) + 'px';
    elm.style.top = (oy + k.y * scale + 3) + 'px';
    elm.style.width = Math.max(8, k.w * scale - 6) + 'px';
    elm.style.height = Math.max(8, k.h * scale - 6) + 'px';
  };

  const paintSelection = () => {
    [...layer.children].forEach((elm, i) => {
      if (i === selected) {
        elm.style.outline = '2px solid ' + INK;
        elm.style.outlineOffset = '2px';
      } else {
        elm.style.outline = 'none';
      }
    });
  };

  const renderChips = () => {
    layer.textContent = '';
    keys.forEach((k, i) => {
      const c = chipColors(i);
      const chip = h('div', {
        position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '600', fontFamily: FONT,
        background: k.encoder ? 'transparent' : c.bg, color: k.encoder ? FAINT : c.fg,
        border: k.encoder ? '1.5px dashed rgba(255,255,255,0.25)' : 'none',
        cursor: 'grab', touchAction: 'none', overflow: 'hidden',
        whiteSpace: 'nowrap', boxSizing: 'border-box', padding: '0 4px'
      }, layer);
      sq(chip, k.encoder ? 99 : 6);
      chip.textContent = chipLabel(k);
      place(chip, k);
      if (i === selected) {
        chip.style.outline = '2px solid ' + INK;
        chip.style.outlineOffset = '2px';
      }
      chip.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        selected = i;
        renderProps();
        paintSelection();
        const sx = e.clientX;
        const sy = e.clientY;
        const x0 = k.x;
        const y0 = k.y;
        let moved = false;
        chip.style.cursor = 'grabbing';
        try { chip.setPointerCapture(e.pointerId); } catch {}
        const mv = (ev) => {
          const nx = Math.max(0, snapU(x0 + (ev.clientX - sx) / scale));
          const ny = Math.max(0, snapU(y0 + (ev.clientY - sy) / scale));
          if (nx !== k.x || ny !== k.y) {
            k.x = nx;
            k.y = ny;
            place(chip, k);
            moved = true;
          }
        };
        const up = () => {
          chip.removeEventListener('pointermove', mv);
          chip.removeEventListener('pointerup', up);
          chip.removeEventListener('pointercancel', up);
          chip.style.cursor = 'grab';
          if (moved) {
            dirty = true;
            preview();
            renderProps();
          }
        };
        chip.addEventListener('pointermove', mv);
        chip.addEventListener('pointerup', up);
        chip.addEventListener('pointercancel', up);
      });
    });
  };

  const hint = (parent) => {
    cap('drag · 0.25u snap · esc saves', parent);
  };

  const numStepper = (caption, get, set, min, max) => {
    cap(caption, bar);
    stepper(bar,
      () => get().toFixed(2),
      () => {
        set(Math.max(min, Math.min(max, snapU(num(get() - SNAP, get())))));
        dirty = true; preview(); renderProps();
      },
      () => {
        set(Math.max(min, Math.min(max, snapU(num(get() + SNAP, get())))));
        dirty = true; preview(); renderProps();
      });
  };

  const renderProps = () => {
    bar.textContent = '';
    const k = keys[selected];
    if (!k) {
      cap('layout', bar);
      const e = extents();
      cap(e.w.toFixed(2) + 'u × ' + e.h.toFixed(2) + 'u · ' + keys.length + (keys.length === 1 ? ' key' : ' keys'), bar);
      divider(bar);
      cap('click a key to edit', bar);
      divider(bar);
      hint(bar);
      return;
    }
    cap('key ' + (selected + 1) + '/' + keys.length, bar);
    divider(bar);
    numStepper('x', () => k.x, (v) => { k.x = v; }, 0, 40);
    numStepper('y', () => k.y, (v) => { k.y = v; }, 0, 40);
    if (!k.encoder) {
      divider(bar);
      numStepper('w', () => k.w, (v) => { k.w = v; }, 0.25, 12);
      numStepper('h', () => k.h, (v) => { k.h = v; }, 0.25, 3);
      divider(bar);
      const input = textBox(bar, 88, 'name key…', 'rename key');
      input.value = k.legend !== null && k.legend !== undefined
        ? k.legend
        : (k.code === 'KC_NO' ? '' : app.defaultLegend(k.code));
      input.addEventListener('change', () => {
        k.legend = input.value.trim() || null;
        dirty = true;
        preview();
        renderChips();
      });
      cap(k.code, bar);
    } else {
      divider(bar);
      cap('encoder · scroll knob in 3d', bar);
    }
    divider(bar);
    if (keys.length > 1) {
      nakedBtn('delete', bar, () => {
        keys.splice(selected, 1);
        selected = -1;
        dirty = true;
        paintBrand();
        fit();
        renderChips();
        renderProps();
        preview();
      }, 'delete key');
      divider(bar);
    }
    hint(bar);
  };

  const preview = () => {
    app.previewEditedKeys(keys);
    renderChips();
  };

  function close() {
    window.removeEventListener('resize', onResize);
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
    if (dirty) app.applyEditedKeys(keys);
    if (onClose) onClose();
  }

  const onResize = () => {
    fit();
    keys.forEach((k, i) => {
      if (layer.children[i]) place(layer.children[i], k);
    });
  };

  const onKey = (e) => {
    if (e.key !== 'Escape' || e.isComposing) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    close();
  };

  canvasWrap.addEventListener('pointerdown', (e) => {
    if (e.target === canvasWrap || e.target === layer) {
      selected = -1;
      renderProps();
      paintSelection();
    }
  });

  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey, true);

  fit();
  renderChips();
  renderProps();
}
