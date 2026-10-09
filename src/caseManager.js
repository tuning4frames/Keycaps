// case
// extruded rounded rect
// and knobs for the keyboards that have one

import * as THREE from 'three';
import { noiseAOTexture } from './texture.js';

const toRad = (deg) => (deg * Math.PI) / 180;

const MATERIAL_OPTIONS = {
  matte: { metalness: 0, roughness: 1, envMapIntensity: 0 },
  glossy: { metalness: 0.55, roughness: 0.18, envMapIntensity: 0.45 }
};

// fixed height so the case doesnt move when bezel changes
const POSITION_BEZEL = 0.5;

// hole polygon with rounded corners
const HOLE_RADIUS_RATIO = 0.3;

export function roundedHolePath(poly, r, bezel) {
  const path = new THREE.Path();
  const pts = poly.map((p) => ({ x: (bezel || 0) + p.x, y: (bezel || 0) + p.y }));
  const n = pts.length;
  if (n < 3) return path;
  if (!(r > 0.001)) {
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n; i++) path.lineTo(pts[i].x, pts[i].y);
    path.closePath();
    return path;
  }
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const l1 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const l2 = Math.hypot(next.x - cur.x, next.y - cur.y);
    if (!(l1 > 1e-9) || !(l2 > 1e-9)) continue;
    const d = Math.min(r, l1 / 2, l2 / 2);
    const ax = cur.x + ((prev.x - cur.x) * d) / l1;
    const ay = cur.y + ((prev.y - cur.y) * d) / l1;
    const bx = cur.x + ((next.x - cur.x) * d) / l2;
    const by = cur.y + ((next.y - cur.y) * d) / l2;
    if (i === 0) path.moveTo(ax, ay);
    else path.lineTo(ax, ay);
    path.quadraticCurveTo(cur.x, cur.y, bx, by);
  }
  path.closePath();
  return path;
}

export class CaseManager {
  constructor(opts) {
    this.scene = opts.scene;
    this.envMap = opts.envMap || null;
    this.layout = opts.layout;
    this.boardId = opts.boardId || null;
    this.color = opts.color || '#eeeeee';
    this.finish = opts.finish || 'matte';
    this.angle = 6;
    this.bezel = opts.bezel != null ? opts.bezel : 0.5;
    this.cornerRadius = opts.cornerRadius != null ? opts.cornerRadius : 0.5;
    this.height = opts.height != null ? opts.height : 1;
    this.group = new THREE.Group();
    this.group.name = 'CASE';
    this.createPlate();
    this.createCase();
    this.createKnob();
    this.position();
    this.scene.add(this.group);
  }

  get width() {
    return this.layout.width + this.bezel * 2;
  }
  get depth() {
    return this.layout.height + this.bezel * 2;
  }
  get angleOffset() {
    return Math.sin(toRad(this.angle)) * (this.layout.height + POSITION_BEZEL * 2);
  }

  position() {
    this.group.rotation.x = toRad(this.angle);
    this.group.position.x = -this.layout.width / 2;
    this.group.position.y = this.angleOffset + this.height;
  }

  createPlate() {
    // plate under the caps, so it isnt void
    // COULD BE USED FOR RGB LIGHTS
    const geometry = new THREE.BoxGeometry(
      this.width - this.bezel * 2,
      0.1,
      this.depth - this.bezel * 2
    );
    this.plateMat = new THREE.MeshPhysicalMaterial({
      color: this.color,
      metalness: MATERIAL_OPTIONS[this.finish].metalness,
      roughness: MATERIAL_OPTIONS[this.finish].roughness,
      envMap: this.finish === 'glossy' ? this.envMap || null : null,
      envMapIntensity: MATERIAL_OPTIONS[this.finish].envMapIntensity
    });
    this.plate = new THREE.Mesh(geometry, this.plateMat);
    // stay inside the case: bottom is at -(height + bevel), so clamp for shallow builds
    const plateY = Math.max(-0.4, -(this.height * 0.5));
    this.plate.position.set(
      this.width / 2 - this.bezel,
      plateY,
      this.depth / 2 - this.bezel
    );
    this.group.add(this.plate);
  }

