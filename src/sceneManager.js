// scene manager
// renderer camera lights render loop

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default class SceneManager {
  constructor(options) {
    this.options = options || {};
    this.el = options.el || document.body;
    this.tickCallbacks = [];
    this.paintMode = false;
    this.boundTick = this.tick.bind(this);
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.display = 'block';
    this.el.appendChild(this.renderer.domElement);

    this.setupEnvironment();
    this.setupCamera();
    this.setupControls();
    this.setupLights();
    this.resize();

    // mouse + raycaster for hover/paint
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.raycaster = new THREE.Raycaster();

    window.addEventListener('resize', () => this.resize(), false);
    this.el.addEventListener('mousemove', (e) => this.move(e), false);
  }

  setupEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.6;
    this.envMap = this.scene.environment;
  }

  get w() {
    return this.el.offsetWidth || window.innerWidth;
  }
  get h() {
    return this.el.offsetHeight || window.innerHeight;
  }

  resize() {
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.w, this.h);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 1, 1000);
    this.camera.position.y = 15;
    this.camera.position.z = 15;
    this.camera.position.x = 0;
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI - 0.001;
    this.controls.minPolarAngle = 0.001;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.maxDistance = 40;
    this.controls.target = new THREE.Vector3(0, 0, 0);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight('#ffffff', 0.45);
    this.scene.add(ambient);

    const primaryLight = new THREE.DirectionalLight('#ffffff', 0.7);
    primaryLight.position.set(4, 14, 6);
    primaryLight.target.position.set(0, 0, 0);
    primaryLight.target.updateMatrixWorld();
    this.scene.add(primaryLight, primaryLight.target);

    const shadowLight = new THREE.DirectionalLight('#ffffff', 0.0);
    shadowLight.position.set(-4, 3, -10);
    shadowLight.target.position.set(0, 0, 0);
    shadowLight.target.updateMatrixWorld();
    this.scene.add(shadowLight, shadowLight.target);
  }

  move(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  pickKey(keyMeshes) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(keyMeshes, false);
    if (intersects.length) return intersects[0].object;
    return null;
  }

  screenshot() {
    this.render();
    const data = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'keycaps.png';
    link.href = data;
    link.click();
  }

  onUpdate(cb) {
    this.tickCallbacks.push(cb);
  }

  render() {
    this.controls.update();
    for (const cb of this.tickCallbacks) cb();
    this.renderer.render(this.scene, this.camera);
  }

  tick() {
    this.render();
    requestAnimationFrame(this.boundTick);
  }

  start() {
    this.tick();
  }
}