// cap texture
// one canvas per key 100+ canvases.
// my gpu hates me, your gpu hates me, EVERYBODYYY HATES MEE T-T

import * as THREE from 'three';
import { LEGENDS } from './config.js';

const PX_PER_U = 128;

const LEGEND_FONT = (size, weight) =>
  `${weight || 600} ${size}px Montserrat, system-ui, -apple-system, sans-serif`;

export function keyTexture(opts) {
  const w = opts.w;
  const h = opts.h || 1;
  const key = opts.code;
  const fg = opts.color;
  const bg = opts.background;

  const canvas = document.createElement('canvas');
  canvas.height = PX_PER_U * h;
  canvas.width = PX_PER_U * w;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const mainChar = opts.labelOverride !== undefined && opts.labelOverride !== null
    ? opts.labelOverride
    : (LEGENDS[key] || '');
  if (mainChar && opts.legends !== false) {
    const word = mainChar.length > 1;
    const isoEnter = key === 'KC_ENT' && h > 1;
    const corner = !isoEnter && opts.legendPos === 'topleft';
    const isSymbol = mainChar.length === 1 && !/[a-z0-9]/i.test(mainChar);
    let fontSize = word ? 30 : isSymbol ? 54 : 46;
    const weight = word ? 500 : 600;
    ctx.font = LEGEND_FONT(fontSize, weight);
    const pad = Math.round(PX_PER_U * 0.16);
    const maxW = corner ? canvas.width - pad * 2 : canvas.width * (isoEnter ? 0.6 : 0.78);
    const tw = ctx.measureText(mainChar).width;
    if (tw > maxW) {
      fontSize = Math.max(15, Math.floor(fontSize * maxW / tw));
      ctx.font = LEGEND_FONT(fontSize, weight);
    }
    ctx.fillStyle = fg;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = fontSize * 0.09;
    ctx.shadowOffsetY = fontSize * 0.035;
    if (corner) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(mainChar, pad * 0.75, canvas.height * 0.26);
      if (word) {
        ctx.font = LEGEND_FONT(Math.round(fontSize * 0.62), 500);
        ctx.globalAlpha = 0.55;
        ctx.textAlign = 'right';
        ctx.fillText(mainChar, canvas.width - pad * 0.75, canvas.height * 0.74);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mainChar, canvas.width / 2, canvas.height * (isoEnter ? 0.28 : 0.42));
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  return texture;
}

export function noiseAOTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = 235 + Math.random() * 20;
    img.data[p] = v;
    img.data[p + 1] = v;
    img.data[p + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function softShadowTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function wallShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(0,0,0,0.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}