  // Cutouts per layout
  computeKeyHoles() {
    const G = 0.05;
    const sq = (x, y, w, h, g = G) => ([
      { x: x - g, y: y - g },
      { x: x + w + g, y: y - g },
      { x: x + w + g, y: y + h + g },
      { x: x - g, y: y + h + g },
    ]);
    const fromPts = (sx, sy, pts) => {
      const poly = [{ x: sx, y: sy }];
      for (const p of pts) {
        const l = poly[poly.length - 1];
        poly.push({ x: l.x + p.x, y: l.y + p.y });
      }
      const f = poly[0];
      const l = poly[poly.length - 1];
      if (Math.abs(f.x - l.x) < 1e-9 && Math.abs(f.y - l.y) < 1e-9) poly.pop();
      return poly;
    };

    const arrows = (sx, sy) => fromPts(sx - G, sy + G, [
      { x: 0, y: -1 - G * 2 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 1 + G * 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 + G * 2 },
      { x: -3 - G * 2, y: 0 },
    ]);

    const id = this.boardId;
    if (id === '100') {
      return [
        sq(0, 0, 1, 1),          // esc
        sq(2, 0, 4, 1),          // F1-F4
        sq(6.5, 0, 4, 1),        // F5-F8
        sq(11, 0, 4, 1),         // F9-F12
        sq(15.25, 0, 3, 1),      // PScr/SLck/Paus
        sq(15.25, 1.25, 3, 2),   // nav
        arrows(15.25, 6.2),      // arrows T
        sq(0, 1.25, 15, 5),      // main
        sq(18.5, 1.25, 4, 5),    // numpad
      ];
    }
    if (id === '80') {
      return [
        sq(0, 0, 1, 1),
        sq(2, 0, 4, 1),
        sq(6.5, 0, 4, 1),
        sq(11, 0, 4, 1),
        sq(15.25, 1.25, 3, 2),
        arrows(15.25, 6.2),
        sq(0, 1.25, 15, 5),
      ];
    }
    if (id === '95') {
      return [
        sq(0, 0, 1, 1),          // esc
        sq(1.25, 0, 4, 1),       // F1-F4
        sq(5.5, 0, 4, 1),        // F5-F8
        sq(9.75, 0, 4, 1),       // F9-F12
        arrows(13.25, 6.4),      // arrows T
        fromPts(15.5, 1.25, [    // numpad block with arrow notch
          { x: 4, y: 0 },
          { x: 0, y: 5 },
          { x: -3, y: 0 },
          { x: 0, y: -1 },
          { x: -1, y: 0 },
          { x: 0, y: -4 },
        ]),
        fromPts(0, 1.25, [       // main block with arrow steps
          { x: 15, y: 0 },
          { x: 0, y: 3 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: -13, y: 0 },
          { x: 0, y: -5 },
        ]),
      ];
    }
    if (id === '60hhkb') {
      return [fromPts(-G, -G, [
        { x: 15 + G * 2, y: 0 },
        { x: 0, y: 4 + G * 2 },
        { x: -1.75, y: 0 },
        { x: 0, y: 1 },
        { x: -12 - G * 2, y: 0 },
        { x: 0, y: -1 },
        { x: -1.25, y: 0 },
        { x: 0, y: -4 - G * 2 },
      ])];
    }
    if (id === '60wkl') {
      return [fromPts(0, 0, [
        { x: 15, y: 0 },
        { x: 0, y: 5 },
        { x: -1.25, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: -10.5, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: -1.25, y: 0 },
        { x: 0, y: -5 },
      ])];
    }
    if (id === 'numpad') {
      return [sq(0, 0, 4, 1), sq(0, 1.25, 4, 5)];
    }
    if (id === '75knob' || id === 'custom') {
      // knob board + custom = trace the outline

      return this.computeOutlineHoles();
    }
    // everything else is just one massive hole

    return [sq(0, 0, this.layout.width, this.layout.height)];
  }

  // trace around the keys to make the hole shape for it

