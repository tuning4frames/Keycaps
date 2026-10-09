// used to be the old THREE.Geometry, that thing is dead
// MEGA DED, deader than death himself T-T

// hours_spent_rewritting = 2
// hours_i_woudve_saved = 5

import * as THREE from 'three';

const GUTTER = 0.05;
const c = 0.05;
const i = 0.15;
const it = 0.05;
const H = 0.5;

const computed_geometries = {};

function lowerCapFace(verts, dist, distFront, offset) {
  distFront = distFront || dist;
  offset = offset || 0;
  verts[4].y -= dist;
  verts[5].y -= dist + offset;
  verts[6].y -= dist + offset;
  verts[7].y -= dist;
  verts[8].y -= distFront;
  verts[9].y -= distFront - offset;
  verts[10].y -= distFront - offset;
  verts[11].y -= distFront;
}

function rotateXVerts(verts, a) {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  for (const v of verts) {
    const y = v.y * cos - v.z * sin;
    const z = v.y * sin + v.z * cos;
    v.y = y;
    v.z = z;
  }
}

function translateVerts(verts, x, y, z) {
  for (const v of verts) {
    v.x += x;
    v.y += y;
    v.z += z;
  }
}

// face + uv tables
const FACES = [
  [4, 7, 5], [7, 6, 5],       // top top (in dutch this means well done well done)
  [9, 11, 10], [9, 8, 11],    // top bottom
  [4, 11, 7], [8, 7, 11],     // top center
  [0, 4, 5], [1, 6, 7],       // corner faces (these thingies <: >:) very corner faces)
  [2, 8, 9], [3, 10, 11],
  [0, 5, 1], [1, 5, 6],       // back side
  [2, 7, 8], [2, 1, 7],       // right side
  [0, 3, 11], [0, 11, 4],     // left side
  [3, 2, 9], [3, 9, 10]       // front side
];

