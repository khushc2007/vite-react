import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ============================================================
   GREYWATER MECHANICAL CHAMBER — FULL VISUALIZATION
   Single-file React + Three.js
   Engineering demo quality | Real-time animated | Modular logic
============================================================ */

// ── CONSTANTS ─────────────────────────────────────────────────
const BRACKET_META = {
  F1: { label: "Baseline Polishing",   color: 0x22c55e, hex: "#22c55e", tank: "A", desc: "pH 6.5–8, TDS<200, Turb<2" },
  F2: { label: "Moderate Solids",      color: 0x86efac, hex: "#86efac", tank: "B", desc: "TDS<300, Turb<4" },
  F3: { label: "High Suspended",       color: 0xfbbf24, hex: "#fbbf24", tank: "B", desc: "TDS<500, Turb<8" },
  F4: { label: "High Dissolved",       color: 0xf97316, hex: "#f97316", tank: "B", desc: "TDS<800" },
  F5: { label: "Severe Contamination", color: 0xef4444, hex: "#ef4444", tank: "B", desc: "TDS≥800" },
};

function classifyBracket(ph, turbidity, tds) {
  if (turbidity < 2 && tds < 200 && ph >= 6.5 && ph <= 8) return "F1";
  if (turbidity < 4 && tds < 300) return "F2";
  if (turbidity < 8 && tds < 500) return "F3";
  if (tds < 800) return "F4";
  return "F5";
}

// ── WATER SHADER ──────────────────────────────────────────────
const waterVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uSwirl;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    vec3 pos = position;
    if (pos.y > 0.45) {
      float w1 = sin(pos.x * 7.0 + uTime * 2.2) * 0.007;
      float w2 = cos(pos.z * 6.0 + uTime * 1.8) * 0.005;
      float sw = sin(atan(pos.z, pos.x) * 5.0 + uTime * 4.0) * uSwirl * 0.012;
      pos.y += w1 + w2 + sw;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uSwirl;
  uniform float uContamination;
  uniform float uOpacity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i); float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1)); float d = hash(i + vec2(1,1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 clean = vec3(0.20, 0.72, 0.93);
    vec3 murky = vec3(0.42, 0.55, 0.35);
    vec3 base = mix(clean, murky, uContamination * 0.85);

    float n1 = noise(vUv * 5.0 + uTime * 0.4);
    float n2 = noise(vUv * 10.0 - uTime * 0.25);
    float caustic = n1 * n2 * (1.0 - uContamination * 0.7);

    float ang = atan(vPosition.z, vPosition.x);
    float rad = length(vPosition.xz);
    float swirlBand = sin(ang * 7.0 + uTime * 5.0 - rad * 9.0) * 0.5 + 0.5;
    swirlBand *= uSwirl;

    float fresnel = 1.0 - abs(dot(normalize(vNormal), vec3(0.0,1.0,0.0)));
    fresnel = pow(fresnel, 1.8);

    vec3 col = base + caustic * 0.09 + swirlBand * 0.10 * vec3(0.25, 0.75, 1.0) + fresnel * 0.12;
    float alpha = uOpacity + fresnel * 0.18 + swirlBand * 0.08;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.3, 0.72));
  }
