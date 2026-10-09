const SEQ = 'gamerlights';

function isJeb(cw) {
  return !!cw && (cw.rainbow === true || (cw.id && cw.id.indexOf('custom_jeb_') === 0));
}

function stripTops(app) {
  for (const k of app.keys.components) {
    if (k.topMat.map) {
      k.topMat.map.dispose();
      k.topMat.map = null;
      k.topMat.needsUpdate = true;
    }
    if (k.activeTopMat && k.activeTopMat.map) {
      k.activeTopMat.map.dispose();
      k.activeTopMat.map = null;
      k.activeTopMat.needsUpdate = true;
    }
  }
}

function paintWave(app, t) {
  const n = app.keys.components.length;
  for (let i = 0; i < n; i++) {
    const k = app.keys.components[i];
    const h = (t * 0.12 + i / Math.max(1, n)) % 1;
    k.sideMat.color.setHSL(h, 1, 0.55);
    k.topMat.color.setHSL(h, 1, 0.72);
    if (k.activeTopMat) k.activeTopMat.color.setHSL(h, 1, 0.72);
    if (k.activeSideMat) k.activeSideMat.color.setHSL(h, 1, 0.55);
  }
  const ch = (t * 0.12) % 1;
  const cm = app.caseMgr;
  if (cm.caseMesh) {
    for (const m of cm.caseMesh.material) m.color.setHSL(ch, 1, 0.6);
  }
  if (cm.plateMat) cm.plateMat.color.setHSL(ch, 1, 0.6);
  if (cm.knob) cm.knob.material.color.setHSL(ch, 1, 0.6);
  if (cm.knobRing) cm.knobRing.material.color.setHSL(ch, 1, 0.6);
}

function restoreAll(app) {
  for (const k of app.keys.components) {
    k.updateColors();
    k.refreshLegend();
  }
  app.caseMgr.updateCaseMaterial(app.caseColor, app.caseFinish);
}

export function attachGamerLights(app) {
  let buf = '';
  let on = false;
  let was = false;
  app.sm.onUpdate(() => {
    if (!on && !isJeb(app.colorway)) {
      if (was) {
        was = false;
        restoreAll(app);
      }
      return;
    }
    was = true;
    stripTops(app);
    paintWave(app, performance.now() / 1000);
  });
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-SEQ.length);
    if (buf === SEQ) {
      buf = '';
      on = !on;
    }
  });
}