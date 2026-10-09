import * as THREE from 'three';
import { noiseAOTexture } from '../texture.js';

const SEQ = 'plsbreak';
const WORDS = ['RIP', ':(', 'lol', 'fah', '67', 'ggs', 'o7'];

function randomNeon() {
  const c = new THREE.Color();
  c.setHSL(Math.random(), 1, 0.55);
  return c;
}

function glitchTexture(w, code) {
  const s = 128;
  const wide = Math.max(1, w || 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(s * wide);
  canvas.height = s;
  const ctx = canvas.getContext('2d');
  const cw = canvas.width;
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(0, 0, cw, s);
  ctx.fillStyle = '#000000';
  const n = 8;
  const cell = s / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n * wide; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  for (let i = 0; i < 400 * wide; i++) {
    ctx.fillStyle = 'hsl(' + Math.floor(Math.random() * 360) + ',100%,60%)';
    ctx.fillRect(Math.random() * cw, Math.random() * s, 3, 3);
  }
  let word = WORDS[Math.floor(Math.random() * WORDS.length)];
  if (code === 'KC_SPC') word = 'clock it';
  else if (wide >= 2) word = 'cooked';
  ctx.fillStyle = '#ffffff';
  let size = 28;
  ctx.font = 'bold ' + size + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(word).width;
  const maxW = cw - 16;
  if (tw > maxW) {
    size = Math.max(10, Math.floor(size * maxW / tw));
    ctx.font = 'bold ' + size + 'px sans-serif';
  }
  ctx.save();
  ctx.translate(cw / 2, s / 2);
  ctx.rotate((Math.random() - 0.5) * 0.6);
  ctx.fillText(word, 0, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function killMat(m, w, code) {
  if (m.map) {
    m.map.dispose();
  }
  m.map = glitchTexture(w, code);
  if (m.aoMap) {
    m.aoMap = null;
  }
  if (m.color) m.color.copy(randomNeon());
  m.wireframe = true;
  m.needsUpdate = true;
}

function breakAll(app) {
  for (const k of app.keys.components) {
    killMat(k.topMat, k.w, k.code);
    k.topMat.wireframe = false;
    k.sideMat.aoMap = null;
    k.sideMat.color.copy(randomNeon());
    k.sideMat.wireframe = true;
    k.sideMat.needsUpdate = true;
    if (k.activeTopMat) {
      killMat(k.activeTopMat, k.w, k.code);
      k.activeTopMat.wireframe = false;
    }
    if (k.activeSideMat) {
      k.activeSideMat.color.copy(randomNeon());
      k.activeSideMat.wireframe = true;
    }
  }
  const cm = app.caseMgr;
  if (cm.caseMesh) {
    for (const m of cm.caseMesh.material) killMat(m);
  }
  if (cm.plateMat) killMat(cm.plateMat);
  if (cm.knob) killMat(cm.knob.material);
  if (cm.knobRing) killMat(cm.knobRing.material);
  app.room.uniforms.uTopColor.value.copy(randomNeon());
  app.room.uniforms.uMidColor.value.copy(randomNeon());
  app.room.uniforms.uBottomColor.value.copy(randomNeon());
  app.room.uniforms.uHaloColor.value.copy(randomNeon());
}

function clearMat(m) {
  if (m.map) {
    m.map.dispose();
    m.map = null;
  }
  m.wireframe = false;
  m.needsUpdate = true;
}

function fixAll(app) {
  for (const k of app.keys.components) {
    k.topMat.wireframe = false;
    k.sideMat.wireframe = false;
    if (k.activeTopMat) k.activeTopMat.wireframe = false;
    if (k.activeSideMat) k.activeSideMat.wireframe = false;
    k.updateColors();
    k.refreshLegend();
  }
  const cm = app.caseMgr;
  if (cm.caseMesh) {
    for (const m of cm.caseMesh.material) clearMat(m);
    cm.caseMesh.material[2].aoMap = noiseAOTexture();
  }
  if (cm.plateMat) clearMat(cm.plateMat);
  if (cm.knob) clearMat(cm.knob.material);
  if (cm.knobRing) clearMat(cm.knobRing.material);
  cm.updateCaseMaterial(app.caseColor, app.caseFinish);
  app.room.updateColor(app.sceneColor);
}

export function attachPlsBreak(app) {
  let buf = '';
  let broken = false;
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-SEQ.length);
    if (buf === SEQ) {
      buf = '';
      broken = !broken;
      if (broken) breakAll(app);
      else fixAll(app);
    }
  });
}