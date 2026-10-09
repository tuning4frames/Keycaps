// keycap aimation
// The itsy bitsy keycap went up the water spout.
// Down came the rain, and washed the keycap out.
// Up came the sun, and dried up all the rain,
// and the itsy bitsy keycap went up the spout again.

import * as THREE from 'three';
import { keyGeometry, keyGeometryISOEnter } from './geometry.js';
import { keyTexture, noiseAOTexture } from './texture.js';
import { MODS } from './config.js';

export const KEYSTATES = {
  INITIAL: 0,   
  PRESSED: 1,   
  MOVING_UP: 2,
  MOVING_DOWN: 3
};

const sharedAO = noiseAOTexture();

export class Key {
  constructor(options) {
    this.options = options || {};
    this.code = this.options.code;
    this.state = KEYSTATES.INITIAL;
    this.colorway = this.options.colorway;
    this.gutter = 0.05;
    this.start_y = -0.05;
    this.dist_pressed = 0.25;
    this.press_velocity = 0.1;
    this.direction = -1;
    this.testing = false;
    this.swatchOverride = null;
    this.setup();
  }

  get h() { return this.options.dimensions.h || 1; }
  get w() { return this.options.dimensions.w || 1; }
  get x() { return this.options.dimensions.x || 0; }
  get y() { return this.options.dimensions.y || 0; }
  get row() { return this.options.dimensions.row || 1; }

  get swatchName() {
    if (this.swatchOverride) return this.swatchOverride;
    const cw = this.colorway;
    const isMod = MODS.includes(this.code);
    if (isMod && cw.swatches.mods) return 'mods';
    return 'base';
  }

  get swatch() {
    const cw = this.colorway;
    const name = this.swatchName;
    const sw = cw.swatches[name];
    const o = cw.override || {};
    const overrideName = o[this.code] || (this.swatchOverride ? null : o[this.code]);
    if (!this.swatchOverride && overrideName && cw.swatches[overrideName]) {
      return cw.swatches[overrideName];
    }
    return sw || cw.swatches.base;
  }

