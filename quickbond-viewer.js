import * as THREE from '/assets/vendor/three.module.min.js';
import { OrbitControls } from '/assets/vendor/OrbitControls.js?v=9';

const stage = document.querySelector('.qb-render-stage');
const canvas = document.querySelector('.qb-webgl-canvas');

if (stage && canvas) {
  stage.dataset.viewerState = 'loading';
  initQuickbondViewer().catch((error) => {
    stage.dataset.viewerState = 'fallback';
    stage.dataset.viewerError = error instanceof Error ? error.message : String(error);
    console.error('Quickbond 3D-viewer kon niet worden gestart.', error);
  });
}

async function initQuickbondViewer() {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  const maximumPixelRatio = window.matchMedia('(max-width: 760px)').matches ? 1.25 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maximumPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, .55, 14.3);

  if (document.fonts) {
    await document.fonts.load('500 100px "Instrument Sans"').catch(() => undefined);
  }
  const labelTexture = createLabelTexture(renderer.capabilities.getMaxAnisotropy());
  const product = createQuickbondModel(labelTexture);
  scene.add(product);

  const ambient = new THREE.HemisphereLight(0xf4f7ff, 0x18213b, 2.5);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 5.1);
  key.position.set(4.5, 6.5, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xff7a32, 3.8);
  rim.position.set(-5, 2.5, -4);
  scene.add(rim);

  const fill = new THREE.PointLight(0x8daeff, 20, 18, 2);
  fill.position.set(-3.8, 1.4, 4.5);
  scene.add(fill);

  const controls = new OrbitControls(camera, canvas);
  canvas.style.touchAction = 'pan-y';
  controls.target.set(0, .35, 0);
  controls.enableDamping = true;
  controls.dampingFactor = .065;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = .78;
  controls.minPolarAngle = Math.PI * .25;
  controls.maxPolarAngle = Math.PI * .72;
  controls.saveState();

  let pointerActive = false;
  let scrollRotation = 0;
  let manualOffset = 0;
  let viewerVisible = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quickbondSection = stage.closest('.quickbond');
  const storySteps = Array.from(stage.querySelectorAll('[data-qb-step]'));
  const turnButtons = Array.from(stage.querySelectorAll('[data-qb-turn]'));
  const resetButton = stage.querySelector('[data-qb-reset]');

  controls.addEventListener('start', () => {
    pointerActive = true;
    stage.classList.add('is-dragging');
  });
  controls.addEventListener('end', () => {
    pointerActive = false;
    stage.classList.remove('is-dragging');
  });

  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      manualOffset += event.key === 'ArrowRight' ? .28 : -.28;
    }
    if (event.key === 'Home' || event.key.toLowerCase() === 'r') {
      event.preventDefault();
      resetViewer();
    }
  });

  turnButtons.forEach((button) => {
    button.addEventListener('click', () => {
      manualOffset += Number(button.dataset.qbTurn || 0) * .34;
    });
  });

  function resetViewer() {
    manualOffset = 0;
    controls.reset();
    updateScrollRotation();
  }

  resetButton?.addEventListener('click', resetViewer);
  stage.addEventListener('dblclick', resetViewer);

  function updateScrollRotation() {
    if (!quickbondSection || reducedMotion) return;
    const rect = quickbondSection.getBoundingClientRect();
    const scrollDistance = Math.max(1, rect.height - window.innerHeight);
    const progress = THREE.MathUtils.clamp(-rect.top / scrollDistance, 0, 1);
    scrollRotation = progress * Math.PI * 2 * 1.15;
    const activeStep = Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length));
    storySteps.forEach((step, index) => step.classList.toggle('is-active', index === activeStep));
    stage.style.setProperty('--qb-progress', progress.toFixed(3));
  }

  function resizeRenderer() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    const pixelRatio = renderer.getPixelRatio();
    const targetWidth = Math.floor(width * pixelRatio);
    const targetHeight = Math.floor(height * pixelRatio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(stage);
  const visibilityObserver = new IntersectionObserver((entries) => {
    viewerVisible = entries.some((entry) => entry.isIntersecting);
  }, { rootMargin: '35% 0px' });
  visibilityObserver.observe(stage);
  window.addEventListener('scroll', updateScrollRotation, { passive: true });
  window.addEventListener('resize', updateScrollRotation);
  updateScrollRotation();
  resizeRenderer();

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    const delta = Math.min(clock.getDelta(), .05);
    if (!pointerActive && !reducedMotion) {
      product.rotation.y = THREE.MathUtils.damp(product.rotation.y, scrollRotation + manualOffset, 7.2, delta);
    }
    controls.update();
    if (viewerVisible && !document.hidden) renderer.render(scene, camera);
  }

  renderer.render(scene, camera);
  stage.classList.add('webgl-ready');
  stage.dataset.viewerState = 'active';
  render();
}