`;

// ── THREE.JS SCENE BUILDER ─────────────────────────────────────
function buildScene(canvas, getState) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Camera
  const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(5.5, 3.2, 6.2);
  camera.lookAt(0, 0.2, 0);

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020817);
  scene.fog = new THREE.FogExp2(0x020817, 0.045);

  // ── ORBIT CONTROLS (manual) ──────────────────────────────────
  const orbit = {
    theta: Math.atan2(5.5, 6.2),
    phi: Math.asin(3.2 / camera.position.length()),
    radius: camera.position.length(),
    isDragging: false,
    lastX: 0,
    lastY: 0,
    targetTheta: Math.atan2(5.5, 6.2),
    targetPhi: Math.asin(3.2 / camera.position.length()),
    targetRadius: camera.position.length(),
  };

  function updateCamera() {
    orbit.theta += (orbit.targetTheta - orbit.theta) * 0.08;
    orbit.phi   += (orbit.targetPhi   - orbit.phi)   * 0.08;
    orbit.radius+= (orbit.targetRadius - orbit.radius)* 0.08;
    orbit.phi = Math.max(0.08, Math.min(Math.PI * 0.80, orbit.phi));
    orbit.radius = Math.max(3, Math.min(18, orbit.radius));
    camera.position.set(
      orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      orbit.radius * Math.cos(orbit.phi),
      orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)
    );
    camera.lookAt(0, 0.2, 0);
  }

  canvas.addEventListener("mousedown", (e) => {
    orbit.isDragging = true;
    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!orbit.isDragging) return;
    const dx = e.clientX - orbit.lastX;
    const dy = e.clientY - orbit.lastY;
    orbit.targetTheta -= dx * 0.008;
    orbit.targetPhi   -= dy * 0.008;
    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
  });
  canvas.addEventListener("mouseup", () => { orbit.isDragging = false; });
  canvas.addEventListener("mouseleave", () => { orbit.isDragging = false; });
  canvas.addEventListener("wheel", (e) => {
    orbit.targetRadius += e.deltaY * 0.01;
    e.preventDefault();
  }, { passive: false });

  // Touch
  let lastTouchDist = 0;
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      orbit.isDragging = true;
      orbit.lastX = e.touches[0].clientX;
      orbit.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && orbit.isDragging) {
      const dx = e.touches[0].clientX - orbit.lastX;
      const dy = e.touches[0].clientY - orbit.lastY;
      orbit.targetTheta -= dx * 0.009;
      orbit.targetPhi   -= dy * 0.009;
      orbit.lastX = e.touches[0].clientX;
      orbit.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      orbit.targetRadius -= (d - lastTouchDist) * 0.02;
      lastTouchDist = d;
    }
  }, { passive: false });
  canvas.addEventListener("touchend", () => { orbit.isDragging = false; });

  // ── LIGHTING ─────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xdbeafe, 0.40));

  const keyLight = new THREE.DirectionalLight(0xc8e6ff, 1.3);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -7;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xfde68a, 0.7, 20);
  fillLight.position.set(-5, 2, 2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x06b6d4, 0.6, 20);
  rimLight.position.set(0, -1, -5);
  scene.add(rimLight);

  const chamberSpot = new THREE.SpotLight(0xffffff, 1.8, 12, 0.38, 0.75);
  chamberSpot.position.set(0, 6, 1);
  chamberSpot.castShadow = true;
  scene.add(chamberSpot);

  const tankALight = new THREE.PointLight(0x22c55e, 0.5, 8);
  tankALight.position.set(-2.5, 1, 0);
  scene.add(tankALight);

  const tankBLight = new THREE.PointLight(0xef4444, 0.5, 8);
  tankBLight.position.set(2.5, 1, 0);
  scene.add(tankBLight);

  // ── GROUND ───────────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(22, 14);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x050c18,
    roughness: 0.95,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper
  const grid = new THREE.GridHelper(22, 28, 0x0f172a, 0x0f172a);
  grid.position.y = -2.08;
  scene.add(grid);

  // ── APARTMENT BUILDING ────────────────────────────────────────
  const aptGroup = new THREE.Group();
  aptGroup.position.set(0, 3.5, -3.2);

  // Building shell
  const buildingGeo = new THREE.BoxGeometry(4.2, 3.5, 0.1);
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  aptGroup.add(new THREE.Mesh(buildingGeo, buildingMat));

  // Wireframe outline
  const buildingEdges = new THREE.EdgesGeometry(buildingGeo);
  const buildingLine = new THREE.LineSegments(buildingEdges, new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.6 }));
  aptGroup.add(buildingLine);

  // Windows
  const windowMats = [];
  for (let col = -1.5; col <= 1.5; col += 1.0) {
    for (let row = -0.9; row <= 1.0; row += 0.9) {
      const wGeo = new THREE.BoxGeometry(0.38, 0.42, 0.02);
      const wMat = new THREE.MeshStandardMaterial({
        color: 0xb0d4f1,
        transparent: true,
        opacity: 0.4,
        emissive: 0x4a90d9,
        emissiveIntensity: 0.12,
      });
      windowMats.push(wMat);
      const w = new THREE.Mesh(wGeo, wMat);
      w.position.set(col, row, 0.06);
      aptGroup.add(w);
    }
  }

  // Floor lines
  for (let y = -1.05; y <= 1.1; y += 0.9) {
    const fGeo = new THREE.BoxGeometry(4.2, 0.03, 0.02);
    const fMesh = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.6 }));
    fMesh.position.set(0, y, 0.06);
    aptGroup.add(fMesh);
  }

  // Bathroom source icon
  const sinkGeo = new THREE.BoxGeometry(0.26, 0.16, 0.04);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, emissive: 0x38bdf8, emissiveIntensity: 0.15 });
  const sink = new THREE.Mesh(sinkGeo, sinkMat);
  sink.position.set(1.6, -0.5, 0.1);
  aptGroup.add(sink);

  scene.add(aptGroup);
  scene.add(aptGroup);

  // Vertical building pipe down to inlet
  const bPipeGeo = new THREE.CylinderGeometry(0.065, 0.065, 3.8, 12);
  const bPipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.88, roughness: 0.22 });
  const bPipe = new THREE.Mesh(bPipeGeo, bPipeMat);
  bPipe.position.set(1.72, 0.85, 0);
  scene.add(bPipe);

  // ── MAIN CHAMBER ─────────────────────────────────────────────
  const chamberGroup = new THREE.Group();
  chamberGroup.position.set(0, 0.25, 0);

  // Acrylic shell
  const shellGeo = new THREE.CylinderGeometry(0.64, 0.64, 2.3, 72, 1, true);
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xa8d8f0,
    transparent: true,
    opacity: 0.12,
    roughness: 0.0,
    metalness: 0.0,
    transmission: 0.88,
    thickness: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  chamberGroup.add(new THREE.Mesh(shellGeo, shellMat));

  // Top cap
  const topCapGeo = new THREE.CircleGeometry(0.64, 72);
  const capMat = new THREE.MeshPhysicalMaterial({ color: 0xa8d8f0, transparent: true, opacity: 0.15, roughness: 0, side: THREE.DoubleSide, depthWrite: false });
  const topCap = new THREE.Mesh(topCapGeo, capMat);
  topCap.rotation.x = -Math.PI / 2;
  topCap.position.y = 1.15;
  chamberGroup.add(topCap);

  // Bottom cone
  const coneGeo = new THREE.CylinderGeometry(0.64, 0.09, 0.48, 48, 1, true);
  const coneMat = new THREE.MeshPhysicalMaterial({ color: 0xa8d8f0, transparent: true, opacity: 0.14, roughness: 0, side: THREE.DoubleSide, depthWrite: false });
  chamberGroup.add(new THREE.Mesh(coneGeo, coneMat)).position.y = -1.14;

  // Frame rings
  [-0.92, 0.0, 0.92].forEach(y => {
    const rGeo = new THREE.TorusGeometry(0.65, 0.013, 8, 72);
    const rMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.92, roughness: 0.18 });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.y = y;
    chamberGroup.add(ring);
  });

  // ── WATER BODY (shader) ─────────────────────────────────────
  const waterUniforms = {
    uTime:          { value: 0 },
    uSwirl:         { value: 0 },
    uContamination: { value: 0.2 },
    uOpacity:       { value: 0.52 },
  };
  const waterGeo = new THREE.CylinderGeometry(0.60, 0.60, 1.0, 48, 6);
  const waterMat = new THREE.ShaderMaterial({
    vertexShader:   waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms:       waterUniforms,
    transparent:    true,
    depthWrite:     false,
    side:           THREE.DoubleSide,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.visible = false;
  chamberGroup.add(waterMesh);

  // ── OIL LAYER ───────────────────────────────────────────────
  const oilGeo = new THREE.CircleGeometry(0.59, 48);
  const oilMat = new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    transparent: true,
    opacity: 0.38,
    emissive: 0xb8860b,
    emissiveIntensity: 0.1,
    depthWrite: false,
  });
  const oilMesh = new THREE.Mesh(oilGeo, oilMat);
  oilMesh.rotation.x = -Math.PI / 2;
  oilMesh.visible = false;
  chamberGroup.add(oilMesh);

  // ── SLUDGE BASE ─────────────────────────────────────────────
  const sludgeBaseGeo = new THREE.CircleGeometry(0.38, 32);
  const sludgeBaseMat = new THREE.MeshStandardMaterial({
    color: 0x5c3317,
    transparent: true,
    opacity: 0.65,
    roughness: 1,
    depthWrite: false,
  });
  const sludgeBase = new THREE.Mesh(sludgeBaseGeo, sludgeBaseMat);
  sludgeBase.rotation.x = -Math.PI / 2;
  sludgeBase.position.y = -1.09;
  sludgeBase.visible = false;
  chamberGroup.add(sludgeBase);

  // ── LAMINAR SENSOR ZONE ─────────────────────────────────────
  const laminGeo = new THREE.RingGeometry(0.15, 0.57, 48);
  const laminMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.06,
    emissive: 0x22c55e,
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const laminRing = new THREE.Mesh(laminGeo, laminMat);
  laminRing.rotation.x = -Math.PI / 2;
  laminRing.position.y = -0.1;
  chamberGroup.add(laminRing);

  // ── BAFFLE PLATE ─────────────────────────────────────────────
  const baffleVert = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.72, 0.065),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.82, roughness: 0.28, transparent: true, opacity: 0.88 })
  );
  baffleVert.position.set(-0.055, 0.02, 0);
  chamberGroup.add(baffleVert);

  const baffleHoriz = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.022, 0.58),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.82, roughness: 0.28, transparent: true, opacity: 0.78 })
  );
  baffleHoriz.position.set(-0.055, 0.12, 0);
  chamberGroup.add(baffleHoriz);

  // ── INLET PIPE (tangential) ──────────────────────────────────
  const inletHGeo = new THREE.CylinderGeometry(0.063, 0.063, 0.88, 16);
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.90, roughness: 0.22 });
  const inletPipe = new THREE.Mesh(inletHGeo, pipeMat.clone());
  inletPipe.rotation.z = Math.PI / 2;
  inletPipe.position.set(1.06, 0.38, 0);
  const inletPipeMat = inletPipe.material;
  inletPipeMat.emissive = new THREE.Color(0x38bdf8);
  inletPipeMat.emissiveIntensity = 0;
  chamberGroup.add(inletPipe);

  // Elbow
  const elbowGeo = new THREE.TorusGeometry(0.19, 0.063, 10, 24, Math.PI / 2);
  const elbow = new THREE.Mesh(elbowGeo, pipeMat);
  elbow.position.set(1.44, 0.57, 0);
  elbow.rotation.z = Math.PI;
  chamberGroup.add(elbow);

  // ── SENSOR PROBES ────────────────────────────────────────────
  const sensorDefs = [
    { id: "PH",   pos: [-0.30, 0.0,  0.22], color: 0x22c55e, label: "pH" },
    { id: "TDS",  pos: [ 0.30, -0.16,-0.22], color: 0xf97316, label: "TDS" },
    { id: "TURB", pos: [ 0.0,  -0.30, 0.36], color: 0x38bdf8, label: "Turb" },
  ];
  const sensorBulbs = [];
  sensorDefs.forEach(s => {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.42, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.18 })
    );
    shaft.position.set(...s.pos);
    shaft.position.y -= 0.16;
    chamberGroup.add(shaft);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: s.color,
      emissive: new THREE.Color(s.color),
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.4,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), bulbMat);
    bulb.position.set(s.pos[0], s.pos[1] - 0.38, s.pos[2]);
    bulb.userData = { id: s.id, label: s.label, color: s.color };
    sensorBulbs.push(bulb);
    chamberGroup.add(bulb);
  });

  // Classification glow shell
  const glowGeo = new THREE.CylinderGeometry(0.68, 0.68, 2.35, 64, 1, true);
  const glowMat = new THREE.MeshStandardMaterial({
    transparent: true, opacity: 0, emissiveIntensity: 1,
    side: THREE.BackSide, depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  chamberGroup.add(glowMesh);

  scene.add(chamberGroup);

  // ── OUTLET PIPES ─────────────────────────────────────────────
  function makeOutletPipe(dir, color) {
    const grp = new THREE.Group();
    grp.position.set(dir * 0.52, -1.1, 0);

    const pMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.88,
      roughness: 0.24,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0,
    });
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.052, Math.abs(dir) * 3.0, 14),
      pMat
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(dir * 1.22, 0, 0);
    grp.add(pipe);

    // Valve body
    const valveBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.30, 0.13),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.30 })
    );
    valveBody.position.set(dir * 0.28, 0, 0);
    grp.add(valveBody);

    // Gate (animatable)
    const gateMat = new THREE.MeshStandardMaterial({
      color, transparent: true, opacity: 0.85,
      emissive: new THREE.Color(color), emissiveIntensity: 0.2,
    });
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.12), gateMat);
    gate.position.set(dir * 0.28, 0, 0);
    grp.add(gate);

    scene.add(grp);
    return { group: grp, pipe, gate, gateMat, pipeMat: pMat };
  }

  const outletA = makeOutletPipe(-1, 0x22c55e);
  const outletB = makeOutletPipe(1, 0xef4444);

  // Vertical drop pipes to tanks
  const dropGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.6, 12);
  const dropMatA = new THREE.Mesh(dropGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.88, roughness: 0.24 }));
  dropMatA.position.set(-2.5, -1.45, 0);
  scene.add(dropMatA);

  const dropMatB = new THREE.Mesh(dropGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.88, roughness: 0.24 }));
  dropMatB.position.set(2.5, -1.45, 0);
  scene.add(dropMatB);

  // ── STORAGE TANKS ─────────────────────────────────────────────
  function makeStorageTank(posX, color) {
    const tGrp = new THREE.Group();
    tGrp.position.set(posX, -0.35, 0);

    const tankR = 0.46, tankH = 1.45;

    // Shell
    const tShellGeo = new THREE.CylinderGeometry(tankR, tankR, tankH, 52, 1, true);
    const tShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x94c5e8, transparent: true, opacity: 0.13,
      roughness: 0, transmission: 0.82, thickness: 0.3,
      side: THREE.DoubleSide, depthWrite: false,
    });
    tGrp.add(new THREE.Mesh(tShellGeo, tShellMat));

    // Bottom cap
    const botCapMesh = new THREE.Mesh(
      new THREE.CircleGeometry(tankR, 52),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.65 })
    );
    botCapMesh.rotation.x = -Math.PI / 2;
    botCapMesh.position.y = -tankH / 2;
    tGrp.add(botCapMesh);

    // Water fill
    const fillGeo = new THREE.CylinderGeometry(tankR * 0.94, tankR * 0.94, tankH, 32);
    const fillMat = new THREE.MeshStandardMaterial({
      color, transparent: true, opacity: 0.42,
      emissive: new THREE.Color(color), emissiveIntensity: 0.04,
      depthWrite: false,
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    tGrp.add(fill);

    // Glow shell
    const glowShellMat = new THREE.MeshStandardMaterial({
      color, transparent: true, opacity: 0.03,
      emissive: new THREE.Color(color), emissiveIntensity: 1.0,
      side: THREE.BackSide, depthWrite: false,
    });
    const glowShell = new THREE.Mesh(
      new THREE.CylinderGeometry(tankR + 0.025, tankR + 0.025, tankH + 0.06, 52, 1, true),
      glowShellMat
    );
    tGrp.add(glowShell);

    // Level bar
    const barBg = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, tankH, 0.042),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    barBg.position.set(tankR + 0.07, 0, 0);
    tGrp.add(barBg);

    const barFill = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, tankH, 0.042),
      new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 0.35 })
    );
    barFill.position.set(tankR + 0.07, -tankH / 2, 0);
    tGrp.add(barFill);

    // Frame rings
    [-tankH/2 + 0.1, 0, tankH/2 - 0.1].forEach(y => {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(tankR + 0.012, 0.011, 6, 52),
        new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.2 })
      );
      r.position.y = y;
      tGrp.add(r);
    });

    scene.add(tGrp);
    return { group: tGrp, fill, fillMat, barFill, glowShellMat, tankH };
  }

  const tankA = makeStorageTank(-2.5, 0x22c55e);
  const tankB = makeStorageTank(2.5, 0xef4444);

  // ── PARTICLE SYSTEMS ──────────────────────────────────────────
  // Sludge particles
  const SLUDGE_COUNT = 200;
  const sludgePositions = new Float32Array(SLUDGE_COUNT * 3);
  const sludgeVelocities = new Float32Array(SLUDGE_COUNT * 3);
  for (let i = 0; i < SLUDGE_COUNT; i++) {
    const r = Math.random() * 0.55;
    const a = Math.random() * Math.PI * 2;
    sludgePositions[i*3]   = Math.cos(a) * r;
    sludgePositions[i*3+1] = -0.88 + Math.random() * 0.22;
    sludgePositions[i*3+2] = Math.sin(a) * r;
    sludgeVelocities[i*3]   = (Math.random() - 0.5) * 0.002;
    sludgeVelocities[i*3+1] = 0;
    sludgeVelocities[i*3+2] = (Math.random() - 0.5) * 0.002;
  }
  const sludgeGeo = new THREE.BufferGeometry();
  sludgeGeo.setAttribute("position", new THREE.BufferAttribute(sludgePositions, 3));
  const sludgeMat = new THREE.PointsMaterial({
    color: 0x6b3f1a, size: 0.033, transparent: true, opacity: 0.82,
    sizeAttenuation: true, depthWrite: false,
  });
  const sludgeParticles = new THREE.Points(sludgeGeo, sludgeMat);
  chamberGroup.add(sludgeParticles);

  // Oil droplets
  const OIL_COUNT = 60;
  const oilPositions = new Float32Array(OIL_COUNT * 3);
  for (let i = 0; i < OIL_COUNT; i++) {
    const r = Math.random() * 0.50;
    const a = Math.random() * Math.PI * 2;
    oilPositions[i*3]   = Math.cos(a) * r;
    oilPositions[i*3+1] = 0.54 + Math.random() * 0.14;
    oilPositions[i*3+2] = Math.sin(a) * r;
  }
  const oilPartGeo = new THREE.BufferGeometry();
  oilPartGeo.setAttribute("position", new THREE.BufferAttribute(oilPositions, 3));
  const oilPartMat = new THREE.PointsMaterial({
    color: 0xd4a017, size: 0.048, transparent: true, opacity: 0.72,
    sizeAttenuation: true, depthWrite: false,
  });
  const oilParticles = new THREE.Points(oilPartGeo, oilPartMat);
  chamberGroup.add(oilParticles);

  // Inlet flow particles
  const INLET_COUNT = 70;
  const inletPos = new Float32Array(INLET_COUNT * 3);
  const inletVel = new Float32Array(INLET_COUNT * 3);
  const inletAge = new Float32Array(INLET_COUNT);
  const inletLife = new Float32Array(INLET_COUNT);
  for (let i = 0; i < INLET_COUNT; i++) {
    inletPos[i*3]   = 0.72;
    inletPos[i*3+1] = 0.32;
    inletPos[i*3+2] = 0;
    inletVel[i*3]   = -0.32 - Math.random() * 0.1;
    inletVel[i*3+1] = -0.18 - Math.random() * 0.07;
    inletVel[i*3+2] =  0.48 + Math.random() * 0.18;
    inletLife[i] = 0.55 + Math.random() * 0.75;
    inletAge[i]  = Math.random() * inletLife[i];
  }
  const inletGeo = new THREE.BufferGeometry();
  inletGeo.setAttribute("position", new THREE.BufferAttribute(inletPos, 3));
  const inletMat = new THREE.PointsMaterial({
    color: 0x7dd3fc, size: 0.042, transparent: true, opacity: 0,
    sizeAttenuation: true, depthWrite: false,
  });
  const inletParticles = new THREE.Points(inletGeo, inletMat);
  chamberGroup.add(inletParticles);

  // Routing particles (A and B)
  function makeRoutingParticles(color) {
    const COUNT = 45;
    const pos = new Float32Array(COUNT * 3);
    const age = new Float32Array(COUNT);
    const life = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i*3] = 0; pos[i*3+1] = -1.15; pos[i*3+2] = 0;
      life[i] = 0.7 + Math.random() * 0.45;
      age[i]  = Math.random() * life[i];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size: 0.037, transparent: true, opacity: 0,
      sizeAttenuation: true, depthWrite: false,
    });
    return { pts: new THREE.Points(geo, mat), geo, mat, age, life, COUNT };
  }

  const routeA = makeRoutingParticles(0x22c55e);
  const routeB = makeRoutingParticles(0xef4444);
  scene.add(routeA.pts);
  scene.add(routeB.pts);

  // ── DRIFT DETECTION RING ─────────────────────────────────────
  const driftRingGeo = new THREE.RingGeometry(0.70, 0.82, 72);
  const driftRingMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, transparent: true, opacity: 0,
    emissive: 0x22c55e, emissiveIntensity: 0.5,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const driftRing = new THREE.Mesh(driftRingGeo, driftRingMat);
  driftRing.rotation.x = -Math.PI / 2;
  driftRing.position.set(0, 0.1, 0);
  chamberGroup.add(driftRing);

  // ── ANIMATION LOOP ────────────────────────────────────────────
  const clock = new THREE.Clock();
  let raf;

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);
    const state = getState();

    updateCamera();

    // Water
    waterUniforms.uTime.value = t;
    waterUniforms.uSwirl.value = state.swirl;
    waterUniforms.uContamination.value = state.contamination;
    waterMesh.visible = state.chamberLevel > 0.02;
    if (waterMesh.visible) {
      const h = state.chamberLevel * 1.92;
      waterMesh.scale.y = Math.max(0.01, h);
      waterMesh.position.y = -0.96 + h / 2;
    }

    // Oil layer position follows fill
    const surfY = -0.96 + state.chamberLevel * 1.92 - 0.03;
    oilMesh.position.y = surfY;
    oilMesh.visible = state.showOil && state.chamberLevel > 0.28;
    if (oilMesh.visible) {
      oilMat.opacity = 0.32 + 0.05 * Math.sin(t * 0.9);
    }

    // Sludge base
    sludgeBase.visible = state.showSludge && state.chamberLevel > 0.1;
    sludgeMat.opacity = state.showSludge ? 0.75 : 0;

    // Laminar ring pulse
    if (state.phase === "SEPARATING" || state.phase === "CLASSIFYING") {
      laminMat.opacity = 0.06 + 0.05 * Math.abs(Math.sin(t * 3.5));
      laminMat.emissiveIntensity = 0.3 + 0.2 * Math.abs(Math.sin(t * 4));
    } else {
      laminMat.opacity = 0.04;
      laminMat.emissiveIntensity = 0.08;
    }

    // Sludge particles
    {
      const arr = sludgeGeo.attributes.position.array;
      const isSwirling = state.swirl > 0.1 && (state.phase === "SWIRLING" || state.phase === "SEPARATING");
      for (let i = 0; i < SLUDGE_COUNT; i++) {
        const x = arr[i*3], y = arr[i*3+1], z = arr[i*3+2];
        if (isSwirling) {
          const ang = Math.atan2(z, x);
          const rad = Math.sqrt(x*x + z*z);
          const omega = state.swirl * 1.95 * (1 - rad);
          const na = ang + omega * dt;
          const nr = Math.min(rad, 0.58);
          arr[i*3]   = Math.cos(na) * nr;
          arr[i*3+2] = Math.sin(na) * nr;
          arr[i*3+1] = Math.max(-1.08, y - dt * 0.025 * state.swirl);
        } else {
          arr[i*3]   += (Math.random() - 0.5) * 0.0012;
          arr[i*3+2] += (Math.random() - 0.5) * 0.0012;
          arr[i*3+1]  = Math.max(-1.12, Math.min(-0.62, y + (Math.random()-0.52)*0.003));
          const d = Math.sqrt(arr[i*3]**2 + arr[i*3+2]**2);
          if (d > 0.57) { arr[i*3] *= 0.57/d; arr[i*3+2] *= 0.57/d; }
        }
      }
      sludgeGeo.attributes.position.needsUpdate = true;
    }

    // Oil droplet particles
    {
      const arr = oilPartGeo.attributes.position.array;
      for (let i = 0; i < OIL_COUNT; i++) {
        const x = arr[i*3], y = arr[i*3+1], z = arr[i*3+2];
        if (state.swirl > 0.1) {
          const ang = Math.atan2(z, x);
          const rad = Math.sqrt(x*x + z*z);
          const na = ang + state.swirl * 0.85 * (1 - rad * 0.5) * dt;
          arr[i*3]   = Math.cos(na) * rad;
          arr[i*3+2] = Math.sin(na) * rad;
          arr[i*3+1] = Math.min(surfY + 0.04, y + 0.001);
        } else {
          arr[i*3+1] += Math.sin(t * 0.9 + i) * 0.0003;
        }
        oilPartMat.opacity = state.showOil ? 0.68 : 0;
      }
      oilPartGeo.attributes.position.needsUpdate = true;
    }

    // Inlet flow particles
    {
      const arr = inletGeo.attributes.position.array;
      const isActive = state.phase === "FILLING" || state.phase === "SWIRLING";
      inletMat.opacity = isActive ? 0.88 : 0;
      if (isActive) {
        for (let i = 0; i < INLET_COUNT; i++) {
          inletAge[i] += dt;
          if (inletAge[i] > inletLife[i]) {
            arr[i*3]   = 0.72 + (Math.random()-0.5)*0.04;
            arr[i*3+1] = 0.32 + (Math.random()-0.5)*0.04;
            arr[i*3+2] = 0;
            inletVel[i*3]   = -0.32 - Math.random() * 0.12;
            inletVel[i*3+1] = -0.2  - Math.random() * 0.06;
            inletVel[i*3+2] =  0.48 + Math.random() * 0.12;
            inletAge[i] = 0;
          } else {
            arr[i*3]   += inletVel[i*3]   * dt;
            arr[i*3+1] += inletVel[i*3+1] * dt;
            arr[i*3+2] += inletVel[i*3+2] * dt;
            const d = Math.sqrt(arr[i*3]**2 + arr[i*3+2]**2);
            if (d > 0.57) {
              arr[i*3] *= 0.57/d; arr[i*3+2] *= 0.57/d;
              inletVel[i*3]   *= -0.28; inletVel[i*3+2] *= -0.28;
            }
          }
        }
        inletGeo.attributes.position.needsUpdate = true;
      }
    }

    // Routing particles
    function animateRoute(route, valve, destX) {
      const arr = route.geo.attributes.position.array;
      route.mat.opacity = valve * 0.88;
      if (valve < 0.05) return;
      for (let i = 0; i < route.COUNT; i++) {
        route.age[i] += dt;
        const progress = route.age[i] / route.life[i];
        if (progress >= 1) {
          arr[i*3] = (Math.random()-0.5)*0.06; arr[i*3+1] = -1.15; arr[i*3+2] = (Math.random()-0.5)*0.06;
          route.age[i] = 0;
        } else {
          // Bezier arc
          const cx = destX * 0.5, cy = -2.2;
          const bx = (1-progress)*(1-progress)*0 + 2*(1-progress)*progress*cx + progress*progress*destX;
          const by = (1-progress)*(1-progress)*(-1.15) + 2*(1-progress)*progress*cy + progress*progress*(-0.85);
          arr[i*3]   = bx + (Math.random()-0.5)*0.05;
          arr[i*3+1] = by + (Math.random()-0.5)*0.04;
          arr[i*3+2] = (Math.random()-0.5)*0.08;
        }
      }
      route.geo.attributes.position.needsUpdate = true;
    }
    animateRoute(routeA, state.valveA, -2.5);
    animateRoute(routeB, state.valveB, 2.5);

    // Valve gates
    const targetAScaleY = 1 - state.valveA * 0.94;
    const targetBScaleY = 1 - state.valveB * 0.94;
    outletA.gate.scale.y += (targetAScaleY - outletA.gate.scale.y) * 0.07;
    outletA.gate.position.y = 0.13 * (1 - outletA.gate.scale.y);
    outletB.gate.scale.y += (targetBScaleY - outletB.gate.scale.y) * 0.07;
    outletB.gate.position.y = 0.13 * (1 - outletB.gate.scale.y);
    outletA.pipeMat.emissiveIntensity = state.valveA > 0.5 ? 0.22 + 0.14*Math.sin(t*5) : 0;
    outletB.pipeMat.emissiveIntensity = state.valveB > 0.5 ? 0.22 + 0.14*Math.sin(t*5) : 0;

    // Inlet pipe glow
    inletPipeMat.emissiveIntensity = (state.phase === "FILLING" || state.phase === "SWIRLING")
      ? 0.35 + 0.2*Math.sin(t*7) : 0;

    // Tank fill animation
    function animateTank(tank, levelKey, isActive) {
      const targetLevel = state[levelKey];
      const h = Math.max(0.01, targetLevel * tank.tankH);
      tank.fill.scale.y = h / tank.tankH;
      tank.fill.position.y = -tank.tankH / 2 + h / 2;
      tank.barFill.scale.y = Math.max(0.01, targetLevel);
      tank.barFill.position.y = -tank.tankH / 2 + (targetLevel * tank.tankH) / 2;
      if (isActive) {
        tank.fillMat.emissiveIntensity = 0.09 + 0.06*Math.sin(t*4);
        tank.glowShellMat.opacity = 0.06 + 0.03*Math.sin(t*5);
      } else {
        tank.fillMat.emissiveIntensity = 0.03;
        tank.glowShellMat.opacity = 0.02;
      }
    }
    animateTank(tankA, "tankALevel", state.valveA > 0.5);
    animateTank(tankB, "tankBLevel", state.valveB > 0.5);

    // Sensor pulse
    sensorBulbs.forEach((bulb, idx) => {
      const isSensing = state.phase === "SEPARATING" || state.phase === "CLASSIFYING";
      const baseEI = isSensing ? 0.7 + 0.4*Math.abs(Math.sin(t*5 + idx)) : 0.25;
      bulb.material.emissiveIntensity = bulb.userData.id === state.selectedSensor ? 1.2 : baseEI;
    });

    // Classification glow
    if (state.bracket && (state.phase === "CLASSIFYING" || state.phase === "ROUTING")) {
      const meta = BRACKET_META[state.bracket];
      glowMat.color = new THREE.Color(meta.color);
      glowMat.emissive = new THREE.Color(meta.color);
      glowMat.opacity = 0.07 + 0.05*Math.abs(Math.sin(t*6));
    } else {
      glowMat.opacity = 0;
    }

    // Window flicker (apartment)
    windowMats.forEach((wm, i) => {
      wm.emissiveIntensity = 0.06 + (Math.sin(t*0.35 + i*1.7)+1)/2 * 0.14;
    });

    // Drift ring
    if (state.showDrift) {
      const DRIFT_COLORS = {
        normal:        0x22c55e,
        degraded:      0xfbbf24,
        flatline:      0xef4444,
        recalibrating: 0x38bdf8,
      };
      const dc = DRIFT_COLORS[state.driftState] || 0x22c55e;
      driftRingMat.color.setHex(dc);
      driftRingMat.emissive.setHex(dc);
      driftRingMat.opacity = state.driftState === "flatline"
        ? 0.18 + 0.14*Math.abs(Math.sin(t*9))
        : state.driftState === "recalibrating"
        ? 0.10 + 0.07*Math.sin(t*3)
        : 0.07;
      driftRing.rotation.z = state.driftState === "recalibrating" ? t * 1.5 : 0;
    } else {
      driftRingMat.opacity = 0;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ── RAYCASTER (sensor click) ──────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(sensorBulbs);
    if (hits.length) {
      const id = hits[0].object.userData.id;
      getState().__callbacks?.onSensorClick(id);
    }
  }
  canvas.addEventListener("click", onCanvasClick);

  // ── RESIZE ────────────────────────────────────────────────────
  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("click", onCanvasClick);
    renderer.dispose();
  };
}

// ── MAIN REACT COMPONENT ──────────────────────────────────────
export default function GreywaterViz() {
  const canvasRef = useRef(null);
  const stateRef  = useRef({});

  const [phase,        setPhase]        = useState("IDLE");
  const [bracket,      setBracket]      = useState(null);
  const [chamberLevel, setChamberLevel] = useState(0);
  const [swirl,        setSwirl]        = useState(0);
  const [valveA,       setValveA]       = useState(0);
  const [valveB,       setValveB]       = useState(0);
  const [tankALevel,   setTankALevel]   = useState(0.12);
  const [tankBLevel,   setTankBLevel]   = useState(0.07);
  const [contamination,setContamination]= useState(0.22);
  const [selectedSensor,setSelectedSensor]=useState(null);
  const [showOil,      setShowOil]      = useState(true);
  const [showSludge,   setShowSludge]   = useState(true);
  const [showDrift,    setShowDrift]    = useState(false);
  const [driftState,   setDriftState]   = useState("normal");
  const [swirlSpeed,   setSwirlSpeed]   = useState(1);
  const [popup,        setPopup]        = useState(null);
  const [sensorPanel,  setSensorPanel]  = useState(null);
  const [sensorReadings,setSensorReadings]=useState({ ph:7.2, turbidity:1.8, tds:180 });
  const [running,      setRunning]      = useState(false);
  const [log,          setLog]          = useState([]);

  const addLog = useCallback((msg, color="#22c55e") => {
    setLog(prev => [{msg, color, id: Date.now() + Math.random()}, ...prev].slice(0, 8));
  }, []);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = {
      phase, bracket, chamberLevel, swirl: swirl * swirlSpeed,
      valveA, valveB, tankALevel, tankBLevel, contamination,
      selectedSensor, showOil, showSludge, showDrift, driftState,
      __callbacks: {
        onSensorClick: (id) => {
          setSelectedSensor(prev => prev === id ? null : id);
          setSensorPanel(id);
        }
      }
    };
  });

  // Mount Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    const cleanup = buildScene(canvas, () => stateRef.current);
    return cleanup;
  }, []);

  // Full cycle automation
  const triggerCycle = useCallback(() => {
    if (running) return;
    setRunning(true);
    setPhase("IDLE");
    setBracket(null);
    setValveA(0); setValveB(0);
    setChamberLevel(0); setSwirl(0);
    setPopup(null);

    const ph         = 6.5 + Math.random()*2 - contamination*1.5;
    const turbidity  = contamination*12 + Math.random()*2;
    const tds        = 150 + contamination*800 + Math.random()*50;
    const clamp      = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
    const reading    = { ph: +clamp(ph,4,10).toFixed(2), turbidity: +clamp(turbidity,0,20).toFixed(2), tds: +clamp(tds,100,1200).toFixed(0) };
    const br         = classifyBracket(reading.ph, reading.turbidity, reading.tds);
    const target     = ["F1","F2","F3"].includes(br) ? "A" : "B";
    setSensorReadings(reading);

    addLog("▶ Cycle started — inlet valve open", "#38bdf8");

    setTimeout(() => { setPhase("FILLING"); setChamberLevel(0); setSwirl(0); }, 100);
    const fillSteps = 12;
    for (let i = 1; i <= fillSteps; i++) {
      setTimeout(() => setChamberLevel(i / fillSteps * 0.82), i * 100);
    }
    setTimeout(() => { setPhase("SWIRLING"); setSwirl(0.9); addLog("↺ Swirl initiated — tangential flow active", "#38bdf8"); }, 1400);
    setTimeout(() => { setPhase("SEPARATING"); setSwirl(0.45); addLog("⬇ Layer separation in progress", "#fbbf24"); }, 3200);
    setTimeout(() => {
      setPhase("CLASSIFYING"); setBracket(br);
      setPopup({ bracket: br, reading, target });
      addLog(`✦ Classified as ${br} — ${BRACKET_META[br].label}`, BRACKET_META[br].hex);
    }, 5400);
    setTimeout(() => {
      setPopup(null); setPhase("ROUTING");
      if (target === "A") { setValveA(1); setValveB(0); addLog("▸ Valve A open — routing to Tank A (Reusable)", "#22c55e"); }
      else                { setValveA(0); setValveB(1); addLog("▸ Valve B open — routing to Tank B (Treatment)", "#ef4444"); }
    }, 7600);
    setTimeout(() => {
      setPhase("DRAINING"); setSwirl(0);
      setChamberLevel(0.08);
      if (target === "A") setTankALevel(prev => Math.min(0.96, prev + 0.18 + Math.random()*0.08));
      else                setTankBLevel(prev => Math.min(0.96, prev + 0.18 + Math.random()*0.08));
    }, 9200);
    setTimeout(() => {
      setPhase("IDLE"); setValveA(0); setValveB(0);
      setRunning(false); addLog("✓ Cycle complete", "#22c55e");
    }, 11400);
  }, [running, contamination, addLog]);

  const triggerDrift = useCallback(() => {
    setShowDrift(true);
    setDriftState("degraded"); addLog("⚠ Sensor drift detected — confidence dropping", "#fbbf24");
    setTimeout(() => { setDriftState("flatline"); addLog("⚠ FLATLINE — sensor non-responsive", "#ef4444"); }, 2500);
    setTimeout(() => { setDriftState("recalibrating"); addLog("↻ Recalibration triggered", "#38bdf8"); }, 5000);
    setTimeout(() => { setDriftState("normal"); addLog("✓ Sensors recalibrated — nominal", "#22c55e"); }, 8500);
  }, [addLog]);

  const SENSOR_INFO = {
    PH:   { label: "pH Probe",          unit: "",      val: sensorReadings.ph,        safe: [6.5,8.5], color:"#22c55e" },
    TDS:  { label: "TDS Conductivity",  unit: " mg/L", val: sensorReadings.tds,       safe: [0,500],   color:"#f97316" },
    TURB: { label: "Turbidity (NTU)",   unit: " NTU",  val: sensorReadings.turbidity, safe: [0,8],     color:"#38bdf8" },
  };

  const phaseColors = {
    IDLE:"#475569", FILLING:"#38bdf8", SWIRLING:"#38bdf8",
    SEPARATING:"#fbbf24", CLASSIFYING:"#a78bfa",
    ROUTING:"#22c55e", DRAINING:"#64748b",
  };

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#020817", display:"flex", flexDirection:"column", fontFamily:"'DM Mono','Courier New',monospace", overflow:"hidden" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0f172a; } ::-webkit-scrollbar-thumb { background:#22c55e44; border-radius:2px; }
        button { font-family:inherit; cursor:pointer; transition:all 0.18s; }
        button:active { transform:scale(0.97); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px currentColor} 50%{box-shadow:0 0 28px currentColor} }
      `}</style>

      {/* ── TOP HEADER ─────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", background:"#060d1a", borderBottom:"1px solid #1e293b", flexShrink:0, gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite", boxShadow:"0 0 8px #22c55e" }} />
          <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:17, color:"#ecfdf5", letterSpacing:"-0.02em" }}>
            Water<span style={{color:"#22c55e"}}>IQ</span>
          </span>
          <span style={{ fontSize:11, color:"#475569", borderLeft:"1px solid #1e293b", paddingLeft:10 }}>Greywater Chamber Visualization</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Phase badge */}
          <div style={{ padding:"4px 12px", borderRadius:8, border:`1px solid ${phaseColors[phase]}44`, background:`${phaseColors[phase]}11`, color:phaseColors[phase], fontSize:11, fontWeight:600, letterSpacing:"0.06em" }}>
            {phase === "IDLE" ? "● IDLE" : `▶ ${phase}`}
          </div>
          {bracket && (
            <div style={{ padding:"4px 12px", borderRadius:8, border:`1px solid ${BRACKET_META[bracket].hex}66`, background:`${BRACKET_META[bracket].hex}18`, color:BRACKET_META[bracket].hex, fontSize:11, fontWeight:700 }}>
              {bracket} — {BRACKET_META[bracket].label}
            </div>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#475569" }}>
          <span>🖱 Drag to rotate</span>
          <span style={{color:"#1e293b"}}>|</span>
          <span>⚙ Scroll to zoom</span>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

        {/* ── LEFT PANEL ──────────────────────────────── */}
        <div style={{ width:220, background:"#060d1a", borderRight:"1px solid #1e293b", display:"flex", flexDirection:"column", gap:1, flexShrink:0, overflowY:"auto" }}>
          <PanelSection title="Simulation">
            <button onClick={triggerCycle} disabled={running} style={{
              width:"100%", padding:"10px 0", borderRadius:10,
              background: running ? "#0f172a" : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: running ? "#22c55e" : "#022c22",
              border: running ? "1px solid #22c55e" : "none",
              fontWeight:700, fontSize:13,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              {running ? <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> : "▶"}
              {running ? "Running…" : "Run Full Cycle"}
            </button>
            <button onClick={triggerDrift} disabled={running} style={{
              width:"100%", padding:"8px 0", borderRadius:10, marginTop:6,
              background:"#1c1007", color:"#fbbf24", border:"1px solid #fbbf2444",
              fontWeight:600, fontSize:12,
            }}>
              ⚠ Trigger Drift
            </button>
          </PanelSection>

          <PanelSection title="Contamination Level">
            <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>
              Current: <span style={{ color:"#ecfdf5", fontWeight:700 }}>{Math.round(contamination * 100)}%</span>
            </div>
            <input type="range" min="0" max="100" value={Math.round(contamination*100)}
              onChange={e => setContamination(+e.target.value / 100)}
              disabled={running}
              style={{ width:"100%", accentColor:"#22c55e", cursor:"pointer" }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#334155", marginTop:2 }}>
              <span>Clean (F1)</span><span>Severe (F5)</span>
            </div>
          </PanelSection>

          <PanelSection title="Swirl Speed">
            <input type="range" min="10" max="200" value={Math.round(swirlSpeed*100)}
              onChange={e => setSwirlSpeed(+e.target.value / 100)}
              style={{ width:"100%", accentColor:"#38bdf8", cursor:"pointer" }}
            />
            <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>
              Speed: <span style={{ color:"#38bdf8", fontWeight:700 }}>{Math.round(swirlSpeed*100)}%</span>
            </div>
          </PanelSection>

          <PanelSection title="Layers">
            {[
              { label:"Oil Layer",         key:"showOil",   val:showOil,   set:setShowOil,   color:"#d4a017" },
              { label:"Sludge Particles",  key:"showSludge",val:showSludge,set:setShowSludge,color:"#6b3f1a" },
              { label:"Drift Detection",   key:"showDrift", val:showDrift, set:setShowDrift, color:"#fbbf24" },
            ].map(({ label, val, set, color }) => (
              <ToggleRow key={label} label={label} value={val} onChange={set} color={color} />
            ))}
          </PanelSection>

          <PanelSection title="Sensors" subtitle="Click sensor in 3D to inspect">
            {Object.entries(SENSOR_INFO).map(([id, info]) => (
              <div key={id} onClick={() => { setSelectedSensor(prev => prev===id?null:id); setSensorPanel(prev=>prev===id?null:id); }}
                style={{ padding:"7px 10px", borderRadius:8, marginBottom:4, cursor:"pointer",
                  background: selectedSensor===id ? `${info.color}18` : "#0f172a",
                  border:`1px solid ${selectedSensor===id ? info.color : "#1e293b"}`,
                  transition:"all 0.2s",
                }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:info.color, fontWeight:700 }}>{info.label}</span>
                  <span style={{ fontSize:12, color:"#ecfdf5", fontWeight:800, fontFamily:"DM Mono,monospace" }}>
                    {typeof info.val === "number" ? info.val.toFixed(2) : info.val}{info.unit}
                  </span>
                </div>
                <SafeBar val={info.val} range={info.safe} color={info.color} />
              </div>
            ))}
          </PanelSection>
        </div>

        {/* ── 3D CANVAS ────────────────────────────────── */}
        <div style={{ flex:1, position:"relative" }}>
          <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block" }} />

          {/* Classification popup */}
          {popup && (
            <div style={{
              position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)",
              background:"#060d1a", border:`2px solid ${BRACKET_META[popup.bracket].hex}`,
              borderRadius:18, padding:"22px 30px", minWidth:280, animation:"fadeUp 0.3s ease",
              boxShadow:`0 0 40px ${BRACKET_META[popup.bracket].hex}44`,
              zIndex:100, textAlign:"center",
            }}>
              <div style={{ fontSize:11, color:"#64748b", letterSpacing:"0.1em", marginBottom:8 }}>CLASSIFICATION RESULT</div>
              <div style={{ fontSize:52, fontWeight:900, fontFamily:"Syne,sans-serif", color:BRACKET_META[popup.bracket].hex, lineHeight:1 }}>{popup.bracket}</div>
              <div style={{ fontSize:15, color:"#ecfdf5", marginTop:6, fontWeight:600 }}>{BRACKET_META[popup.bracket].label}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{BRACKET_META[popup.bracket].desc}</div>
              <div style={{ display:"flex", gap:10, marginTop:16, justifyContent:"center" }}>
                {[["pH", popup.reading.ph.toFixed(2), ""], ["TDS", popup.reading.tds, " mg/L"], ["Turb", popup.reading.turbidity.toFixed(2), " NTU"]].map(([k,v,u]) => (
                  <div key={k} style={{ background:"#0f172a", borderRadius:8, padding:"7px 12px", border:"1px solid #1e293b" }}>
                    <div style={{ fontSize:10, color:"#475569" }}>{k}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#ecfdf5" }}>{v}{u}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"8px 16px", borderRadius:10,
                background: popup.target==="A" ? "#052e16" : "#1c0202",
                border:`1px solid ${popup.target==="A" ? "#22c55e" : "#ef4444"}`,
                color: popup.target==="A" ? "#22c55e" : "#ef4444",
                fontWeight:700, fontSize:13,
              }}>
                {popup.target==="A" ? "→ TANK A — Reusable" : "→ TANK B — Advanced Treatment"}
              </div>
            </div>
          )}

          {/* Layer legend */}
          <div style={{ position:"absolute", bottom:16, left:16, display:"flex", flexDirection:"column", gap:5 }}>
            {[["#d4a017","Oil Layer (top)"],["#38bdf8","Clear Water Zone"],["#6b3f1a","Sludge (bottom)"],["#22c55e","Sensor Zone"]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8" }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:c, boxShadow:`0 0 5px ${c}` }} />
                {l}
              </div>
            ))}
          </div>

          {/* Valve status */}
          <div style={{ position:"absolute", bottom:16, right:16, display:"flex", gap:8 }}>
            <ValveIndicator label="Valve A" open={valveA > 0.5} color="#22c55e" />
            <ValveIndicator label="Valve B" open={valveB > 0.5} color="#ef4444" />
          </div>

          {/* Tank levels */}
          <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:28 }}>
            <TankLevel label="TANK A" level={tankALevel} color="#22c55e" />
            <TankLevel label="TANK B" level={tankBLevel} color="#ef4444" />
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────── */}
        <div style={{ width:210, background:"#060d1a", borderLeft:"1px solid #1e293b", display:"flex", flexDirection:"column", gap:1, flexShrink:0, overflowY:"auto" }}>
          <PanelSection title="Phase Timeline">
            {["IDLE","FILLING","SWIRLING","SEPARATING","CLASSIFYING","ROUTING","DRAINING"].map(p => {
              const phases = ["IDLE","FILLING","SWIRLING","SEPARATING","CLASSIFYING","ROUTING","DRAINING"];
              const phaseIdx = phases.indexOf(phase);
              const thisIdx  = phases.indexOf(p);
              const done    = thisIdx < phaseIdx;
              const current = p === phase;
              return (
                <div key={p} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                    background: current ? phaseColors[p] : done ? "#22c55e44" : "#1e293b",
                    border:`1px solid ${current ? phaseColors[p] : done ? "#22c55e" : "#334155"}`,
                    animation: current ? "pulse 1s infinite" : "none",
                    boxShadow: current ? `0 0 6px ${phaseColors[p]}` : "none",
                  }} />
                  <span style={{ fontSize:11, color: current ? phaseColors[p] : done ? "#475569" : "#334155", fontWeight: current ? 700 : 400 }}>{p}</span>
                </div>
              );
            })}
          </PanelSection>

          <PanelSection title="Bracket Guide">
            {Object.entries(BRACKET_META).map(([br, m]) => (
              <div key={br} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", cursor:"pointer",
                opacity: !bracket || bracket===br ? 1 : 0.35,
                transition:"opacity 0.2s",
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:m.hex, flexShrink:0, boxShadow:`0 0 5px ${m.hex}` }} />
                <div>
                  <span style={{ fontSize:12, fontWeight:700, color:m.hex }}>{br}</span>
                  <span style={{ fontSize:10, color:"#475569", marginLeft:5 }}>→ Tank {m.tank}</span>
                  <div style={{ fontSize:10, color:"#334155" }}>{m.label}</div>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="Drift State" subtitle={showDrift ? driftState.toUpperCase() : "OFF"}>
            <div style={{ padding:"8px 10px", borderRadius:8, background:"#0f172a", border:"1px solid #1e293b", fontSize:11, color:"#64748b", textAlign:"center" }}>
              {showDrift ? (
                <div style={{ color: driftState==="normal"?"#22c55e":driftState==="flatline"?"#ef4444":driftState==="recalibrating"?"#38bdf8":"#fbbf24", fontWeight:700 }}>
                  {driftState === "normal"        && "✓ Sensors nominal"}
                  {driftState === "degraded"      && "⚠ Drift detected"}
                  {driftState === "flatline"      && "⚠ FLATLINE"}
                  {driftState === "recalibrating" && "↻ Recalibrating…"}
                  <div style={{ marginTop:4, fontSize:10, color:"#475569", fontWeight:400 }}>
                    {driftState === "recalibrating" ? "Do not interrupt" : driftState === "flatline" ? "Awaiting recalibration" : "Confidence: 97%"}
                  </div>
                </div>
              ) : (
                "Toggle drift layer to view"
              )}
            </div>
          </PanelSection>

          <PanelSection title="Event Log">
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {log.length === 0 && <div style={{ fontSize:11, color:"#334155", textAlign:"center", padding:"8px 0" }}>No events yet</div>}
              {log.map(entry => (
                <div key={entry.id} style={{ fontSize:10, color:entry.color, padding:"4px 7px", borderRadius:5, background:`${entry.color}11`, border:`1px solid ${entry.color}22`, animation:"fadeUp 0.3s ease", lineHeight:1.4 }}>
                  {entry.msg}
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}

// ── SMALL UI COMPONENTS ────────────────────────────────────────

function PanelSection({ title, subtitle, children }) {
  return (
    <div style={{ padding:"14px 14px 12px", borderBottom:"1px solid #0f172a" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>{title}</span>
        {subtitle && <span style={{ fontSize:9, color:"#334155" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, value, onChange, color }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", cursor:"pointer", userSelect:"none" }}>
      <span style={{ fontSize:12, color:value ? "#ecfdf5" : "#475569" }}>{label}</span>
      <div style={{ width:32, height:17, borderRadius:99, background:value?color:"#1e293b", position:"relative", transition:"background 0.2s", border:`1px solid ${value?color:"#334155"}` }}>
        <div style={{ position:"absolute", top:2, left:value?16:2, width:11, height:11, borderRadius:"50%", background:"#ecfdf5", transition:"left 0.2s" }} />
      </div>
    </div>
  );
}

function SafeBar({ val, range, color }) {
  const pct = Math.min(Math.max((val - range[0]) / (range[1] - range[0]), 0), 1) * 100;
  const inRange = val >= range[0] && val <= range[1];
  return (
    <div style={{ height:3, borderRadius:99, background:"#1e293b", marginTop:4, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:inRange?color:"#ef4444", borderRadius:99, transition:"width 0.5s" }} />
    </div>
  );
}

function ValveIndicator({ label, open, color }) {
  return (
    <div style={{ padding:"5px 12px", borderRadius:8, background: open?`${color}18`:"#0f172a", border:`1px solid ${open?color:"#1e293b"}`, display:"flex", alignItems:"center", gap:6, fontSize:11, color:open?color:"#475569", fontWeight:700, transition:"all 0.3s" }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:open?color:"#1e293b", boxShadow:open?`0 0 7px ${color}`:"none", animation:open?"pulse 1.5s infinite":"none" }} />
      {label}: {open?"OPEN":"CLOSED"}
    </div>
  );
}

function TankLevel({ label, level, color }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:10, fontWeight:700, color, letterSpacing:"0.06em" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"flex-end", gap:2 }}>
        {Array.from({length:8}).map((_, i) => {
          const filled = i < Math.round(level * 8);
          return <div key={i} style={{ width:5, height:5 + i*1.5, borderRadius:2, background:filled?color:"#1e293b", transition:"background 0.3s", boxShadow:filled?`0 0 4px ${color}`:"none" }} />;
        })}
      </div>
      <span style={{ fontSize:10, color:"#64748b" }}>{Math.round(level*100)}%</span>
    </div>
  );
}