  setup() {
    this.is_iso_enter = this.code === 'KC_ENT' && (this.options.dimensions.h || 1) > 1;
    this.legendText = this.options.legendText !== undefined
      ? this.options.legendText
      : null;
    const geometry = this.is_iso_enter
      ? keyGeometryISOEnter({ row: this.row, w: this.w, h: this.h })
      : keyGeometry({ row: this.row, w: this.w, h: this.h });

    this.topMat = new THREE.MeshStandardMaterial({ map: this.makeTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
    this.sideMat = new THREE.MeshStandardMaterial({
      color: this.swatch.background,
      envMapIntensity: 0,
      roughness: 1,
      metalness: 0,
      aoMap: sharedAO,
      aoMapIntensity: 0.4
    });

    this.cap = new THREE.Mesh(geometry, [this.topMat, this.sideMat]);
    this.cap.name = this.code;
    this.cap.position.y = this.start_y;
    this.cap.position.x = this.x;
    this.cap.position.z = this.y;
    this.options.container.add(this.cap);
  }

  makeTexture() {
    return keyTexture({
      w: this.w,
      h: this.h,
      code: this.code,
      labelOverride: this.legendText,
      legendPos: this.options.legendStyle,
      legends: this.options.legends,
      color: this.swatch.color,
      background: this.swatch.background
    });
  }

  makeActiveTexture() {
    return keyTexture({
      w: this.w,
      h: this.h,
      code: this.code,
      legendPos: this.options.legendStyle,
      legends: this.options.legends,
      color: this.options.activeColor,
      background: this.options.activeBackground
    });
  }

  // life legend edit, redo the texture
  setLegendText(text) {
    this.legendText = text;
    this.refreshLegend();
  }

  // redo texture in place
  refreshLegend() {
    const oldTop = this.topMat;
    this.topMat = new THREE.MeshStandardMaterial({ map: this.makeTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
    if (!this.testingActive) {
      this.cap.material = [this.topMat, this.sideMat];
    } else {
      if (this.activeTopMat) {
        if (this.activeTopMat.map) this.activeTopMat.map.dispose();
        this.activeTopMat.dispose();
      }
      this.activeTopMat = new THREE.MeshStandardMaterial({ map: this.makeActiveTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
      this.cap.material = [this.activeTopMat, this.activeSideMat];
    }
    if (oldTop) {
      if (oldTop.map) oldTop.map.dispose();
      oldTop.dispose();
    }
  }

  setTesting(testing) {
    this.testing = testing;
    if (!testing) {
      this.cap.material = [this.topMat, this.sideMat];
    }
  }

  // redo materials
  updateColors() {
    this.colorway = this.options.colorway;
    const oldTop = this.topMat;
    this.topMat = new THREE.MeshStandardMaterial({ map: this.makeTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
    this.sideMat.color.set(this.swatch.background);
    if (!this.testingActive) {
      this.cap.material = [this.topMat, this.sideMat];
    } else {
      this.activeTopMat = new THREE.MeshStandardMaterial({ map: this.makeActiveTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
      this.activeSideMat = new THREE.MeshStandardMaterial({
        color: this.options.activeBackground,
        envMapIntensity: 0,
        roughness: 1,
        metalness: 0
      });
      this.cap.material = [this.activeTopMat, this.activeSideMat];
    }
    if (oldTop) {
      if (oldTop.map) oldTop.map.dispose();
      oldTop.dispose();
    }
  }

  setState(state) {
    if (this.state === KEYSTATES.MOVING_DOWN && state === KEYSTATES.MOVING_UP) {
      this.queueRelease = true;
    }
    if (
      (this.state === KEYSTATES.INITIAL &&
        (state === KEYSTATES.PRESSED || state === KEYSTATES.MOVING_UP)) ||
      (this.state === KEYSTATES.PRESSED &&
        (state === KEYSTATES.INITIAL || state === KEYSTATES.MOVING_DOWN))
    ) {
      return;
    }
    this.state = state;
  }

  reset() {
    this.cap.position.y = this.start_y;
    this.setState(KEYSTATES.INITIAL);
    this.direction = -1;
  }

  bottomOut() {
    this.cap.position.y = this.start_y - this.dist_pressed;
    this.setState(KEYSTATES.PRESSED);
    this.direction = 1;
    if (this.queueRelease) {
      this.setState(KEYSTATES.MOVING_UP);
      this.queueRelease = false;
    }
  }

  // testingmode, keys get so FUCKING GREEEN
  setTestingActive(active) {
    this.testingActive = active;
    if (active) {
      if (!this.activeTopMat) {
        this.activeTopMat = new THREE.MeshStandardMaterial({ map: this.makeActiveTexture(), roughness: 1, metalness: 0, envMapIntensity: 0 });
        this.activeSideMat = new THREE.MeshStandardMaterial({
          color: this.options.activeBackground,
          envMapIntensity: 0,
          roughness: 1,
          metalness: 0
        });
      }
      this.cap.material = [this.activeTopMat, this.activeSideMat];
    } else {
      this.cap.material = [this.topMat, this.sideMat];
    }
  }

  move(dimensions) {
    this.options.dimensions = dimensions;
    this.cap.position.x = this.x;
    this.cap.position.z = this.y;
  }

  update() {
    if (this.state === KEYSTATES.INITIAL || this.state === KEYSTATES.PRESSED) return;


    if (!Number.isFinite(this.cap.position.y)) {
      this.reset();
      return;
    }

    if (this.testing) {
      this.setTestingActive(true);
    }

    this.cap.position.y = this.cap.position.y + this.press_velocity * this.direction;

    if (this.cap.position.y >= this.start_y) {
      this.reset();
    }
    if (this.cap.position.y <= this.start_y - this.dist_pressed) {
      this.bottomOut();
    }
  }

  destroy() {
    this.options.container.remove(this.cap);

    // dispose per-key stuff only, geometry + sharedAO are shared
    if (this.topMat) {
      if (this.topMat.map) this.topMat.map.dispose();
      this.topMat.dispose();
    }
    if (this.sideMat) {
      if (this.sideMat.map) this.sideMat.map.dispose();
      this.sideMat.dispose();
    }
    if (this.activeTopMat) {
      if (this.activeTopMat.map) this.activeTopMat.map.dispose();
      this.activeTopMat.dispose();
    }
    if (this.activeSideMat) {
      if (this.activeSideMat.map) this.activeSideMat.map.dispose();
      this.activeSideMat.dispose();
    }
  }
}