function createQuickbondModel(labelTexture) {
  const product = new THREE.Group();
  product.rotation.set(.025, 0, -.015);

  const whitePlastic = new THREE.MeshPhysicalMaterial({
    color: 0xf6f7fa,
    roughness: .27,
    metalness: 0,
    clearcoat: .55,
    clearcoatRoughness: .2
  });
  const labelMaterial = new THREE.MeshPhysicalMaterial({
    map: labelTexture,
    roughness: .32,
    metalness: 0,
    clearcoat: .6,
    clearcoatRoughness: .18,
    side: THREE.DoubleSide
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(.79, .79, 5.25, 128, 1, true),
    labelMaterial
  );
  body.castShadow = true;
  body.receiveShadow = true;
  product.add(body);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(.805, .805, .38, 96),
    whitePlastic
  );
  base.position.y = -2.79;
  base.castShadow = true;
  product.add(base);

  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(.78, .035, 14, 96),
    whitePlastic
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = -2.98;
  product.add(baseRing);

  const shoulderPoints = [
    new THREE.Vector2(.79, 0),
    new THREE.Vector2(.79, .36),
    new THREE.Vector2(.76, .52),
    new THREE.Vector2(.66, .66),
    new THREE.Vector2(.50, .77),
    new THREE.Vector2(.30, .82)
  ];
  const shoulder = new THREE.Mesh(
    new THREE.LatheGeometry(shoulderPoints, 128),
    whitePlastic
  );
  shoulder.position.y = 2.625;
  shoulder.castShadow = true;
  product.add(shoulder);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(.265, .29, .68, 80),
    whitePlastic
  );
  neck.position.y = 3.76;
  neck.castShadow = true;
  product.add(neck);

  for (let index = 0; index < 7; index += 1) {
    const thread = new THREE.Mesh(
      new THREE.TorusGeometry(.282 - index * .004, .027, 12, 72),
      whitePlastic
    );
    thread.rotation.x = Math.PI / 2;
    thread.position.y = 3.49 + index * .085;
    thread.castShadow = true;
    product.add(thread);
  }

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(.105, .24, .65, 80),
    whitePlastic
  );
  nozzle.position.y = 4.39;
  nozzle.castShadow = true;
  product.add(nozzle);

  const nozzleTip = new THREE.Mesh(
    new THREE.CylinderGeometry(.085, .108, .12, 64),
    whitePlastic
  );
  nozzleTip.position.y = 4.77;
  product.add(nozzleTip);

  const floorShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: .24,
    depthWrite: false
  });
  const floorShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.08, 96),
    floorShadowMaterial
  );
  floorShadow.scale.set(1, .30, 1);
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(.16, -3.04, -.08);
  product.add(floorShadow);

  product.traverse((object) => {
    if (object.isMesh && object !== floorShadow) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return product;
}

function createLabelTexture(anisotropy) {
  const label = document.createElement('canvas');
  label.width = 2048;
  label.height = 4096;
  const context = label.getContext('2d');
  const width = label.width;
  const height = label.height;

  context.fillStyle = '#f5f6f7';
  context.fillRect(0, 0, width, height);

  const redLabelTop = Math.round(height * .22);
  const redLabelBottom = Math.round(height * .90);
  const redGradient = context.createLinearGradient(0, redLabelTop, width, redLabelBottom);
  redGradient.addColorStop(0, '#f23d2d');
  redGradient.addColorStop(.45, '#d6161d');
  redGradient.addColorStop(1, '#b90016');
  context.fillStyle = redGradient;
  context.fillRect(0, redLabelTop, width, redLabelBottom - redLabelTop);

  context.save();
  context.globalAlpha = .22;
  context.strokeStyle = '#ffd1b5';
  context.lineWidth = 52;
  for (let index = -2; index < 7; index += 1) {
    context.beginPath();
    context.moveTo(-180, redLabelTop + 420 + index * 360);
    context.bezierCurveTo(
      width * .28,
      redLabelTop + 160 + index * 360,
      width * .64,
      redLabelTop + 700 + index * 320,
      width + 180,
      redLabelTop + 390 + index * 360
    );
    context.stroke();
  }
  context.restore();

  drawNijtecMark(context, width * .50, redLabelTop * .51, .92);
  drawNijtecMark(context, 0, redLabelTop * .51, .88);
  drawNijtecMark(context, width, redLabelTop * .51, .88);

  context.save();
  context.translate(width * .5, redLabelTop + (redLabelBottom - redLabelTop) * .54);
  context.rotate(-Math.PI / 2);
  context.fillStyle = '#10131b';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '500 292px "Instrument Sans", Arial, sans-serif';
  context.fillText('QUICK BOND', 0, 0);
  context.restore();

  context.fillStyle = 'rgba(20,20,24,.72)';
  context.font = '38px "Instrument Sans", Arial, sans-serif';
  context.textAlign = 'left';
  const details = [
    'HIGH INITIAL TACK',
    'ELASTISCH · WATERBESTENDIG',
    'VOOR BOUW EN INDUSTRIE',
    'PROFESSIONELE VERLIJMING'
  ];
  for (let column = 0; column < 2; column += 1) {
    const x = column === 0 ? 54 : width - 54;
    context.textAlign = column === 0 ? 'left' : 'right';
    details.forEach((detail, index) => {
      context.fillText(detail, x, redLabelTop + 330 + index * 74);
    });
  }

  context.fillStyle = '#182547';
  context.font = '650 94px "Instrument Sans", Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText('info@nijtec.nl', width * .5, height * .962);

  context.fillStyle = '#ef762f';
  context.beginPath();
  context.arc(width * .12, height * .962 - 22, 13, 0, Math.PI * 2);
  context.arc(width * .88, height * .962 - 22, 13, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(label);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.offset.x = .5;
  texture.anisotropy = Math.min(anisotropy || 1, 16);
  texture.needsUpdate = true;
  return texture;
}

function drawNijtecMark(context, centerX, centerY, scale) {
  context.save();
  context.translate(centerX, centerY);
  context.scale(scale, scale);
  context.lineCap = 'round';

  context.strokeStyle = '#233f8d';
  context.lineWidth = 18;
  context.beginPath();
  context.ellipse(0, 0, 205, 146, -.18, .35, Math.PI * 1.86);
  context.stroke();

  context.strokeStyle = '#ef762f';
  context.lineWidth = 13;
  context.beginPath();
  context.ellipse(8, 3, 166, 120, -.18, Math.PI * 1.05, Math.PI * 2.43);
  context.stroke();

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '650 116px "Instrument Sans", Arial, sans-serif';
  context.fillStyle = '#ef762f';
  context.fillText('Nij', -43, 5);
  context.fillStyle = '#233f8d';
  context.fillText('Tec', 68, 5);
  context.restore();
}
