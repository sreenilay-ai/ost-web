// ============================================================
// scene.js — Open Source Tech 3D Experience
// All-in-one ES Module: Three.js Scene + UI Controller
// ============================================================
import * as THREE from 'three';

// ─── Renderer ──────────────────────────────────────────────
const canvas   = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace  = THREE.SRGBColorSpace;

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0xEEF1F7);
scene.fog        = new THREE.FogExp2(0xDFE5F0, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 18);

// ─── Lighting ──────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xfdfaf5, 5.0));

const keyLight = new THREE.DirectionalLight(0xfff8ef, 5.0);
keyLight.position.set(8, 14, 12);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd8e8ff, 3.5);
fillLight.position.set(-12, 4, 8);
scene.add(fillLight);

const pointGold   = new THREE.PointLight(0xD4A84B, 8.0, 40);
pointGold.position.set(4, 3, 10);
scene.add(pointGold);

const pointSilver = new THREE.PointLight(0x90B4D8, 5.0, 30);
pointSilver.position.set(-5, -2, 8);
scene.add(pointSilver);

// No external env map needed — studio lights provide illumination
// scene.environment kept null for clean light-theme rendering


// ─── Central Knowledge Sphere ──────────────────────────────
function createKnowledgeSphere() {
  const group = new THREE.Group();

  // Pearl core
  const coreGeo = new THREE.SphereGeometry(3.0, 64, 64);
  const coreMat = new THREE.MeshStandardMaterial({
    color:     0xD4B896,
    metalness: 0.45,
    roughness: 0.08,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.castShadow = true;
  group.add(core);

  // Shiny acrylic highlight cap
  const capGeo = new THREE.SphereGeometry(3.05, 32, 16, 0, Math.PI*2, 0, Math.PI*0.35);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xffffee, metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.18
  });
  group.add(new THREE.Mesh(capGeo, capMat));

  // Icosahedron wireframe shell (outer)
  const wireOuter = new THREE.Mesh(
    new THREE.IcosahedronGeometry(5.2, 1),
    new THREE.MeshBasicMaterial({ color: 0xC9A96E, wireframe: true, transparent: true, opacity: 0.2 })
  );
  group.add(wireOuter);

  // Mid translucent faceted shell
  const midShell = new THREE.Mesh(
    new THREE.OctahedronGeometry(4.2, 2),
    new THREE.MeshStandardMaterial({
      color: 0xE8E0D0, metalness: 0.12, roughness: 0.25, transparent: true, opacity: 0.26,
      side: THREE.FrontSide,
    })
  );
  group.add(midShell);

  // Orbiting glass shards
  const shardColors = [0xC9A96E, 0x98B8D0, 0xD4C4A8, 0xA8C0B8, 0xE0C898];
  for (let i = 0; i < 40; i++) {
    const geo = new THREE.TetrahedronGeometry(0.2 + Math.random() * 0.35, 0);
    const mat = new THREE.MeshStandardMaterial({
      color:       shardColors[i % shardColors.length],
      metalness:   0.5,
      roughness:   0.15,
      transparent: true,
      opacity:     0.8 + Math.random() * 0.18,
    });
    const shard = new THREE.Mesh(geo, mat);
    const phi   = Math.acos(-1 + (2 * i) / 40);
    const theta = Math.sqrt(40 * Math.PI) * phi;
    const r     = 3.6 + Math.random() * 2.0;
    shard.position.setFromSphericalCoords(r, phi, theta);
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    shard.castShadow = true;
    shard.userData.orbitSpeed = (Math.random() - 0.5) * 0.009;
    shard.userData.orbitAxis  = new THREE.Vector3(
      Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
    ).normalize();
    group.add(shard);
  }

  // Decorative rings
  [[Math.PI/2, 0, 0], [0.8, 0.4, 0], [0.3, 1.3, 0.5]].forEach(([rx, ry, rz]) => {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(4.6 + Math.random() * 0.6, 0.035, 6, 140),
      new THREE.MeshBasicMaterial({ color: 0xC9A96E, transparent: true, opacity: 0.45 })
    );
    r.rotation.set(rx, ry, rz);
    group.add(r);
  });

  return group;
}

