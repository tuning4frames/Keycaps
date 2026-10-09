// no ground. it just floats. like my gpa T-T

import * as THREE from 'three';

function shiftHex(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = /* glsl */ `
uniform vec3 uTopColor;
uniform vec3 uMidColor;
uniform vec3 uBottomColor;
uniform vec3 uHaloColor;
uniform vec3 uHaloDir;      // sky direction of the glow (behind the board)
varying vec3 vDir;
void main() {
  float h = vDir.y; // -1 (down) .. +1 (up)

  // gradient
  vec3 c = mix(uMidColor, uTopColor, smoothstep(0.0, 0.85, h));
  c = mix(uBottomColor, c, smoothstep(-0.7, 0.05, h));

  // halo
  float halo = pow(max(dot(vDir, uHaloDir), 0.0), 5.0);
  c = mix(c, uHaloColor, halo * 0.4);

  // dither. banding is DEATH
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * (2.0 / 255.0);

  gl_FragColor = vec4(c, 1.0);
}
`;

export class Room {
  constructor(options) {
    this.options = options || {};
    this.baseColor = this.options.color || '#3a3a41';
    this.setup();
  }

  setup() {
    this.uniforms = {
      uTopColor: { value: new THREE.Color(shiftHex(this.baseColor, 16)) },
      uMidColor: { value: new THREE.Color(this.baseColor) },
      uBottomColor: { value: new THREE.Color(shiftHex(this.baseColor, -34)) },
      uHaloColor: { value: new THREE.Color(shiftHex(this.baseColor, 24)) },
      uHaloDir: { value: new THREE.Vector3(0, -0.7, -0.7).normalize() }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });

    this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 24), this.material);
    this.sky.renderOrder = -1;

    this.options.scene.add(this.sky);
  }


  updateHalo(camera) {
    this.uniforms.uHaloDir.value.copy(camera.position).multiplyScalar(-1).normalize();
  }

  updateColor(color) {
    this.baseColor = color;
    this.uniforms.uTopColor.value.set(shiftHex(color, 16));
    this.uniforms.uMidColor.value.set(color);
    this.uniforms.uBottomColor.value.set(shiftHex(color, -34));
    this.uniforms.uHaloColor.value.set(shiftHex(color, 24));
  }
}