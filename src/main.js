// main. everything gets wired up here
// if it breaks, its this file. its ALWAYS this file, ALWAYS THIS FUCKING FILE.

import SceneManager from './sceneManager.js';
import * as THREE from 'three';
import { Room } from './room.js';
import { CaseManager } from './caseManager.js';
import { KeyManager } from './keyManager.js';
import { BOARDS } from './boards.js';
import { MechVibes } from './sound/mechvibes.js';
import { openLayoutEditor } from './layoutEditor.js';
import { openGalleryPanel } from './gallery.js';
import { COLORWAYS, DEFAULTS, QMK_CODES, loadCustomColorways } from './config.js';
import { parseKLE } from './kle.js';
import { exportKLE, downloadJSON } from './exportKLE.js';
import { attachUI } from './ui.js';
import { attachPlsBreak } from './easter eggs/A-Very-Normal-Script.js';
import { attachGamerLights } from './easter eggs/Nothing-To-See-Here.js';
import { attachDinnerbone } from './easter eggs/Very-Boring-Utilities.js';
import * as configModule from './config.js';

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#1a1a1f';
document.body.style.width = '100vw';
document.body.style.height = '100vh';
document.body.style.display = 'flex';
document.body.style.flexDirection = 'row';
document.body.style.alignItems = 'stretch';

class App {
  constructor() {
    this.colorway = COLORWAYS[DEFAULTS.colorway];
    this.legendStyle = DEFAULTS.legendStyle;
    this.legends = DEFAULTS.legends;
    this.caseColor = DEFAULTS.caseColor;
    this.caseFinish = DEFAULTS.caseMaterial;
    this.caseBezel = DEFAULTS.caseBezel;
    this.caseCorners = DEFAULTS.caseCorners;
    this.caseHeight = DEFAULTS.caseHeight;
    this.sceneColor = DEFAULTS.sceneColor;
    this.boardId = DEFAULTS.board;
    this.testing = false;
    this.paintMode = false;
    this.activeSwatch = 'accent';
    this.selectedKey = null;
    this.customBoard = null;
    loadCustomColorways();

    // sounds
    this.vibes = new MechVibes();
    this.soundPackId = DEFAULTS.soundPack;
    this.soundOn = true;
    this.vibes.enabled = true;
    this.soundPacks = [];
    
    // only make noise for keys that exist
this.vibes.bindBrowserEvents(this.visibleKeyFilter());
    const viewport = document.createElement('div');
    Object.assign(viewport.style, {
      flex: '1',
      position: 'relative',
      height: '100vh',
      minWidth: '0',
      minHeight: '0',
      overflow: 'hidden'
    });
    document.body.appendChild(viewport);
    this.viewport = viewport;

    this.sm = new SceneManager({ el: viewport });
    this.room = new Room({ scene: this.sm.scene, color: this.sceneColor });
    this.keys = new KeyManager({
      scene: this.sm.scene,
      boardId: this.boardId,
      colorway: this.colorway,
      legendStyle: this.legendStyle,
      legends: this.legends,
      activeColor: DEFAULTS.activeColor,
      activeBackground: DEFAULTS.activeBackground
    });
    this.caseMgr = new CaseManager({
      scene: this.sm.scene,
      layout: this.keys.layout,
      boardId: this.boardId,
      color: this.caseColor,
      finish: this.caseFinish,
      bezel: this.caseBezel,
      cornerRadius: this.caseCorners === 'sharp' ? 0 : 0.5,
      height: this.caseHeight,
      envMap: this.sm.envMap
    });

    this.keys.setCaseHeight(this.caseHeight);
    this.syncCaseToColorway();
    this.bindPaint();
    this.bindKnob();
    this.loadLegendFont();
    this.sm.onUpdate(() => {
      this.keys.update();
      this.room.updateHalo(this.sm.camera);
    });
    this.resetCamera();
    this.sm.start();

    this.loadSoundPacks();
    attachUI(this);
    attachPlsBreak(this);
    attachGamerLights(this);
    attachDinnerbone(this);
  }

  // only make noise for keys that exist, please?
  visibleKeyFilter() {
    return (e) => {
      const code = QMK_CODES[e.code];
      if (!code) return false;
      return this.keys.components.some((k) => k.code === code);
    };
  }