const sphere = createKnowledgeSphere();
sphere.position.x = window.innerWidth < 768 ? 5.0 : 2.0; // push further right on mobile
scene.add(sphere);

// Update sphere offset on resize
window.addEventListener('resize', () => {
  sphere.position.x = window.innerWidth < 768 ? 5.0 : 2.0;
});

// ─── Floating Orbital Nodes ─────────────────────────────────
const nodeData = [
  { id: 'about',      label: 'About',      pos: [-4.5, 2.2, -1],   solid: 0xC8A870, wire: 0xC9A96E },
  { id: 'activities', label: 'Activities', pos: [ 8.2, 1.2, -2],   solid: 0x7A9CBD, wire: 0x6090B8 },
  { id: 'resources',  label: 'Resources',  pos: [-3.5,-3.2, -1],   solid: 0x88AC80, wire: 0x70A068 },
  { id: 'connect',    label: 'Connect',    pos: [ 7.4,-3.0, -1.5], solid: 0xC09870, wire: 0xAA8058 },
];

const floatingNodes = [];

nodeData.forEach(nd => {
  const group = new THREE.Group();
  group.position.set(...nd.pos);
  group.userData.id         = nd.id;
  group.userData.label      = nd.label;
  group.userData.basePos    = new THREE.Vector3(...nd.pos);
  group.userData.floatPhase = Math.random() * Math.PI * 2;

  // Solid metallic core octahedron [index 0]
  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.15, 0),
    new THREE.MeshStandardMaterial({
      color: nd.solid, metalness: 0.6, roughness: 0.1
    })
  );
  inner.castShadow = true;
  group.add(inner);  // [0]

  // Wireframe cage [index 1]
  group.add(new THREE.Mesh(
    new THREE.OctahedronGeometry(1.8, 1),
    new THREE.MeshBasicMaterial({ color: nd.wire, wireframe: true, transparent: true, opacity: 0.32 })
  ));                // [1]

  // Translucent outer shell [index 2]
  group.add(new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xEEEEEE, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.12,
      side: THREE.DoubleSide,
    })
  ));                // [2]

  // Glowing torus ring [index 3]
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.028, 6, 100),
    new THREE.MeshBasicMaterial({ color: nd.wire, transparent: true, opacity: 0.6 })
  );
  ring.rotation.x = Math.random() * Math.PI;
  ring.rotation.y = Math.random() * Math.PI;
  group.add(ring);   // [3]

  // Satellite dots [index 4+]
  for (let s = 0; s < 6; s++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 8, 8),
      new THREE.MeshStandardMaterial({ color: nd.solid, metalness: 0.5, roughness: 0.15 })
    );
    const ang = (s / 6) * Math.PI * 2;
    dot.position.set(Math.cos(ang) * 2.8, 0, Math.sin(ang) * 1.6);
    dot.userData.orbitAngle = ang;
    group.add(dot);
  }

  scene.add(group);
  floatingNodes.push(group);
});

// ─── Background Grid ─────────────────────────────────────────
function addGrid(size, divs, col, op, pos, rot) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size, divs, divs),
    new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: op, depthWrite: false })
  );
  m.position.set(...pos); m.rotation.set(...rot);
  scene.add(m);
}
addGrid(100, 24, 0x9AAABB, 0.06, [0, -18, -22], [0, 0, 0]);
addGrid(100, 24, 0x9AAABB, 0.04, [-34, 0, -22], [0, Math.PI/2, 0]);

// ─── Ambient Particles ───────────────────────────────────────
const partPos = new Float32Array(300 * 3);
for (let i = 0; i < 300; i++) {
  partPos[i*3]   = (Math.random() - 0.5) * 80;
  partPos[i*3+1] = (Math.random() - 0.5) * 55;
  partPos[i*3+2] = (Math.random() - 0.5) * 55 - 10;
}
const partGeo = new THREE.BufferGeometry();
partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
scene.add(new THREE.Points(partGeo, new THREE.PointsMaterial({
  color: 0x9AAABB, size: 0.09, transparent: true, opacity: 0.5, sizeAttenuation: true, depthWrite: false
})));