const UVS = [
  [[0, 1 - c], [1, 1 - c], [c, 1]],
  [[1, 1 - c], [1 - c, 1], [c, 1]],
  [[1 - c, 0], [0, c], [c, 0]],
  [[1 - c, 0], [1, c], [0, c]],
  [[0, 1 - c], [0, c], [1, 1 - c]],
  [[1, c], [1, 1 - c], [0, c]],
  [[0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0]],
  [[1, 0], [1, 1], [0, 0]],
  [[0, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [1, 1], [0, 1]]
];

function isTopFace(idx) {
  return idx < 6;
}

function buildBufferGeometry(verts) {
  const topPos = [];
  const topUv = [];
  const sidePos = [];
  const sideUv = [];

  FACES.forEach((face, idx) => {
    const P = isTopFace(idx) ? topPos : sidePos;
    const U = isTopFace(idx) ? topUv : sideUv;
    for (const vi of face) {
      const v = verts[vi];
      P.push(v.x, v.y, v.z);
    }
    const uv = UVS[idx];
    U.push(uv[0][0], uv[0][1], uv[1][0], uv[1][1], uv[2][0], uv[2][1]);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(topPos.concat(sidePos), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(topUv.concat(sideUv), 2));
  geo.addGroup(0, topPos.length / 3, 0);
  geo.addGroup(topPos.length / 3, sidePos.length / 3, 1);
  geo.computeVertexNormals(); 
  return geo;
}


export function keyGeometry(opts) {
  const h = opts.h || 1;
  const key = 'k' + (opts.w || 1) + '_' + h + '_' + (opts.row || 0);
  if (computed_geometries[key]) return computed_geometries[key].clone();

  const w = (opts.w || 1) - GUTTER;
  const d = h - GUTTER;

  const verts = [
    { x: 0, y: 0, z: 0 },             // 0
    { x: w, y: 0, z: 0 },             // 1
    { x: w, y: 0, z: d },             // 2
    { x: 0, y: 0, z: d },             // 3
    { x: i, y: H, z: it + c },        // 4
    { x: i + c, y: H, z: it },        // 5
    { x: w - i - c, y: H, z: it },    // 6
    { x: w - i, y: H, z: it + c },    // 7
    { x: w - i, y: H, z: d - i - c }, // 8
    { x: w - i - c, y: H, z: d - i }, // 9
    { x: i + c, y: H, z: d - i },     // 10
    { x: i, y: H, z: d - i - c }      // 11
  ];

  // tilt the tops per row, THIS is the sculpt
  if (opts.h === 2 && opts.w < 1.25) {
    lowerCapFace(verts, 0.1);
  }
  if (opts.row === 1) {
    lowerCapFace(verts, -0.05);
  }
  if (opts.row === 2 && opts.h !== 2) {
    lowerCapFace(verts, 0.1);
  }
  if (opts.row === 3 && opts.h !== 2) {
    lowerCapFace(verts, 0.1);
    rotateXVerts(verts, -0.1);
    translateVerts(verts, 0, -0.1, 0);
  }
  if (opts.row === 4 && opts.h !== 2) {
    rotateXVerts(verts, -0.2);
    translateVerts(verts, 0, -0.19, 0);
  }

  const geo = buildBufferGeometry(verts);
  computed_geometries[key] = geo;
  return geo.clone();
}

// iso (its you and me) enter geometry
export function keyGeometryISOEnter(opts) {
  const key = 'isoent';
  if (computed_geometries[key]) return computed_geometries[key].clone();

  const w = (opts.w || 1) - GUTTER;
  const d = (opts.h || 2) - GUTTER;
  const h = 0.4;
  const o = 0.25;

  const verts = [
    { x: -o, y: 0, z: 0 },            // 0
    { x: w, y: 0, z: 0 },             // 1
    { x: w, y: 0, z: d },             // 2
    { x: 0, y: 0, z: d },             // 3
    { x: 0, y: 0, z: 1 },             // 4
    { x: -o, y: 0, z: 1 },            // 5
    { x: i - o, y: h, z: it + c },    // 6
    { x: i + c - o, y: h, z: it },    // 7
    { x: w - i - c, y: h, z: it },    // 8
    { x: w - i, y: h, z: it + c },    // 9
    { x: w - i, y: h, z: d - i - c }, // 10
    { x: w - i - c, y: h, z: d - i }, // 11
    { x: i + c, y: h, z: d - i },     // 12
    { x: i, y: h, z: d - i - c },     // 13
    { x: i, y: h, z: 1 - i },         // 14 
    { x: i - c, y: h, z: 1 - i },     // 15
    { x: i + c - o, y: h, z: 1 - i }, // 16
    { x: i - o, y: h, z: 1 - i - c }  // 17
  ];

  const FACES = [
    [6, 9, 7], [7, 9, 8],           
    [6, 17, 15], [17, 16, 15],
    [6, 15, 9], [15, 14, 9],
    [14, 10, 9], [14, 13, 10],
    [13, 11, 10], [13, 12, 11],
    [0, 6, 7], [1, 8, 9], [2, 10, 11], [3, 12, 13], [4, 14, 15], [5, 16, 17],
    [0, 7, 8], [0, 8, 1],
    [9, 10, 2], [9, 2, 1],
    [3, 2, 11], [3, 11, 12],
    [4, 3, 13], [4, 13, 14],
    [5, 4, 15], [5, 15, 16],
    [0, 5, 17], [0, 17, 6]
  ];

  const uxo = 0.2;
  const uyo = 0.35;
  const UVS = [
    [[0, 1 - c], [1, 1 - c], [c, 1]],
    [[c, 1], [1, 1 - c], [1 - c, 1]],
    [[0, 1 - c], [0, uyo + c], [uxo - c, uyo]],
    [[0, uyo + c], [c, uyo], [uxo - c, uyo]],
    [[0, 1 - c], [uxo - c, uyo], [1, 1 - c]],
    [[uxo - c, uyo], [uxo, uyo], [1, 1 - c]],
    [[uxo, uyo], [1, c], [1, 1 - c]],
    [[uxo, uyo], [uxo, c], [1, c]],
    [[uxo, c], [1 - c, 0], [1, c]],
    [[uxo, c], [uxo + c, 0], [1 - c, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[1, 0], [1, 1], [0, 1]],
    [[1, 0], [0, 1], [0, 0]],
    [[1, 1], [0, 1], [0, 0]],
    [[1, 1], [0, 0], [1, 0]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [1, 1], [0, 1]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [1, 1], [0, 1]],
    [[0, 0], [1, 1], [0, 1]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [1, 1], [0, 1]]
  ];

  const geo = buildIsoBufferGeometry(verts, FACES, UVS);
  computed_geometries[key] = geo;
  return geo.clone();
}

function buildIsoBufferGeometry(verts, FACES, UVS) {
  const topPos = [];
  const topUv = [];
  const sidePos = [];
  const sideUv = [];

  FACES.forEach((face, idx) => {
    const P = idx < 10 ? topPos : sidePos;
    const U = idx < 10 ? topUv : sideUv;
    for (const vi of face) {
      const v = verts[vi];
      P.push(v.x, v.y, v.z);
    }
    const uv = UVS[idx];
    U.push(uv[0][0], uv[0][1], uv[1][0], uv[1][1], uv[2][0], uv[2][1]);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(topPos.concat(sidePos), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(topUv.concat(sideUv), 2));
  geo.addGroup(0, topPos.length / 3, 0);
  geo.addGroup(topPos.length / 3, sidePos.length / 3, 1);
  geo.computeVertexNormals();
  return geo;
}

// r1,r1,r2,r3,r4,r4
export function getKeyProfile(index, layout, total_rows) {
  total_rows = total_rows || 5;
  let row = Math.floor(layout[index].y);
  if (total_rows < 5) {
    row++;
  } else if (total_rows > 5) {
    row = row === 0 ? 1 : row;
    row = row > 4 ? 4 : row;
  } else {
    row++;
    row = row > 4 ? 4 : row;
  }
  return row;
}