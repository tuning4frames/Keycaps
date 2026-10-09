// kle parser
// KLE json -> our board shape
// if this breaks, blame keyboard-layout-editor.com

import { QMK_CODES } from './config.js';
import { LEGENDS } from './config.js';

// legend text -> qmk code
const REVERSE_LEGENDS = {};
for (const [code, text] of Object.entries(LEGENDS)) {
  if (text && !(text in REVERSE_LEGENDS)) {
    REVERSE_LEGENDS[text.toUpperCase()] = code;
  }
}
// letters/numbers directly
for (const code of Object.values(QMK_CODES)) {
  const m = code.match(/^KC_([A-Z0-9])$/);
  if (m && !(m[1] in REVERSE_LEGENDS)) REVERSE_LEGENDS[m[1]] = code;
}
REVERSE_LEGENDS['`'] = 'KC_GESC';
REVERSE_LEGENDS['~'] = 'KC_GESC';
REVERSE_LEGENDS['\\'] = 'KC_BSLS';
REVERSE_LEGENDS['|'] = 'KC_BSLS';
REVERSE_LEGENDS['Fn'] = 'MO(1)';

export function parseKLE(data) {
  let rows;
  if (Array.isArray(data)) {
    rows = data;
  } else if (data && Array.isArray(data.keys)) {
    // already decoded
    const layout = [];
    const keymap = [];
    const legends = [];
    for (const k of data.keys) {
      layout.push({ x: k.x || 0, y: k.y || 0, w: k.w || 1, h: k.h || 1 });
      const label = (k.label || '').trim();
      keymap.push(REVERSE_LEGENDS[label.toUpperCase()] || 'KC_NO');
      legends.push(label);
    }
    return finish(layout, keymap, legends);
  } else {
    throw new Error('not a KLE layout');
  }

  const layout = [];
  const keymap = [];
  const legends = [];
  let cx = 0;
  let cy = 0;

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    cx = 0;
    let rowH = 1;
    let pendingMeta = null;
    for (const item of row) {
      // meta comes wrapped in an array
      if (Array.isArray(item) && item.length && typeof item[0] === 'object') {
        const metaObj = item[0];
        pendingMeta = pendingMeta ? { ...pendingMeta, ...metaObj } : { ...metaObj };
        cx += pendingMeta.x || 0;
        cy += pendingMeta.y || 0;
      } else if (item && typeof item === 'object') {

        pendingMeta = pendingMeta ? { ...pendingMeta, ...item } : { ...item };
        cx += pendingMeta.x || 0;
        cy += pendingMeta.y || 0;
      } else if (typeof item === 'string') {
        const label = String(item).trim();
        const meta = pendingMeta || {};
        const w = meta.w || 1;
        const h = meta.h || 1;
        layout.push({ x: cx, y: cy, w, h });
        keymap.push(REVERSE_LEGENDS[label.toUpperCase()] || 'KC_NO');
        legends.push(label);
        rowH = Math.max(rowH, h);
        cx += w;
        pendingMeta = null;
      }
    }
    cy += rowH;
  }

  return finish(layout, keymap, legends);
}

function finish(layout, keymap, legends) {
  if (!layout.length) throw new Error('empty layout');
  let width = 0;
  let height = 0;
  for (const k of layout) {
    width = Math.max(width, k.x + (k.w || 1));
    height = Math.max(height, k.y + (k.h || 1));
  }
  return { width, height, layout, keymap, legends };
}