// ─── Camera State ────────────────────────────────────────────
const mouse = { nx: 0, ny: 0 };
let targetCam = { x: 0, y: 0, z: 18 };
let curCam    = { x: 0, y: 0, z: 18 };
let activeNode = null, transitioning = false;
const raycaster = new THREE.Raycaster();
const clock     = new THREE.Clock();

// Bridge for label click handlers (set inside setupUI)
let _flyToNode = null;

// ─── Mouse tracking ──────────────────────────────────────────
document.addEventListener('mousemove', e => {
  mouse.nx = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.ny = -(e.clientY / window.innerHeight - 0.5) * 2;
  document.documentElement.style.setProperty('--cx', e.clientX + 'px');
  document.documentElement.style.setProperty('--cy', e.clientY + 'px');
});

// ─── UI Setup (after DOM ready) ──────────────────────────────
function setupUI() {
const loader    = document.getElementById('loader');
const heroHud   = document.getElementById('hero-hud');
const nav       = document.getElementById('nav');
const panels    = document.querySelectorAll('.info-panel');
const exploreBtn = document.getElementById('explore-btn');

// Back button (created programmatically)
const backBtn = document.createElement('button');
backBtn.id = 'back-btn';
backBtn.textContent = '← Return to Space';
document.body.appendChild(backBtn);

// Expose flyToNode for label click handlers
_flyToNode = (id) => flyToNode(id);

// ③ Hash-on-load: after scene reveals, open panel if hash present
function showScene() {
  setTimeout(() => {
    loader.classList.add('hidden');
    nav.classList.add('visible');
    setTimeout(() => {
      heroHud.classList.add('visible');
      // Check URL hash and auto-open panel
      const validIds = ['about', 'activities', 'resources', 'connect'];
      const hash = window.location.hash.replace('#', '');
      if (validIds.includes(hash)) {
        setTimeout(() => flyToNode(hash), 400);
      }
    }, 350);
  }, 1200);
}
if (document.readyState === 'complete') {
  showScene();
} else {
  window.addEventListener('load', showScene, { once: true });
}

// Explore space
if (exploreBtn) {
  exploreBtn.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      // Mobile explore experience: hide text, show full canvas and labels, zoom out slightly
      const heroHud = document.getElementById('hero-hud');
      const canvas  = document.getElementById('c');
      if (heroHud && canvas) {
        heroHud.classList.add('hero-transparent');
        canvas.classList.add('canvas-focused');
        
        targetCam.x = 0;
        targetCam.y = 0;
        targetCam.z = 24; // Zoom out to see all nodes clearly

        setTimeout(() => {
          heroHud.classList.remove('hero-transparent');
          canvas.classList.remove('canvas-focused');
          targetCam.z = 18;
        }, 4000); // immersive view for 4 seconds
      }
    } else {
      // Desktop
      targetCam.z = 10;
      setTimeout(() => { targetCam.z = 18; }, 2200);
    }
  });
}

// ─── Fly Functions ────────────────────────────────────────────
function flyToNode(id) {
  if (transitioning) return;
  const node = floatingNodes.find(n => n.userData.id === id);
  if (!node) return;
  activeNode   = id;
  transitioning = true;
  const pos = node.userData.basePos;
  targetCam.x  = pos.x * 0.4;
  targetCam.y  = pos.y * 0.3;
  targetCam.z  = 12;
  setTimeout(() => { transitioning = false; }, 1400);

  // ① Nav active state
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.target === id);
  });

  // ② URL hash (no page reload)
  history.replaceState(null, '', '#' + id);

  // Fade hero, show panel
  heroHud.classList.add('fade-out');
  setTimeout(() => heroHud.classList.remove('visible'), 400);
  panels.forEach(p => p.classList.remove('visible'));
  setTimeout(() => {
    const t = document.getElementById('panel-' + id);
    if (t) t.classList.add('visible');
    backBtn.classList.add('visible');
  }, 550);
}