  computeOutlineHoles() {
    const Q = 0.05;
    const G = 0.05;
    const q = (v) => Math.round(v / Q);
    const gw = q(this.layout.width);
    const gh = q(this.layout.height);
    const grid = new Uint8Array(gw * gh);

    for (const k of this.layout.layout) {
      if (k.encoder) continue;
      const x0 = Math.max(0, q(k.x - G));
      const x1 = Math.min(gw, q(k.x + (k.w || 1) + G));
      const y0 = Math.max(0, q(k.y - G));
      const y1 = Math.min(gh, q(k.y + (k.h || 1) + G));
      for (let gy = y0; gy < y1 && gy < gh; gy++) {
        for (let gx = x0; gx < x1 && gx < gw; gx++) {
          grid[gy * gw + gx] = 1;
        }
      }
    }

    // group touching key cells
    const comp = new Int32Array(gw * gh).fill(-1);
    let ncomp = 0;
    const stack = [];
    for (let i = 0; i < gw * gh; i++) {
      if (!grid[i] || comp[i] !== -1) continue;
      comp[i] = ncomp;
      stack.push(i);
      while (stack.length) {
        const cur = stack.pop();
        const cx = cur % gw;
        const cy = (cur / gw) | 0;
        if (cx > 0) {
          const n = cur - 1;
          if (grid[n] && comp[n] === -1) { comp[n] = ncomp; stack.push(n); }
        }
        if (cx + 1 < gw) {
          const n = cur + 1;
          if (grid[n] && comp[n] === -1) { comp[n] = ncomp; stack.push(n); }
        }
        if (cy > 0) {
          const n = cur - gw;
          if (grid[n] && comp[n] === -1) { comp[n] = ncomp; stack.push(n); }
        }
        if (cy + 1 < gh) {
          const n = cur + gw;
          if (grid[n] && comp[n] === -1) { comp[n] = ncomp; stack.push(n); }
        }
      }
      ncomp++;
    }

    // edgefinder 
    const holes = [];
    const stride = gw + 1;
    for (let c = 0; c < ncomp; c++) {
      const edges = [];
      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          if (comp[gy * gw + gx] !== c) continue;
          // top edge
          if (gy + 1 >= gh || comp[(gy + 1) * gw + gx] !== c) {
            edges.push({ x0: gx + 1, y0: gy + 1, x1: gx, y1: gy + 1 });
          }
          // bottom edge
          if (gy === 0 || comp[(gy - 1) * gw + gx] !== c) {
            edges.push({ x0: gx, y0: gy, x1: gx + 1, y1: gy });
          }
          // left edge
          if (gx === 0 || comp[gy * gw + gx - 1] !== c) {
            edges.push({ x0: gx, y0: gy + 1, x1: gx, y1: gy });
          }
          // right edge
          if (gx + 1 >= gw || comp[gy * gw + gx + 1] !== c) {
            edges.push({ x0: gx + 1, y0: gy, x1: gx + 1, y1: gy + 1 });
          }
        }
      }
      if (!edges.length) continue;

