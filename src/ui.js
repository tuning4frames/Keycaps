
import { BOARDS } from './boards.js';
import { COLORWAYS, saveCustomColorway, deleteCustomColorway } from './config.js';

const FONT = "'Lexend', 'Inter', system-ui, -apple-system, sans-serif";

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

function segBtn(parent, options, get, set) {
  const wrap = h('div', {
    display: 'flex', gap: '2px', background: FILL,
    padding: '2px', flexShrink: '0'
  }, parent);
  sq(wrap, 15);
  const btns = options.map((opt) => {
    const b = h('div', {
      fontSize: '12px', fontWeight: '500', padding: '5px 9px',
      cursor: 'pointer', color: DIM,
      fontFamily: FONT, whiteSpace: 'nowrap', userSelect: 'none'
    }, wrap);
    sq(b, 11);
    b.textContent = opt.label;
    b.addEventListener('click', () => { set(opt.value); paint(); });
    return { opt, el: b };
  });
  function paint() {
    const cur = get();
    for (const { opt, el } of btns) {
      const on = opt.value === cur;
      el.style.background = on ? INK : 'transparent';
      el.style.color = on ? '#0b0b0d' : DIM;
      el.style.fontWeight = on ? '600' : '500';
    }
  }
  paint();
  return { paint };
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

function pill(text, parent, onClick) {
  const outer = segBox(parent, { cursor: 'pointer' });
  const inner = segPad(outer, { fontWeight: '600', color: INK });
  inner.textContent = text;
  outer.addEventListener('mouseenter', () => { outer.style.background = '#1c1c21'; });
  outer.addEventListener('mouseleave', () => { outer.style.background = FILL; });
  outer.addEventListener('click', onClick);
  return outer;
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

function toggle(parent, get, set) {
  const sw = h('div', {
    width: '34px', height: '20px',
    display: 'flex', alignItems: 'center', padding: '2px',
    cursor: 'pointer', flexShrink: '0', boxSizing: 'border-box'
  }, parent);
  sq(sw, 12);
  const knob = h('div', { width: '16px', height: '16px', flexShrink: '0' }, sw);
  sq(knob, 8);
  function paint() {
    const on = get();
    sw.style.background = on ? INK : FILL;
    sw.style.justifyContent = on ? 'flex-end' : 'flex-start';
    knob.style.background = on ? '#0b0b0d' : FAINT;
  }
  sw.addEventListener('click', () => { set(!get()); paint(); });
  paint();
  return { paint };
}

function toggleRow(parent, get, set, caption) {
  const wrap = h('div', {
    display: 'flex', alignItems: 'center', gap: '8px',
    flexShrink: '0', height: '31px'
  }, parent);
  const t = toggle(wrap, get, set);
  cap(caption, wrap);
  return t;
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

function slider(parent, rangeWidth, min, max, step, get, set, fmt, extra) {
  const inner = h('div', {
    display: 'flex', alignItems: 'center', gap: '8px',
    flexShrink: '0', height: '31px'
  }, parent);
  const snap = (v) => {
    const lo = extra && extra.minFn ? extra.minFn() : min;
    let n = typeof v === 'number' ? v : parseFloat(v);
    if (!Number.isFinite(n)) n = get();
    n = Math.max(lo, Math.min(max, n));
    n = Math.round(n / step) * step;
    return Math.round(n * 10000) / 10000;
  };
  const input = h('input', { width: rangeWidth + 'px', accentColor: INK, flexShrink: '0' }, inner);
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(get());
  const val = h('input', {
    width: '52px', background: 'transparent', color: INK,
    border: '0', outline: 'none',
    fontSize: '12px', fontFamily: FONT, textAlign: 'right', flexShrink: '0',
    padding: '0'
  }, inner);
  val.type = 'text';
  val.title = 'type a value';
  const paint = () => {
    input.value = String(get());
    val.value = fmt ? fmt(get()) : String(get());
  };
  input.addEventListener('input', () => { set(snap(Number(input.value))); paint(); });
  val.addEventListener('change', () => {
    const raw = extra && extra.fromDisplay ? extra.fromDisplay(val.value) : parseFloat(val.value);
    set(snap(raw));
    paint();
  });
  paint();
  return { paint };
}

function colorDot(parent, get, set) {
  const outer = segBox(parent);
  const inner = h('div', {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '5px 9px', flexShrink: '0'
  }, outer);
  const input = h('input', {
    width: '18px', height: '18px', borderRadius: '99px',
    border: '0',
    background: 'transparent', cursor: 'pointer', padding: '0',
    flexShrink: '0'
  }, inner);
  input.type = 'color';
  const val = h('span', { fontSize: '12px', fontFamily: FONT, color: INK }, inner);
  const paint = () => { input.value = get(); val.textContent = get(); };
  input.addEventListener('input', () => { set(input.value); paint(); });
  paint();
  return { paint };
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

function unionOutline(box, bright) {
  const NS = 'http://www.w3.org/2000/svg';
  const RR = 10, c1x = 9, c2x = 17, cy = 10;
  const half = (c2x - c1x) / 2;
  const hh = Math.sqrt(RR * RR - half * half);
  const mx = (c1x + c2x) / 2;
  const yT = (cy - hh).toFixed(3);
  const yB = (cy + hh).toFixed(3);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '26');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 26 20');
  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.overflow = 'visible';
  svg.style.pointerEvents = 'none';
  const upath = document.createElementNS(NS, 'path');
  upath.setAttribute('d',
    'M ' + mx + ' ' + yT +
    ' A ' + RR + ' ' + RR + ' 0 1 1 ' + mx + ' ' + yB +
    ' A ' + RR + ' ' + RR + ' 0 1 1 ' + mx + ' ' + yT + ' Z');
  upath.setAttribute('fill', 'none');
  upath.setAttribute('stroke', bright ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)');
  upath.setAttribute('stroke-width', '2');
  svg.appendChild(upath);
  box.appendChild(svg);
}

export function attachUI(app) {
  ensureFont();
  ensureStyle();
  const boardIds = Object.keys(BOARDS);
  const cwIds = () => Object.keys(COLORWAYS);

  const brand = h('div', {
    position: 'fixed', top: '16px', left: '18px', zIndex: '40',
    display: 'flex', alignItems: 'baseline', gap: '8px',
    fontFamily: FONT, userSelect: 'none', pointerEvents: 'none'
  }, document.body);
  const brandName = h('span', {
    fontSize: '14px', fontWeight: '700', color: '#fff'
  }, brand);
  brandName.textContent = 'keycaps';
  const brandSub = h('span', {
    fontSize: '11px', fontFamily: FONT, color: DIM
  }, brand);
  const paintBrand = () => {
    const b = BOARDS[app.boardId];
    brandSub.textContent = (b ? b.label : 'Custom') + ' · ' + app.colorway.label;
  };
  paintBrand();

  const topActions = h('div', {
    position: 'fixed', top: '14px', right: '16px', zIndex: '40',
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: FONT, userSelect: 'none'
  }, document.body);

  h('div', {
    position: 'fixed', left: '0', right: '0', bottom: '0', height: '45vh',
    zIndex: '39', pointerEvents: 'none',
    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)'
  }, document.body);

  const bar = h('div', {
    position: 'fixed', left: '50%', bottom: '14px', transform: 'translateX(-50%)',
    zIndex: '40', display: 'flex', alignItems: 'center', gap: '10px',
    fontFamily: FONT, userSelect: 'none', maxWidth: '98vw',
    overflowX: 'auto', overflowY: 'visible', whiteSpace: 'nowrap',
    boxSizing: 'border-box', padding: '4px 6px',
    scrollbarWidth: 'none'
  }, document.body);
  bar.className = 'kf-bar';
  bar.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  const legendsTg = toggleRow(bar, () => app.legends, (v) => app.setLegends(v), 'legends');
  const testTg = toggleRow(bar, () => app.testing, (v) => app.setTesting(v), 'test');
  const soundTg = toggleRow(bar, () => app.soundOn, (v) => app.setSoundOn(v), 'sound');
  divider(bar);

  const legendInput = textBox(bar, 88, 'name key…');
  legendInput.disabled = true;
  legendInput.style.opacity = '0.45';
  legendInput.addEventListener('change', () => {
    if (!app.selectedKey) return;
    app.selectedKey.setLegendText(legendInput.value.trim() || null);
  });
  segBtn(bar, [
    { label: 'center', value: 'center' },
    { label: 'corner', value: 'topleft' }
  ], () => app.legendStyle, (v) => app.setLegendStyle(v));
  divider(bar);

  cap('color', bar);
  const modeSeg = segBtn(bar, [
    { label: 'inspect', value: 'inspect' },
    { label: 'paint', value: 'paint' }
  ], () => (app.paintMode ? 'paint' : 'inspect'), (v) => {
    const wantPaint = v === 'paint';
    if (wantPaint !== app.paintMode) app.togglePaint();
  });
  const brushWrap = h('div', {
    display: 'flex', alignItems: 'center', gap: '9px', flexShrink: '0',
    padding: '0 2px', height: '31px'
  }, bar);
  function paintBrush() {
    brushWrap.textContent = '';
    for (const name of Object.keys(app.colorway.swatches)) {
      const sw = app.colorway.swatches[name];
      const on = app.activeSwatch === name;
      const d = h('div', {
        position: 'relative', cursor: 'pointer', flexShrink: '0',
        width: '26px', height: '20px'
      }, brushWrap);
      unionOutline(d, on);
      h('div', {
        position: 'absolute', left: '9px', top: '2px',
        width: '16px', height: '16px', borderRadius: '99px',
        background: sw.color,
        boxSizing: 'border-box'
      }, d);
      h('div', {
        position: 'absolute', left: '1px', top: '2px',
        width: '16px', height: '16px',
        borderRadius: '99px',
        background: sw.background,
        boxSizing: 'border-box'
      }, d);
      d.title = name;
      d.addEventListener('click', () => {
        app.activeSwatch = name;
        if (!app.paintMode) app.togglePaint();
        paintAll();
      });
    }
  }
  paintBrush();
  function stepCw(dir) {
    const ids = cwIds();
    const i = Math.max(0, ids.indexOf(app.colorway.id));
    app.setColorway(ids[(i + dir + ids.length) % ids.length]);
    paintAll();
  }
  const cwStep = stepper(bar, () => app.colorway.label, () => stepCw(-1), () => stepCw(1));
  const delCw = h('div', {
    fontSize: '13px', color: FAINT, cursor: 'pointer', padding: '6px 4px',
    flexShrink: '0', display: 'none', fontFamily: FONT
  }, bar);
  delCw.textContent = '×';
  delCw.title = 'delete custom colorway';
  delCw.addEventListener('click', () => {
    deleteCustomColorway(app.colorway.id);
    app.setColorway(cwIds()[0]);
    paintAll();
  });
  const makerInner = h('div', {
    display: 'flex', alignItems: 'center', gap: '8px',
    flexShrink: '0', height: '31px'
  }, bar);
  const makerName = h('input', {
    width: '64px', background: 'transparent', color: INK,
    border: '0', borderBottom: '1px solid rgba(255,255,255,0.3)', outline: 'none',
    fontSize: '12px', fontFamily: FONT, padding: '5px 0', flexShrink: '0'
  }, makerInner);
  makerName.type = 'text';
  makerName.placeholder = 'new mix…';
  makerName.title = 'name it, pick cap + legend colors per row, hit add';
  const mkPairs = [
    { bg: '#e3d9c6', fg: '#575d5e' },
    { bg: '#575d5e', fg: '#ed6b21' },
    { bg: '#ed6b21', fg: '#575d5e' }
  ].map((c, i) => {
    const pair = h('div', { position: 'relative', width: '26px', height: '20px', flexShrink: '0' }, makerInner);
    unionOutline(pair, false);
    const fg = h('input', {
      position: 'absolute', left: '9px', top: '2px',
      width: '16px', height: '16px', borderRadius: '99px',
      border: '0',
      background: 'transparent', cursor: 'pointer', padding: '0'
    }, pair);
    fg.type = 'color';
    fg.value = c.fg;
    fg.title = ['base', 'mods', 'accent'][i] + ' legend color';
    const bg = h('input', {
      position: 'absolute', left: '1px', top: '2px',
      width: '16px', height: '16px', borderRadius: '99px',
      border: '0',
      background: 'transparent', cursor: 'pointer', padding: '0'
    }, pair);
    bg.type = 'color';
    bg.value = c.bg;
    bg.title = ['base', 'mods', 'accent'][i] + ' cap color';
    return { bg, fg };
  });
  const mkAddOuter = segBox(bar, { cursor: 'pointer' });
  const mkAdd = segPad(mkAddOuter, { fontWeight: '600', color: INK });
  mkAdd.textContent = 'add';
  mkAdd.title = 'save custom colorway';
  mkAddOuter.addEventListener('mouseenter', () => { mkAddOuter.style.background = '#1c1c21'; });
  mkAddOuter.addEventListener('mouseleave', () => { mkAddOuter.style.background = FILL; });
  mkAddOuter.addEventListener('click', () => {
    const name = makerName.value.trim() || 'custom';
    const jeb = name.toLowerCase().indexOf('jeb_') === 0;
    const bone = name.toLowerCase().indexOf('dinnerbone') === 0;
    const id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const swatches = {};
    ['base', 'mods', 'accent'].forEach((n, i) => {
      swatches[n] = { background: mkPairs[i].bg.value, color: mkPairs[i].fg.value };
    });
    saveCustomColorway({ id, label: name, custom: true, rainbow: jeb, flip: bone, swatches });
    app.setColorway(id);
    makerName.value = '';
    paintAll();
  });
  cap('case', bar);
  const caseDot = colorDot(bar, () => app.caseColor, (v) => app.setCaseColor(v));
  cap('bg', bar);
  const bgDot = colorDot(bar, () => app.sceneColor, (v) => app.setSceneColor(v));
  divider(bar);

  const cornersSeg = segBtn(bar, [
    { label: 'rounded', value: 'rounded' },
    { label: 'sharp', value: 'sharp' }
  ], () => app.caseCorners, (v) => app.setCaseCorners(v));
  const finishSeg = segBtn(bar, [
    { label: 'matte', value: 'matte' },
    { label: 'gloss', value: 'glossy' }
  ], () => (app.caseFinish === 'glossy' ? 'glossy' : 'matte'), (v) => app.setCaseFinish(v));
  cap('bezel', bar);
  const bezelSl = slider(bar, 64, 0.1, 3, 0.05,
    () => app.caseBezel, (v) => app.setCaseBezel(v), (v) => v.toFixed(2) + 'u',
    { minFn: () => (app.caseCorners === 'sharp' ? 0.1 : 0.15) });
  cap('height', bar);
  const heightSl = slider(bar, 64, 0.75, 4, 0.05,
    () => app.caseHeight, (v) => app.setCaseHeight(v), (v) => v.toFixed(2) + 'u');
  divider(bar);

  cap('pack', bar);
  function stepPack(dir) {
    if (!app.soundPacks.length) return;
    const ids = app.soundPacks.map((p) => p.pack_id);
    const i = Math.max(0, ids.indexOf(app.soundPackId));
    app.setSoundPack(ids[(i + dir + ids.length) % ids.length]);
    paintAll();
  }
  const packStep = stepper(bar,
    () => {
      const p = app.soundPacks.find((x) => x.pack_id === app.soundPackId);
      if (!p) return app.soundPacks.length ? '…' : 'loading…';
      return p.name || p.pack_id;
    },
    () => stepPack(-1), () => stepPack(1));
  function paintPacks() { packStep.paint(); }
  app.onSoundPacksLoaded = () => paintPacks();
  const volSl = slider(bar, 64, 0, 1, 0.01,
    () => app.vibes.volume, (v) => app.vibes.setVolume(v),
    (v) => String(Math.round(v * 100)),
    { fromDisplay: (raw) => parseFloat(raw) / 100 });
  divider(bar);

  cap('board', bar);
  const boardOuter = segBox(bar);
  const boardSelect = h('select', {
    background: 'transparent', color: INK, border: '0', outline: 'none',
    fontSize: '12px', fontFamily: FONT, padding: '5px 9px',
    maxWidth: '118px', flexShrink: '0'
  }, boardOuter);
  function paintBoards() {
    boardSelect.textContent = '';
    for (const id of boardIds) {
      const o = h('option', {}, boardSelect);
      o.value = id;
      o.textContent = BOARDS[id].label;
    }
    if (boardIds.indexOf(app.boardId) < 0) {
      const o = h('option', {}, boardSelect);
      o.value = 'custom';
      o.textContent = 'Custom';
    }
    boardSelect.value = app.boardId;
  }
  paintBoards();
  boardSelect.addEventListener('change', () => { app.setBoard(boardSelect.value); paintAll(); });
  const kleInput = textBox(bar, 84, 'KLE json…', 'paste KLE json, hit enter');
  kleInput.addEventListener('change', () => {
    if (!kleInput.value.trim()) return;
    const ok = app.importKLE(kleInput.value.trim());
    kleInput.value = '';
    kleInput.placeholder = ok ? 'KLE json…' : 'invalid json!';
    if (ok) paintAll();
  });
  const expLayout = nakedBtn('exp layout', bar, () => app.exportLayout(), 'export layout KLE json');
  const expCw = nakedBtn('exp colors', bar, () => app.exportColorway(), 'export colorway json');

  pill('shot', topActions, () => app.screenshot());
  pill('reset cam', topActions, () => app.resetCamera());
  pill('clear paint', topActions, () => app.clearPaint());
  pill('gallery', topActions, () => app.openGallery(() => paintAll()));
  pill('edit layout', topActions, () => app.openEditor(() => paintAll()));

  function paintSelection() {
    const k = app.selectedKey;
    if (k) {
      legendInput.disabled = false;
      legendInput.style.opacity = '1';
      legendInput.value = k.legendText != null && k.legendText !== undefined
        ? k.legendText
        : (k.code ? k.code : '');
      legendInput.placeholder = k.code || 'name key…';
    } else {
      legendInput.disabled = true;
      legendInput.style.opacity = '0.45';
      legendInput.value = '';
      legendInput.placeholder = 'name key…';
    }
  }

  function paintAll() {
    modeSeg.paint();
    paintBrush();
    paintSelection();
    cwStep.paint();
    delCw.style.display = app.colorway.custom ? 'block' : 'none';
    legendsTg.paint();
    cornersSeg.paint();
    finishSeg.paint();
    bezelSl.paint();
    heightSl.paint();
    caseDot.paint();
    bgDot.paint();
    testTg.paint();
    soundTg.paint();
    volSl.paint();
    paintBoards();
    paintPacks();
    paintBrand();
  }

  app.onKeySelected = () => paintSelection();
  paintAll();

  return { repaint: paintAll };
}