function flyHome() {
  if (transitioning) return;
  activeNode   = null;
  transitioning = true;
  targetCam.x  = 0; targetCam.y = 0; targetCam.z = 18;
  setTimeout(() => { transitioning = false; }, 1400);

  // ① Clear nav active state
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(el => el.classList.remove('active'));

  // ② Clear URL hash
  history.replaceState(null, '', window.location.pathname);

  panels.forEach(p => p.classList.remove('visible'));
  backBtn.classList.remove('visible');
  setTimeout(() => {
    heroHud.classList.remove('fade-out');
    heroHud.classList.add('visible');
  }, 450);
}

// ─── Click: canvas nodes ─────────────────────────────────────
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const ndc  = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  const meshes = floatingNodes.flatMap(g => g.children.filter(o => o.isMesh));
  const hits   = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    let o = hits[0].object;
    while (o && !o.userData.id) o = o.parent;
    if (o && o.userData.id) flyToNode(o.userData.id);
  }
});

// Cursor hover state on nodes
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const ndc  = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  const meshes = floatingNodes.flatMap(g => g.children.filter(o => o.isMesh));
  const hits   = raycaster.intersectObjects(meshes, false);
  document.body.classList.toggle('cursor-hover', hits.length > 0);
});

// ─── Nav links ───────────────────────────────────────────────
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); flyToNode(el.dataset.target); });
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Back button
backBtn.addEventListener('click', flyHome);

// Nav logo — clicking returns to home
const navLogoLink = document.getElementById('nav-logo-link');
if (navLogoLink) {
  navLogoLink.addEventListener('click', e => { e.preventDefault(); flyHome(); });
}

// Keyboard nav (existing 1-4 + Escape) + ③ Arrow key cycling
const nodeOrder = ['about', 'activities', 'resources', 'connect'];
document.addEventListener('keydown', e => {
  // Escape — return to space
  if (e.key === 'Escape') { flyHome(); return; }
  // Number shortcuts
  if (e.key === '1') { flyToNode('about'); return; }
  if (e.key === '2') { flyToNode('activities'); return; }
  if (e.key === '3') { flyToNode('resources'); return; }
  if (e.key === '4') { flyToNode('connect'); return; }
  // Arrow key cycling
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    const cur = nodeOrder.indexOf(activeNode);
    const next = nodeOrder[(cur + 1) % nodeOrder.length];
    flyToNode(next);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    const cur = nodeOrder.indexOf(activeNode);
    const prev = nodeOrder[(cur - 1 + nodeOrder.length) % nodeOrder.length];
    flyToNode(prev);
  }
});


// Interactive cursor styles
document.querySelectorAll('a, button, .pill, .r-card, .connect-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ⑤ Hamburger / mobile menu
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu   = document.getElementById('mobile-menu');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburgerBtn.classList.add('open');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', e => {
    e.stopPropagation();
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
}

// Close menu on outside click
document.addEventListener('click', e => {
  if (mobileMenu && mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) && e.target !== hamburgerBtn) {
    closeMobileMenu();
  }
});

// Mobile nav link clicks — close menu then fly to panel
document.querySelectorAll('.mobile-nav-link[data-target]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    closeMobileMenu();
    flyToNode(el.dataset.target);
  });
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// Escape also closes mobile menu
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
}, true); // capture phase so it fires before the main keydown


} // end setupUI()

// Run UI setup after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupUI);
} else {
  setupUI();
}

// ─── Node Labels ─────────────────────────────────────────────
const labelContainer = document.getElementById('node-labels');
const labelEls = floatingNodes.map(node => {
  const labelContainer = document.getElementById('node-labels');
  const div = document.createElement('div');
  div.className = 'node-label';
  div.dataset.id = node.userData.id;
  div.innerHTML = `<div class="node-label-dot"></div><div class="node-label-text">${node.userData.label}</div>`;
  div.addEventListener('click', () => { if (_flyToNode) _flyToNode(node.userData.id); });
  if (labelContainer) labelContainer.appendChild(div);
  return { el: div, node };
});