      const out = new Map();
      edges.forEach((e, i) => {
        const k = e.y0 * stride + e.x0;
        let arr = out.get(k);
        if (!arr) { arr = []; out.set(k, arr); }
        arr.push(i);
      });
      const used = new Uint8Array(edges.length);
      for (let i = 0; i < edges.length; i++) {
        if (used[i]) continue;
        const sx = edges[i].x0;
        const sy = edges[i].y0;
        const loop = [];
        let cur = i;
        for (;;) {
          used[cur] = 1;
          const e = edges[cur];
          loop.push(e);
          const nk = e.y1 * stride + e.x1;
          const arr = out.get(nk);
          let nxt = -1;
          if (arr) {
            while (arr.length) {
              const cand = arr.pop();
              if (!used[cand]) { nxt = cand; break; }
            }
          }
          if (nxt < 0) break;
          cur = nxt;
          if (loop.length > edges.length + 5) break;
        }
        const last = loop[loop.length - 1];
        if (!last || last.x1 !== sx || last.y1 !== sy || loop.length < 3) continue;

        const pts = loop.map((e) => [e.x0, e.y0]);
        const simp = [];
        const n = pts.length;
        for (let k = 0; k < n; k++) {
          const p = pts[(k - 1 + n) % n];
          const qpt = pts[k];
          const r = pts[(k + 1) % n];
          const d1x = qpt[0] - p[0];
          const d1y = qpt[1] - p[1];
          const d2x = r[0] - qpt[0];
          const d2y = r[1] - qpt[1];
          if (d1x * d2y === d1y * d2x && d1x * d2x + d1y * d2y > 0) continue;
          simp.push(qpt);
        }
        if (simp.length < 3) continue;
        let area2 = 0;
        for (let k = 0; k < simp.length; k++) {
          const a = simp[k];
          const b = simp[(k + 1) % simp.length];
          area2 += a[0] * b[1] - b[0] * a[1];
        }
        if (area2 <= 0) continue;
        holes.push(simp.map(([ix, iy]) => ({ x: ix * Q, y: iy * Q })));
      }
    }
    return holes;
  }

  // case outline
  buildOutline() {
    const width = this.width;
    const depth = this.depth;
    const r = Math.max(0, Math.min(this.cornerRadius, width / 2, depth / 2));
    const shape = new THREE.Shape();
    if (r <= 0.001) {
      shape.moveTo(0, 0);
      shape.lineTo(width, 0);
      shape.lineTo(width, depth);
      shape.lineTo(0, depth);
      shape.lineTo(0, 0);
      return shape;
    }
    shape.moveTo(0, r);
    shape.quadraticCurveTo(0, 0, r, 0);
    shape.lineTo(width - r, 0);
    shape.quadraticCurveTo(width, 0, width, r);
    shape.lineTo(width, depth - r);
    shape.quadraticCurveTo(width, depth, width - r, depth);
    shape.lineTo(r, depth);
    shape.quadraticCurveTo(0, depth, 0, depth - r);
    shape.lineTo(0, r);
    return shape;
  }

  destroy() {
    // don't touch the scene here, main.js already removes the group
    if (this.caseMesh) {
      if (this.bottomLid) this.bottomLid.geometry.dispose();
      this.caseMesh.geometry.dispose();
      const mats = new Set();
      if (this.bottomLid) mats.add(this.bottomLid.material);
      for (const m of this.caseMesh.material) mats.add(m);
      for (const m of mats) m.dispose();
    }
    if (this.plate) {
      this.plate.geometry.dispose();
      this.plate.material.dispose();
    }
    if (this.knob) {
      this.knob.geometry.dispose();
      this.knob.material.dispose();
    }
    if (this.knobRing) {
      this.knobRing.geometry.dispose();
      this.knobRing.material.dispose();
    }
  }

  // rebuild geometry in place
  rebuildCase() {
    if (this.caseMesh) {
      this.group.remove(this.caseMesh);
      this.caseMesh.geometry.dispose();
      this.bottomLid.geometry.dispose();
      this.caseMesh = null;
      this.bottomLid = null;
    }
    if (this.plate) {
      this.group.remove(this.plate);
      this.plate.geometry.dispose();
      this.plate = null;
    }
    this.createPlate();
    this.createCase();
    this.position();
  }

  setBezel(v) {
    // rounded corners need a slightly bigger bezel

    const min = this.cornerRadius > 0.001 ? 0.15 : 0.1;
    this.bezel = Math.max(min, Math.min(3, v));
    this.rebuildCase();
  }

  setCornerRadius(v) {
    this.cornerRadius = Math.max(0, v);

    if (this.cornerRadius > 0.001 && this.bezel < 0.15) this.bezel = 0.15;
    this.rebuildCase();
  }

  setHeight(v) {
    this.height = Math.max(0.75, Math.min(4, v));
    this.rebuildCase();
  }

  // THE MIGHTY CASE CREATOR
  createCase() {
    const bevel = 0.05;

    const shape = this.buildOutline();

    const polys = this.computeKeyHoles();
    const keyEntries = this.layout.layout.filter((k) => !k.encoder); // knob entries skip the hole
    const holeR = this.cornerRadius * HOLE_RADIUS_RATIO;
    for (const poly of polys) {
      shape.holes.push(roundedHolePath(poly, holeR, this.bezel));
    }

    const extrudeOptions = {
      depth: this.height,
      steps: 1,
      bevelSegments: 1,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions);

    const BOTTOM_BRIGHTEN = 1;
    const pos = geometry.attributes.position;
    const lidGroup = geometry.groups.find((g) => g.materialIndex === 0);
    const wallGroup = geometry.groups.find((g) => g.materialIndex === 1);
    const faceCount = lidGroup.count / 3;
    let splitAt = -1;
    let prevBottom = null;
    let cleanSplit = true;
    for (let f = 0; f < faceCount; f++) {
      const vi = lidGroup.start + f * 3;
      const zAvg = (pos.getZ(vi) + pos.getZ(vi + 1) + pos.getZ(vi + 2)) / 3;
      const isBottom = zAvg >= this.height / 2;
      if (prevBottom === null) {
        prevBottom = isBottom;
      } else if (isBottom !== prevBottom) {
        if (splitAt === -1) {
          splitAt = vi;
          prevBottom = isBottom;
        } else {
          cleanSplit = false;
        }
      }
    }

    geometry.clearGroups();
    if (cleanSplit && splitAt > lidGroup.start) {
      geometry.addGroup(lidGroup.start, splitAt - lidGroup.start, 0); // world top lid
      geometry.addGroup(splitAt, lidGroup.start + lidGroup.count - splitAt, 1); // world botom lid
    } else {
      geometry.addGroup(lidGroup.start, lidGroup.count, 0); // group lids
    }
    geometry.addGroup(wallGroup.start, wallGroup.count, 2); // walls

    const options = { ...MATERIAL_OPTIONS[this.finish] };
    if (this.finish === 'glossy' && this.envMap) options.envMap = this.envMap;
    const materialTop = new THREE.MeshPhysicalMaterial({
      color: this.color,
      ...options
    });
    const materialBottom = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.color).multiplyScalar(BOTTOM_BRIGHTEN),
      ...options
    });
    const materialWalls = new THREE.MeshPhysicalMaterial({
      color: this.color,
      aoMap: noiseAOTexture(),
      aoMapIntensity: 0.6,
      ...options
    });

    this.bottomBrighten = BOTTOM_BRIGHTEN;
    this.caseMesh = new THREE.Mesh(geometry, [materialTop, materialBottom, materialWalls]);
    this.caseMesh.name = 'CASE';
    this.caseMesh.rotation.x = Math.PI / 2;
    this.caseMesh.position.set(-this.bezel, 0, -this.bezel);
    this.group.add(this.caseMesh);

    const lidShape = shape.clone();
    lidShape.holes = [];
    const lidGeo = new THREE.ShapeGeometry(lidShape);
    lidGeo.translate(0, 0, this.height + bevel + 0.002);
    this.bottomLid = new THREE.Mesh(lidGeo, materialBottom);
    this.caseMesh.add(this.bottomLid);
  }

  // knob for the 75%  keyboard
  createKnob() {
    const encEntry = this.layout.layout.find((k) => k.encoder);
    if (!encEntry) return;
    const enc = { x: encEntry.x, y: encEntry.y, w: encEntry.w || 1, h: encEntry.h || 1, r: 0.45 };

    const radius = enc.r || 0.45;
    const knobHeight = 0.5;
    const geo = new THREE.CylinderGeometry(radius, radius, knobHeight, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.color).multiplyScalar(0.92),
      metalness: 0.85,
      roughness: 0.3,
      envMap: this.envMap || null,
      envMapIntensity: 0.5
    });
    this.knob = new THREE.Mesh(geo, mat);
    this.knob.castShadow = true;

    const ringGeo = new THREE.TorusGeometry(radius, 0.03, 8, 32);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.color).multiplyScalar(0.75),
      metalness: 0.9,
      roughness: 0.35,
      envMap: this.envMap || null,
      envMapIntensity: 0.5
    });
    this.knobRing = new THREE.Mesh(ringGeo, ringMat);
    this.knobRing.rotation.x = Math.PI / 2;
    this.knobRing.position.y = knobHeight / 2 - 0.05;
    this.knob.add(this.knobRing);

    const cx = enc.x + (enc.w || 1) / 2;
    const cz = enc.y + (enc.h || 1) / 2;
    this.knob.position.set(cx, knobHeight / 2 - 0.25, cz);
    this.group.add(this.knob);

    this.knobTicks = 0;
  }

  spinKnob(deltaY) {
    if (!this.knob) return false;
    const dir = deltaY > 0 ? 1 : -1;
    this.knob.rotation.y += dir * (Math.PI / 12);
    return true;
  }

  updateCaseMaterial(color, finish) {
    this.color = color || this.color;
    this.finish = finish || this.finish;
    const options = { ...MATERIAL_OPTIONS[this.finish] };
    if (this.finish === 'glossy' && this.envMap) options.envMap = this.envMap;
    const bottomColor = new THREE.Color(this.color);
    // UPDATE THE MATERIALS LIFE, SO USER SEE'S THE COLOR OF THE CASE PROPERELY
    this.caseMesh.material[0].color.set(this.color);
    this.caseMesh.material[0].metalness = options.metalness;
    this.caseMesh.material[0].roughness = options.roughness;
    this.caseMesh.material[0].envMapIntensity = options.envMapIntensity;
    this.caseMesh.material[1].color.copy(bottomColor);
    this.caseMesh.material[1].metalness = options.metalness;
    this.caseMesh.material[1].roughness = options.roughness;
    this.caseMesh.material[1].envMapIntensity = options.envMapIntensity;
    this.caseMesh.material[2].color.set(this.color);
    this.caseMesh.material[2].metalness = options.metalness;
    this.caseMesh.material[2].roughness = options.roughness;
    this.caseMesh.material[2].envMapIntensity = options.envMapIntensity;
    this.plateMat.color.set(this.color);
    this.plateMat.metalness = options.metalness;
    this.plateMat.roughness = options.roughness;
    this.plateMat.envMap = this.finish === 'glossy' ? this.envMap || null : null;
    this.plateMat.envMapIntensity = options.envMapIntensity;
    if (this.knob) {
      this.knob.material.color.set(new THREE.Color(this.color).multiplyScalar(0.92));
      this.knob.material.envMap = this.envMap || null;
      this.knobRing.material.color.set(new THREE.Color(this.color).multiplyScalar(0.75));
    }
  }
}