// key manager, gets 5 stars pays his keycaps well, ~ get payed the least nd ctrl + v or ctrl + c get payed the most they does the most work
// builds the keys, binds typing, does the 6 deg tilt

import * as THREE from 'three';
import { Key, KEYSTATES } from './key.js';
import { getKeyProfile } from './geometry.js';
import { QMK_CODES } from './config.js';
import { BOARDS } from './boards.js';

const toRad = (deg) => (deg * Math.PI) / 180;

export class KeyManager {
  constructor(opts) {
    this.scene = opts.scene;
    this.height = 1.1;
    this.angle = 6;
    this.boardId = opts.boardId || '60';
    this.legendStyle = opts.legendStyle || 'topleft';
    this.legends = opts.legends !== false;
    this.colorway = opts.colorway;
    this.activeColor = opts.activeColor;
    this.activeBackground = opts.activeBackground;
    this.testing = false;
    this.group = new THREE.Object3D();
    this.group.name = 'KEYS';
    this.components = [];
    this.createKeys();
    this.bindPressedEvents();
    this.position();
    this.scene.add(this.group);
  }

  get board() {
    if (this.custom) {
      return { label: 'Custom', layout: this.custom, keymap: this.custom.keymap };
    }
    return BOARDS[this.boardId];
  }

  get layout() {
    return this.board.layout;
  }

  get width() {
    return this.layout.width;
  }
  get depth() {
    return this.layout.height;
  }
  get angleOffset() {
    return Math.sin(toRad(this.angle)) * this.depth;
  }

  // caps sit on the case, so they track the case height (rim + cap gap)
  setCaseHeight(caseHeight) {
    this.height = caseHeight + 0.1;
    this.position();
  }

  position() {
    this.group.rotation.x = toRad(this.angle);
    this.group.position.x = -this.layout.width / 2;
    this.group.position.y = this.angleOffset + this.height;
  }

  createKeys() {
    for (const key of this.components) key.destroy();
    this.components = [];

    const layout = this.layout.layout;
    const keymap = this.board.keymap;
    for (let idx = 0; idx < layout.length; idx++) {
      const code = keymap[idx];
      // no cap
      if (code === 'ENCODER') continue;
      const dimensions = { ...layout[idx] };
      dimensions.row = getKeyProfile(idx, layout, this.layout.height);
      const key = new Key({
        dimensions,
        container: this.group,
        colorway: this.colorway,
        legendStyle: this.legendStyle,
        legends: this.legends,
        code: code || 'KC_NO',
        activeColor: this.activeColor,
        activeBackground: this.activeBackground
      });
      if (this.custom && this.custom.legends && this.custom.legends[idx]) {
        key.legendText = this.custom.legends[idx];
        key.updateColors();
      }
      this.components.push(key);
    }
  }

  setBoard(boardId) {
    if (!BOARDS[boardId] || boardId === this.boardId) return;
    this.boardId = boardId;
    this.custom = null;
    this.createKeys();
    this.position();
  }

  setCustom(parsed) {
    this.boardId = 'custom';
    this.custom = parsed;
    this.createKeys();
    this.position();
  }

  getCustom() {
    return this.custom;
  }

  setActiveColors(activeColor, activeBackground) {
    this.activeColor = activeColor;
    this.activeBackground = activeBackground;
    for (const key of this.components) {
      key.options.activeColor = activeColor;
      key.options.activeBackground = activeBackground;
      key.activeTopMat = null;
      key.activeSideMat = null;
      if (key.testingActive) key.setTestingActive(true);
    }
  }

  bindPressedEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      const code = QMK_CODES[e.code];
      if (!code) return;
      const key = this.getKey(code);
      if (!key) return;
      key.setState(KEYSTATES.MOVING_DOWN);
      // leave browser shortcuts like F5 refresh alone
      const browserCombo = e.ctrlKey || e.metaKey || e.altKey;
      const browserKey = e.code === 'F5' || e.code === 'F11' || e.code === 'F12';
      if (!browserCombo && !browserKey) e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
      const code = QMK_CODES[e.code];
      if (!code) return;
      const key = this.getKey(code);
      if (!key) return;
      key.setState(KEYSTATES.MOVING_UP);
    });
  }

  getKey(code) {
    return this.components.find((k) => k.code === code);
  }

  setTesting(testing) {
    this.testing = testing;
    for (const key of this.components) {
      key.setTesting(testing);
      if (!testing) key.setTestingActive(false);
    }
  }

  setColorway(colorway) {
    this.colorway = colorway;
    for (const key of this.components) {
      key.options.colorway = colorway;
      key.swatchOverride = null;
      key.updateColors();
    }
  }

  setLegendStyle(style) {
    this.legendStyle = style;
    for (const key of this.components) {
      key.options.legendStyle = style;
      key.refreshLegend();
    }
  }

  setLegends(on) {
    this.legends = on;
    for (const key of this.components) {
      key.options.legends = on;
      key.refreshLegend();
    }
  }

  update() {
    for (const key of this.components) {
      key.update();
    }
  }
}