function updateLabels() {

  labelEls.forEach(({ el, node }) => {
    const pos = node.userData.basePos.clone().project(camera);
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    el.style.left    = x + 'px';
    el.style.top     = (y - 62) + 'px';
    el.style.opacity = (pos.z < 1 && !(activeNode && activeNode !== node.userData.id)) ? '1' : '0';
  });
}

// ─── Animation Loop ──────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth camera
  const lk = 0.05;
  curCam.x += (targetCam.x + mouse.nx * 1.2 - curCam.x) * lk;
  curCam.y += (targetCam.y + mouse.ny * 0.8 - curCam.y) * lk;
  curCam.z += (targetCam.z - curCam.z) * lk;
  camera.position.set(curCam.x, curCam.y, curCam.z);
  camera.lookAt(0, 0, 0);

  // Knowledge sphere
  sphere.rotation.y += 0.002;
  sphere.rotation.x  = Math.sin(t * 0.12) * 0.045;
  sphere.children.forEach(child => {
    if (child.userData.orbitAxis) {
      child.applyQuaternion(
        new THREE.Quaternion().setFromAxisAngle(child.userData.orbitAxis, child.userData.orbitSpeed)
      );
    }
  });

  // Floating nodes
  floatingNodes.forEach(node => {
    const ph   = node.userData.floatPhase;
    const base = node.userData.basePos;
    node.position.y = base.y + Math.sin(t * 0.55 + ph) * 0.42;
    node.position.x = base.x + Math.cos(t * 0.32 + ph) * 0.24;
    node.children[0].rotation.y += 0.007;
    node.children[0].rotation.x += 0.004;
    node.children[1].rotation.z += 0.004;
    node.children[3].rotation.z += 0.005;
    for (let s = 4; s < node.children.length; s++) {
      const dot = node.children[s];
      if (dot.userData.orbitAngle !== undefined) {
        dot.userData.orbitAngle += 0.01;
        const a = dot.userData.orbitAngle;
        dot.position.set(Math.cos(a) * 1.9, Math.sin(t * 0.4 + a * 0.3) * 0.4, Math.sin(a) * 1.1);
      }
    }
  });

  // Animate accent lights
  pointGold.position.x   = Math.sin(t * 0.3) * 5 + 4;
  pointGold.position.y   = Math.cos(t * 0.25) * 3 + 3;
  pointSilver.position.x = Math.cos(t * 0.27) * 5 - 5;
  pointSilver.position.y = Math.sin(t * 0.22) * 3 - 2;

  updateLabels();
  renderer.render(scene, camera);
}
animate();

// ─── Resize ──────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

if (window.innerWidth < 768) {
  let touchEndTimeout;
  let lastTouchX = null;
  let lastTouchY = null;

  canvas.addEventListener('touchstart', (e) => {
    const heroHud = document.getElementById('hero-hud');
    if (heroHud) {
      clearTimeout(touchEndTimeout);
      heroHud.classList.add('hero-transparent');
      canvas.classList.add('canvas-focused');
    }
    if (e.touches.length > 0) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0 && lastTouchX !== null) {
      const deltaX = lastTouchX - e.touches[0].clientX;
      const deltaY = e.touches[0].clientY - lastTouchY; // inverted Y

      // Pan the camera directly by adjusting targetCam
      targetCam.x += deltaX * 0.035;
      targetCam.y += deltaY * 0.035;

      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;

      // Keep parallax mouse values centered so they don't fight the pan
      mouse.nx = 0;
      mouse.ny = 0;
    }
  });

  canvas.addEventListener('touchend', () => {
    const heroHud = document.getElementById('hero-hud');
    lastTouchX = null;
    lastTouchY = null;

    if (heroHud) {
      touchEndTimeout = setTimeout(() => {
        heroHud.classList.remove('hero-transparent');
        canvas.classList.remove('canvas-focused');
        
        // Return camera to center smoothly when HUD reappears
        targetCam.x = 0;
        targetCam.y = 0;
      }, 2000);
    }
  });
}