  async loadSoundPacks() {
    await this.vibes.loadPacks();
    this.soundPacks = this.vibes.packs;
    if (this.soundOn) {
      const pack = this.vibes.getPack(this.soundPackId) || this.vibes.packs[0];
      if (pack) {
        this.soundPackId = pack.pack_id;
        this.vibes.loadPack(pack);
      }
    }
    if (this.onSoundPacksLoaded) this.onSoundPacksLoaded();
  }

  bindPaint() {
    const capMeshes = () => this.keys.components.map((k) => k.cap);
    let downPos = null;

    this.sm.renderer.domElement.addEventListener('pointerdown', (e) => {
      downPos = { x: e.clientX, y: e.clientY };
    });

    this.sm.renderer.domElement.addEventListener('pointerup', (e) => {
      if (!downPos) return;
      const dist = Math.abs(e.clientX - downPos.x) + Math.abs(e.clientY - downPos.y);
      downPos = null;
      if (dist > 6) return; // orbit drag, nuh uh clicky

      this.sm.move(e);
      const mesh = this.sm.pickKey(capMeshes());
      if (!mesh) {
        if (this.selectedKey) {
          this.selectedKey = null;
          if (this.onKeySelected) this.onKeySelected();
        }
        return;
      }
      const key = this.keys.components.find((k) => k.cap === mesh);
      if (!key) return;

      if (this.paintMode) {
        // MSPAINT but bettaaaa
        key.swatchOverride = this.activeSwatch;
        key.updateColors();
      }
      this.selectedKey = key;
      if (this.onKeySelected) this.onKeySelected();
    });
  }

  togglePaint() {
    this.paintMode = !this.paintMode;
  }

