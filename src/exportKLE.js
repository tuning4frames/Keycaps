// board export, stackoverflow <3

import { LEGENDS } from './config.js';

export function exportKLE(keys, colorway) {
  const rowsMap = new Map();
  for (const key of keys) {
    const y = key.y;
    if (!rowsMap.has(y)) rowsMap.set(y, []);
    rowsMap.get(y).push(key);
  }
  const ys = [...rowsMap.keys()].sort((a, b) => a - b);

  const rows = [];
  for (const y of ys) {
    const rowKeys = rowsMap.get(y).sort((a, b) => a.x - b.x);
    const row = [];
    let cursor = 0;
    for (const key of rowKeys) {
      const meta = {};
      const gap = key.x - cursor;
      if (gap > 0) meta.x = gap;
      if ((key.w || 1) !== 1) meta.w = key.w;
      if ((key.h || 1) !== 1) meta.h = key.h;

      const swatchName = key.swatchName;
      const sw = colorway.swatches[swatchName] || colorway.swatches.base;
      meta.c = sw.background;
      meta.t = sw.color;

      if (Object.keys(meta).length) row.push(meta);
      row.push(key.legendText != null ? key.legendText : (LEGENDS[key.code] || ''));
      cursor = key.x + (key.w || 1);
    }
    rows.push(row);
  }
  return rows;
}

export function downloadJSON(data, filename) {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}