  // font for legends, i lowkey need change the font
  loadLegendFont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap';
    document.head.appendChild(link);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('600 48px "Montserrat"').then(() => {
        for (const key of this.keys.components) key.refreshLegend();
      }).catch(() => {});
    }
  }

  defaultLegend(code) {
    const { LEGENDS } = configModule;
    return LEGENDS[code] || code;
  }

  importKLE(text) {
    try {
      const data = JSON.parse(text);
      const parsed = parseKLE(data);
      this.customBoard = parsed;
      this.keys.setCustom(parsed);
      this.boardId = 'custom';
      this.rebindSoundFilter();
      this.rebuildCase();
      this.resetCamera();
      return true;
    } catch (e) {
      console.warn('KLE import failed:', e);
      return false;
    }
  }

  previewEditedKeys(keys) {
    this.setCustomKeys(keys, false);
  }

  applyEditedKeys(keys) {
    this.setCustomKeys(keys, true);
  }

  openEditor(onClose) {
    openLayoutEditor(this, onClose);
  }

  openGallery(refresh) {
    openGalleryPanel(this, refresh);
  }

  setCustomKeys(keys, resetCam) {
    let width = 0;
    let height = 0;
    const layout = [];
    const keymap = [];
    const legends = [];
    for (const k of keys) {
      const w = k.encoder ? (k.w || 1) : Math.max(0.25, k.w || 1);
      const h = k.encoder ? (k.h || 1) : Math.max(0.25, k.h || 1);
      const e = { x: k.x, y: k.y };
      if (w !== 1) e.w = w;
      if (h !== 1) e.h = h;
      if (k.encoder) e.encoder = true;
      layout.push(e);
      keymap.push(k.encoder ? 'ENCODER' : (k.code || 'KC_NO'));
      legends.push(k.legend || '');
      width = Math.max(width, k.x + w);
      height = Math.max(height, k.y + h);
    }
    const parsed = {
      width: Math.max(1, width),
      height: Math.max(1, height),
      layout, keymap, legends
    };
    this.customBoard = parsed;
    this.keys.setCustom(parsed);
    this.boardId = 'custom';
    this.rebindSoundFilter();
    this.rebuildCase();
    if (resetCam) this.resetCamera();
  }

  rebuildCase() {
    this.caseMgr.destroy();
    this.sm.scene.remove(this.caseMgr.group);
    this.caseMgr = new CaseManager({
      scene: this.sm.scene,
      layout: this.keys.layout,
      boardId: this.keys.boardId,
      color: this.caseColor,
      finish: this.caseFinish,
      bezel: this.caseBezel,
      cornerRadius: this.caseCorners === 'sharp' ? 0 : 0.5,
      height: this.caseHeight,
      envMap: this.sm.envMap
    });
    this.keys.setCaseHeight(this.caseHeight);
  }

  exportLayout() {
    const rows = exportKLE(this.keys.components, this.colorway);
    const name = (this.customBoard ? 'custom-layout' : 'keycaps-' + this.boardId)
      .toLowerCase().replace(/\s+/g, '-');
    downloadJSON(rows, name + '.json');
  }

  exportColorway() {
    downloadJSON(this.colorway, this.colorway.id + '.json');
  }


  setCaseColor(color) {
    this.caseColor = color;
    this.caseMgr.updateCaseMaterial(color, null);
  }

  setCaseBezel(bezel) {
    this.caseMgr.setBezel(bezel);
    this.caseBezel = this.caseMgr.bezel;
  }

  setCaseCorners(style) {
    this.caseCorners = style;
    this.caseMgr.setCornerRadius(style === 'sharp' ? 0 : 0.5);
    this.caseBezel = this.caseMgr.bezel;
  }

  setBoard(boardId) {
    if (!BOARDS[boardId] || boardId === this.boardId) return;
    this.boardId = boardId;
    this.keys.setBoard(boardId);
    this.rebindSoundFilter();
    this.rebuildCase();
    this.sm.controls.target.copy(this.boardCenter());
  }

  rebindSoundFilter() {
    this.vibes.unbindBrowserEvents();
    this.vibes.bindBrowserEvents(this.visibleKeyFilter());
  }

  // scroll on the knob do it JUST DO IT
  bindKnob() {
    const raycaster = this.sm.raycaster;
    this.sm.renderer.domElement.addEventListener('wheel', (e) => {
      if (!this.caseMgr.knob) return;
      this.sm.move(e);
      raycaster.setFromCamera(this.sm.mouse, this.sm.camera);
      const hits = raycaster.intersectObject(this.caseMgr.knob, true);
      if (hits.length) {
        e.preventDefault();
        this.caseMgr.spinKnob(e.deltaY);
      }
    }, { passive: false });
  }

  setCaseHeight(height) {
    this.caseMgr.setHeight(height);
    this.caseHeight = this.caseMgr.height;
    this.keys.setCaseHeight(this.caseHeight);
  }

  setCaseFinish(finish) {
    this.caseFinish = finish;
    this.caseMgr.updateCaseMaterial(null, finish);
  }

  setSceneColor(color) {
    this.sceneColor = color;
    this.room.updateColor(color);
  }

  setTesting(testing) {
    this.testing = testing;
    this.keys.setTesting(testing);
  }

  clearPaint() {
    for (const key of this.keys.components) {
      if (key.swatchOverride) {
        key.swatchOverride = null;
        key.updateColors();
      }
    }
  }

  setColorway(id) {
    const cw = COLORWAYS[id];
    if (!cw) return;
    this.colorway = cw;
    this.activeSwatch = 'accent';
    this.keys.setColorway(cw);
    this.syncCaseToColorway();
  }

  syncCaseToColorway() {
    const caseSw = (this.colorway.swatches && (this.colorway.swatches.mods || this.colorway.swatches.base)) || null;
    if (caseSw && caseSw.background) this.setCaseColor(caseSw.background);
  }

  setLegendStyle(style) {
    this.legendStyle = style;
    this.keys.setLegendStyle(style);
  }

  setLegends(on) {
    this.legends = on;
    this.keys.setLegends(on);
  }

  screenshot() {
    this.sm.screenshot();
  }

  setSoundOn(on) {
    this.soundOn = on;
    this.vibes.enabled = on;
    if (on) {
      const pack = this.vibes.getPack(this.soundPackId) || this.vibes.packs[0];
      if (pack) {
        this.soundPackId = pack.pack_id;
        this.vibes.loadPack(pack);
      }
    } else {
      this.vibes.unloadAllPacks();
      this.vibes.current_pack = null;
    }
  }

  setSoundPack(packId) {
    this.soundPackId = packId;
    if (this.soundOn) {
      const pack = this.vibes.getPack(packId);
      if (pack) this.vibes.loadPack(pack);
    }
  }

  resetCamera() {
    const c = this.boardCenter();
    this.sm.controls.target.copy(c);
    this.sm.camera.position.set(c.x, c.y + 15, c.z + 15);
  }

  boardCenter() {
    const layout = this.keys.layout;
    this.keys.group.updateWorldMatrix(true, false);
    return this.keys.group.localToWorld(new THREE.Vector3(layout.width / 2, 0, layout.height / 2));
  }
}

new App();