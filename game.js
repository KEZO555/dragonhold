// DRAGONHOLD: Milestone 1 "Walk the Isles"
// First-person, low-poly hex settling prototype (Three.js).
import * as THREE from './three.module.js';

// ---------------------------------------------------------------- constants
const HEX_R = 30;                 // hex corner radius (world units ≈ metres)
const SQ3 = Math.sqrt(3);
const HARVEST_MIN = 30, HARVEST_MAX = 60;    // each harvest arrives at a random time in this range
const ROLLS_PER_HARVEST = 2;                  // the Rune Stones are cast twice every harvest
// Early on there is little to do, so harvests come quickly (12–20 s) and slow down to 30–60 s over the first ~8 harvests.
function nextHarvestDelay() {
  const ramp = Math.min(1, Math.max(0, ((typeof state === 'object' ? state.harvests : 8) - 1) / 7));
  const lo = 12 + (HARVEST_MIN - 12) * ramp, hi = 20 + (HARVEST_MAX - 20) * ramp;
  return lo + Math.random() * (hi - lo);
}
const GOAL = 12;
const EYE = 1.7;
let P = 0;                        // local player's seat (0 = host / single player)
const LIMITS = { road: 15, hamlet: 5, keep: 4, roost: 1, tower: 3 };
const COST = {
  road:   { timber: 1, stone: 1 },
  hamlet: { timber: 1, stone: 1, wheat: 1, cattle: 1 },
  keep:   { wheat: 2, ember: 3 },
  scroll: { wheat: 1, cattle: 1, ember: 1 },
  roost:  { stone: 2, ember: 2, timber: 1 },
  tower:  { stone: 2, timber: 1, ember: 1 },
};
const RES = {
  timber: { name: 'Timber',     icon: '🌲' },
  stone:  { name: 'Stone',      icon: '🪨' },
  wheat:  { name: 'Sunwheat',   icon: '🌾' },
  cattle: { name: 'Cattle',     icon: '🐄' },
  ember:  { name: 'Emberstone', icon: '🔥' },
};
const RES_KEYS = Object.keys(RES);
const BIOME = {
  timber: { name: 'Pinewild',   color: 0x3f7a35, mini: '#3f7a35' },
  stone:  { name: 'Greyquarry', color: 0x8d877c, mini: '#9a948a' },
  wheat:  { name: 'Goldfield',  color: 0xd6ad45, mini: '#d9b44a' },
  cattle: { name: 'Highmoor',   color: 0x86b450, mini: '#86b450' },
  ember:  { name: 'Ashvent',    color: 0x3b3330, mini: '#4a3530' },
  cradle: { name: 'The Cradle', color: 0x5b4d45, mini: '#6b5246' },
};
const HOUSES = {
  varn:   { key: 'varn',   name: 'House Varn',   sigil: '🐺', color: 0xb3262c, css: '#c0392b', style: 'nordic', desc: 'Wolves of the north. Turf-roofed longhouses, timber halls behind palisades.' },
  calder: { key: 'calder', name: 'House Calder', sigil: '🦌', color: 0x2b5fa8, css: '#3a73c8', style: 'stone',  desc: 'Stags of the highlands. Grey stone cottages and towered keeps.' },
  morrow: { key: 'morrow', name: 'House Morrow', sigil: '🐍', color: 0x2f7d4a, css: '#2f9a58', style: 'fen',    desc: 'Serpents of the fens. Thatched stilt huts and round watchtowers.' },
  ashby:  { key: 'ashby',  name: 'House Ashby',  sigil: '☀️', color: 0xd8a021, css: '#e0a82a', style: 'sun',    desc: 'The sun-house of the south. Sunstone domes and white towers.' },
};
let HOUSE = HOUSES.varn;
const DAY_LENGTH = 480;            // seconds for a full day + night

// ---------------------------------------------------------------- rng & noise
const URLQ = new URLSearchParams(location.search);
let seed = URLQ.get('seed') ? (+URLQ.get('seed') | 0) : ((Math.random() * 2 ** 31) | 0);   // guests load the host's world
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(seed);
const rr = (a, b) => a + rand() * (b - a);
const pick = arr => arr[Math.floor(rand() * arr.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hash2(x, y) { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- hex math
const hexToWorld = (q, r) => ({ x: HEX_R * SQ3 * (q + r / 2), z: HEX_R * 1.5 * r });
const worldToFrac = (x, z) => ({ q: (SQ3 / 3 * x - z / 3) / HEX_R, r: (2 / 3 * z) / HEX_R });
function cubeRound(q, r) {
  const s = -q - r; let rq = Math.round(q), rr_ = Math.round(r); const rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr_ - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr_ - rs; else if (dr > ds) rr_ = -rq - rs;
  return { q: rq, r: rr_ };
}
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

// ---------------------------------------------------------------- board generation
const tiles = [], tileMap = new Map(), corners = [], edges = [];
function genBoard() {
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > 2) continue;
    const w = hexToWorld(q, r);
    const t = { id: tiles.length, q, r, x: w.x, z: w.z, type: null, num: null, corners: [] };
    tiles.push(t); tileMap.set(q + ',' + r, t);
  }
  const pool = shuffle(['timber', 'timber', 'timber', 'timber', 'stone', 'stone', 'stone', 'wheat', 'wheat', 'wheat', 'wheat',
    'cattle', 'cattle', 'cattle', 'cattle', 'ember', 'ember', 'ember']);
  let i = 0;
  for (const t of tiles) t.type = (t.q === 0 && t.r === 0) ? 'cradle' : pool[i++];
  // numbers: no two red numbers (6/8) adjacent
  const nums = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  for (let tries = 0; tries < 500; tries++) {
    shuffle(nums); let k = 0;
    for (const t of tiles) t.num = t.type === 'cradle' ? null : nums[k++];
    const bad = tiles.some(t => (t.num === 6 || t.num === 8) && DIRS.some(([dq, dr]) => {
      const n = tileMap.get((t.q + dq) + ',' + (t.r + dr)); return n && (n.num === 6 || n.num === 8);
    }));
    if (!bad) break;
  }
  // corners & edges
  const cKey = new Map(), eKey = new Map();
  for (const t of tiles) {
    const ids = [];
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 180 * (60 * k - 30);
      const x = t.x + HEX_R * Math.cos(a), z = t.z + HEX_R * Math.sin(a);
      const key = Math.round(x * 2) + ',' + Math.round(z * 2);
      let c = cKey.get(key);
      if (!c) { c = { id: corners.length, x, z, y: 0, tiles: [], edges: [], adj: [], building: null }; corners.push(c); cKey.set(key, c); }
      c.tiles.push(t.id); ids.push(c.id);
    }
    t.corners = ids;
    for (let k = 0; k < 6; k++) {
      const a = ids[k], b = ids[(k + 1) % 6], key = Math.min(a, b) + '-' + Math.max(a, b);
      if (!eKey.has(key)) {
        const e = { id: edges.length, a, b, road: null, mx: (corners[a].x + corners[b].x) / 2, mz: (corners[a].z + corners[b].z) / 2 };
        edges.push(e); eKey.set(key, e);
        corners[a].edges.push(e.id); corners[b].edges.push(e.id);
        corners[a].adj.push(b); corners[b].adj.push(a);
      }
    }
  }
}
genBoard();

// ---------------------------------------------------------------- terrain height
function heightAt(x, z) {
  const f = worldToFrac(x, z);
  const d = Math.max(Math.abs(f.q), Math.abs(f.r), Math.abs(f.q + f.r));
  let h = 1.8 + vnoise(x * 0.035, z * 0.035) * 1.1 + vnoise(x * 0.12, z * 0.12) * 0.3;
  const c = cubeRound(f.q, f.r), t = tileMap.get(c.q + ',' + c.r);
  if (t) {
    const dd = Math.hypot(x - t.x, z - t.z) / (HEX_R * 0.8);
    const k = 1 - smooth(0, 1, dd);
    if (t.type === 'stone') h += k * (7 + 3 * vnoise(x * 0.09, z * 0.09));
    else if (t.type === 'ember') h += k * (3.5 + 2 * vnoise(x * 0.2, z * 0.2));
    else if (t.type === 'cattle') h += k * 2.2;
    else if (t.type === 'timber') h += k * 1.2;
    else if (t.type === 'wheat') h = h * (1 - k * 0.7) + 1.9 * k * 0.7;
    else if (t.type === 'cradle') {
      const dc = Math.hypot(x, z), kk = Math.max(0, 1 - dc / (HEX_R * 0.9));
      h += 26 * Math.pow(kk, 1.5);
      if (dc < 6) h -= (6 - dc) * 2.4;
    }
  }
  const s = smooth(2.72, 3.25, d);
  return h * (1 - s) - 5 * s;
}
for (const c of corners) c.y = heightAt(c.x, c.z);
const tileAtWorld = (x, z) => { const f = worldToFrac(x, z), c = cubeRound(f.q, f.r); return tileMap.get(c.q + ',' + c.r) || null; };

// ---------------------------------------------------------------- renderer & scene
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;   // crisp, cel-style shadows
const scene = new THREE.Scene();
const FOG = 0xf0c9a0;
scene.fog = new THREE.Fog(FOG, 160, 650);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.3, 2500);
camera.rotation.order = 'YXZ';
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); resizeInk(); });

const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x5a4632, 1.3); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b8, 2.6);
sun.position.set(-160, 220, 90); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -190, right: 190, top: 190, bottom: -190, near: 10, far: 600 });
sun.shadow.bias = -0.0008; scene.add(sun);

// comic look: 3-tone cel shading
const toonRamp = (() => {
  const d = new Uint8Array([105, 105, 105, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t;
})();
// ---------------------------------------------------------------- ink pass (outlines + halftone)
const inkRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
inkRT.depthTexture = new THREE.DepthTexture(1, 1); inkRT.depthTexture.type = THREE.UnsignedIntType;
const inkU = {
  tColor: { value: inkRT.texture }, tDepth: { value: inkRT.depthTexture }, res: { value: new THREE.Vector2(1, 1) },
  near: { value: 0.3 }, far: { value: 2500 }, fadeNear: { value: 200 }, fadeFar: { value: 600 }, px: { value: 1 },
};
const inkScene = new THREE.Scene(), inkCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
inkScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: inkU, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `#include <packing>
    uniform sampler2D tColor, tDepth; uniform vec2 res; uniform float near, far, fadeNear, fadeFar, px; varying vec2 vUv;
    float D(vec2 uv){ return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, near, far); }
    void main(){
      vec2 o = px / res;
      vec3 col = texture2D(tColor, vUv).rgb;
      float d0 = D(vUv), dl = D(vUv - vec2(o.x, 0.)), dr = D(vUv + vec2(o.x, 0.)), du = D(vUv + vec2(0., o.y)), dd = D(vUv - vec2(0., o.y));
      // silhouettes: big depth jumps; creases: depth curvature (second derivative)
      float jump = max(max(abs(d0 - dl), abs(d0 - dr)), max(abs(d0 - du), abs(d0 - dd))) / d0;
      float crease = (abs(dl + dr - 2.0 * d0) + abs(du + dd - 2.0 * d0)) / d0;
      float edge = max(smoothstep(0.035, 0.07, jump), smoothstep(0.012, 0.03, crease));
      edge *= 1.0 - smoothstep(fadeNear, fadeFar, d0);          // lines fade into the mist
      // comic colour: a little extra saturation + halftone dots in the deep shadows
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(lum), col, 1.18);
      vec2 p = gl_FragCoord.xy / (5.0 * px); p = mat2(0.707, -0.707, 0.707, 0.707) * p;
      float dotMask = smoothstep(0.0, 0.08, (0.11 - lum)) * step(length(fract(p) - 0.5), 0.28);
      col *= 1.0 - 0.32 * dotMask;
      col = mix(col, vec3(0.06, 0.045, 0.05), edge * 0.92);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
})));
function resizeInk() {
  const pr = renderer.getPixelRatio(), w = Math.floor(innerWidth * pr), h = Math.floor(innerHeight * pr);
  inkRT.setSize(w, h); inkU.res.value.set(w, h); inkU.px.value = Math.max(1.6, pr * 1.5);
}
resizeInk();

const mat = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...o });

// sky dome: painted gradient, sun glow and moon (colours driven by the day/night cycle)
const skyU = {
  top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color(0x2a4a5a) },
  sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, moonDir: { value: new THREE.Vector3(0, -1, 0) }, night: { value: 0 },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 top, horizon, bottom, sunCol, sunDir, moonDir; uniform float night; varying vec3 vDir;
    void main(){
      vec3 d = normalize(vDir); float h = d.y;
      vec3 c = h > 0.0 ? mix(horizon, top, pow(h, 0.5)) : mix(horizon, bottom, min(1.0, -h * 5.0));
      float s = max(dot(d, sunDir), 0.0);
      c += sunCol * (pow(s, 6.0) * 0.45 * (1.0 - smoothstep(0.0, 0.6, h)) + pow(s, 900.0) * 3.0);
      float m = max(dot(d, moonDir), 0.0);
      c += vec3(0.9, 0.93, 1.0) * (smoothstep(0.99955, 0.9997, m) * 1.2 + pow(m, 40.0) * 0.12) * night;
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
}));
scene.add(sky);
const stars = (() => {
  const p = [];
  for (let i = 0; i < 900; i++) { const a = Math.random() * Math.PI * 2, y = Math.random() * 0.95 + 0.05, r = Math.sqrt(1 - y * y); p.push(Math.cos(a) * r * 1500, y * 1500, Math.sin(a) * r * 1500); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  scene.add(m); return m;
})();

// ground
{
  const SIZE = 400, SEG = 200;
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  const ng = g.toNonIndexed(), np = ng.attributes.position, cols = new Float32Array(np.count * 3);
  const c = new THREE.Color(), sand = new THREE.Color(0xd9c38f), wet = new THREE.Color(0xa38f63);
  for (let i = 0; i < np.count; i += 3) {
    const cx = (np.getX(i) + np.getX(i + 1) + np.getX(i + 2)) / 3, cz = (np.getZ(i) + np.getZ(i + 1) + np.getZ(i + 2)) / 3;
    const cy = (np.getY(i) + np.getY(i + 1) + np.getY(i + 2)) / 3;
    const t = tileAtWorld(cx, cz), j = hash2(Math.round(cx * 3), Math.round(cz * 3));
    if (cy < 0.2) c.copy(wet);
    else if (cy < 1.0 || !t) c.copy(sand);
    else {
      c.setHex(BIOME[t.type].color);
      if (t.type === 'wheat') { if (Math.sin((cx * 0.7 + cz * 0.4)) > 0.3) c.offsetHSL(0.01, 0.05, 0.07); }
      else if (t.type === 'ember' && j < 0.1) c.setHex(0x8a2d10);
      else if (t.type === 'stone' && cy > 6) c.offsetHSL(0, -0.05, 0.08);
      else if (t.type === 'cradle') { c.lerp(new THREE.Color(0x2a2220), Math.min(1, cy / 26)); }
      // soften colours toward borders so regions blend a little
      const dd = Math.hypot(cx - t.x, cz - t.z) / HEX_R;
      if (dd > 0.82 && t.type !== 'cradle') c.lerp(new THREE.Color(0x6f8a45), (dd - 0.82) * 1.2);
    }
    if (cy > 1) c.offsetHSL(0, 0.04, Math.min(0.08, (cy - 3) * 0.009));   // painted light-on-hilltops
    c.offsetHSL(0, 0, (j - 0.5) * 0.04);
    for (let k = 0; k < 3; k++) { cols[(i + k) * 3] = c.r; cols[(i + k) * 3 + 1] = c.g; cols[(i + k) * 3 + 2] = c.b; }
  }
  ng.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  ng.computeVertexNormals();
  const ground = new THREE.Mesh(ng, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonRamp }));
  ground.receiveShadow = true; scene.add(ground);
}

// region borders (subtle lines so the board reads clearly)
{
  const pts = [];
  for (const e of edges) {
    const A = corners[e.a], B = corners[e.b], N = 12;
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const x0 = A.x + (B.x - A.x) * t0, z0 = A.z + (B.z - A.z) * t0, x1 = A.x + (B.x - A.x) * t1, z1 = A.z + (B.z - A.z) * t1;
      pts.push(x0, heightAt(x0, z0) + 0.25, z0, x1, heightAt(x1, z1) + 0.25, z1);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xfff2cc, transparent: true, opacity: 0.35 })));
}

// sea
const water = (() => {
  const g = new THREE.PlaneGeometry(2400, 2400, 80, 80); g.rotateX(-Math.PI / 2);
  const ng = g.toNonIndexed();
  const m = new THREE.Mesh(ng, new THREE.MeshToonMaterial({ color: 0x2f7fa6, gradientMap: toonRamp, transparent: true, opacity: 0.9 }));
  m.position.y = 0.3; m.receiveShadow = true; scene.add(m);
  m.userData.base = Float32Array.from(ng.attributes.position.array);
  return m;
})();

// distant islets
for (let i = 0; i < 14; i++) {
  const a = rr(0, Math.PI * 2), d = rr(380, 700), s = rr(20, 70);
  const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * rr(0.5, 1.1), 6 + Math.floor(rr(0, 3))), mat(pick([0x5b7d48, 0x6b6a62, 0x4f6b3d])));
  m.position.set(Math.cos(a) * d, -2, Math.sin(a) * d); m.rotation.y = rr(0, 6); scene.add(m);
}

// clouds
const clouds = [], cloudMat = mat(0xffffff, { transparent: true, opacity: 0.92 });
for (let i = 0; i < 16; i++) {
  const g = new THREE.Group(), cm = cloudMat;
  for (let k = 0; k < 4 + Math.floor(rr(0, 3)); k++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(6, 12), 0), cm);
    b.position.set(rr(-14, 14), rr(-2, 3), rr(-6, 6)); g.add(b);
  }
  g.position.set(rr(-500, 500), rr(90, 140), rr(-500, 500)); scene.add(g); clouds.push(g);
}

// ---------------------------------------------------------------- decorations
function placeIn(t, minR, maxR) {
  const a = rand() * Math.PI * 2, r = minR + Math.sqrt(rand()) * (maxR - minR);
  const x = t.x + Math.cos(a) * r, z = t.z + Math.sin(a) * r;
  return { x, z, y: heightAt(x, z) };
}
function instanced(geo, material, list, colorFn) {
  const m = new THREE.InstancedMesh(geo, material, list.length), o = new THREE.Object3D(), c = new THREE.Color();
  list.forEach((it, i) => {
    o.position.set(it.x, it.y, it.z); o.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); o.scale.setScalar(it.s || 1); o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    if (colorFn) { c.setHex(colorFn(it)); m.setColorAt(i, c); }
  });
  m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
const trees = [], rocks = [], tufts = [], vents = [], blackRocks = [];
const windmills = [], cows = [], smoke = [];
for (const t of tiles) {
  if (t.type === 'timber') for (let i = 0; i < 34; i++) { const p = placeIn(t, 6, HEX_R * 0.7); trees.push({ ...p, s: rr(0.8, 1.6), ry: rr(0, 6), g: rand() }); }
  if (t.type === 'stone') {
    for (let i = 0; i < 16; i++) { const p = placeIn(t, 6, HEX_R * 0.7); rocks.push({ ...p, s: rr(1.2, 3.2), rx: rr(0, 3), ry: rr(0, 3) }); }
    // quarry crane
    const p = placeIn(t, 9, 14), g = new THREE.Group();
    const w = mat(0x6b4a2b);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9, 0.6), w); mast.position.y = 4.5; g.add(mast);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(7, 0.5, 0.5), w); arm.position.set(2.5, 8.8, 0); g.add(arm);
    const blk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), mat(0xb0a99c)); blk.position.set(5.5, 5, 0); g.add(blk);
    g.position.set(p.x, p.y, p.z); g.rotation.y = rr(0, 6); g.traverse(o => o.castShadow = true); scene.add(g);
  }
  if (t.type === 'wheat') {
    for (let i = 0; i < 90; i++) { const p = placeIn(t, 5, HEX_R * 0.72); tufts.push({ ...p, s: rr(0.8, 1.3), ry: rr(0, 6) }); }
    const p = placeIn(t, 8, 13), g = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 7, 6), mat(0xe8dcc0)); tower.position.y = 3.5; g.add(tower);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 2.2, 6), mat(0x7a3b22)); roof.position.y = 8.1; g.add(roof);
    const blades = new THREE.Group(); blades.position.set(0, 6.6, 1.9);
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 0.1), mat(0xd9cfb5)); b.position.y = 2.5; const piv = new THREE.Group(); piv.rotation.z = k * Math.PI / 2; piv.add(b); blades.add(piv); }
    g.add(blades); g.position.set(p.x, p.y, p.z); g.rotation.y = rr(0, 6); g.traverse(o => o.castShadow = true); scene.add(g);
    windmills.push(blades);
  }
  if (t.type === 'cattle') {
    for (let i = 0; i < 40; i++) { const p = placeIn(t, 5, HEX_R * 0.72); tufts.push({ ...p, s: rr(0.5, 0.8), ry: rr(0, 6), green: true }); }
    for (let i = 0; i < 9; i++) cows.push(makeCow(t));
  }
  if (t.type === 'ember') {
    for (let i = 0; i < 18; i++) { const p = placeIn(t, 6, HEX_R * 0.7); blackRocks.push({ ...p, s: rr(1, 2.6), rx: rr(0, 3), ry: rr(0, 3) }); }
    for (let i = 0; i < 7; i++) { const p = placeIn(t, 6, HEX_R * 0.66); vents.push({ ...p, s: rr(0.8, 1.5), ry: rr(0, 6) }); }
  }
}
instanced(new THREE.CylinderGeometry(0.25, 0.4, 2, 5).translate(0, 1, 0), mat(0x5e3b22), trees);
instanced(new THREE.ConeGeometry(1.9, 5, 6).translate(0, 4.2, 0), mat(0xffffff), trees, it => it.g < 0.33 ? 0x2d5a2a : it.g < 0.66 ? 0x356b30 : 0x24482a);
instanced(new THREE.DodecahedronGeometry(1, 0), mat(0xa39d92), rocks);
instanced(new THREE.DodecahedronGeometry(1, 0), mat(0x2a2422), blackRocks);
instanced(new THREE.ConeGeometry(0.35, 1.4, 4).translate(0, 0.7, 0), mat(0xffffff), tufts, it => it.green ? 0x5f9a3a : 0xe8c35a);
instanced(new THREE.ConeGeometry(0.9, 1.6, 5).translate(0, 0.6, 0), mat(0xff6a1a, { emissive: 0xff4a00, emissiveIntensity: 1.2 }), vents);

function makeCow(t) {
  const g = new THREE.Group(), body = mat(pick([0x6b3f22, 0x8a5a33, 0xe9e2d4, 0x3b2a20]));
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.1), body); b.position.y = 1.2; g.add(b);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), body); h.position.set(1.35, 1.55, 0); g.add(h);
  const horn = mat(0xeeeadd);
  for (const s of [-1, 1]) { const hn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 4), horn); hn.position.set(1.4, 2.05, s * 0.35); hn.rotation.x = s * 0.6; g.add(hn); }
  const leg = new THREE.BoxGeometry(0.25, 0.7, 0.25), lm = mat(0x2b211a);
  for (const [lx, lz] of [[-0.8, -0.35], [-0.8, 0.35], [0.8, -0.35], [0.8, 0.35]]) { const l = new THREE.Mesh(leg, lm); l.position.set(lx, 0.35, lz); g.add(l); }
  g.traverse(o => o.castShadow = true);
  const p = placeIn(t, 6, HEX_R * 0.65); g.position.set(p.x, p.y, p.z); g.rotation.y = rr(0, 6); scene.add(g);
  return { g, t };
}

const lavaLight = new THREE.PointLight(0xff6a20, 400, 70, 2);
// the Cradle: lava pool, smoke, three dragon eggs (teaser)
{
  const lava = new THREE.Mesh(new THREE.CircleGeometry(5.5, 10), new THREE.MeshBasicMaterial({ color: 0xff5a10 }));
  lava.rotation.x = -Math.PI / 2; lava.position.set(0, heightAt(0, 0) + 1.0, 0); scene.add(lava);
  const glow = lavaLight; glow.intensity = 400; glow.position.set(0, heightAt(0, 0) + 4, 0); scene.add(glow);
  const sm = mat(0x6b625c, { transparent: true, opacity: 0.55 });
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(1.5, 3), 0), sm);
    s.userData.age = rr(0, 1); smoke.push(s); scene.add(s);
  }
}

// ---------------------------------------------------------------- number banners
function bannerTexture(num, icon) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 176;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff4dc'; g.beginPath(); g.roundRect(30, 2, 68, 50, 14); g.fill(); g.lineWidth = 6; g.strokeStyle = '#17110d'; g.stroke();
  g.font = '34px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(icon || '', 64, 29);
  g.fillStyle = '#efe0bd'; g.beginPath(); g.arc(64, 114, 56, 0, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.strokeStyle = '#17110d'; g.stroke();
  const red = num === 6 || num === 8;
  g.fillStyle = red ? '#b3261e' : '#2b1d12'; g.font = 'bold 60px Georgia';
  g.fillText(String(num), 64, 108);
  const pips = 6 - Math.abs(7 - num);
  for (let i = 0; i < pips; i++) { g.beginPath(); g.arc(64 + (i - (pips - 1) / 2) * 11, 150, 4, 0, Math.PI * 2); g.fill(); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
for (const t of tiles) {
  if (!t.num) continue;
  const y = heightAt(t.x, t.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7, 5), mat(0x5a3a1e)); pole.position.set(t.x, y + 3.5, t.z); pole.castShadow = true; scene.add(pole);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bannerTexture(t.num, RES[t.type].icon), fog: false, alphaTest: 0.5 }));
  sp.scale.set(5, 6.9, 1); sp.position.set(t.x, y + 10, t.z); scene.add(sp);
  t.banner = sp; t.pole = pole;
}

// comic caption textures for labels in the world
function labelTexture(text, bg = '#fff4dc', fg = '#17110d') {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 100; const g = cv.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(6, 6, 500, 88, 22); g.fill(); g.lineWidth = 7; g.strokeStyle = '#17110d'; g.stroke();
  g.fillStyle = fg; g.font = '44px Bangers, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 54);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// floating "+1 🌲" popups in the world
const floats = [];
function floatText(text, x, y, z, color = '#fff4dc') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const g = cv.getContext('2d');
  g.font = '64px Bangers, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 10; g.strokeStyle = '#17110d'; g.strokeText(text, 128, 50); g.fillStyle = color; g.fillText(text, 128, 50);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true }));
  s.scale.set(7, 2.6, 1); s.position.set(x, y, z); s.renderOrder = 10; scene.add(s);
  floats.push({ s, t: 0 });
}
function updateFloats(dt) {
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i]; f.t += dt; f.s.position.y += dt * 2.2; f.s.material.opacity = Math.min(1, 3 - f.t);
    if (f.t > 3) { scene.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); floats.splice(i, 1); }
  }
}
// show what every building you can see harvests
function harvestPopups(sum) {
  for (const t of tiles) {
    if (t.num !== sum || t === reaverTile || t.scorchedUntil >= state.harvests) continue;
    for (const cid of t.corners) {
      const c = corners[cid]; if (!c.building) continue;
      if (c.building.owner !== P && !c.tiles.some(id => visible.has(id))) continue;
      const n = (c.building.type === 'keep' ? 2 : 1) + (state.dawnBounty ? 1 : 0);
      floatText(`+${n} ${RES[t.type].icon}`, c.x + rr(-2, 2), c.y + (c.building.type === 'keep' ? 15 : 9), c.z + rr(-2, 2), c.building.owner === P ? '#ffe27a' : '#fff4dc');
    }
  }
}

// ---------------------------------------------------------------- reavers
const reavers = (() => {
  const g = new THREE.Group(), tent = mat(0x3a1a1a), tent2 = mat(0x5c1f1f);
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2, tn = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 5), i % 2 ? tent : tent2);
    tn.position.set(Math.cos(a) * 4.5, 1.5, Math.sin(a) * 4.5); g.add(tn);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8, 5), mat(0x222)); pole.position.y = 4; g.add(pole);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), mat(0x111111)); flag.position.set(1.2, 7, 0); g.add(flag);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 5), new THREE.MeshBasicMaterial({ color: 0xff7a20 })); fire.position.set(0, 0.7, 2.5); g.add(fire);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture('🏴 REAVERS · no harvest here', '#2a1010', '#ffd0c0'), depthWrite: false, transparent: true })); tag.scale.set(11, 2.2, 1); tag.position.y = 11; g.add(tag);
  g.traverse(o => o.castShadow = true); scene.add(g); return g;
})();
let reaverTile = tiles.find(t => t.type === 'cradle');
function placeReavers(t) {
  reaverTile = t;
  const x = t.x + 9, z = t.z + 5; reavers.position.set(x, heightAt(x, z), z);
}
placeReavers(reaverTile);

// ---------------------------------------------------------------- rune stones (dice in the sky)
function runeTexture(n) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = '#4b4a52'; g.beginPath(); g.roundRect(8, 8, 112, 112, 22); g.fill();
  g.strokeStyle = '#ffb347'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#ffcf7a'; g.shadowColor = '#ff7a00'; g.shadowBlur = 18; g.font = 'bold 70px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(n), 64, 68);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
const runeTex = [null, 1, 2, 3, 4, 5, 6].map(n => n && runeTexture(n));
const runes = [0, 1].map(i => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: runeTex[1], fog: false, transparent: true, alphaTest: 0.5 }));
  s.scale.set(9, 9, 1); s.position.set(i ? 6 : -6, 62, 0); s.visible = false; scene.add(s); return s;
});

// ---------------------------------------------------------------- buildings
for (const h of Object.values(HOUSES)) h.mat = mat(h.color);
let houseMat = HOUSE.mat;
const wallMat = mat(0xe6d8b8), woodMat = mat(0x6b4a2b), stoneMat = mat(0x9e978b), roadMat = mat(0x8a7356);
const M = {
  woodDark: mat(0x4e3420), woodLight: mat(0x8a6338), turf: mat(0x5f8f3a), thatch: mat(0xc9a557), slate: mat(0x4f5866),
  moss: mat(0x7d8a72), sand: mat(0xe3c995), white: mat(0xf0e8d8), plaster: wallMat, stone: stoneMat, iron: mat(0x2b2b2e),
};
// glowing bits that come alive at night
const windowMat = new THREE.MeshToonMaterial({ gradientMap: toonRamp, color: 0x2a1c10, emissive: 0xffa040, emissiveIntensity: 0 });
const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa530 });
const glowMat = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,190,90,1)'); gr.addColorStop(0.4, 'rgba(255,140,40,.45)'); gr.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 });
})();

// small builders: B = box resting on y, roof = triangular prism, cone/cyl helpers
function B(w, h, d, m, x = 0, y = 0, z = 0, ry = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); o.rotation.y = ry; return o; }
function roof(w, h, len, m, x = 0, y = 0, z = 0, ry = 0) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.rotation.y = ry; return o;
}
function cone(r, h, seg, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); o.position.set(x, y + h / 2, z); return o; }
function cyl(r1, r2, h, seg, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y + h / 2, z); return o; }
function dome(r, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), m); o.position.set(x, y, z); return o; }
function win(x, y, z, ry = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.1), windowMat); o.position.set(x, y, z); o.rotation.y = ry; return o; }
function torch(x, z, h = 2.2) {
  const g = new THREE.Group();
  g.add(cyl(0.08, 0.1, h, 4, M.woodDark));
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 5), flameMat); f.position.y = h + 0.25; g.add(f);
  const s = new THREE.Sprite(glowMat); s.scale.set(4.5, 4.5, 1); s.position.y = h + 0.3; g.add(s);
  g.position.set(x, 0, z); return g;
}
function flagPole(h) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 5), woodMat); p.position.y = h / 2; g.add(p);
  const f = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.08), houseMat); f.position.set(0.95, h - 0.7, 0); g.add(f);
  return g;
}
const STYLES = {
  // House Varn: Nordic longhouses with turf roofs; keep = great hall behind a palisade with a watchtower
  nordic: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(6, 2, 3, M.woodDark, -0.5, 0, 0.6, 0.35));
      const r = roof(3.9, 2.8, 6.6, houseMat, -0.5, 2, 0.6, 0.35 + Math.PI / 2); g.add(r);
      for (const sx of [-1, 1]) { const beam = B(0.25, 1.6, 0.2, houseMat, -0.5 + Math.cos(0.35) * sx * 3.3, 4.2, 0.6 - Math.sin(0.35) * sx * 3.3); beam.rotation.z = 0.5; g.add(beam); }
      g.add(win(-0.5 + Math.sin(0.35) * 1.55, 1.1, 0.6 + Math.cos(0.35) * 1.55, 0.35));
      g.add(B(2.4, 1.6, 2.4, M.woodLight, 2.6, 0, -2.0, -0.3)); g.add(roof(2.8, 1.6, 2.6, houseMat, 2.6, 1.6, -2.0, -0.3));
      g.add(torch(1.6, 2.4)); const f = flagPole(6.5); f.position.set(-3.2, 0, -1.6); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      for (let i = 0; i < 18; i++) {   // palisade with a gate gap
        const a = i / 18 * Math.PI * 2; if (Math.abs(a - Math.PI / 2) < 0.35) continue;
        const st = cyl(0.3, 0.3, 2.6, 5, M.woodDark, Math.cos(a) * 6.2, 0, Math.sin(a) * 6.2); g.add(st); g.add(cone(0.3, 0.6, 5, M.woodDark, Math.cos(a) * 6.2, 2.6, Math.sin(a) * 6.2));
      }
      g.add(B(7.5, 3, 4, M.woodDark, 0, 0, -0.8)); g.add(roof(5, 3.6, 8.2, houseMat, 0, 3, -0.8, Math.PI / 2));
      for (const x of [-2.4, 0, 2.4]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 8), houseMat); sh.rotation.x = Math.PI / 2; sh.position.set(x, 1.6, 1.25); g.add(sh); }
      g.add(win(-1.2, 1.4, 1.22)); g.add(win(1.2, 1.4, 1.22));
      // watchtower
      for (const [px, pz] of [[3.4, 2.2], [4.8, 2.2], [3.4, 3.6], [4.8, 3.6]]) g.add(cyl(0.15, 0.15, 7, 4, M.woodLight, px, 0, pz));
      g.add(B(2.2, 0.3, 2.2, M.woodLight, 4.1, 7, 2.9)); g.add(cone(1.9, 2.2, 4, houseMat, 4.1, 7.3, 2.9));
      g.add(torch(-1.2, 4.6)); g.add(torch(1.2, 4.6));
      const f = flagPole(5); f.position.set(0, 6.4, -0.8); g.add(f);
      return g;
    },
  },
  // House Calder: grey stone & slate; keep = square tower with four round corner turrets
  stone: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(3.2, 2.4, 3.4, M.stone, -1.6, 0, 1, 0.4)); g.add(roof(3.6, 2, 3.8, houseMat, -1.6, 2.4, 1, 0.4 + Math.PI / 2));
      g.add(B(0.6, 1.4, 0.6, M.stone, -0.9, 3.2, 0.3)); g.add(win(-1.6 + Math.sin(0.4) * 1.72, 1.2, 1 + Math.cos(0.4) * 1.72, 0.4));
      g.add(B(2.6, 2.1, 2.8, M.stone, 2, 0, -1.2, -0.6)); g.add(roof(3, 1.6, 3.2, houseMat, 2, 2.1, -1.2, -0.6 + Math.PI / 2));
      g.add(torch(0.4, 2.8)); const f = flagPole(6.5); f.position.set(0.5, 0, -2.8); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(B(6, 9, 6, M.stone));
      for (let i = 0; i < 4; i++) for (let k = -1; k <= 1; k++) {
        const side = i % 2 ? [k * 2, 2.9] : [2.9, k * 2], sx = i < 2 ? 1 : -1;
        g.add(B(0.8, 0.9, 0.8, M.stone, side[0] * sx, 9, side[1] * sx));
      }
      for (const [x, z] of [[3, 3], [-3, 3], [3, -3], [-3, -3]]) { g.add(cyl(1.2, 1.3, 11, 8, M.stone, x, 0, z)); g.add(cone(1.5, 2.6, 8, houseMat, x, 11, z)); }
      for (const y of [3, 6]) { g.add(win(-1.2, y, 3.05)); g.add(win(1.2, y, 3.05)); }
      g.add(B(1.6, 2.4, 0.2, M.woodDark, 0, 0, 3.05));
      g.add(torch(-1.6, 4.4)); g.add(torch(1.6, 4.4));
      const f = flagPole(5); f.position.set(0, 9, 0); g.add(f);
      return g;
    },
  },
  // House Morrow: fen-folk stilt huts; keep = mossy round tower with a balcony
  fen: {
    hamlet() {
      const g = new THREE.Group();
      for (const [x, z, s] of [[-1.8, 1.2, 1], [2, -0.6, 0.85], [-0.4, -2.4, 0.75]]) {
        const h = new THREE.Group();
        for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) h.add(cyl(0.12, 0.12, 1, 4, M.woodDark, px, 0, pz));
        h.add(cyl(1.5, 1.5, 0.2, 8, M.woodLight, 0, 1, 0)); h.add(cyl(1.3, 1.4, 1.7, 8, M.plaster, 0, 1.2, 0));
        h.add(cone(2, 2.2, 8, houseMat, 0, 2.9, 0)); h.add(win(0, 2, 1.36));
        h.position.set(x, 0, z); h.scale.setScalar(s); g.add(h);
      }
      g.add(torch(0.6, 2.6)); const f = flagPole(6.5); f.position.set(3, 0, 2); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(cyl(2.4, 3, 11, 9, M.moss));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.25, 4, 18), M.woodLight); ring.rotation.x = Math.PI / 2; ring.position.y = 8; g.add(ring);
      g.add(cone(3.2, 4.2, 9, houseMat, 0, 11, 0));
      for (const y of [3, 6, 9]) g.add(win(0, y, 2.55 - y * 0.03));
      for (const [x, z] of [[4.3, 1.5], [-4, -1.8]]) { g.add(cyl(1.2, 1.3, 1.6, 8, M.plaster, x, 0, z)); g.add(cone(1.7, 1.8, 8, houseMat, x, 1.6, z)); }
      g.add(torch(-1.4, 3.8)); g.add(torch(1.6, 3.6));
      const f = flagPole(4); f.position.set(0, 14.5, 0); g.add(f);
      return g;
    },
  },
  // House Ashby: sunstone houses with domes; keep = citadel with a great golden dome and slender towers
  sun: {
    hamlet() {
      const g = new THREE.Group();
      g.add(B(3, 2.4, 3, M.sand, -1.4, 0, 0.8, 0.3)); g.add(B(2, 1.4, 2, M.sand, -1.6, 2.4, 0.6, 0.3)); g.add(dome(0.9, houseMat, -1.6, 3.8, 0.6));
      g.add(win(-1.4 + Math.sin(0.3) * 1.52, 1.2, 0.8 + Math.cos(0.3) * 1.52, 0.3));
      g.add(B(2.6, 2, 2.6, M.white, 2, 0, -1.3, -0.4)); g.add(dome(1.2, houseMat, 2, 2, -1.3));
      const aw = B(2, 0.1, 1.2, houseMat, -0.9, 2.1, 2.6, 0.3); aw.rotation.x = -0.25; g.add(aw);
      g.add(torch(1.2, 2.6)); const f = flagPole(6.5); f.position.set(3.2, 0, 1.6); g.add(f);
      return g;
    },
    keep() {
      const g = new THREE.Group();
      g.add(B(8, 4, 8, M.sand)); g.add(B(5, 4, 5, M.white, 0, 4, 0)); g.add(dome(2.6, houseMat, 0, 8, 0));
      g.add(cone(0.25, 1.2, 6, houseMat, 0, 10.4, 0));
      for (const [x, z] of [[3.6, 3.6], [-3.6, -3.6]]) { g.add(cyl(0.6, 0.75, 12, 8, M.white, x, 0, z)); g.add(dome(0.85, houseMat, x, 12, z)); }
      for (const x of [-2.2, 0, 2.2]) g.add(win(x, 2.4, 4.05));
      g.add(torch(-1.4, 5.2)); g.add(torch(1.4, 5.2));
      return g;
    },
  },
};
function withHouse(h, fn) { const prev = houseMat; houseMat = h.mat; try { return fn(); } finally { houseMat = prev; } }
const makeHamlet = (h = HOUSE) => withHouse(h, () => STYLES[h.style].hamlet());
const makeKeep = (h = HOUSE) => withHouse(h, () => STYLES[h.style].keep());
// Walls in the style of the Great Wall: a stone wall with battlements on both edges, a walkway
// on top in the house colour, and a small watchtower at each end. (Internally they are still "roads".)
const WALL_H = 2.6, WALL_TRIM = 4.5, GATE_HALF = 2.2;   // a gate in the middle of every wall
const wallGates = [];   // { e, pivots: [left, right], open }
const boxAt = (...args) => B(...args);   // (inside makeRoad, B is a corner)
const wallStone = mat(0xb8ab94), _wm = new THREE.Matrix4(), _wt = new THREE.Matrix4(), _wo = new THREE.Object3D();
function mergeGeos(parts) {
  const pos = [], nor = [];
  for (const { geo, m } of parts) {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
const WG = { body: new THREE.BoxGeometry(2.4, 1, 1), merlon: new THREE.BoxGeometry(0.42, 0.6, 0.7), walk: new THREE.BoxGeometry(0.7, 0.08, 1),
  tower: new THREE.BoxGeometry(3.4, 1, 3.4), roof: new THREE.ConeGeometry(2.7, 2.2, 4).rotateY(Math.PI / 4) };
function makeRoad(e, h = HOUSE) {
  const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), N = 6;
  const stone = [], colour = [];
  const at = (t) => { const x = A.x + dx * t, z = A.z + dz * t; return { x, y: heightAt(x, z), z }; };
  // two runs of wall with the gate between them
  const runs = [[WALL_TRIM, L / 2 - GATE_HALF - 0.6], [L / 2 + GATE_HALF + 0.6, L - WALL_TRIM]], segs = [];
  for (const [a, b] of runs) for (let i = 0; i < 3; i++) segs.push([(a + (b - a) * i / 3) / L, (a + (b - a) * (i + 1) / 3) / L]);
  for (const [t0, t1] of segs) {
    const p0 = at(t0), p1 = at(t1), len = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z) + 0.2;
    // segment frame: centred on the wall's mid-height, facing along the wall
    _wo.position.set((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + WALL_H / 2 - 0.4, (p0.z + p1.z) / 2);
    _wo.lookAt(p1.x, p1.y + WALL_H / 2 - 0.4, p1.z); _wo.scale.set(1, 1, 1); _wo.updateMatrix(); _wm.copy(_wo.matrix);
    stone.push({ geo: WG.body, m: _wm.clone().multiply(_wt.makeScale(1, WALL_H + 0.8, len)) });
    for (const side of [-1.0, 1.0]) for (const k of [-0.33, 0, 0.33])   // battlements
      stone.push({ geo: WG.merlon, m: _wm.clone().multiply(_wt.makeTranslation(side, WALL_H / 2 + 0.7, k * len)) });
    colour.push({ geo: WG.walk, m: _wm.clone().multiply(_wt.makeTranslation(0, WALL_H / 2 + 0.44, 0)).multiply(new THREE.Matrix4().makeScale(1, 1, len * 0.85)) });
  }
  for (const t of [WALL_TRIM / L, 1 - WALL_TRIM / L]) {   // watchtowers at both ends
    const p = at(t), th = WALL_H + 2.4;
    stone.push({ geo: WG.tower, m: new THREE.Matrix4().makeTranslation(p.x, p.y + th / 2 - 0.4, p.z).multiply(new THREE.Matrix4().makeScale(1, th, 1)) });
    colour.push({ geo: WG.roof, m: new THREE.Matrix4().makeTranslation(p.x, p.y + th - 0.4 + 1.1, p.z) });
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(mergeGeos(stone), wallStone));
  g.add(new THREE.Mesh(mergeGeos(colour), h.mat));
  // the gate: two pillars, a lintel with a banner, and wooden doors in the house colour that swing open for their owner
  const G = at(0.5), gate = new THREE.Group(); gate.position.set(G.x, G.y - 0.3, G.z); gate.rotation.y = Math.atan2(dx, dz);
  for (const sd of [-1, 1]) gate.add(boxAt(2.8, WALL_H + 1.5, 1.2, wallStone, 0, 0, sd * (GATE_HALF + 0.6)));
  gate.add(boxAt(2.8, 0.8, GATE_HALF * 2 + 2.4, wallStone, 0, WALL_H + 0.7, 0));
  gate.add(boxAt(0.12, 0.9, 2.4, h.mat, 1.45, WALL_H + 0.65, 0)); gate.add(boxAt(0.12, 0.9, 2.4, h.mat, -1.45, WALL_H + 0.65, 0));
  const pivots = [-1, 1].map(sd => {
    const pv = new THREE.Group(); pv.position.set(0, 0, sd * GATE_HALF); gate.add(pv);
    const leaf = boxAt(0.28, WALL_H + 0.3, GATE_HALF, h.mat, 0, 0, -sd * GATE_HALF / 2); pv.add(leaf);
    pv.add(boxAt(0.32, 0.18, GATE_HALF * 0.9, M.iron, 0, 0.8, -sd * GATE_HALF / 2)); pv.add(boxAt(0.32, 0.18, GATE_HALF * 0.9, M.iron, 0, WALL_H - 0.6, -sd * GATE_HALF / 2));
    return pv;
  });
  g.add(gate); g.userData.gate = { pivots, pos: { x: G.x, z: G.z } };
  g.traverse(o => { o.castShadow = true; o.receiveShadow = true; });
  return g;
}
// Walls protect their owner: no rival lord can cross them (or walk into them). Only the owner crosses.
function distSeg(x, z, A, B) {
  const dx = B.x - A.x, dz = B.z - A.z, t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(A.x + dx * t - x, A.z + dz * t - z);
}
function crosses(x0, z0, x1, z1, A, B) {
  const s = (ax, az, bx, bz, cx, cz) => (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
  const d1 = s(A.x, A.z, B.x, B.z, x0, z0), d2 = s(A.x, A.z, B.x, B.z, x1, z1), d3 = s(x0, z0, x1, z1, A.x, A.z), d4 = s(x0, z0, x1, z1, B.x, B.z);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
// the rival wall (if any) that stops `pid` moving from (x0,z0) to (x1,z1)
// where along the wall (0..1) is the point closest to (x,z)?
function wallT(e, x, z) { const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z; return ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz); }
function inGate(e, x, z) { const A = corners[e.a], B = corners[e.b], L = Math.hypot(B.x - A.x, B.z - A.z); return Math.abs(wallT(e, x, z) - 0.5) * L < GATE_HALF - 0.5; }
// where the owner may pass their own wall: the gate, or right beside their own settlement at either end
function ownerPass(e, x, z) {
  const A = corners[e.a], B = corners[e.b], L = Math.hypot(B.x - A.x, B.z - A.z), t = wallT(e, x, z);
  return inGate(e, x, z) || t * L < WALL_TRIM + 1 || (1 - t) * L < WALL_TRIM + 1;
}
const tollPasses = {};   // "pid:edgeId" -> time (duelClock) until which the gate lets them through
const TOLL_TIME = 12;
const hasPass = (pid, e) => (tollPasses[`${pid}:${e.id}`] || 0) > duelClock;
function wallBlocks(pid, x0, z0, x1, z1, crossOnly = false) {
  for (const e of edges) {
    if (e.road === null || (crossOnly && e.road === pid)) continue;
    const own = e.road === pid || (!crossOnly && hasPass(pid, e)), A = corners[e.a], B = corners[e.b];
    const ownWall = e.road === pid;
    if (crosses(x0, z0, x1, z1, A, B)) { const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; if (ownWall ? ownerPass(e, mx, mz) : own && inGate(e, mx, mz)) continue; return e; }   // owners: gate or beside their settlement; toll payers: gate
    if (crossOnly) continue;
    const dn = distSeg(x1, z1, A, B);
    if (dn < 1.5 && dn < distSeg(x0, z0, A, B) && !(ownWall ? ownerPass(e, x1, z1) : own && inGate(e, x1, z1))) return e;   // can't walk into the wall itself
  }
  return null;
}
// pay the gate's owner 1 resource (from your largest stock) to pass through
function payToll(pid, e) {
  const p = players[pid], owner = e.road;
  const k = RES_KEYS.slice().sort((a, b) => p.res[b] - p.res[a])[0];
  if (!k || p.res[k] < 1) return false;
  p.res[k]--; players[owner].res[k]++;
  tollPasses[`${pid}:${e.id}`] = duelClock + TOLL_TIME;
  tell(pid, { log: `🚪 You pay ${nameOf(owner)} 1 ${RES[k].icon} to pass their gate`, flash: [k], loss: true, sfx: 'build' });
  tell(owner, { log: `🚪 ${nameOf(pid)} pays you 1 ${RES[k].icon} toll to pass your gate`, flash: [k], sfx: 'build' });
  updateHUD();
  return true;
}
// the nearest rival gate you are standing at (within 7 m)
function rivalGateNear(x, z) {
  let best = null, bd = 7;
  for (const g of wallGates) if (g.e.road !== P) { const d = Math.hypot(g.pos.x - x, g.pos.z - z); if (d < bd) { bd = d; best = g; } }
  return best;
}
let tollGate = null;
function updateToll() {
  let g = state.phase === 'play' && !state.riding && !duel ? rivalGateNear(player.pos.x, player.pos.z) : null;
  const pt = player.pendingToll && wallGates.find(w => w.e === player.pendingToll.e);   // the gate you walked to, first
  if (g && pt && Math.hypot(pt.pos.x - player.pos.x, pt.pos.z - player.pos.z) < 7) g = pt;
  const show = g && !hasPass(P, g.e);
  if ((show ? g : null) !== tollGate) {
    tollGate = show ? g : null; $('tollBtn').classList.toggle('hidden', !tollGate);
    if (tollGate) $('tollBtn').innerHTML = `🚪 Pay 1 to pass ${players[tollGate.e.road].house.sigil} ${players[tollGate.e.road].house.name.replace('House ', '')}'s gate <span class="muted">(${resTotal(P) ? 'from your largest stock' : 'you have nothing to pay'})</span>`;
  }
}
function tryToll() {
  if (!tollGate) return;
  const e = tollGate.e;
  if (resTotal(P) < 1) { log('⚠️ You have nothing to pay the toll'); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'toll', e: e.id }); tollPasses[`${P}:${e.id}`] = duelClock + TOLL_TIME; }
  else payToll(P, e);
  if (player.pendingToll && player.pendingToll.e === e) {   // carry on through the gate
    const t = player.pendingToll; player.pendingToll = null;
    player.via = [t.far, t.target]; player.autoTarget = t.far;
  }
  tollGate = null; $('tollBtn').classList.add('hidden');
}

function registerGate(o, e) { if (o.userData.gate) wallGates.push({ e, ...o.userData.gate, open: 0 }); }
// gate points on both sides of a wall: walk to `near`, then through to `far`
function gatePath(e, fromX, fromZ) {
  const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz);
  const gx = (A.x + B.x) / 2, gz = (A.z + B.z) / 2, nx = -dz / L, nz = dx / L;
  const side = Math.sign((fromX - gx) * nx + (fromZ - gz) * nz) || 1;
  return [{ x: gx + nx * side * 3.5, z: gz + nz * side * 3.5 }, { x: gx - nx * side * 3.5, z: gz - nz * side * 3.5 }];
}
// doors swing open when their owner comes near
function updateGates(dt) {
  for (const g of wallGates) {
    const o = g.e.road, op = lordAt(o);
    const payer = players.find(q => hasPass(q.id, g.e) && lordAt(q.id) && Math.hypot(lordAt(q.id).x - g.pos.x, lordAt(q.id).z - g.pos.z) < 9);
    const want = (op && Math.hypot(op.x - g.pos.x, op.z - g.pos.z) < 9) || payer ? 1 : 0;
    g.open += (want - g.open) * Math.min(1, dt * 4);
    g.pivots[0].rotation.y = g.open * 1.35; g.pivots[1].rotation.y = -g.open * 1.35;
  }
}
let wallMsgT = 0;
function blockedByWall(e) {
  player.autoTarget = null; player.via = null; destMarker.visible = false;
  if (performance.now() > wallMsgT) { wallMsgT = performance.now() + 4000; log(e.road === P ? '🚪 Your wall: cross it through its gate (in the middle)' : `🧱 ${nameOf(e.road)}'s wall blocks your way: walk around it`); }
}
// AI lords look for a way around: past the nearer open end of the wall; if the wall line is closed, they give up
function aiDetour(p, e, target) {
  p.detours = (p.detours || 0) + 1;
  if (p.detours > 4) { p.task = null; p.wander = null; p.detour = null; p.detourQ = null; p.tollE = null; p.wait = rr(2, 5); p.detours = 0; return; }   // stuck: try something else
  if (e.road === p.id) { const [near, far] = gatePath(e, p.pos.x, p.pos.z); p.detourQ = [far]; p.detour = near; return; }   // own wall: use the gate
  const A = corners[e.a], B = corners[e.b];
  const fenceGoesOn = c => c.edges.some(id => id !== e.id && edges[id].road === e.road);
  if (resTotal(p.id) > 0 && (rand() < 0.4 || [A, B].every(fenceGoesOn))) {   // pay at the gate instead of walking around
    const [near, far] = gatePath(e, p.pos.x, p.pos.z); p.detour = near; p.detourQ = [far]; p.tollE = e.id; return;
  }
  const ends = [[A, B], [B, A]].filter(([c]) => !fenceGoesOn(c))
    .sort((u, v) => Math.hypot(u[0].x - target.x, u[0].z - target.z) - Math.hypot(v[0].x - target.x, v[0].z - target.z));
  if (!ends.length) { p.task = null; p.wander = null; p.detour = null; p.wait = rr(2, 5); p.detours = 0; return; }
  const [c, o] = ends[0], L = Math.hypot(c.x - o.x, c.z - o.z) || 1;
  p.detour = { x: c.x + (c.x - o.x) / L * 7, z: c.z + (c.z - o.z) / L * 7 };
}

// you can walk along the top of any wall, like the Great Wall
function walkHeight(x, z) {
  const base = heightAt(x, z);
  for (const e of edges) {
    if (e.road === null) continue;
    const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, L2 = dx * dx + dz * dz, L = Math.sqrt(L2);
    const t = ((x - A.x) * dx + (z - A.z) * dz) / L2;
    if (t < WALL_TRIM / L || t > 1 - WALL_TRIM / L) continue;
    if (Math.hypot(A.x + dx * t - x, A.z + dz * t - z) < 1.3 && Math.abs(t - 0.5) * L > GATE_HALF) return base + WALL_H + 0.4;
  }
  return base;
}
function ghostify(g, color) {
  const gm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false });
  g.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; } if (o.isSprite) o.visible = false; });
  g.userData.gm = gm; return g;
}
function placeAtCorner(obj, c) { obj.position.set(c.x, c.y, c.z); obj.rotation.y = Math.atan2(c.x, c.z); }

// ---------------------------------------------------------------- game state
const state = {
  phase: 'title',            // title | setup | play | won
  setupStep: 0,              // your landing steps: 0 hamlet, 1 road, 2 hamlet, 3 road
  setupCorner: null,
  setupQueue: [], setupTurn: 0,
  order: [], hornIdx: -1,    // turn order (snake for landing) and who holds the Harvest Horn
  res: { timber: 0, stone: 0, wheat: 0, cattle: 0, ember: 0 },
  built: { road: 0, hamlet: 0, keep: 0, roost: 0, tower: 0 },
  mode: null,                // 'road' | 'hamlet' | 'keep'
  harvestT: HARVEST_MAX,
  harvestLen: HARVEST_MAX,
  rolling: 0,
  lastRoll: null,
  longest: 0,
  highwayHolder: null,
  recallCD: 0,
  recallIdx: 0,
  startTime: 0,
  harvests: 0,
  paused: false,
  reaverPick: false,
  dragonEye: false,          // Milestone 3: a grown dragon reveals the whole map
};
const players = [];          // players[0] is you; the rest are AI houses
const explored = new Set(), visible = new Set();
const SIGHT = 48;            // how far you can see on foot (tile centres within this radius)
const buildingObjs = new Map();   // corner id -> Object3D
const PL = pid => players[pid] || { res: state.res, built: state.built };
const nameOf = pid => { const p = players[pid]; return `${p.house.sigil} ${!p.ai && p.name ? `${p.name} of ${p.house.name.replace('House ', '')}` : p.house.name}`; };

// ---------------------------------------------------------------- rules (pid = which house; defaults to you)
const owns = (c, pid = P) => !!c.building && c.building.owner === pid;
function hamletProblem(c, pid = P) {
  if (c.building) return 'This corner is already claimed';
  if (c.adj.some(id => corners[id].building)) return 'Too close to another settlement';
  if (state.phase === 'play' && !c.edges.some(id => edges[id].road === pid)) return 'Must connect to one of your walls';
  return null;
}
function roadProblem(e, pid = P) {
  if (e.road !== null) return 'A wall already stands here';
  if (state.phase === 'setup') { const sc = PL(pid).setupCorner; return (sc != null && (e.a === sc || e.b === sc)) ? null : 'Must start at your new Hamlet'; }
  for (const cid of [e.a, e.b]) {
    const c = corners[cid];
    if (owns(c, pid)) return null;
    if (!c.building && c.edges.some(id => id !== e.id && edges[id].road === pid)) return null;
  }
  return 'Must connect to your walls or Hamlets';
}
function keepProblem(c, pid = P) {
  if (!owns(c, pid)) return 'Upgrade one of your own Hamlets';
  if (c.building.type === 'keep') return 'Already a Keep';
  return null;
}
function roostProblem(c, pid = P) {
  if (!owns(c, pid) || c.building.type !== 'keep') return 'A Dragon Roost must stand beside one of your Keeps';
  if (c.roost != null) return 'There is already a Roost here';
  return null;
}
function towerProblem(c, pid = P) {
  if (!owns(c, pid)) return 'Scorpion Towers stand beside your own Hamlets or Keeps';
  if (c.tower != null) return 'There is already a Scorpion Tower here';
  return null;
}
function missing(kind, pid = P) {
  if (state.phase === 'setup') return [];
  if (kind === 'road' && PL(pid).freeRoads > 0) return [];
  const res = PL(pid).res, out = [];
  for (const [k, n] of Object.entries(COST[kind])) if (res[k] < n) out.push(`${n - res[k]} ${RES[k].name}`);
  return out;
}
function limitHit(kind, pid = P) { return PL(pid).built[kind] >= LIMITS[kind]; }
function pay(kind, pid = P) {
  if (state.phase === 'setup') return;
  if (kind === 'road' && PL(pid).freeRoads > 0) { PL(pid).freeRoads--; return; }
  for (const [k, n] of Object.entries(COST[kind])) PL(pid).res[k] -= n; }
const resTotal = pid => RES_KEYS.reduce((s, k) => s + PL(pid).res[k], 0);

const secretOf = pid => (players[pid]?.scrolls || []).filter(c => c.type === 'renown').length;
const totalRenown = pid => renown(pid) + secretOf(pid);   // what counts for victory
function renown(pid = P) {   // public renown (Renown Scrolls stay secret)
  let r = 0;
  for (const c of corners) if (owns(c, pid)) r += c.building.type === 'keep' ? 2 : 1;
  if (state.highwayHolder === pid) r += 2;
  if (state.hostHolder === pid) r += 2;
  r += dragonRenown(pid);
  return r;
}
function longestRoad(pid = P) {
  const mine = edges.filter(e => e.road === pid);
  let best = 0;
  const used = new Set();
  function dfs(cid, len) {
    best = Math.max(best, len);
    const c = corners[cid];
    if (c.building && c.building.owner !== pid && len > 0) return;   // a rival's settlement cuts your road
    for (const eid of c.edges) {
      const e = edges[eid];
      if (e.road !== pid || used.has(eid)) continue;
      used.add(eid); dfs(e.a === cid ? e.b : e.a, len + 1); used.delete(eid);
    }
  }
  for (const e of mine) { dfs(e.a, 0); dfs(e.b, 0); }
  return best;
}
// The Great Wall: first to 5 connected roads; taken by anyone who builds a strictly longer one
function updateHighway() {
  players.forEach(p => p.longest = longestRoad(p.id));
  state.longest = players[P] ? players[P].longest : 0;
  const h = state.highwayHolder;
  let best = h, bestLen = h === null ? 4 : players[h].longest;
  for (const p of players) if (p.longest > bestLen) { best = p.id; bestLen = p.longest; }
  if (h !== null && players[h].longest < 5 && best === h) {   // holder's road was cut below 5
    const others = players.filter(p => p.longest >= 5).sort((a, b) => b.longest - a.longest);
    best = others.length ? others[0].id : null;
  }
  if (best !== h) {
    state.highwayHolder = best;
    if (best === P) { announce('THE GREAT WALL', 'Your walls are the longest in Embervale. +2 Renown'); log('🧱 You hold the Great Wall (+2★)'); }
    else if (best !== null) { announce('GREAT WALL SEIZED!', `${nameOf(best)} now holds the Great Wall (+2★)`); log(`🧱 ${nameOf(best)} takes the Great Wall`); }
  }
}

// ---------------------------------------------------------------- actions
function buildHamlet(c, pid = P) {
  c.building = { owner: pid, type: 'hamlet' };
  const o = makeHamlet(players[pid]?.house || HOUSE); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o);
  buildingObjs.set(c.id, o); PL(pid).built.hamlet++;
  popIn(o); if (players.length) updateHighway();
}
function buildKeep(c, pid = P) {
  scene.remove(buildingObjs.get(c.id));
  c.building.type = 'keep';
  const o = makeKeep(players[pid]?.house || HOUSE); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o);
  buildingObjs.set(c.id, o); PL(pid).built.keep++; PL(pid).built.hamlet--;
  popIn(o);
}
function buildRoad(e, pid = P) {
  e.road = pid; const o = makeRoad(e, players[pid]?.house || HOUSE); scene.add(o); PL(pid).built.road++; registerGate(o, e);
  popIn(o);
  if (players.length) updateHighway();
}
const pops = [];
function popIn(o) { o.scale.setScalar(0.01); pops.push({ o, t: 0 }); }

function tryBuild(tgt = currentTarget) {
  if (!tgt) return;
  if (state.phase === 'setup' && !myLandingTurn()) return;   // wait for your turn on the war table
  const kind = tgt.kind || state.mode;
  if (!kind || (kind === 'road') !== !!tgt.e) return;
  tgt.problem = problemFor(kind, tgt);
  if (tgt.problem) { log('⚠️ ' + tgt.problem); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'build', kind, c: tgt.c?.id, e: tgt.e?.id }); sfx('build'); currentTarget = null; return; }
  pay(kind);
  if (kind === 'hamlet') buildHamlet(tgt.c);
  else if (kind === 'keep') buildKeep(tgt.c);
  else if (kind === 'roost') buildRoost(tgt.c);
  else if (kind === 'tower') buildTower(tgt.c);
  else buildRoad(tgt.e);
  sfx('build');
  if (state.phase === 'setup') advanceSetup(tgt);
  else {
    log({ road: '🧱 Wall built', hamlet: '🏘️ Hamlet founded (+1★)', keep: '🏰 Keep raised (+1★)', roost: '🐉 Dragon Roost built: now fetch an egg from the Cradle (the volcano)', tower: '🏹 Scorpion Tower built: dragons cannot scorch the regions around it' }[kind]);
    if (kind === 'roost') announce('THE ROOST IS READY', 'Walk to the Cradle (the volcano), press E at an egg, and carry it home');
    if (state.mode && (!canAfford(state.mode) || limitHit(state.mode))) setMode(null);
    state.builtInPlay = true; updateObjective();
  }
  refreshMarkers(); updateHUD(); checkWin();
}
function problemFor(kind, tgt, pid = P) {
  let p = kind === 'road' ? roadProblem(tgt.e, pid) : kind === 'hamlet' ? hamletProblem(tgt.c, pid) : kind === 'roost' ? roostProblem(tgt.c, pid) : kind === 'tower' ? towerProblem(tgt.c, pid) : keepProblem(tgt.c, pid);
  if (!p && limitHit(kind, pid)) p = `No ${kind === 'road' ? 'wall' : kind}s left in your supply`;
  if (!p) { const m = missing(kind, pid); if (m.length) p = 'Need ' + m.join(', '); }
  return p;
}
function canAfford(kind, pid = P) { return missing(kind, pid).length === 0; }

// ---------------------------------------------------------------- landing (snake order on the war table)
const setupPid = () => state.setupQueue[state.setupTurn];
const myLandingTurn = () => state.phase === 'setup' && setupPid() === P;
function beginSetup() {
  cradleEggs.forEach((e, i) => { if (i >= players.length) { e.taken = true; e.mesh.visible = false; } });   // one egg per house
  state.order = shuffle(players.map(p => p.id));
  state.setupQueue = [...state.order, ...state.order.slice().reverse()];
  state.setupTurn = 0; players.forEach(p => { p.setupStep = 0; p.setupCorner = null; });
  log('📜 Landing order: ' + state.order.map(id => players[id].house.sigil).join(' → ') + ' then back again');
  nextSetupTurn();
}
function nextSetupTurn() {
  if (state.setupTurn >= state.setupQueue.length) return finishSetup();
  const pid = setupPid();
  if (players[pid].ai) {
    state.mode = null; refreshMarkers(); updateObjective();
    setTimeout(() => { if (state.phase !== 'setup') return; aiSetupPlace(pid); sfx('build'); state.setupTurn++; nextSetupTurn(); }, 1300);
  } else if (pid === P) { setMode('hamlet'); updateObjective(); }
  else { state.mode = null; refreshMarkers(); updateObjective(); }   // a friend's turn: wait for their click
}
function grantStart(pid, c) {
  const got = [];
  for (const tid of c.tiles) { const t = tiles[tid]; if (RES[t.type]) { players[pid].res[t.type]++; got.push(RES[t.type].icon); } }
  return got;
}
function advanceSetup(tgt, pid = P) {
  const p = players[pid];
  p.setupStep++;
  if (p.setupStep % 2 === 1) { p.setupCorner = tgt.c.id; if (pid === P) setMode('road'); }
  else {
    if (p.setupStep === 4) { const got = grantStart(pid, corners[p.setupCorner]); if (pid === P) state.startGot = got; else tell(pid, { startGot: got }); }
    p.setupCorner = null; if (pid === P) state.mode = null; state.setupTurn++; nextSetupTurn();
  }
  updateObjective();
}
function finishSetup() {
  state.phase = 'play'; setMode(null);
  state.harvestT = state.harvestLen = 8;    // a quick first harvest to get going
  const got = state.startGot || [];
  announce('THE HOUSES HAVE LANDED', got.length ? 'Your starting supplies: ' + got.join(' ') : 'Let the harvests begin');
  log('🎺 Landing complete. The mist rolls in… explore to reveal the isles.');
  endLanding(); spawnAvatars(); updateHUD(); updateObjective();
  if (NET.host) wsSend({ t: 'close' });
}

function setMode(m) {
  if (m && state.phase === 'setup') m = myLandingTurn() ? ((players[P]?.setupStep || 0) % 2 === 0 ? 'hamlet' : 'road') : null;
  state.mode = m; currentTarget = null; refreshMarkers(); updateHUD();
}

// ---------------------------------------------------------------- harvest
const hornBearer = () => state.order[((state.hornIdx % state.order.length) + state.order.length) % state.order.length];
function startHarvest() {
  state.harvests++; state.hornIdx++; state.rollsLeft = ROLLS_PER_HARVEST;
  dragonsOnHarvest();
  sfx('horn'); updateHUD(); startRoll();
}
function startRoll() {
  clearTimeout(state.runeHide);
  state.rolling = 1.8; state.rollNo = ROLLS_PER_HARVEST - state.rollsLeft + 1;
  runes.forEach(r => r.visible = true);
}
function resolveHarvest() {
  const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6), sum = d1 + d2;
  runes[0].material.map = runeTex[d1]; runes[1].material.map = runeTex[d2];
  runes.forEach(r => { r.material.rotation = 0; r.material.needsUpdate = true; });
  state.lastRoll = sum; state.rollSeq = (state.rollSeq || 0) + 1; state.dice = [d1, d2];
  clearTimeout(state.runeHide); state.runeHide = setTimeout(() => runes.forEach(r => r.visible = false), 2600);
  if (sum === 7) return reaverRaid();
  const gain = {};
  for (const t of tiles) {
    if (t.num !== sum) continue;
    pulse.push({ s: t.banner, t: 0 });
    if (t === reaverTile) { if (t.corners.some(cid => owns(corners[cid]))) log(`🏴 Reavers block ${BIOME[t.type].name} (${sum})`); continue; }
    if (t.scorchedUntil >= state.harvests) { if (t.corners.some(cid => owns(corners[cid]))) log(`🔥 ${BIOME[t.type].name} (${sum}) is scorched and yields nothing`); continue; }
    for (const cid of t.corners) {
      const c = corners[cid]; if (!c.building) continue;
      const n = (c.building.type === 'keep' ? 2 : 1) + (state.dawnBounty ? 1 : 0);   // dawn bounty
      players[c.building.owner].res[t.type] += n;
      if (c.building.owner === P) gain[t.type] = (gain[t.type] || 0) + n;
    }
  }
  harvestPopups(sum);
  if (state.dawnBounty) log('🌅 Dawn bounty: +1 for every producing Hamlet and Keep');
  const parts = Object.entries(gain).map(([k, n]) => { flashRes(k); return `+${n} ${RES[k].icon}`; });
  announce(`HARVEST ${state.rollNo || 1}/${ROLLS_PER_HARVEST} · ${sum}`, parts.length ? parts.join('  ') : 'Your lands yield nothing this time');
  log(`🎲 Rune Stones show ${d1} + ${d2} = ${sum}` + (parts.length ? ' → ' + parts.join(' ') : ''));
  updateHUD(); refreshMarkers();
}
function loseHalf(pid) {
  const res = players[pid].res, total = resTotal(pid);
  if (total <= 7) return null;
  let lose = Math.floor(total / 2); const lost = {};
  while (lose > 0) {   // lose from the largest stockpile first
    const k = RES_KEYS.slice().sort((a, b) => res[b] - res[a])[0];
    res[k]--; lost[k] = (lost[k] || 0) + 1; lose--; if (pid === P) flashRes(k, true);
  }
  return lost;
}
function reaverRaid() {
  let lostTxt = '';
  for (const p of players) {
    const lost = loseHalf(p.id);
    if (lost && p.id === P) lostTxt = 'They plunder your Hold: ' + Object.entries(lost).map(([k, n]) => `-${n} ${RES[k].icon}`).join(' ') + '. ';
  }
  sfx('raid');
  const bearer = hornBearer();
  if (players[bearer].ai) {
    const t = aiChooseReaverTile(bearer);
    sendReavers(bearer, t, lostTxt);
  } else if (bearer === P) {
    announce('REAVER RAID!', lostTxt + 'You hold the Horn: choose where the Reavers strike.');
    startReaverPick();
  } else { state.pickFor = bearer; state.pickT = 25; log(`🎺 ${nameOf(bearer)} holds the Horn and chooses where the Reavers strike…`); }
  updateHUD(); refreshMarkers();
}
function sendReavers(pid, t, prefix = '', title = 'REAVER RAID!') {
  placeReavers(t); computeVisibility();
  const seen = visible.has(t.id) || pid === P;
  const where = seen ? `in ${BIOME[t.type].name}${t.num ? ' (' + t.num + ')' : ''}` : 'somewhere in the mist';
  // steal one random card from a rival with a settlement on that region
  const victims = [...new Set(t.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== pid && resTotal(o) > 0))];
  let steal = '';
  if (victims.length) {
    const v = pick(victims), pool = RES_KEYS.flatMap(k => Array(players[v].res[k]).fill(k)), k = pick(pool);
    players[v].res[k]--; players[pid].res[k]++;
    if (pid === P) steal = ` You steal 1 ${RES[k].icon} from ${nameOf(v)}!`;
    else if (v === P) { steal = ` ${nameOf(pid)} steals 1 ${RES[k].icon} from you!`; flashRes(k, true); }
    else if (seen) steal = ` ${nameOf(pid)} robs ${nameOf(v)}.`;
    if (pid !== P) tell(pid, { log: `🏴 Your Reavers rob ${nameOf(v)}: +1 ${RES[k].icon}`, flash: [k] });
    if (v !== P) tell(v, { big: title, small: `${nameOf(pid)} steals 1 ${RES[k].icon} from you!`, flash: [k], loss: true });
  }
  const who = pid === P ? 'Your Reavers make camp' : `${nameOf(pid)} sends the Reavers. They make camp`;
  announce(title, `${prefix}${who} ${where}.${steal}`);
  log(`${title === 'REAVER RAID!' ? '🏴 7!' : '⚔️ Sellswords!'} ${who} ${where}.${steal}`);
  updateHUD(); refreshMarkers();
}
function startReaverPick(reason = 'raid') {
  state.reaverReason = reason; state.reaverPick = true; state.paused = !NET.online;
  document.exitPointerLock?.(); setWarMap(true); updateObjective();
}
function finishReaverPick(t) {
  state.reaverPick = false; state.paused = false; setWarMap(false); updateObjective();
  if (NET.guest) {   // tell the host where our Reavers go
    if (state.reaverReason === 'sellsword') netAct({ a: 'scroll_play', idx: state.sellswordIdx, arg: t.id }); else netAct({ a: 'reaver_pick', t: t.id });
    lockPointer(); return;
  }
  sendReavers(P, t, '', state.reaverReason === 'sellsword' ? 'SELLSWORDS!' : 'REAVER RAID!'); lockPointer();
}
const pulse = [];

function checkWin() {
  if (state.phase !== 'play') return;
  const winner = players.find(p => totalRenown(p.id) >= GOAL);
  if (!winner) return;
  state.phase = 'won'; state.winner = winner.id;
  showWin(winner);
}
function showWin(winner) {
  document.exitPointerLock?.();
  const mins = ((performance.now() - state.startTime) / 60000).toFixed(1);
  const me = winner.id === P;
  $('winTitle').textContent = me ? 'VICTORY' : 'DEFEAT';
  $('winHouse').textContent = winner.house.name;
  $('winStats').innerHTML = `${totalRenown(winner.id)} Renown in ${mins} minutes · ${state.harvests} harvests<br>` +
    players.slice().sort((a, b) => totalRenown(b.id) - totalRenown(a.id)).map(p => `${p.house.sigil} ${p.house.name}: ${totalRenown(p.id)}★${secretOf(p.id) ? ` (👑${secretOf(p.id)} secret)` : ''}`).join(' · ');
  $('win').classList.remove('hidden');
  sfx(me ? 'win' : 'raid');
}

// ---------------------------------------------------------------- AI houses
const PIPS = n => n ? 6 - Math.abs(7 - n) : 0;
function ownedTypes(pid) { const s = new Set(); for (const c of corners) if (owns(c, pid)) c.tiles.forEach(id => RES[tiles[id].type] && s.add(tiles[id].type)); return s; }
function cornerScore(c, pid, have = ownedTypes(pid)) {
  let s = 0; const types = new Set();
  for (const tid of c.tiles) { const t = tiles[tid]; if (!t.num) continue; s += PIPS(t.num) * (t === reaverTile ? 0.4 : 1); types.add(t.type); }
  s += types.size * 1.2;
  for (const ty of types) if (!have.has(ty)) s += 1.6;
  if (types.has('wheat')) s += 0.5; if (types.has('ember')) s += 0.5;
  return s;
}
const freeSpot = c => !c.building && !c.adj.some(id => corners[id].building);
function aiSetupPlace(pid) {
  const have = ownedTypes(pid);
  const best = corners.filter(freeSpot).map(c => ({ c, s: cornerScore(c, pid, have) + rand() * 0.8 })).sort((a, b) => b.s - a.s)[0].c;
  buildHamlet(best, pid);
  // road toward the most promising free corner nearby
  const roads = best.edges.map(id => edges[id]).filter(e => e.road === null);
  const far = e => corners[e.a === best.id ? e.b : e.a];
  const rs = e => Math.max(0, ...far(e).adj.map(id => corners[id]).filter(freeSpot).map(c => cornerScore(c, pid)));
  const road = roads.sort((a, b) => rs(b) - rs(a))[0];
  if (road) buildRoad(road, pid);
  if (players[pid].built.hamlet === 2) grantStart(pid, best);
  log(`${nameOf(pid)} lands at ${best.tiles.map(id => tiles[id]).map(t => t.num ? RES[t.type].icon + t.num : '🌋').join(' ')}`);
  refreshMarkers(); updateHUD();
}
// The Horn-Bearer sends the Reavers where they hurt the leading rival most, never onto their own lands
function aiChooseReaverTile(pid) {
  const lead = Math.max(...players.filter(p => p.id !== pid).map(p => renown(p.id)));
  let best = null, bs = -1e9;
  for (const t of tiles) {
    if (t === reaverTile) continue;
    let s = rand() * 0.5;
    for (const cid of t.corners) {
      const b = corners[cid].building; if (!b) continue;
      if (b.owner === pid) s -= 100;
      else s += (b.type === 'keep' ? 2 : 1) * PIPS(t.num) * (renown(b.owner) >= lead ? 2 : 1);
    }
    if (s > bs) { bs = s; best = t; }
  }
  return best;
}
function bestSite(pid) {
  let best = null, bs = -1; const have = ownedTypes(pid);
  for (const c of corners) if (!hamletProblem(c, pid)) { const s = cornerScore(c, pid, have); if (s > bs) { bs = s; best = c; } }
  return best;
}
function bestRoad(pid, noise = true) {
  let best = null, bs = 0.5; const have = ownedTypes(pid);
  for (const e of edges) {
    if (roadProblem(e, pid)) continue;
    let s = 0;
    for (const cid of [e.a, e.b]) {
      const c = corners[cid];
      if (owns(c, pid) || c.edges.some(id => edges[id].road === pid)) continue;   // the end we already reach
      if (freeSpot(c)) s = Math.max(s, cornerScore(c, pid, have));
      else s = Math.max(s, 0.55 * Math.max(0, ...c.adj.map(id => corners[id]).filter(freeSpot).map(x => cornerScore(x, pid, have))));
    }
    s += noise ? rand() * 0.6 : 0;
    if (players[pid].longest >= 3 && state.highwayHolder !== pid) s += 1;   // chase the Great Wall
    if (s > bs) { bs = s; best = e; }
  }
  return best;
}
function aiGoal(pid) {
  const p = players[pid];
  if (p.built.hamlet > 0 && !limitHit('keep', pid) && p.res.wheat + p.res.ember >= 3) return 'keep';
  if (!limitHit('hamlet', pid) && bestSite(pid)) return 'hamlet';
  if (!limitHit('road', pid)) return 'road';
  return 'keep';
}
const needOf = (goal, k) => COST[goal][k] || 0;
function aiGuildTrade(p) {
  const goal = aiGoal(p.id), lack = RES_KEYS.filter(k => p.res[k] < needOf(goal, k));
  if (!lack.length) return false;
  // first try a fair 1:1 swap with another AI house that wants what we have spare
  for (const q of shuffle(players.filter(q => q.ai && q !== p))) {
    const want = lack.find(k => aiSpare(q, k));
    const giveK = want && RES_KEYS.find(k => k !== want && aiSpare(p, k) && aiWants(q, k));
    if (want && giveK) { p.res[giveK]--; q.res[giveK]++; q.res[want]--; p.res[want]++; return true; }
  }
  // otherwise the Guild: 4 of a surplus for 1 of what we lack (more eager when the Reavers could take half)
  const hoard = resTotal(p.id) > 7;
  const spare = RES_KEYS.filter(k => p.res[k] - (hoard ? 0 : needOf(goal, k)) >= 4 && !lack.includes(k)).sort((a, b) => p.res[b] - p.res[a])[0];
  if (spare) { p.res[spare] -= 4; p.res[lack[0]]++; return true; }
  return false;
}
function aiThink(p) {
  if (state.phase !== 'play' || p.task) return;
  const pid = p.id;
  if (aiPlayScroll(p)) { p.think = 1; return; }
  if (aiDragonPlans(p)) return;
  if (aiRaidPlan(p)) return;
  if (canAfford('keep', pid) && !limitHit('keep', pid)) {
    const c = corners.filter(c => owns(c, pid) && c.building.type === 'hamlet').sort((a, b) => cornerScore(b, pid) - cornerScore(a, pid))[0];
    if (c) { p.task = { kind: 'keep', c }; return; }
  }
  const site = !limitHit('hamlet', pid) ? bestSite(pid) : null;
  if (site && canAfford('hamlet', pid)) { p.task = { kind: 'hamlet', c: site }; return; }
  if (canAfford('road', pid) && !limitHit('road', pid)) {
    const saving = !p.freeRoads && site && missing('hamlet', pid).length <= 2 && !(p.res.timber >= 2 && p.res.stone >= 2);
    if (!saving) { const e = bestRoad(pid); if (e) { p.task = { kind: 'road', e }; return; } }
  }
  // nothing to build: maybe study a Lore Scroll (more likely when the Reavers could take half)
  if (deck.length && canAfford('scroll', pid) && (resTotal(pid) > 7 || rand() < 0.3) && !(aiGoal(pid) === 'keep' && p.res.ember < 4)) {
    buyScroll(pid); log(`📜 ${nameOf(pid)} buys a Lore Scroll`); updateHUD(); return;
  }
  if (aiGuildTrade(p)) p.think = 0.5;   // trade, then think again soon
}
function aiPlayScroll(p) {
  const pid = p.id;
  for (let i = 0; i < p.scrolls.length; i++) {
    const c = p.scrolls[i]; if (!canPlay(p, c)) continue;
    if (c.type === 'sellsword' && (reaverTile.corners.some(cid => owns(corners[cid], pid)) || p.knights >= 2 || rand() < 0.3)) { playScroll(pid, i); return true; }
    if (c.type === 'roads' && !limitHit('road', pid) && bestRoad(pid)) { playScroll(pid, i); return true; }
    if (c.type === 'harvest') {
      const goal = aiGoal(pid), lack = RES_KEYS.flatMap(k => Array(Math.max(0, needOf(goal, k) - p.res[k])).fill(k));
      playScroll(pid, i, [...lack, 'wheat', 'ember'].slice(0, 2)); return true;
    }
    if (c.type === 'decree') {
      const k = RES_KEYS.slice().sort((a, b) => players.reduce((s, q) => s + (q === p ? 0 : q.res[b]), 0) - players.reduce((s, q) => s + (q === p ? 0 : q.res[a]), 0))[0];
      if (players.reduce((s, q) => s + (q === p ? 0 : q.res[k]), 0) >= 3) { playScroll(pid, i, k); return true; }
    }
  }
  return false;
}

// ---------------------------------------------------------------- Lore Scrolls (development cards)
const SCROLLS = {
  sellsword: { name: 'Sellsword', icon: '⚔️', desc: 'Move the Reavers and rob a rival there. Counts toward the Mightiest Host.' },
  renown:    { name: 'Renown Scroll', icon: '👑', desc: '+1 Renown, kept secret from the other houses.' },
  roads:     { name: 'Wall Builders', icon: '🧱', desc: 'Build your next 2 walls for free.' },
  harvest:   { name: 'Bountiful Harvest', icon: '🌾', desc: 'Take any 2 resources.' },
  decree:    { name: 'Royal Decree', icon: '📯', desc: 'Name a resource: every other house gives you all of theirs.' },
};
let deck = [];
function makeDeck() { deck = shuffle([...Array(14).fill('sellsword'), ...Array(5).fill('renown'), 'roads', 'roads', 'harvest', 'harvest', 'decree', 'decree']); }
function buyScroll(pid = P) {
  if (!deck.length) return null;
  if (!canAfford('scroll', pid)) return null;
  pay('scroll', pid);
  const type = deck.pop();
  players[pid].scrolls.push({ type, boughtAt: state.harvests });
  return type;
}
// a scroll can be played from the harvest after it was bought, and each house plays at most one per harvest
const canPlay = (p, c) => c.type !== 'renown' && state.harvests > c.boughtAt && p.playedAt !== state.harvests;
function updateHost() {
  const h = state.hostHolder;
  let best = h, bestN = h === null || h === undefined ? 2 : players[h].knights;
  for (const p of players) if (p.knights > bestN) { best = p.id; bestN = p.knights; }
  if (best !== h && best !== undefined) {
    state.hostHolder = best;
    if (best === P) { announce('THE MIGHTIEST HOST', 'Your Sellswords are the strongest force. +2 Renown'); log('⚔️ You command the Mightiest Host (+2★)'); }
    else { announce('A MIGHTY HOST!', `${nameOf(best)} commands the Mightiest Host (+2★)`); log(`⚔️ ${nameOf(best)} takes the Mightiest Host`); }
  }
}
function playScroll(pid, idx, arg) {
  const p = players[pid], card = p.scrolls[idx], S = SCROLLS[card.type];
  p.scrolls.splice(idx, 1); p.playedAt = state.harvests;
  const who = pid === P ? 'You play' : `${nameOf(pid)} plays`;
  if (card.type === 'sellsword') {
    p.knights++; updateHost();
    log(`${S.icon} ${who} a Sellsword`);
    if (pid === P && arg == null) startReaverPick('sellsword'); else sendReavers(pid, arg != null ? tiles[arg] : aiChooseReaverTile(pid), '', 'SELLSWORDS!');
  } else if (card.type === 'roads') {
    p.freeRoads += 2;
    log(`${S.icon} ${who} Wall Builders: 2 free walls`);
    if (pid === P) announce('WALL BUILDERS', 'Your next 2 walls are free');
  } else if (card.type === 'harvest') {
    arg.forEach(k => { p.res[k]++; if (pid === P) flashRes(k); });
    log(`${S.icon} ${who} Bountiful Harvest` + (pid === P ? `: +1 ${RES[arg[0]].icon} +1 ${RES[arg[1]].icon}` : ''));
  } else if (card.type === 'decree') {
    let n = 0;
    for (const q of players) if (q !== p) { n += q.res[arg]; if (q.id === P && q.res[arg]) flashRes(arg, true); p.res[arg] += q.res[arg]; q.res[arg] = 0; }
    if (pid === P) flashRes(arg);
    announce('ROYAL DECREE!', `${who.replace(' play', ' claim').replace('You claims', 'You claim')} every ${RES[arg].icon} ${RES[arg].name} in Embervale (${n})`);
    log(`${S.icon} ${who} a Royal Decree: all ${RES[arg].icon} go to ${pid === P ? 'you' : nameOf(pid)} (${n})`);
  }
  updateHUD(); refreshMarkers(); checkWin();
}
function taskPos(task) {
  if (task.kind === 'egg') return { x: task.egg.x * 0.72, z: task.egg.z * 0.72 };
  const x = task.c ? task.c.x : task.e.mx, z = task.c ? task.c.z : task.e.mz, L = Math.hypot(x, z) || 1;
  return { x: x - x / L * 5, z: z - z / L * 5 };   // stand a few steps inland of the spot
}
function aiExecute(p) {
  const t = p.task; p.task = null;
  if (t.kind === 'egg' || t.kind === 'deliver') return aiEggStep(p, t);
  if (t.kind === 'raid') { if (!raidProblem(p.id, t.c, p.pos)) raid(p.id, t.c); return; }
  if (problemFor(t.kind, t, p.id)) return;          // someone took the spot, or resources were lost
  pay(t.kind, p.id);
  if (t.kind === 'hamlet') buildHamlet(t.c, p.id); else if (t.kind === 'keep') buildKeep(t.c, p.id);
  else if (t.kind === 'roost') buildRoost(t.c, p.id); else if (t.kind === 'tower') buildTower(t.c, p.id); else buildRoad(t.e, p.id);
  reportBuild(p.id, t);
  refreshMarkers(); updateHUD(); checkWin();
}
// news travels: you see it if you can see the spot; otherwise ravens report settlements
function reportBuild(pid, t) {
  const tile = t.c ? t.c.tiles.map(id => tiles[id]) : [corners[t.e.a], corners[t.e.b]].flatMap(c => c.tiles.map(id => tiles[id]));
  const seen = tile.some(x => visible.has(x.id));
  const what = { road: 'builds a wall', hamlet: 'founds a Hamlet (+1★)', keep: 'raises a Keep (+1★)', roost: 'builds a Dragon Roost 🐉', tower: 'builds a Scorpion Tower 🏹' }[t.kind];
  if (seen) { log(`👀 ${nameOf(pid)} ${what} nearby`); sfx('build'); }
  else if (t.kind !== 'road') log(`🐦 Ravens report: ${nameOf(pid)} ${what}`);
}
// AI lords walk the isles in person
function makeAvatar(h, label = `${h.sigil} ${h.name}`) {
  const g = new THREE.Group(), body = new THREE.Group();
  body.add(cyl(0.45, 0.7, 1.5, 7, h.mat, 0, 0, 0));
  body.add(cyl(0.5, 0.5, 0.5, 7, M.iron, 0, 1.45, 0));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 6), M.plaster); head.position.y = 2.15; body.add(head);
  body.add(cone(0.42, 0.5, 7, M.iron, 0, 2.3, 0));
  const pole = cyl(0.06, 0.06, 3.6, 4, M.woodDark, -0.35, 0, -0.35); body.add(pole);
  const flag = B(1.2, 0.8, 0.06, h.mat, 0.25, 2.7, -0.35); body.add(flag);
  g.add(body); g.userData.body = body;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const x = cv.getContext('2d');
  x.fillStyle = '#fff4dc'; x.beginPath(); x.roundRect(4, 4, 248, 56, 14); x.fill(); x.lineWidth = 5; x.strokeStyle = '#17110d'; x.stroke();
  x.fillStyle = h.css; x.font = '30px Bangers, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 128, 34);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthWrite: false, transparent: true }));
  tag.scale.set(5, 1.25, 1); tag.position.y = 4.4; g.add(tag);
  const egg = makeEgg(); egg.scale.set(0.55, 0.75, 0.55); egg.position.y = 3.3; egg.visible = false; body.add(egg); g.userData.egg = egg;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(1.25); scene.add(g); return g;
}
function spawnAvatars() {
  for (const p of players) {
    if (p.id === P || p.avatar) continue;
    const c = corners.find(c => owns(c, p.id)) || corners[0], L = Math.hypot(c.x, c.z) || 1;
    p.avatar = makeAvatar(p.house, !p.ai && p.name ? `${p.house.sigil} ${p.name}` : undefined); p.pos = { x: c.x - c.x / L * 6, z: c.z - c.z / L * 6 };
    p.think = rr(1, 4); p.task = null; p.wander = null; p.wait = 0;
  }
}
function updateAI(dt, time) {
  for (const p of players) {
    if (!p.ai || !p.avatar) continue;
    aiDuelCheck(p, dt);
    if (p.duelWith != null) { p.avatar.position.set(p.pos.x, heightAt(p.pos.x, p.pos.z), p.pos.z); continue; }   // fighting: stand and face the foe
    p.think -= dt;
    if (p.think <= 0) { p.think = rr(2, 4); aiThink(p); if (Math.random() < 0.08) aiRavenOffer(p); }
    let target = p.detour || (p.task ? taskPos(p.task) : p.wander);
    if (!target) {
      if ((p.wait -= dt) <= 0) {   // stroll between your own holdings
        const mine = corners.filter(c => owns(c, p.id)), c = pick(mine), L = Math.hypot(c.x, c.z) || 1;
        p.wander = { x: c.x - c.x / L * rr(5, 12) + rr(-4, 4), z: c.z - c.z / L * rr(5, 12) + rr(-4, 4) };
      }
    }
    target = p.detour || (p.task ? taskPos(p.task) : p.wander);
    let moving = false;
    if (target) {
      const dx = target.x - p.pos.x, dz = target.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d < 1.2) { if (p.detour) { if (p.tollE != null) { const te = edges[p.tollE]; p.tollE = null; if (te.road !== p.id && !payToll(p.id, te)) { p.task = null; p.wander = null; p.detourQ = null; } } p.detour = p.detourQ && p.detourQ.length ? p.detourQ.shift() : null; } else if (p.task) { p.detours = 0; aiExecute(p); } else { p.wander = null; p.wait = rr(3, 9); } }
      else {
        const sp = Math.min(d, (p.task ? (p.carrying ? 6 : 9) : 4) * dt), nx = p.pos.x + dx / d * sp, nz = p.pos.z + dz / d * sp;
        const w = wallBlocks(p.id, p.pos.x, p.pos.z, nx, nz);
        if (w) aiDetour(p, w, p.task ? taskPos(p.task) : (p.wander || target));
        else { p.pos.x = nx; p.pos.z = nz; p.avatar.rotation.y = Math.atan2(dx, dz); moving = true; }
      }
    }
    const y = walkHeight(p.pos.x, p.pos.z);
    p.avatar.position.set(p.pos.x, y, p.pos.z);
    p.avatar.userData.body.position.y = moving ? Math.abs(Math.sin(time * 9 + p.id)) * 0.25 : 0;
    p.avatar.userData.egg.visible = !!p.carrying;
    // the mist hides rivals you can't see
    const t = tileAtWorld(p.pos.x, p.pos.z);
    p.avatar.visible = state.dragonEye || Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 10 || (t && visible.has(t.id));
  }
}

// ---------------------------------------------------------------- ravens (trading with the houses)
let ravenOffer = null;
function aiWants(p, k) { const goal = aiGoal(p.id); return p.res[k] < needOf(goal, k) || p.res[k] === 0; }
function aiSpare(p, k) { return p.res[k] - needOf(aiGoal(p.id), k) >= 1 && p.res[k] >= 1; }
// would this AI house take the bundle? (give/get are from the asking player's side)
function aiAccepts(p, give, get, from = P) {
  if (renown(from) >= renown(p.id) + 3) return 'refuses to aid the mightiest house';
  const goal = aiGoal(p.id);
  for (const k of RES_KEYS) if ((get[k] || 0) > 0) {
    if (p.res[k] < get[k]) return `has too few ${RES[k].icon}`;
    if (p.res[k] - needOf(goal, k) < get[k]) return `needs its ${RES[k].icon}`;
  }
  const nG = bundleSum(give), nR = bundleSum(get);
  if (nG < nR) return 'wants a fairer deal';
  const helps = RES_KEYS.some(k => (give[k] || 0) > 0 && aiWants(p, k));
  if (!helps && nG < nR + 2 && !isDusk()) return 'has no need of it';   // at dusk any fair deal will do
  return null;
}
function sendRaven(give, get) {
  if (!RES_KEYS.every(k => state.res[k] >= (give[k] || 0))) return;
  $('ravenStatus').textContent = '🐦 Your ravens fly to the other houses…';
  if (NET.guest) { netAct({ a: 'raven', give, get }); return; }
  setTimeout(() => ravenDeal(P, give, get), 1500);
}
function ravenDeal(from, give, get) {   // the AI houses answer an offer
  const me = players[from], replies = [];
  for (const p of shuffle(players.filter(p => p.ai))) {
    const no = aiAccepts(p, give, get, from);
    if (!no && RES_KEYS.every(k => me.res[k] >= (give[k] || 0))) {
      applyBundle(from, give, get, p);
      const msg = `🤝 ${nameOf(p.id)} accepts: your ${bundleTxt(give)} for their ${bundleTxt(get)}`;
      if (from === P) { $('ravenStatus').textContent = msg; log(msg); RES_KEYS.forEach(k => get[k] && flashRes(k)); sfx('build'); resetTrade(); updateHUD(); refreshMarkers(); renderTrade(); }
      else tell(from, { raven: msg, log: msg, flash: RES_KEYS.filter(k => get[k]), sfx: 'build' });
      return;
    }
    replies.push(`${p.house.sigil} ${no}`);
  }
  const msg = '✖ No takers. ' + (replies.join(' · ') || 'no other house will trade');
  if (from === P) $('ravenStatus').textContent = msg; else tell(from, { raven: msg });
}
function aiRavenOffer(p) {
  if (ravenOffer || state.phase !== 'play' || renown(P) >= renown(p.id) + 3) return;
  const want = RES_KEYS.filter(k => aiWants(p, k) && state.res[k] >= 2);
  const give = RES_KEYS.filter(k => aiSpare(p, k) && p.res[k] >= 2 && !want.includes(k));
  if (!want.length || !give.length) return;
  ravenOffer = { p, want: pick(want), give: pick(give), t: 20 };
  $('ravenText').innerHTML = `🐦 <b>${nameOf(p.id)}</b> offers <b>1 ${RES[ravenOffer.give].icon}</b> for your <b>1 ${RES[ravenOffer.want].icon}</b>`;
  $('raven').classList.remove('hidden'); sfx('build');
}
function answerRaven(yes) {
  if (!ravenOffer) return;
  const { p, want, give } = ravenOffer; ravenOffer = null; $('raven').classList.add('hidden');
  if (!yes) { log(`🐦 You decline ${nameOf(p.id)}'s offer`); return; }
  if (state.res[want] < 1 || p.res[give] < 1) { log('🐦 The trade fell through'); return; }
  state.res[want]--; state.res[give]++; p.res[want]++; p.res[give]--;
  log(`🤝 Trade with ${nameOf(p.id)}: 1 ${RES[want].icon} → 1 ${RES[give].icon}`); flashRes(give); sfx('build'); updateHUD(); refreshMarkers();
}

// ---------------------------------------------------------------- player & input
const player = { pos: new THREE.Vector3(), vy: 0, yaw: 0, pitch: -0.15, onGround: true };
const keys = {};
let pointerLocked = false, dragLook = false, dragMoved = 0;
function spawn() {
  // land on the coast-facing side of a random ring-1 tile, looking at the volcano
  const t = pick(tiles.filter(t => Math.max(Math.abs(t.q), Math.abs(t.r), Math.abs(t.q + t.r)) === 1));
  const x = t.x * 1.15, z = t.z * 1.15;
  player.pos.set(x, heightAt(x, z), z);
  player.yaw = Math.atan2(x, z);
}
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (state.phase !== 'setup' && state.phase !== 'play') return;
  if (e.code === 'KeyT' && !state.reaverPick && $('lore').classList.contains('hidden')) { toggleTrade(); return; }
  if (e.code === 'KeyL' && !state.reaverPick && $('trade').classList.contains('hidden')) { toggleLore(); return; }
  if (ravenOffer && (e.code === 'KeyY' || e.code === 'KeyN')) { answerRaven(e.code === 'KeyY'); return; }
  if (state.phase === 'setup') { if (e.code === 'KeyQ' || e.code === 'Escape') return; }
  if (!document.getElementById('trade').classList.contains('hidden') || !$('lore').classList.contains('hidden')) return;
  if (e.code === 'Digit1') setMode(state.mode === 'road' ? null : 'road');
  if (e.code === 'Digit2') setMode(state.mode === 'hamlet' ? null : 'hamlet');
  if (e.code === 'Digit3') setMode(state.mode === 'keep' ? null : 'keep');
  if (e.code === 'Digit4') setMode(state.mode === 'roost' ? null : 'roost');
  if (e.code === 'Digit5') setMode(state.mode === 'tower' ? null : 'tower');
  if (e.code === 'KeyE' && state.phase === 'play') tryEgg();
  if (e.code === 'KeyF' && state.phase === 'play') toggleRide();
  if (e.code === 'KeyG' && state.riding) dragonfire();
  if (e.code === 'KeyQ') setMode(null);
  if (e.code === 'KeyM' && state.phase === 'play') toggleMap();
  if (e.code === 'KeyH') $('helpOverlay').classList.toggle('hidden');
  if (e.code === 'KeyR') recall();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// No mouse capture: drag to look around, click (or tap) to act. Works with a mouse and with touch.
function lockPointer() {}
document.getElementById('pause').addEventListener('click', () => { document.getElementById('pause').classList.add('hidden'); state.paused = false; });
const ptr = { down: false, id: null, lx: 0, ly: 0, moved: 0, hover: null };
canvas.addEventListener('pointerdown', e => {
  if (state.phase !== 'play') return;
  if (e.button === 2) { setMode(null); return; }
  ptr.down = true; ptr.id = e.pointerId; ptr.lx = e.clientX; ptr.ly = e.clientY; ptr.moved = 0;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') ptr.hover = { x: e.clientX, y: e.clientY };
  if (!ptr.down || e.pointerId !== ptr.id) return;
  const dx = e.clientX - ptr.lx, dy = e.clientY - ptr.ly; ptr.lx = e.clientX; ptr.ly = e.clientY;
  ptr.moved += Math.abs(dx) + Math.abs(dy);
  if (ptr.moved > 6) {
    const k = e.pointerType === 'touch' ? 0.006 : 0.0042;
    player.yaw += dx * k; player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch + dy * k));   // drag the world around you
  }
});
canvas.addEventListener('pointerup', e => {
  if (!ptr.down || e.pointerId !== ptr.id) return;
  ptr.down = false;
  if (ptr.moved <= 6) tapAt(e.clientX, e.clientY);
});
canvas.addEventListener('pointercancel', () => { ptr.down = false; });
canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') ptr.hover = null; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

// what is under a screen point?
const _rc = new THREE.Raycaster(), _ndc = new THREE.Vector2();
function groundAt(sx, sy, maxD = 320) {
  _ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); _rc.setFromCamera(_ndc, camera);
  const o = _rc.ray.origin, d = _rc.ray.direction;
  for (let t = 0.5; t < maxD; t += t < 80 ? 0.5 : 1.5) {
    const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
    if (y <= heightAt(x, z)) return { x, z, d: t };
  }
  return null;
}
function tapAt(sx, sy) {
  if (state.paused || state.phase !== 'play') return;
  closeMenus();
  const hit = groundAt(sx, sy);
  if (state.riding) { if (hit) flyTo(hit); return; }
  if (!hit) return;
  // an egg in the Cradle?
  const egg = cradleEggs.find(e => !e.taken && Math.hypot(e.x - hit.x, e.z - hit.z) < 4);
  if (egg) { if (Math.hypot(egg.x - player.pos.x, egg.z - player.pos.z) < 6) tryEgg(); else walkTo({ x: egg.x * 0.8, z: egg.z * 0.8 }); return; }
  const rb = isNight() && corners.find(c => c.building && c.building.owner !== P && Math.hypot(c.x - hit.x, c.z - hit.z) < 5);
  if (rb) { if (Math.hypot(rb.x - player.pos.x, rb.z - player.pos.z) < RAID_RANGE) tryRaid(rb); else walkTo(at(rb)); return; }
  const foe = players.find(p => p.id !== P && p.avatar && p.avatar.visible && Math.hypot(p.pos.x - hit.x, p.pos.z - hit.z) < 3.5);
  if (foe) { if (Math.hypot(foe.pos.x - player.pos.x, foe.pos.z - player.pos.z) < DUEL_RANGE) challenge(foe.id); else walkTo({ x: foe.pos.x, z: foe.pos.z }); return; }
  const tgt = hit.d < 120 ? targetNear(hit) : null;
  if (tgt && !tgt.problem) { currentTarget = tgt; tryBuild(tgt); return; }   // gold sign: build it
  if (tgt && state.mode) { log('⚠️ ' + tgt.problem); sfx('bad'); return; }   // placing something: explain why not
  walkTo(hit);   // anything else: walk there
}
// click-to-move (and click-to-fly)
const destMarker = (() => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.22, 5, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  m.rotation.x = Math.PI / 2; m.visible = false; scene.add(m); return m;
})();
function walkTo(p) {
  player.via = null; player.pendingToll = null;
  if (heightAt(p.x, p.z) < 0.6) { const L = Math.hypot(p.x, p.z), k = Math.min(1, 150 / L); p = { x: p.x * k, z: p.z * k }; }   // not into the sea
  player.autoTarget = { x: p.x, z: p.z };
  destMarker.position.set(p.x, heightAt(p.x, p.z) + 0.4, p.z); destMarker.visible = true;
}
function flyTo(p) { player.autoTarget = { x: p.x, z: p.z }; destMarker.position.set(p.x, heightAt(p.x, p.z) + 0.6, p.z); destMarker.visible = true; }

function recall() {
  if (state.riding || state.carrying) { log('⚠️ The Recall Horn cannot be used while flying or carrying an egg'); return; }
  if (state.recallCD > 0) { log(`⏳ Recall Horn ready in ${Math.ceil(state.recallCD)}s`); return; }
  const mine = corners.filter(owns);
  if (!mine.length) return;
  const c = mine[state.recallIdx++ % mine.length];
  const dx = -c.x, dz = -c.z, L = Math.hypot(dx, dz) || 1;
  const x = c.x + dx / L * 6, z = c.z + dz / L * 6;
  player.pos.set(x, heightAt(x, z), z); player.vy = 0; player.yaw = Math.atan2(c.x - x, c.z - z) + Math.PI;
  state.recallCD = 30; sfx('horn'); log('📯 Recalled to your ' + c.building.type);
}

function onOwnRoad(x, z) {
  for (const e of edges) {
    if (e.road !== P) continue;
    const A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z;
    const t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
    if (Math.hypot(A.x + dx * t - x, A.z + dz * t - z) < 2.2) return true;
  }
  return false;
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) player.yaw += 2 * dt;
  if (keys.ArrowRight) player.yaw -= 2 * dt;
  if (state.riding) return updateFlight(dt);
  let fx = 0, fz = 0;
  if (keys.KeyW || keys.ArrowUp) fz -= 1; if (keys.KeyS || keys.ArrowDown) fz += 1; if (keys.KeyA) fx -= 1; if (keys.KeyD) fx += 1;
  if (state.dazeT > 0) { state.dazeT -= dt; fx = fz = 0; player.autoTarget = null; destMarker.visible = false; }   // knocked down in a duel
  if (fx || fz) { player.autoTarget = null; player.via = null; destMarker.visible = false; }
  else if (player.autoTarget) {   // click-to-move: turn toward the target and walk
    const dx = player.autoTarget.x - player.pos.x, dz = player.autoTarget.z - player.pos.z, d = Math.hypot(dx, dz);
    if (d < 1.5 && player.pendingToll && !player.via) { player.autoTarget = null; destMarker.visible = false; }   // wait at the gate to pay
    else if (d < 1.5) { if (player.via && player.via.length > 1) { player.via.shift(); player.autoTarget = player.via[0]; if (player.via.length === 1) player.via = null; } else { player.autoTarget = null; player.via = null; destMarker.visible = false; } }
    else {
      const want = Math.atan2(-dx, -dz); let dy = want - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      player.yaw += dy * Math.min(1, dt * 4);
      const sp = (d > 30 ? 15 : 10) * (onOwnRoad(player.pos.x, player.pos.z) ? 1.5 : 1) * (state.carrying ? 0.7 : 1) * dt;
      const nx = player.pos.x + dx / d * Math.min(sp, d), nz = player.pos.z + dz / d * Math.min(sp, d);
      const w = wallBlocks(P, player.pos.x, player.pos.z, nx, nz);
      if (w && w.road === P && !player.via) {   // your own wall: walk through its gate
        const [near, far] = gatePath(w, player.pos.x, player.pos.z); player.via = [near, far, player.autoTarget]; player.autoTarget = near;
      } else if (w && w.road !== P && !player.pendingToll && player.autoTarget && !player.via) {   // a rival wall: go to its gate, pay to pass
        const [near, far] = gatePath(w, player.pos.x, player.pos.z);
        player.pendingToll = { e: w, far, target: player.autoTarget }; player.autoTarget = near;
        if (performance.now() > wallMsgT) { wallMsgT = performance.now() + 4000; log(`🧱 ${nameOf(w.road)}'s wall is in the way: walking to its gate (toll: 1 resource)`); }
      } else if (w) blockedByWall(w);
      else if (heightAt(nx, nz) > 0.6) { player.pos.x = nx; player.pos.z = nz; } else { player.autoTarget = null; destMarker.visible = false; }
    }
  }
  const len = Math.hypot(fx, fz);
  if (len > 0) {
    fx /= len; fz /= len;
    let speed = keys.ShiftLeft || keys.ShiftRight ? 16 : 9;
    if (onOwnRoad(player.pos.x, player.pos.z)) speed *= 1.6;
    if (state.carrying) speed *= 0.7;
    const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
    const mx = (fx * cos + fz * sin) * speed * dt, mz = (-fx * sin + fz * cos) * speed * dt;
    const nx = player.pos.x + mx, nz = player.pos.z + mz;
    const ok = (x, z) => heightAt(x, z) > 0.6 && !wallBlocks(P, player.pos.x, player.pos.z, x, z);
    if (ok(nx, nz)) { player.pos.x = nx; player.pos.z = nz; }
    else if (ok(nx, player.pos.z)) player.pos.x = nx;          // slide along walls and coasts
    else if (ok(player.pos.x, nz)) player.pos.z = nz;
    else { const w = wallBlocks(P, player.pos.x, player.pos.z, nx, nz); if (w) blockedByWall(w); }
  }
  const g = walkHeight(player.pos.x, player.pos.z);
  if (keys.Space && player.onGround) { player.vy = 9; player.onGround = false; }
  player.vy -= 28 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y <= g) { player.pos.y = g; player.vy = 0; player.onGround = true; }
  placeCamera(dt);
}
// ---------------------------------------------------------------- camera views
// high (default): eyes raised to a rider's height with a wide view; hero: over the shoulder; first: classic first person
const VIEWS = {
  high:  { label: '👁️ View: High',   eye: 4.2, fov: 80 },
  hero:  { label: '👁️ View: Behind', eye: 2.0, fov: 78, back: 8.5, up: 3.4 },
  first: { label: '👁️ View: First',  eye: 1.7, fov: 70 },
};
let viewMode = 'high', meAvatar = null, meLast = { x: 0, z: 0 };
try { const v = localStorage.getItem('dh-view'); if (VIEWS[v]) viewMode = v; } catch (_) {}
function setView(m) {
  viewMode = m; try { localStorage.setItem('dh-view', m); } catch (_) {}
  camera.fov = VIEWS[m].fov; camera.updateProjectionMatrix();
  $('btnView').textContent = VIEWS[m].label;
}
const _look = new THREE.Vector3();
function placeCamera(dt) {
  const v = VIEWS[viewMode];
  if (viewMode === 'hero') {
    const cp = Math.cos(player.pitch), dx = -Math.sin(player.yaw) * cp, dy = Math.sin(player.pitch), dz = -Math.cos(player.yaw) * cp;
    const x = player.pos.x - dx * v.back, z = player.pos.z - dz * v.back;
    const y = Math.max(player.pos.y + v.eye + v.up - dy * v.back, heightAt(x, z) + 1.2);
    camera.position.set(x, y, z);
    _look.set(player.pos.x + dx * 8, player.pos.y + v.eye + dy * 8, player.pos.z + dz * 8); camera.lookAt(_look);
  } else {
    camera.position.set(player.pos.x, player.pos.y + v.eye, player.pos.z);
    camera.rotation.set(player.pitch, player.yaw, 0);
  }
  // your own lord, seen from behind
  if (!meAvatar && players[P]) {
    meAvatar = makeAvatar(players[P].house);
    meAvatar.children.forEach(o => { if (o.isSprite) o.visible = false; });
  }
  if (meAvatar) {
    meAvatar.visible = viewMode === 'hero' && state.phase === 'play' && !state.riding;
    const moving = Math.hypot(player.pos.x - meLast.x, player.pos.z - meLast.z) > 0.01; meLast = { x: player.pos.x, z: player.pos.z };
    meAvatar.position.copy(player.pos); meAvatar.rotation.y = player.yaw + Math.PI;
    meAvatar.userData.body.position.y = moving ? Math.abs(Math.sin(performance.now() / 110)) * 0.25 : 0;
    meAvatar.userData.egg.visible = !!state.carrying;
  }
}

// ---------------------------------------------------------------- aiming & ghosts
const ghosts = {};
function buildGhosts() {
  for (const k of ['hamlet', 'keep', 'roost', 'tower']) {
    if (ghosts[k]) scene.remove(ghosts[k]);
    ghosts[k] = ghostify({ hamlet: makeHamlet, keep: makeKeep, roost: makeRoost, tower: makeTower }[k](), 0x7dff8a); ghosts[k].visible = false; scene.add(ghosts[k]);
  }
}
buildGhosts();
let roadGhost = null, roadGhostEdge = -1;
let currentTarget = null;
const _dir = new THREE.Vector3();
function aimPoint() { return ptr.hover && !ptr.down ? groundAt(ptr.hover.x, ptr.hover.y, 120) : null; }
// What can be built where? Used by the ground signs and by aiming.
// With no blueprint selected you can aim at any sign and click: the sign decides what gets built.
function siteReady(kind, x) {
  if (kind === 'roost') return !roostProblem(x) && !limitHit('roost');
  if (kind === 'tower') return !towerProblem(x) && !limitHit('tower');
  if (kind === 'road') return !roadProblem(x) && !limitHit('road');
  if (kind === 'hamlet') return !hamletProblem(x) && !limitHit('hamlet');
  return !keepProblem(x) && !limitHit('keep');
}
function updateAim() {
  currentTarget = null;
  Object.values(ghosts).forEach(g => g.visible = false);
  if (roadGhost) roadGhost.visible = false;
  const tip = document.getElementById('tip');
  if (state.paused) { tip.classList.add('hidden'); return; }
  if (state.riding) {   // in the saddle: the crosshair shows Dragonfire instead of building
    const d = dragonOf(P), t = tileAtWorld(camera.position.x, camera.position.z);
    const prob = d.stage === 'grown' ? scorchProblem(P, t) : 'A Wyrmling is too young for Dragonfire';
    tip.classList.remove('hidden', 'ok', 'bad'); tip.classList.add(prob ? 'bad' : 'ok');
    tip.textContent = prob ? `🔥 ${prob}` : `🔥 Press FIRE to scorch ${BIOME[t.type].name} (${t.num})`;
    tip.style.left = '50%'; tip.style.top = '62%';
    return;
  }
  const hit = aimPoint();
  if (!hit) { tip.classList.add('hidden'); return; }
  const best = targetNear(hit);
  if (!best) { tip.classList.add('hidden'); return; }
  tip.style.left = (ptr.hover.x + 18) + 'px'; tip.style.top = (ptr.hover.y + 14) + 'px';
  showTarget(best, tip);
}
// candidates: with a blueprint, every spot of that kind (so you learn why a spot is invalid);
// without one, only spots that have a sign on them
function targetNear(hit) {
  let best = null, bd = 8;
  const kinds = state.mode ? [state.mode] : ['hamlet', 'keep', 'road'];
  for (const kind of kinds) {
    if (kind === 'road') {
      for (const e of edges) {
        if (!state.mode && !siteReady('road', e)) continue;
        const d = Math.hypot(e.mx - hit.x, e.mz - hit.z) + 2;    // corners win when you aim near them
        if (d < bd) { bd = d; best = { e, kind }; }
      }
    } else {
      for (const c of corners) {
        if (!state.mode && !siteReady(kind, c)) continue;
        const d = Math.hypot(c.x - hit.x, c.z - hit.z);
        if (d < bd) { bd = d; best = { c, kind }; }
      }
    }
  }
  if (best) best.problem = problemFor(best.kind, best);
  return best;
}
function showTarget(best, tip) {
  currentTarget = best;
  const col = best.problem ? 0xff5040 : 0x7dff8a;
  const showGhost = state.mode || !best.problem;   // no blueprint: only preview what you can actually build
  if (best.kind === 'road') {
    if (roadGhostEdge !== best.e.id) { if (roadGhost) scene.remove(roadGhost); roadGhost = ghostify(makeRoad(best.e), 0x7dff8a); scene.add(roadGhost); roadGhostEdge = best.e.id; }
    roadGhost.visible = showGhost; roadGhost.userData.gm.color.setHex(col);
  } else {
    const g = ghosts[best.kind]; placeAtCorner(g, best.c); g.visible = showGhost; g.scale.setScalar(1); g.userData.gm.color.setHex(col);
  }
  const names = { road: 'Wall', hamlet: 'Hamlet', keep: 'Keep', roost: 'Dragon Roost', tower: 'Scorpion Tower' };
  const where = best.c ? '   ' + best.c.tiles.map(id => tiles[id]).map(t => t.num ? `${RES[t.type]?.icon || ''}${t.num}` : '🌋').join(' ') : '';
  tip.classList.remove('hidden', 'ok', 'bad');
  tip.classList.add(best.problem ? 'bad' : 'ok');
  tip.textContent = best.problem ? `${names[best.kind]}: ✖ ${best.problem}` : `Click to build ${names[best.kind]}${best.kind === 'keep' ? ' (upgrade)' : ''}${where}`;
}

// ---------------------------------------------------------------- ground signs
// GOLD   = you can build here right now (click it)
// WHITE  = allowed here, but you need more resources
// FAINT  = a future Hamlet plot: lay one more road to reach it
const signGold = new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.95 });
const signWhite = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
const signFaint = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false });
const signCloth = { gold: mat(0xe0a020), white: mat(0xd8d2c4) };
function signTexture(icon, title, cost, ok) {
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 128; const g = cv.getContext('2d');
  g.fillStyle = ok ? '#ffd84a' : 'rgba(255,244,220,.88)';
  g.beginPath(); g.roundRect(8, 8, 304, 112, 18); g.fill();
  g.lineWidth = 7; g.strokeStyle = ok ? '#17110d' : 'rgba(23,17,13,.55)'; g.stroke();
  g.font = '64px serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(icon, 66, 66);
  g.textAlign = 'left'; g.fillStyle = '#17110d'; g.font = '40px Bangers, Impact, sans-serif'; g.fillText(title, 118, 46);
  g.font = '28px serif'; g.fillText(cost, 118, 92);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
const costIcons = kind => Object.entries(COST[kind]).map(([k, n]) => RES[k].icon.repeat(n)).join('');
const signMats = {};
for (const [kind, icon, title] of [['hamlet', '🏠', 'Hamlet'], ['keep', '🏰', 'Keep ⬆'], ['road', '🧱', 'Wall'], ['roost', '🐉', 'Roost'], ['tower', '🏹', 'Tower']])
  for (const ok of [true, false])
    signMats[kind + ok] = new THREE.SpriteMaterial({ map: signTexture(icon, title, costIcons(kind), ok), transparent: true, depthWrite: false });

// corner signs: a staked-out plot (ring + 4 stakes with pennants) + floating label
const ringGeo = new THREE.TorusGeometry(2.6, 0.18, 4, 28); ringGeo.rotateX(Math.PI / 2);
const keepRingGeo = new THREE.TorusGeometry(6.2, 0.16, 4, 40); keepRingGeo.rotateX(Math.PI / 2);
const stakeGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.6, 4); stakeGeo.translate(0, 0.8, 0);
const pennantGeo = new THREE.BoxGeometry(0.5, 0.32, 0.04); pennantGeo.translate(0.27, 1.4, 0);
const cornerSigns = corners.map(c => {
  const g = new THREE.Group(), ring = new THREE.Mesh(ringGeo, signGold); ring.position.y = 0.35; g.add(ring);
  const stakes = [];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4, st = new THREE.Group();
    st.add(new THREE.Mesh(stakeGeo, woodMat)); st.add(new THREE.Mesh(pennantGeo, signCloth.gold));
    st.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); st.rotation.y = -a; g.add(st); stakes.push(st);
  }
  g.position.set(c.x, c.y, c.z); g.visible = false; scene.add(g);
  const label = new THREE.Sprite(signMats.hamlettrue); label.scale.set(6.2, 2.5, 1); label.visible = false; scene.add(label);
  return { g, ring, stakes, label, state: null };
});
// edge signs: a dashed survey line along the edge
const dashGeo = new THREE.BoxGeometry(0.7, 0.14, 2.4);
const edgeSigns = edges.map(e => {
  const g = new THREE.Group(), A = corners[e.a], B = corners[e.b], dx = B.x - A.x, dz = B.z - A.z, N = 6;
  for (let i = 0; i < N; i++) {
    const t = 0.18 + 0.64 * (i + 0.5) / N, x = A.x + dx * t, z = A.z + dz * t;
    const d = new THREE.Mesh(dashGeo, signGold); d.position.set(x, heightAt(x, z) + 0.25, z);
    d.lookAt(x + dx, heightAt(x, z) + 0.25, z + dz); g.add(d);
  }
  g.visible = false; scene.add(g);
  const label = new THREE.Sprite(signMats.roadtrue); label.scale.set(4.6, 1.85, 1);
  label.position.set(e.mx, heightAt(e.mx, e.mz) + 3, e.mz); label.visible = false; scene.add(label);
  return { g, label };
});
function refreshMarkers() {
  const play = state.phase === 'play', filter = state.mode;
  corners.forEach((c, i) => {
    const s = cornerSigns[i];
    let kind = null;
    if (filter === 'roost' || filter === 'tower') kind = siteReady(filter, c) ? filter : null;
    else if (siteReady('keep', c)) kind = 'keep';
    else if (siteReady('hamlet', c)) kind = 'hamlet';
    // future plot: legal for distance rule, and one road away from your network
    const future = play && !kind && !c.building && !c.adj.some(id => corners[id].building) && c.edges.some(id => !roadProblem(edges[id]));
    const show = play && ((kind && (!filter || filter === kind)) || (future && (!filter || filter === 'hamlet' || filter === 'road')));
    s.g.visible = !!show; s.label.visible = !!(show && kind);
    if (!show) return;
    const ok = kind && canAfford(kind);
    const m = !kind ? signFaint : ok ? signGold : signWhite;
    s.ring.material = m; s.stakes.forEach(st => { st.visible = !!kind; st.children[1].material = ok ? signCloth.gold : signCloth.white; });
    s.ring.geometry = kind && kind !== 'hamlet' ? keepRingGeo : ringGeo; s.ring.position.y = 0.3;
    if (kind) { s.label.material = signMats[kind + !!ok]; s.label.position.set(c.x, c.y + (kind === 'hamlet' ? 5.5 : 12), c.z); }
  });
  edges.forEach((e, i) => {
    const s = edgeSigns[i], ready = play && siteReady('road', e) && (!filter || filter === 'road');
    s.g.visible = ready; s.label.visible = ready && (!!filter || canAfford('road'));
    if (!ready) return;
    const ok = canAfford('road');
    s.g.children.forEach(d => d.material = ok ? signGold : signWhite);
    s.label.material = signMats['road' + ok];
  });
}

// ---------------------------------------------------------------- HUD
const $ = id => document.getElementById(id);
$('resources').innerHTML = RES_KEYS.map(k => `<div class="res" id="r-${k}"><div class="ic">${RES[k].icon}</div><div class="n">0</div><div class="nm">${RES[k].name}</div></div>`).join('');
const costStr = kind => Object.entries(COST[kind]).map(([k, n]) => RES[k].icon.repeat(n)).join(' ');
$('buildMenu').innerHTML = [['road', '🧱', 'Wall'], ['hamlet', '🏠', 'Hamlet'], ['keep', '🏰', 'Keep'], ['roost', '🐉', 'Roost'], ['tower', '🏹', 'Tower']].map(([k, ic, nm]) =>
  `<div class="slot" id="b-${k}" data-k="${k}"><i>${ic}</i><div><b>${nm}</b><div class="c">${costStr(k).replace(/ /g, '')}</div></div></div>`).join('');
$('buildMenu').addEventListener('click', e => { const k = e.target.closest('[data-k]')?.dataset.k; if (!k || state.phase !== 'play') return; setMode(state.mode === k ? null : k); });
function closeMenus() {}
$('actTrade').addEventListener('click', () => { closeMenus(); if (state.phase === 'play' && !state.reaverPick) toggleTrade(); });
$('actLore').addEventListener('click', () => { closeMenus(); if (state.phase === 'play' && !state.reaverPick) toggleLore(); });
$('actMap').addEventListener('click', () => { closeMenus(); if (state.phase === 'play') toggleMap(); });
$('actHome').addEventListener('click', () => { closeMenus(); recall(); });
$('actFire').addEventListener('click', () => dragonfire());
$('actDragon').addEventListener('click', () => {
  closeMenus(); if (state.phase !== 'play') return;
  const d = dragonOf(P);
  if (state.riding || (d && d.stage !== 'egg')) return toggleRide();
  if (state.carrying) return log('🥚 Walk back to your Roost: the egg is placed in the nest automatically');
  if (d) return log(`🥚 ${dragonStatus()}`);
  if (!roostOf(P)) { setMode('roost'); return log('🐉 First build a Dragon Roost beside one of your Keeps (gold signs show where)'); }
  const egg = cradleEggs.filter(e => !e.taken).sort((a, b) => Math.hypot(a.x - player.pos.x, a.z - player.pos.z) - Math.hypot(b.x - player.pos.x, b.z - player.pos.z))[0];
  if (!egg) return log('⚠️ No dragon eggs are left in the Cradle');
  if (Math.hypot(egg.x - player.pos.x, egg.z - player.pos.z) < 6) tryEgg(); else { walkTo({ x: egg.x * 0.8, z: egg.z * 0.8 }); log('🥚 Walking to the Cradle to fetch an egg…'); }
});
$('modeChip').addEventListener('click', () => setMode(null));
$('ravenYes').addEventListener('click', () => answerRaven(true));
$('hurryBtn').addEventListener('click', () => { if (!NET.online && state.phase === 'play' && state.harvestT > 1) { state.harvestT = 0.6; log('⏩ You call the harvest early'); } });
$('ravenNo').addEventListener('click', () => answerRaven(false));
$('houseToggle').addEventListener('click', () => $('details').classList.toggle('hidden'));
// help overlay and the beginner guide
let guideOn = true;
try { guideOn = localStorage.getItem('dh-guide') !== 'off'; } catch (_) {}
function setGuide(on) {
  guideOn = on; try { localStorage.setItem('dh-guide', on ? 'on' : 'off'); } catch (_) {}
  $('btnGuide').textContent = on ? '🎓 Guide: ON' : '🎓 Guide: OFF'; $('btnGuide').classList.toggle('on', on); if (state.phase !== 'title') updateObjective();
}
$('btnGuide').addEventListener('click', () => setGuide(!guideOn));
$('btnHelp').addEventListener('click', () => $('helpOverlay').classList.remove('hidden'));
$('helpClose').addEventListener('click', () => $('helpOverlay').classList.add('hidden'));
setGuide(guideOn);
$('goal').textContent = GOAL;
function updateHUD() {
  for (const k of RES_KEYS) document.querySelector(`#r-${k} .n`).textContent = state.res[k];
  for (const k of ['road', 'hamlet', 'keep', 'roost', 'tower']) {
    const el = $('b-' + k);
    el.classList.toggle('active', state.mode === k);
    el.classList.toggle('poor', state.phase === 'play' && (!canAfford(k) || limitHit(k)));
  }
  $('actTrade').classList.toggle('poor', !RES_KEYS.some(k => state.res[k] >= 1));
  $('renown').textContent = totalRenown(P);
  const me = players[P];
  if (me) $('dragonbits').textContent = dragonStatus();
  $('actLore').classList.toggle('poor', state.phase === 'play' && !canAfford('scroll') && !(me && me.scrolls.some(c => canPlay(me, c))));
  $('actBuild').classList.toggle('ready', state.phase === 'play' && ['road', 'hamlet', 'keep', 'roost', 'tower'].some(k => canAfford(k) && !limitHit(k)));
  $('modeChip').classList.toggle('hidden', !state.mode || state.phase !== 'play');
  if (state.mode) $('modeChip').textContent = `Placing: ${{ road: 'Wall', hamlet: 'Hamlet', keep: 'Keep', roost: 'Dragon Roost', tower: 'Scorpion Tower' }[state.mode]}  ✕`;
  if (me) {
    const d = dragonOf(P);
    $('actDragonLabel').textContent = state.riding ? 'Land' : d && d.stage !== 'egg' ? 'Ride' : state.carrying ? 'Carrying' : d ? 'Egg' : roostOf(P) ? 'Get egg' : 'Dragon';
    $('actDragon').classList.toggle('poor', !roostOf(P) && !canAfford('roost'));
    $('actFire').classList.toggle('hidden', !(state.riding && d && d.stage === 'grown'));
    $('actHome').classList.toggle('hidden', !!state.riding);
    document.querySelectorAll('#dpad .fly').forEach(b => b.classList.toggle('hidden', !state.riding));
  }
  if (me) $('lorebits').textContent = `📜 ${me.scrolls.length} scrolls` + (secretOf(P) ? ` (👑 ${secretOf(P)} secret ★)` : '') + ` · ⚔️ ${me.knights} Sellswords` + (state.hostHolder === P ? ' · Mightiest Host +2★' : ' (Host: 3+ and the most)') + (me.freeRoads ? ` · 🧱 ${me.freeRoads} free walls` : '');
  $('housesub').textContent = `Hamlets ${state.built.hamlet}/${LIMITS.hamlet} · Keeps ${state.built.keep}/${LIMITS.keep} · Walls ${state.built.road}/${LIMITS.road}`;
  $('highway').textContent = state.highwayHolder === P ? `🧱 Great Wall held (${state.longest} walls) +2★` : `Longest wall: ${state.longest} (Great Wall: 5+ and the longest)`;
  const bearer = state.order.length && state.hornIdx >= 0 ? hornBearer() : null;
  $('scores').innerHTML = players.map(p => `<div class="row ${p.id === P ? 'me' : ''}" style="--hc:${p.house.css}"><span class="sw"></span>${p.house.sigil} ${p.id === P ? 'You' : (!p.ai && p.name ? p.name : p.house.name.replace('House ', '')) + (!p.ai ? ' 👤' : '')}` +
    `<span class="tags">${p.dragon ? { egg: '🥚', wyrmling: '🐲', grown: '🐉' }[p.dragon.stage] : ''}${p.scrolls?.length && p.id !== P ? '📜' + p.scrolls.length : ''}${state.highwayHolder === p.id ? '🧱' : ''}${state.hostHolder === p.id ? '⚔️' : ''}${bearer === p.id ? '🎺' : ''}</span><b>${p.id === P ? totalRenown(p.id) : renown(p.id)}★</b></div>`).join('');
}
function updateObjective() {
  const o = $('objective');
  let html = null, go = null;
  if (state.phase === 'setup') {
    const msgs = ['Click a <b>gold dot</b> on the map to place your first Hamlet. More dots under the numbers = more harvests',
      'Click a <b>gold dot</b> next to your Hamlet to build a wall',
      'Place your <b>second Hamlet</b>. Its lands give your starting supplies',
      'Build a wall from your second Hamlet. Then the mist rolls in'];
    html = myLandingTurn() ? `🎯 <b>Your turn</b> · ${msgs[players[P]?.setupStep || 0]}` : `⏳ ${nameOf(setupPid())} is choosing where to land…`;
  } else if (state.reaverPick) {
    html = (state.reaverReason === 'sellsword' ? '⚔️ Your Sellswords march!' : '🎺 You hold the Horn!') + ' <b>Click a region</b> on the map: the Reavers block it and rob a rival there';
  } else if (state.phase === 'play' && guideOn) {
    const g = nextGoal(); currentGoal = g;
    html = `<span class="goal-tag">🎯 NEXT GOAL</span> ${g.text}`;
    go = g.target;
  }
  o.classList.toggle('hidden', !html);
  if (html) o.innerHTML = html + (go ? ' <button class="small go" id="goBtn">🧭 Go</button>' : '');
  if (go) $('goBtn').onclick = () => { if (state.riding) flyTo(go); else walkTo(go); };
  beacon.visible = !!(go && guideOn && state.phase === 'play');
  if (beacon.visible) beacon.position.set(go.x, heightAt(go.x, go.z), go.z);
}
let currentGoal = null;
const beacon = (() => {   // a pillar of light over the next goal
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 70, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.geometry.translate(0, 35, 0); m.visible = false; scene.add(m); return m;
})();
const needTxt = kind => { const m = []; for (const [k, n] of Object.entries(COST[kind])) if (state.res[k] < n) m.push(`${n - state.res[k]} ${RES[k].icon}`); return m.join(' '); };
const at = c => ({ x: c.x - c.x / (Math.hypot(c.x, c.z) || 1) * 4, z: c.z - c.z / (Math.hypot(c.x, c.z) || 1) * 4 });
// What should a beginner do right now? One clear step at a time.
function nextGoal() {
  const me = players[P], d = dragonOf(P), have = ownedTypes(P);
  if (state.carrying) { const c = roostOf(P); return { text: 'Carry the <b>dragon egg</b> home to your Roost', target: c && at(c) }; }
  if (state.riding && d && d.stage === 'grown' && d.fireCD === 0 && !d.restless) {
    const t = tiles.find(t => !scorchProblem(P, t));
    return { text: 'Fly over a rival\'s region and press <b>🔥 FIRE</b>. It yields nothing next harvest', target: t && { x: t.x, z: t.z } };
  }
  if (state.riding) return { text: 'Click anywhere to fly there. Higher up you see through the mist. Press <b>Land</b> to get off', target: null };
  if (canAfford('keep') && !limitHit('keep')) {
    const c = corners.filter(c => owns(c) && c.building.type === 'hamlet').sort((a, b) => cornerScore(b, P) - cornerScore(a, P))[0];
    if (c) return { text: 'Upgrade a Hamlet to a <b>Keep</b>: it harvests double (+1★). Click the gold ring', target: at(c) };
  }
  const site = !limitHit('hamlet') ? bestSite(P) : null;
  if (site && canAfford('hamlet')) return { text: 'Found a new <b>Hamlet</b> on the gold ring (+1★)', target: at(site) };
  if (canAfford('road') && !limitHit('road') && !(site && missing('hamlet').length <= 1)) {
    const e = bestRoad(P, false);
    if (e) return { text: 'Build a <b>Wall</b> toward a new Hamlet spot: click the gold dashed line', target: { x: e.mx * 0.92, z: e.mz * 0.92 } };
  }
  if (roostOf(P) && !d) { const egg = cradleEggs.find(e => !e.taken); if (egg) return { text: 'Fetch a <b>dragon egg</b> from the volcano and carry it to your Roost', target: { x: egg.x * 0.8, z: egg.z * 0.8 } }; }
  if (!roostOf(P) && me.built.keep > 0 && canAfford('roost')) { const c = corners.find(c => owns(c) && c.building.type === 'keep' && !roostProblem(c)); if (c) return { text: 'Build a <b>Dragon Roost</b> beside your Keep (🔨 Build → Dragon Roost)', target: at(c) }; }
  if (d && d.stage !== 'egg' && !d.restless && !state.riding) return { text: 'Your dragon is ready: press <b>Ride</b> to fly and scout through the mist', target: null };
  if (isNight()) {
    const c = corners.filter(c => c.building && c.building.owner !== P && c.raided !== dayCount).sort((a, b) => Math.hypot(a.x - player.pos.x, a.z - player.pos.z) - Math.hypot(b.x - player.pos.x, b.z - player.pos.z))[0];
    if (c && Math.hypot(c.x - player.pos.x, c.z - player.pos.z) < 120) return { text: '🌙 Night: sneak to a rival Hamlet and press <b>Raid</b> to steal 1 resource. Beware their towers and lords', target: at(c) };
  }
  // what are we saving for, and can the Guild help?
  const goal = site || corners.some(c => !c.building && !c.adj.some(id => corners[id].building) && c.edges.some(id => !roadProblem(edges[id]))) ? 'hamlet' : me.built.hamlet ? 'keep' : 'road';
  const lack = RES_KEYS.filter(k => state.res[k] < (COST[goal][k] || 0)), spare = RES_KEYS.find(k => state.res[k] - (COST[goal][k] || 0) >= guildRate());
  if (lack.length && spare) return { text: `${isDusk() ? '🌇 Dusk market! ' : ''}Trade at the Guild: ${guildRate()} ${RES[spare].icon} → 1 ${RES[lack[0]].icon} (⚖️ Trade) to get closer to a ${goal === 'keep' ? 'Keep' : goal === 'hamlet' ? 'Hamlet' : 'Wall'}`, target: null };
  if (canAfford('scroll') && deckCount() && resTotal(P) >= 6) return { text: 'Study a <b>Lore Scroll</b> (📜 Scrolls): Sellswords, secret Renown and more', target: null };
  const nums = [...new Set(corners.filter(c => owns(c)).flatMap(c => c.tiles.map(id => tiles[id].num)).filter(Boolean))].sort((a, b) => a - b);
  void have;
  return { text: `Save up for a <b>${goal === 'keep' ? 'Keep' : goal === 'hamlet' ? 'Hamlet' : 'Wall'}</b> (need ${needTxt(goal) || 'nothing'}). Your lands harvest on <b>${nums.join(', ') || '—'}</b>`, target: null };
}
setInterval(() => { if (state.phase === 'play') updateObjective(); }, 700);
function flashRes(k, loss) {
  const el = $('r-' + k); el.classList.remove('flash', 'loss'); void el.offsetWidth; el.classList.add(loss ? 'loss' : 'flash');
  setTimeout(() => el.classList.remove('flash', 'loss'), 900);
}
function log(msg) {
  const d = document.createElement('div'); d.textContent = msg; $('log').prepend(d);
  while ($('log').children.length > 9) $('log').lastChild.remove();
}
let annTimer = 0;
function announce(big, small) { $('annBig').textContent = big; $('annSmall').textContent = small || ''; $('announce').classList.add('show'); annTimer = 3.2; }

// trade
const tgive = {}, tget = {};
const bundleSum = o => RES_KEYS.reduce((n, k) => n + (o[k] || 0), 0);
const bundleTxt = o => RES_KEYS.filter(k => o[k] > 0).map(k => `${o[k]}${RES[k].icon}`).join(' ') || 'nothing';
function resetTrade() { RES_KEYS.forEach(k => { tgive[k] = 0; tget[k] = 0; }); }
resetTrade();
// Guild: 4 of one kind for each 1 of anything; the bundle may combine several such swaps
const guildRate = () => isDusk() ? 3 : 4;
function guildOK(give, get, res) {
  const g = bundleSum(give), r = bundleSum(get), q = guildRate();
  return g > 0 && r > 0 && g === q * r && RES_KEYS.every(k => (give[k] || 0) % q === 0 && !(give[k] && get[k]) && res[k] >= (give[k] || 0));
}
function renderTrade() {
  $('tradeTable').innerHTML = '<tr><th></th><th>have</th><th>you GIVE</th><th>you GET</th></tr>' + RES_KEYS.map(k => `<tr>
    <td>${RES[k].icon} ${RES[k].name}</td><td class="have">${state.res[k]}</td>
    <td><button class="st" data-a="g-" data-k="${k}">−</button><b class="${tgive[k] ? 'on' : ''}">${tgive[k]}</b><button class="st" data-a="g+" data-k="${k}">+</button></td>
    <td><button class="st" data-a="r-" data-k="${k}">−</button><b class="${tget[k] ? 'on' : ''}">${tget[k]}</b><button class="st" data-a="r+" data-k="${k}">+</button></td></tr>`).join('');
  const g = bundleSum(tgive), r = bundleSum(tget);
  $('tradeInfo').innerHTML = `<b>Guild</b>: ${guildRate()} of one kind for each 1 of anything${isDusk() ? ' <b>(🌇 dusk market!)</b>' : ''}. <b>Ravens</b>: offer any bundle to the other houses; they accept if it helps them and is fair.`;
  $('tradeSummary').innerHTML = g || r ? `You give <b>${bundleTxt(tgive)}</b> → you get <b>${bundleTxt(tget)}</b>` + (g && r && !guildOK(tgive, tget, state.res) ? `<div class="muted">Guild: give ${guildRate()} of one kind for each 1 you get</div>` : '') : '<span class="muted">Use + and − to build an offer</span>';
  const enough = RES_KEYS.every(k => state.res[k] >= tgive[k]);
  $('tradeBtn').disabled = !guildOK(tgive, tget, state.res); $('tradeBtn').style.opacity = $('tradeBtn').disabled ? 0.5 : 1;
  $('ravenBtn').disabled = !(g && r && enough); $('ravenBtn').style.opacity = $('ravenBtn').disabled ? 0.5 : 1;
}
$('tradeTable').addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const k = b.dataset.k, a = b.dataset.a;
  if (a === 'g+' && tgive[k] < state.res[k]) { tgive[k]++; tget[k] = 0; }
  if (a === 'g-' && tgive[k] > 0) tgive[k]--;
  if (a === 'r+' && tget[k] < 9) { tget[k]++; tgive[k] = 0; }
  if (a === 'r-' && tget[k] > 0) tget[k]--;
  renderTrade();
});
$('tradeClear').addEventListener('click', () => { resetTrade(); $('ravenStatus').textContent = ''; renderTrade(); });
function applyBundle(pid, give, get, other = null) {
  RES_KEYS.forEach(k => { const g = give[k] || 0, r = get[k] || 0; players[pid].res[k] += r - g; if (other) other.res[k] += g - r; });
}
$('tradeBtn').addEventListener('click', () => {
  if (!guildOK(tgive, tget, state.res)) return;
  if (NET.guest) netAct({ a: 'guild', give: { ...tgive }, get: { ...tget } });
  else { applyBundle(P, tgive, tget); log(`⚖️ Guild trade: ${bundleTxt(tgive)} → ${bundleTxt(tget)}`); RES_KEYS.forEach(k => tget[k] && flashRes(k)); sfx('build'); updateHUD(); refreshMarkers(); }
  resetTrade(); renderTrade();
});
$('tradeClose').addEventListener('click', () => toggleTrade(false));
$('ravenBtn').addEventListener('click', () => { if (!$('ravenBtn').disabled) sendRaven({ ...tgive }, { ...tget }); });
function toggleTrade(force) {
  const el = $('trade'), open = force ?? el.classList.contains('hidden');
  if (open) {
    if (state.phase === 'setup') { log('⚠️ Finish your landing first'); return; }
    el.classList.remove('hidden'); state.paused = !NET.online; resetTrade(); $('ravenStatus').textContent = ''; renderTrade(); document.exitPointerLock?.();
  } else {
    el.classList.add('hidden'); state.paused = false; $('pause').classList.add('hidden'); lockPointer();
  }
}

// Lore panel
let lorePick = null;   // { idx, type, picks: [] } while choosing resources for Bountiful Harvest / Royal Decree
function renderLore() {
  const me = players[P];
  $('deckLeft').textContent = `${deckCount()} scrolls left in the library · cost ${costStr('scroll')}`;
  $('buyScroll').disabled = !deckCount() || !canAfford('scroll'); $('buyScroll').style.opacity = $('buyScroll').disabled ? 0.5 : 1;
  $('hand').innerHTML = me.scrolls.length ? me.scrolls.map((c, i) => {
    const S = SCROLLS[c.type];
    const btn = c.type === 'renown' ? '<div class="muted">kept secret · +1★</div>'
      : canPlay(me, c) ? `<button class="small" data-play="${i}">PLAY</button>`
      : `<div class="muted">${me.playedAt === state.harvests && state.harvests > c.boughtAt ? 'one scroll per harvest' : 'ready after the next harvest'}</div>`;
    return `<div class="scard"><div class="si">${S.icon}</div><div class="sn">${S.name}</div><div class="sd">${S.desc}</div>${btn}</div>`;
  }).join('') : '<div class="muted">You hold no scrolls yet.</div>';
  if (lorePick) {
    const n = lorePick.type === 'harvest' ? 2 : 1;
    $('lorePick').innerHTML = `<div style="margin:8px 0 4px">${lorePick.type === 'harvest' ? `Choose 2 resources (${lorePick.picks.map(k => RES[k].icon).join(' ') || '…'})` : 'Name the resource to claim:'}</div>` +
      `<div class="grid">${RES_KEYS.map(k => `<div class="pick" data-res="${k}">${RES[k].icon}<br>${RES[k].name}${lorePick.type === 'decree' ? `<br><span class="muted">rivals hold ?</span>` : ''}</div>`).join('')}</div>`;
    void n;
  } else $('lorePick').innerHTML = '';
}
$('buyScroll').addEventListener('click', () => {
  if (NET.guest) { if (canAfford('scroll')) { netAct({ a: 'scroll_buy' }); $('loreStatus').textContent = '📜 Unrolling…'; } return; }
  const t = buyScroll(P); if (!t) return;
  const S = SCROLLS[t];
  $('loreStatus').textContent = `📜 You unroll a scroll: ${S.icon} ${S.name}!`; log(`📜 You buy a Lore Scroll: ${S.icon} ${S.name}`); sfx('build');
  updateHUD(); refreshMarkers(); renderLore(); checkWin();
});
$('hand').addEventListener('click', e => {
  const b = e.target.closest('[data-play]'); if (!b) return;
  const i = +b.dataset.play, c = players[P].scrolls[i];
  if (c.type === 'harvest' || c.type === 'decree') { lorePick = { idx: i, type: c.type, picks: [] }; renderLore(); return; }
  if (c.type === 'sellsword') { $('lore').classList.add('hidden'); if (NET.guest) { state.sellswordIdx = i; startReaverPick('sellsword'); } else playScroll(P, i); return; }   // opens the war map
  if (NET.guest) { netAct({ a: 'scroll_play', idx: i }); return; }
  playScroll(P, i); renderLore();
});
$('lorePick').addEventListener('click', e => {
  const k = e.target.closest('[data-res]')?.dataset.res; if (!k || !lorePick) return;
  lorePick.picks.push(k);
  if (lorePick.type === 'decree' || lorePick.picks.length === 2) {
    const { idx, picks, type } = lorePick; lorePick = null;
    if (NET.guest) netAct({ a: 'scroll_play', idx, arg: type === 'decree' ? picks[0] : picks });
    else playScroll(P, idx, type === 'decree' ? picks[0] : picks);
  }
  renderLore();
});
$('loreClose').addEventListener('click', () => toggleLore(false));
function toggleLore(force) {
  const el = $('lore'), open = force ?? el.classList.contains('hidden');
  if (open) {
    if (state.phase !== 'play') return;
    el.classList.remove('hidden'); state.paused = !NET.online; lorePick = null; $('loreStatus').textContent = ''; renderLore(); document.exitPointerLock?.();
  } else {
    el.classList.add('hidden'); state.paused = false; $('pause').classList.add('hidden'); lockPointer();
  }
}

// ---------------------------------------------------------------- visibility (fog of war)
function computeVisibility() {
  visible.clear();
  if (state.phase !== 'play' || state.dragonEye) { tiles.forEach(t => visible.add(t.id)); return; }
  const sight = SIGHT + (state.riding ? Math.min(170, Math.max(0, player.pos.y - heightAt(player.pos.x, player.pos.z)) * 1.8) : 0);   // higher = see further
  for (const t of tiles) if (Math.hypot(t.x - player.pos.x, t.z - player.pos.z) < sight) visible.add(t.id);
  for (const c of corners) if (owns(c)) c.tiles.forEach(id => visible.add(id));
  for (const e of edges) if (e.road === P) [e.a, e.b].forEach(cid => corners[cid].tiles.forEach(id => visible.add(id)));
  visible.forEach(id => explored.add(id));
}
const isKnown = t => state.phase !== 'play' || state.dragonEye || explored.has(t.id);
function applyFogToWorld(dt) {
  for (const t of tiles) if (t.banner) { const k = isKnown(t); t.banner.visible = k; t.pole.visible = k; }
  reavers.visible = visible.has(reaverTile.id);
  const thick = state.phase === 'play' && !state.dragonEye;
  const alt = state.riding ? Math.max(0, player.pos.y - heightAt(player.pos.x, player.pos.z)) : 0;
  const near = thick ? 45 - night * 12 + alt : 160, far = thick ? Math.min(600, 200 - night * 45 + alt * 2.6) : 650, a = Math.min(1, dt * 0.8);
  scene.fog.near += (near - scene.fog.near) * a; scene.fog.far += (far - scene.fog.far) * a;
}

// ---------------------------------------------------------------- war map (minimap / war table)
const mm = $('minimap'), mctx = mm.getContext('2d');
let mapHover = null;
const mapScale = () => mm.width / (mm.classList.contains('big') ? 300 : 330);
function toggleMap() { setWarMap(!mm.classList.contains('big')); }
function setWarMap(open) {
  mm.classList.toggle('big', open); mm.width = mm.height = open ? 1000 : 460;
}
function mapToWorld(ev) {
  const r = mm.getBoundingClientRect(), px = (ev.clientX - r.left) * mm.width / r.width, py = (ev.clientY - r.top) * mm.height / r.height;
  const sc = mapScale(); return { x: (px - mm.width / 2) / sc, z: (py - mm.height / 2) / sc };
}
function mapTargetAt(ev) {
  if (state.phase !== 'setup' || !state.mode) return null;
  const w = mapToWorld(ev); let best = null, bd = 1e9;
  if (state.mode === 'road') { for (const e of edges) { const d = Math.hypot(e.mx - w.x, e.mz - w.z); if (d < bd) { bd = d; best = { e }; } } }
  else for (const c of corners) { const d = Math.hypot(c.x - w.x, c.z - w.z); if (d < bd) { bd = d; best = { c }; } }
  if (bd > 11) return null;
  best.problem = problemFor(state.mode, best); return best;
}
let reaverHover = null;
mm.addEventListener('mousemove', ev => { mapHover = mapTargetAt(ev); if (state.reaverPick) { const w = mapToWorld(ev); reaverHover = tileAtWorld(w.x, w.z); } });
mm.addEventListener('mouseleave', () => { mapHover = null; });
mm.addEventListener('mousedown', ev => {
  if (state.reaverPick) { const w = mapToWorld(ev), tile = tileAtWorld(w.x, w.z); if (tile && tile !== reaverTile) finishReaverPick(tile); return; }
  if (state.phase === 'play') {   // click the map to travel there
    const w = mapToWorld(ev); if (state.riding) flyTo(w); else walkTo(w);
    if (mm.classList.contains('big')) setWarMap(false);
    return;
  }
  const t = mapTargetAt(ev); if (!t) return;
  if (t.problem) { log('⚠️ ' + t.problem); sfx('bad'); return; }
  tryBuild(t); mapHover = null;
});

function cornerInfo(c) {
  const ts = c.tiles.map(id => tiles[id]);
  return ts.map(t => t.num ? `${RES[t.type].icon}${t.num}` : '🌋').join('  ') + `   ·   ${ts.reduce((s, t) => s + PIPS(t.num), 0)} pips`;
}
function hexPath(t, X, Y) { mctx.beginPath(); t.corners.forEach((cid, i) => { const c = corners[cid]; i ? mctx.lineTo(X(c.x), Y(c.z)) : mctx.moveTo(X(c.x), Y(c.z)); }); mctx.closePath(); }
function drawMinimap() {
  const W = mm.width, big = mm.classList.contains('big'), sc = mapScale(), u = W / 460;
  const X = x => W / 2 + x * sc, Y = z => W / 2 + z * sc;
  const fs = W * (big ? 0.03 : 0.042);
  mctx.clearRect(0, 0, W, W);
  mctx.fillStyle = '#1d4f6b'; mctx.fillRect(0, 0, W, W);
  mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
  for (const t of tiles) {
    const known = isKnown(t), live = visible.has(t.id);
    hexPath(t, X, Y);
    mctx.fillStyle = known ? BIOME[t.type].mini : '#4b525c'; mctx.fill();
    if (known && !live) { mctx.fillStyle = 'rgba(20,24,30,.45)'; mctx.fill(); }
    mctx.strokeStyle = 'rgba(255,240,200,.5)'; mctx.lineWidth = 1.5 * u; mctx.stroke();
    if (!known) {   // drifting mist
      mctx.fillStyle = 'rgba(220,226,235,.18)';
      for (let k = 0; k < 4; k++) { mctx.beginPath(); mctx.arc(X(t.x) + Math.cos(k * 1.7 + t.id) * 12 * sc / 1.5, Y(t.z) + Math.sin(k * 2.3 + t.id) * 9 * sc / 1.5, 11 * sc / 1.5, 0, 7); mctx.fill(); }
      mctx.fillStyle = 'rgba(255,255,255,.55)'; mctx.font = `bold ${fs}px Georgia`; mctx.fillText('?', X(t.x), Y(t.z));
      continue;
    }
    if (t.num) {
      mctx.fillStyle = '#efe0bd'; mctx.beginPath(); mctx.arc(X(t.x), Y(t.z), fs * 0.95, 0, 7); mctx.fill();
      mctx.fillStyle = (t.num === 6 || t.num === 8) ? '#b3261e' : '#2b1d12';
      mctx.font = `bold ${fs}px Georgia`; mctx.fillText(t.num, X(t.x), Y(t.z) + 1);
    } else { mctx.font = `${fs * 1.4}px serif`; mctx.fillText('🌋', X(t.x), Y(t.z)); }
    if (big && RES[t.type]) { mctx.font = `${fs * 1.1}px serif`; mctx.fillText(RES[t.type].icon, X(t.x), Y(t.z) - fs * 2.1); }
    if (t === reaverTile && live) { mctx.font = `${fs * 1.3}px serif`; mctx.fillText('🏴', X(t.x) + fs * 1.5, Y(t.z) + fs * 0.9); }
  }
  // war-table markers during landing
  if (state.phase === 'setup' && state.mode) {
    mctx.fillStyle = 'rgba(255,211,106,.9)';
    if (state.mode === 'road') edges.forEach(e => { if (!roadProblem(e)) { mctx.beginPath(); mctx.arc(X(e.mx), Y(e.mz), 5 * u, 0, 7); mctx.fill(); } });
    else corners.forEach(c => { if (!hamletProblem(c)) { mctx.beginPath(); mctx.arc(X(c.x), Y(c.z), 4.5 * u, 0, 7); mctx.fill(); } });
  }
  // rival holdings only appear where you have explored (you can't see through the mist)
  const cornerKnown = c => c.building?.owner === P || c.tiles.some(id => isKnown(tiles[id]));
  const css = pid => players[pid]?.house.css || HOUSE.css;
  mctx.lineWidth = 4 * u;
  for (const e of edges) if (e.road !== null && (e.road === P || (cornerKnown(corners[e.a]) && cornerKnown(corners[e.b])))) {
    const A = corners[e.a], B = corners[e.b]; mctx.strokeStyle = css(e.road); mctx.beginPath(); mctx.moveTo(X(A.x), Y(A.z)); mctx.lineTo(X(B.x), Y(B.z)); mctx.stroke();
    mctx.fillStyle = '#fff4dc'; mctx.beginPath(); mctx.arc(X((A.x + B.x) / 2), Y((A.z + B.z) / 2), 2.2 * u, 0, 7); mctx.fill();   // the gate
  }
  for (const c of corners) if (c.building && cornerKnown(c)) {
    const s = (c.building.type === 'keep' ? 9 : 6) * u;
    mctx.fillStyle = css(c.building.owner); mctx.strokeStyle = c.building.owner === P ? '#fff' : '#17110d'; mctx.lineWidth = 2 * u;
    mctx.beginPath(); c.building.type === 'keep' ? mctx.rect(X(c.x) - s, Y(c.z) - s, s * 2, s * 2) : mctx.arc(X(c.x), Y(c.z), s, 0, 7); mctx.fill(); mctx.stroke();
  }
  // rival lords you can currently see
  for (const p of players) if (p.id !== P && p.avatar && p.avatar.visible && state.phase === 'play') {
    mctx.fillStyle = p.house.css; mctx.strokeStyle = '#17110d'; mctx.lineWidth = 2 * u;
    mctx.beginPath(); mctx.arc(X(p.pos.x), Y(p.pos.z), 7 * u, 0, 7); mctx.fill(); mctx.stroke();
    mctx.font = `${9 * u}px serif`; mctx.fillText(p.house.sigil, X(p.pos.x), Y(p.pos.z) + 0.5 * u);
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh || !d.mesh.visible || state.phase !== 'play' || (p.id === P && state.riding)) continue;
    mctx.font = `${16 * u}px serif`; mctx.fillText('🐉', X(d.pos.x), Y(d.pos.z));
    mctx.strokeStyle = p.house.css; mctx.lineWidth = 2.5 * u; mctx.beginPath(); mctx.arc(X(d.pos.x), Y(d.pos.z), 10 * u, 0, 7); mctx.stroke();
  }
  if (state.reaverPick && reaverHover) {
    hexPath(reaverHover, X, Y); mctx.lineWidth = 5 * u;
    mctx.strokeStyle = reaverHover === reaverTile ? '#888' : '#d01818'; mctx.stroke();
    mctx.fillStyle = 'rgba(208,24,24,.25)'; mctx.fill();
    const owners = [...new Set(reaverHover.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== P))];
    const txt = reaverHover === reaverTile ? 'The Reavers are already here' : `🏴 Send Reavers here · rob: ${owners.length ? owners.map(o => players[o].house.sigil).join(' ') : 'nobody'}`;
    mctx.font = `${fs * 1.05}px Georgia`; const tw = mctx.measureText(txt).width + 30;
    mctx.fillStyle = 'rgba(22,16,12,.85)'; mctx.fillRect(W / 2 - tw / 2, W - fs * 3.2, tw, fs * 2.2);
    mctx.fillStyle = '#f3e9d2'; mctx.fillText(txt, W / 2, W - fs * 2.1);
  }
  // hover preview on the war table
  if (mapHover) {
    const ok = !mapHover.problem;
    mctx.strokeStyle = ok ? '#7dff8a' : '#ff5040'; mctx.fillStyle = ok ? 'rgba(125,255,138,.35)' : 'rgba(255,80,64,.35)'; mctx.lineWidth = 3 * u;
    if (mapHover.e) { const A = corners[mapHover.e.a], B = corners[mapHover.e.b]; mctx.lineWidth = 7 * u; mctx.beginPath(); mctx.moveTo(X(A.x), Y(A.z)); mctx.lineTo(X(B.x), Y(B.z)); mctx.stroke(); }
    else { mctx.beginPath(); mctx.arc(X(mapHover.c.x), Y(mapHover.c.z), 10 * u, 0, 7); mctx.fill(); mctx.stroke(); }
    const txt = mapHover.problem ? '✖ ' + mapHover.problem : mapHover.c ? cornerInfo(mapHover.c) : 'Click to build this wall';
    mctx.font = `${fs * 1.05}px Georgia`; const tw = mctx.measureText(txt).width + 30;
    mctx.fillStyle = 'rgba(22,16,12,.85)'; mctx.fillRect(W / 2 - tw / 2, W - fs * 3.2, tw, fs * 2.2);
    mctx.fillStyle = ok ? '#f3e9d2' : '#ff9a8a'; mctx.fillText(txt, W / 2, W - fs * 2.1);
  }
  if (state.phase !== 'play') return;
  if (beacon.visible) { mctx.font = `${18 * u}px serif`; mctx.fillText('🎯', X(beacon.position.x), Y(beacon.position.z)); }
  if (destMarker.visible) { mctx.strokeStyle = '#fff'; mctx.lineWidth = 2 * u; mctx.setLineDash([4 * u, 4 * u]); mctx.beginPath(); mctx.moveTo(X(player.pos.x), Y(player.pos.z)); mctx.lineTo(X(destMarker.position.x), Y(destMarker.position.z)); mctx.stroke(); mctx.setLineDash([]); }
  // player arrow
  const px = X(player.pos.x), py = Y(player.pos.z), a = -player.yaw;   // arrow points where you look
  mctx.save(); mctx.translate(px, py); mctx.rotate(a);
  mctx.scale(u, u); mctx.fillStyle = '#fff'; mctx.strokeStyle = '#000'; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.moveTo(0, -11); mctx.lineTo(7, 8); mctx.lineTo(0, 4); mctx.lineTo(-7, 8); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

function endLanding() {
  setWarMap(false);
  const first = corners.find(c => owns(c)) || corners[0];
  const dx = -first.x, dz = -first.z, L = Math.hypot(dx, dz) || 1;
  const x = first.x + dx / L * 9, z = first.z + dz / L * 9;
  player.pos.set(x, heightAt(x, z), z); player.yaw = Math.atan2(first.x - x, first.z - z) + Math.PI; player.pitch = -0.22;
  lockPointer();
}

// ---------------------------------------------------------------- tiny sound (WebAudio, no assets)
let actx = null;
function sfx(kind) {
  try {
    actx = actx || new AudioContext();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    const set = { build: ['triangle', 330, 520, 0.18], bad: ['square', 160, 120, 0.15], horn: ['sawtooth', 147, 196, 0.9], raid: ['sawtooth', 110, 70, 1.0], win: ['triangle', 392, 784, 1.4] }[kind];
    o.type = set[0]; o.frequency.setValueAtTime(set[1], t); o.frequency.linearRampToValueAtTime(set[2], t + set[3]);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'horn' || kind === 'raid' ? 0.12 : 0.08, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + set[3] + 0.1);
    o.start(t); o.stop(t + set[3] + 0.15);
  } catch (_) {}
}

// ---------------------------------------------------------------- start / loop
// house picker on the title screen
let chosen = 'varn';
$('housePick').innerHTML = Object.values(HOUSES).map(h => `<div class="hcard ${h.key === chosen ? 'sel' : ''}" data-k="${h.key}" style="--hc:${h.css}"><div class="sig">${h.sigil}</div><div class="hn">${h.name}</div><div class="hd">${h.desc}</div></div>`).join('');
$('housePick').addEventListener('click', e => {
  const c = e.target.closest('.hcard'); if (!c) return; chosen = c.dataset.k;
  document.querySelectorAll('.hcard').forEach(x => x.classList.toggle('sel', x.dataset.k === chosen));
});
let rivalCount = 3;
$('rivalPick').addEventListener('click', e => {
  const b = e.target.closest('[data-n]'); if (!b) return; rivalCount = +b.dataset.n;
  document.querySelectorAll('#rivalPick [data-n]').forEach(x => x.classList.toggle('sel', +x.dataset.n === rivalCount));
});
$('startBtn').addEventListener('click', () => {
  const seats = [{ id: 0, house: chosen, name: '', ai: false }];
  shuffle(Object.values(HOUSES).filter(h => h.key !== chosen)).slice(0, rivalCount).forEach((h, i) => seats.push({ id: i + 1, house: h.key, ai: true }));
  startMatch(seats);
});
// seats: [{ id, house (key), name, ai, remote }]
function startMatch(seats) {
  players.length = 0;
  for (const st of seats) players.push({
    id: st.id, house: HOUSES[st.house], name: st.name || '', ai: !!st.ai, remote: !!st.remote,
    res: st.id === P ? state.res : { timber: 0, stone: 0, wheat: 0, cattle: 0, ember: 0 },
    built: st.id === P ? state.built : { road: 0, hamlet: 0, keep: 0, roost: 0, tower: 0 },
    longest: 0, scrolls: [], knights: 0, freeRoads: 0, playedAt: -1, setupStep: 0, setupCorner: null,
  });
  HOUSE = players[P].house; houseMat = HOUSE.mat; buildGhosts(); dayT = 0.1;
  if (!NET.guest) makeDeck();
  document.querySelector('#house .name').textContent = `${HOUSE.sigil} ${players[P].name || HOUSE.name}`;
  $('start').classList.add('hidden'); $('lobby').classList.add('hidden'); $('hud').classList.remove('hidden');
  state.phase = 'setup'; state.startTime = performance.now();
  spawn(); setWarMap(true); updateHUD();
  announce('THE WAR TABLE', 'Study the isles now. Once you land, the mist rolls in.');
  if (!NET.guest) beginSetup();
  log('⚓ Your longships reach Embervale. The whole isle is visible from the sea.');
  sfx('horn');
}
$('againBtn').addEventListener('click', () => location.reload());

// ---------------------------------------------------------------- DRAGONS (Milestone 3)
// Roost on a Keep → fetch an egg from the Cradle → feed it (🔥 ×3) → Wyrmling (+1★, ride) → feed (🐄🐄 ×3)
// → Grown Dragon (+2★, Dragonfire, Dragon's Eye). A grown dragon eats 🐄🔥 every 3rd harvest or turns Restless.
const DRAGON_FEED = { egg: { ember: 1 }, wyrmling: { cattle: 2 } };
const UPKEEP = { cattle: 1, ember: 1 };
const dragonOf = pid => players[pid]?.dragon || null;
function dragonRenown(pid) { const d = dragonOf(pid); return !d ? 0 : d.stage === 'grown' ? 2 : d.stage === 'wyrmling' ? 1 : 0; }
const hasRes = (pid, need) => Object.entries(need).every(([k, n]) => players[pid].res[k] >= n);
const takeRes = (pid, need) => Object.entries(need).forEach(([k, n]) => { players[pid].res[k] -= n; });
const iconsOf = need => Object.entries(need).map(([k, n]) => RES[k].icon.repeat(n)).join('');

// --- models
const eggMat = mat(0x3b2a26, { emissive: 0xff5a1a, emissiveIntensity: 0.4 });
const eggGeo = new THREE.IcosahedronGeometry(1, 1);
function makeEgg() { const m = new THREE.Mesh(eggGeo, eggMat); m.scale.set(1, 1.4, 1); m.castShadow = true; return m; }
function roostDir(c) { const L = Math.hypot(c.x, c.z) || 1; return { x: c.x / L, z: c.z / L }; }
function nestPos(c) { const d = roostDir(c); return new THREE.Vector3(c.x + d.x * 9, c.y + 4.4, c.z + d.z * 9); }
function makeRoost(h = HOUSE) {
  return withHouse(h, () => {
    const g = new THREE.Group(), o = new THREE.Group(); o.position.set(0, 0, 9); g.add(o);
    o.add(cyl(2.2, 3.2, 7.5, 7, M.stone, 0, -3.5, 0));
    const nest = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.75, 5, 10), M.woodDark); nest.rotation.x = Math.PI / 2; nest.position.y = 4.1; o.add(nest);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, st = cyl(0.12, 0.2, 3.2, 4, M.woodLight, Math.cos(a) * 2.4, 3.8, Math.sin(a) * 2.4); st.rotation.z = Math.cos(a) * 0.5; st.rotation.x = -Math.sin(a) * 0.5; o.add(st); }
    const f = flagPole(5); f.position.set(-2.8, 0, -1.5); o.add(f);
    o.add(torch(2.8, -1.4, 3.2));
    return g;
  });
}
function makeTower(h = HOUSE) {
  return withHouse(h, () => {
    const g = new THREE.Group(), o = new THREE.Group(); o.position.set(6.5, 0, 0); g.add(o);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) o.add(cyl(0.16, 0.2, 5, 4, M.woodDark, x, 0, z));
    o.add(B(3, 0.35, 3, M.woodLight, 0, 5, 0));
    const stock = B(0.45, 0.4, 3.4, M.woodDark, 0, 5.6, 0); stock.rotation.x = -0.45; o.add(stock);
    o.add(B(3.6, 0.25, 0.25, M.iron, 0, 6.3, 0.9));
    const bolt = B(0.12, 0.12, 2.6, houseMat, 0, 6.1, 0.4); bolt.rotation.x = -0.45; o.add(bolt);
    const f = flagPole(3); f.position.set(-1.2, 5.3, -1.2); o.add(f);
    return g;
  });
}
function wingGeometry() {
  const pts = [[0, 0, 0.6], [5, 0.9, 1.7], [10, 1.5, 1.3], [15.5, 0.7, -0.6], [12.5, 0.1, -3], [13.4, -0.3, -5.8], [9.4, 0, -4.4], [8.6, -0.2, -7.4], [5.2, 0, -5.2], [3.6, 0, -7], [1.2, 0, -3.8]];
  const p = [];
  for (let i = 1; i < pts.length - 1; i++) p.push(...pts[0], ...pts[i], ...pts[i + 1]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g;
}
const WING_GEO = wingGeometry();
// Big, heavy and scary: armoured hide like cooled lava rock, glowing cracks and spines in the house colour
function makeDragon(h) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.rotation.order = 'YXZ';
  const hide = mat(0x2a2321), plate = mat(0x46372e), membrane = mat(0x3c2420, { side: THREE.DoubleSide }), bone = mat(0xd8ccb4);
  const glow = new THREE.MeshBasicMaterial({ color: h.color });
  const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), hide); torso.scale.set(1, 0.85, 2.1); body.add(torso);
  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), plate); belly.scale.set(0.85, 0.55, 1.8); belly.position.y = -0.7; body.add(belly);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.7), glow); c.position.set(sx * 2.15, 0.3 - i * 0.5, -1.2 + i * 1.2); c.rotation.y = sx * 0.25; c.rotation.x = 0.3 * i; body.add(c); }
  for (let i = 0; i < 7; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 4), glow); sp.position.set(0, 2 - Math.abs(i - 3) * 0.15, -4 + i * 1.3); sp.rotation.x = -0.35; body.add(sp); }
  // neck + head
  const neck = new THREE.Group(); neck.position.set(0, 0.9, 4); body.add(neck);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(1.6 - i * 0.15, 1.5 - i * 0.12, 1.7), hide); n.position.set(0, i * 0.8, i * 1.25); n.rotation.x = -0.45; neck.add(n);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1, 4), glow); sp.position.set(0, i * 0.8 + 0.9, i * 1.2); sp.rotation.x = -0.4; neck.add(sp);
  }
  const head = new THREE.Group(); head.position.set(0, 3.5, 5.6); neck.add(head);
  head.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.25, 2.4), hide));
  const snout = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.8, 1.8), hide); snout.position.set(0, -0.15, 1.9); head.add(snout);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.35, 2.7), plate); jaw.position.set(0, -0.8, 1.25); jaw.rotation.x = 0.28; head.add(jaw);
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 3), bone); t.rotation.x = Math.PI; t.position.set(sx * 0.55, -0.6, 1.6 + k * 0.5); head.add(t); }
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.4), glow); eye.position.set(sx * 0.75, 0.28, 0.8); head.add(eye);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.8, 5), bone); horn.position.set(sx * 0.65, 0.9, -1.2); horn.rotation.set(-2.2, 0, sx * 0.35); head.add(horn);
    const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.4, 4), bone); horn2.position.set(sx * 0.95, 0.2, -0.9); horn2.rotation.set(-2, 0, sx * 0.9); head.add(horn2);
  }
  // tail
  const tail = [];
  let parent = body;
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Group(); seg.position.set(0, i ? -0.1 : -0.2, i ? -1.7 : -4); parent.add(seg);
    const k = 1 - i / 9; seg.add(new THREE.Mesh(new THREE.BoxGeometry(1.3 * k, 1 * k, 1.9), hide));
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.28 * k + 0.1, 0.8, 4), glow); sp.position.y = 0.6 * k; seg.add(sp);
    tail.push(seg); parent = seg;
  }
  const spade = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 4), glow); spade.rotation.x = -Math.PI / 2; spade.position.z = -1.6; parent.add(spade);
  // wings with bony leading edges
  const wings = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(sx * 1.7, 1.3, 1.4); body.add(pivot);
    const w = new THREE.Mesh(WING_GEO, membrane); w.scale.x = sx; pivot.add(w);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.35, 0.35), hide); arm.position.set(sx * 7.6, 0.8, 0.6); arm.rotation.y = -sx * 0.12; pivot.add(arm);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 4), bone); claw.position.set(sx * 15.6, 0.7, -0.6); claw.rotation.z = -sx * Math.PI / 2; pivot.add(claw);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 0.08), glow); edge.position.set(sx * 7, 0.55, -2.5); edge.rotation.y = sx * 0.35; pivot.add(edge);
    wings.push(pivot);
  }
  for (const [x, zz] of [[-1.4, 2.2], [1.4, 2.2], [-1.4, -2.2], [1.4, -2.2]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2, 0.8), hide); leg.position.set(x, -1.7, zz); leg.rotation.x = 0.6; body.add(leg);
    const cl = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 4), bone); cl.position.set(x, -2.6, zz + 0.5); cl.rotation.x = 1.6; body.add(cl);
  }
  g.userData = { body, wings, tail, head };
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}

// --- eggs waiting in the Cradle (one per house)
const cradleEggs = [0, 1, 2, 3].map(i => {
  const a = i * Math.PI / 2 + 0.5, x = Math.cos(a) * 9, z = Math.sin(a) * 9, m = makeEgg();
  m.position.set(x, heightAt(x, z) + 1.2, z); scene.add(m);
  return { mesh: m, x, z, taken: false };
});
const carryEgg = makeEgg(); carryEgg.scale.set(0.35, 0.5, 0.35); carryEgg.position.set(0.55, -0.55, -1.3); carryEgg.visible = false;
camera.add(carryEgg); scene.add(camera);

// --- building
function buildRoost(c, pid = P) {
  c.roost = pid; PL(pid).built.roost++;
  const o = makeRoost(players[pid]?.house || HOUSE); placeAtCorner(o, c); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); scene.add(o); popIn(o);
}
function buildTower(c, pid = P) {
  c.tower = pid; PL(pid).built.tower++;
  const o = makeTower(players[pid]?.house || HOUSE); placeAtCorner(o, c); o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); scene.add(o); popIn(o);
}
const roostOf = pid => corners.find(c => c.roost === pid) || null;

// --- eggs: fetch & deliver
function hatchery(pid, c) {
  const p = players[pid], pos = nestPos(c), egg = makeEgg(); egg.position.copy(pos); egg.position.y += 0.4; scene.add(egg);
  p.dragon = { stage: 'egg', progress: 0, restless: false, fireCD: 0, upkeepN: 0, roost: c, mesh: null, egg, ang: rand() * 6.28, pos: pos.clone(), strike: null };
}
function tryEgg() {
  if (state.carrying || state.riding) return;
  const me = players[P];
  if (me.dragon) { log('🐉 Your house already has a dragon'); return; }
  if (!roostOf(P)) { log('⚠️ First build a Dragon Roost beside one of your Keeps (key 4)'); return; }
  const e = cradleEggs.find(e => !e.taken && Math.hypot(e.x - player.pos.x, e.z - player.pos.z) < 6);
  if (!e) { log('⚠️ Walk right up to a glowing egg in the Cradle (the volcano), then press E'); return; }
  if (NET.guest) { netAct({ a: 'egg', i: cradleEggs.indexOf(e) }); return; }
  e.taken = true; e.mesh.visible = false; state.carrying = true; carryEgg.visible = true; sfx('build');
  announce('A DRAGON EGG!', 'Carry it home to your Roost. You walk slower while carrying it');
  log('🥚 You lift a dragon egg. Bring it to your Roost!'); updateHUD();
}
function aiEggStep(p, t) {
  if (t.kind === 'egg') {
    if (t.egg.taken || p.dragon) return;
    t.egg.taken = true; t.egg.mesh.visible = false; p.carrying = true;
    p.task = { kind: 'deliver', c: roostOf(p.id) };
    if (Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 20) log(`👀 ${nameOf(p.id)} carries off a dragon egg!`);
  } else {
    p.carrying = false; hatchery(p.id, t.c);
    log(`🐦 Ravens report: ${nameOf(p.id)} has a dragon egg in its Roost 🥚`); updateHUD();
  }
}

// --- each harvest: feeding, growing, hunger, AI dragonfire
function grow(p) {
  const d = p.dragon, me = p.id === P;
  if (d.stage === 'egg') {
    d.stage = 'wyrmling'; d.progress = 0; scene.remove(d.egg);
    d.mesh = makeDragon(p.house); d.mesh.scale.setScalar(0.45); d.mesh.position.copy(d.pos);
    announce(me ? 'THE EGG HATCHES!' : 'A DRAGON IS BORN', me ? 'Your Wyrmling is here (+1★). Press F to ride it!' : `${nameOf(p.id)} has hatched a Wyrmling (+1★)`);
  } else {
    d.stage = 'grown'; d.progress = 0; d.mesh.scale.setScalar(1);
    announce(me ? 'DRAGON ASCENDANT!' : 'BEWARE THE SKIES!', me ? 'Your dragon is grown (+2★): Dragonfire (G) and the Dragon\'s Eye are yours' : `${nameOf(p.id)}'s dragon is fully grown. Scorpion Towers (key 5) keep its fire away`);
  }
  log(`🐉 ${me ? 'Your' : nameOf(p.id) + "'s"} dragon grows: ${d.stage === 'grown' ? 'Grown Dragon (+2★)' : 'Wyrmling (+1★)'}`);
  sfx('win');
}
function dragonsOnHarvest() {
  for (const t of tiles) if (t.flames && state.harvests > t.scorchedUntil) { scene.remove(t.flames); t.flames = null; if (t.banner) t.banner.material.color.setHex(0xffffff); }
  for (const p of players) {
    const d = p.dragon; if (!d) continue;
    const me = p.id === P;
    d.fireCD = Math.max(0, d.fireCD - 1);
    if (d.stage !== 'grown') {
      const need = DRAGON_FEED[d.stage];
      if (hasRes(p.id, need)) {
        takeRes(p.id, need); d.progress++;
        if (me) log(`${d.stage === 'egg' ? '🥚 Your egg drinks' : '🐲 Your Wyrmling devours'} ${iconsOf(need)} (${d.progress}/3)`);
        if (d.progress >= 3) grow(p);
      } else if (me) log(`⚠️ Your ${d.stage} needs ${iconsOf(need)} to grow. Nothing fed this harvest`);
    } else {
      d.upkeepN++;
      if (d.restless || d.upkeepN >= 3) {
        if (hasRes(p.id, UPKEEP)) {
          takeRes(p.id, UPKEEP); if (me) log(`🐉 Your dragon feeds: ${iconsOf(UPKEEP)}`);
          if (d.restless && me) announce('YOUR DRAGON IS CALM', 'Fed again: its powers return');
          d.restless = false; d.upkeepN = 0;
        } else if (!d.restless) {
          d.restless = true; d.upkeepN = 0;
          if (me) { announce('YOUR DRAGON IS RESTLESS!', `It needs ${iconsOf(UPKEEP)}. No riding, fire or Dragon's Eye until fed`); if (state.riding) forceLand(); }
        }
      }
      if (p.ai && !d.restless && d.fireCD === 0) aiDragonfire(p);
    }
  }
  updateHUD(); checkWin();
}

// --- Dragonfire & Scorpion Towers
const guardedBy = (t, attacker) => t.corners.some(cid => corners[cid].tower != null && corners[cid].tower !== attacker);
function scorchProblem(pid, t) {
  const d = dragonOf(pid);
  if (!d || d.stage !== 'grown') return 'Only a grown dragon breathes fire';
  if (d.restless) return 'Your dragon is Restless: it needs feeding';
  if (d.fireCD > 0) return `Dragonfire recovers in ${d.fireCD} harvest${d.fireCD > 1 ? 's' : ''}`;
  if (!t || !t.num) return 'Nothing here worth burning';
  if (t.scorchedUntil >= state.harvests + 1) return 'Already scorched';
  if (guardedBy(t, pid)) return 'A Scorpion Tower guards this region';
  if (!t.corners.some(cid => { const b = corners[cid].building; return b && b.owner !== pid; })) return 'No rival holdings in this region';
  return null;
}
function scorch(pid, t) {
  const d = dragonOf(pid); d.fireCD = 3;
  t.scorchedUntil = state.harvests + 1;
  if (!t.flames) {
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const p = placeIn(t, 4, HEX_R * 0.7), f = new THREE.Mesh(new THREE.ConeGeometry(rr(0.8, 1.5), rr(2.5, 4.5), 5), flameMat);
      f.position.set(p.x, p.y + 1.5, p.z); g.add(f);
      const s = new THREE.Sprite(glowMat); s.scale.set(7, 7, 1); s.position.set(p.x, p.y + 2, p.z); g.add(s);
    }
    scene.add(g); t.flames = g; t.banner.material.color.setHex(0xff6a3a);
  }
  const victims = [...new Set(t.corners.map(cid => corners[cid].building?.owner).filter(o => o !== undefined && o !== pid))];
  const where = `${BIOME[t.type].name} (${t.num})`;
  if (pid === P) { announce('DRAGONFIRE!', `${where} burns: it yields nothing next harvest`); log(`🔥 You scorch ${where}`); }
  else if (victims.includes(P)) { announce('DRAGONFIRE!', `${nameOf(pid)}'s dragon scorches your ${where}!`); log(`🔥 ${nameOf(pid)}'s dragon scorches ${where}`); }
  else if (visible.has(t.id)) log(`🔥 ${nameOf(pid)}'s dragon scorches ${where}`);
  if (pid !== P) tell(pid, { big: 'DRAGONFIRE!', small: `${where} burns: it yields nothing next harvest` });
  victims.forEach(v => { if (v !== P) tell(v, { big: 'DRAGONFIRE!', small: `${nameOf(pid)}'s dragon scorches your ${where}!` }); });
  sfx('raid');
}
function dragonfire() {
  const t = tileAtWorld(camera.position.x, camera.position.z), prob = scorchProblem(P, t);
  if (prob) { log('⚠️ ' + prob); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'fire', t: t.id }); return; }
  scorch(P, t);
  const d = dragonOf(P), from = new THREE.Vector3(); d.mesh.userData.head.getWorldPosition(from);
  breathe(from, new THREE.Vector3(camera.position.x, heightAt(camera.position.x, camera.position.z), camera.position.z));
  updateHUD();
}
function aiDragonfire(p) {
  const lead = Math.max(...players.filter(q => q !== p).map(q => renown(q.id)));
  let best = null, bs = 0;
  for (const t of tiles) {
    if (scorchProblem(p.id, t)) continue;
    let s = 0;
    for (const cid of t.corners) { const b = corners[cid].building; if (!b) continue; if (b.owner === p.id) s -= 4; else s += (b.type === 'keep' ? 2 : 1) * PIPS(t.num) * (renown(b.owner) >= lead ? 2 : 1); }
    if (s > bs) { bs = s; best = t; }
  }
  if (best) { scorch(p.id, best); p.dragon.strike = { t: best, breathed: false, timer: 0 }; }
}
function aiDragonPlans(p) {
  const pid = p.id;
  if (p.carrying) { p.task = { kind: 'deliver', c: roostOf(pid) }; return true; }
  const roost = roostOf(pid);
  if (roost && !p.dragon) { const egg = cradleEggs.find(e => !e.taken); if (egg) { p.task = { kind: 'egg', egg }; return true; } }
  if (!roost && p.built.keep > 0 && canAfford('roost', pid) && renown(pid) >= 4) {
    const c = corners.find(c => owns(c, pid) && c.building.type === 'keep' && !roostProblem(c, pid));
    if (c) { p.task = { kind: 'roost', c }; return true; }
  }
  const threat = players.some(q => q !== p && q.dragon && q.dragon.stage !== 'egg');
  if (threat && p.built.tower < 2 && canAfford('tower', pid)) {
    const c = corners.filter(c => owns(c, pid) && c.tower == null).sort((a, b) => cornerScore(b, pid) - cornerScore(a, pid))[0];
    if (c) { p.task = { kind: 'tower', c }; return true; }
  }
  return false;
}

// --- riding
function toggleRide() {
  const d = dragonOf(P);
  if (state.riding) {
    const g = heightAt(player.pos.x, player.pos.z);
    if (g < 0.6) { log('⚠️ You cannot land on the sea'); return; }
    if (player.pos.y - g > 35) { log('⚠️ Fly lower to land (hold C)'); return; }
    return forceLand();
  }
  if (state.carrying) { log('⚠️ Bring the egg home first'); return; }
  if (!d || d.stage === 'egg') { log('⚠️ You have no dragon to ride yet'); return; }
  if (d.restless) { log(`⚠️ Your dragon is Restless: it will eat ${iconsOf(UPKEEP)} at the next harvest`); return; }
  state.riding = true; setMode(null); player.pos.y += EYE + 9; player.pitch = -0.3; player.autoTarget = null; destMarker.visible = false;
  announce('TO THE SKIES!', 'W fly · Space climb · C dive · Shift faster · ' + (d.stage === 'grown' ? 'G Dragonfire · ' : '') + 'F land');
  sfx('horn'); updateHUD();
}
function forceLand() {
  state.riding = false; player.autoTarget = null; destMarker.visible = false;
  const x = player.pos.x, z = player.pos.z;
  if (heightAt(x, z) < 0.6) { const c = roostOf(P); player.pos.set(c.x * 0.9, heightAt(c.x * 0.9, c.z * 0.9), c.z * 0.9); }
  else player.pos.y = heightAt(x, z);
  player.vy = 0; log('🐉 You land'); updateHUD();
}
const _f = new THREE.Vector3();
function updateFlight(dt) {
  const d = dragonOf(P), grown = d.stage === 'grown';
  const sp = (keys.ShiftLeft || keys.ShiftRight ? 1.7 : 1) * (grown ? 34 : 24);
  const cy = Math.cos(player.pitch);
  _f.set(-Math.sin(player.yaw) * cy, Math.sin(player.pitch), -Math.cos(player.yaw) * cy);
  const fw = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  if (fw || st) { player.autoTarget = null; destMarker.visible = false; }
  else if (player.autoTarget) {
    const dx = player.autoTarget.x - player.pos.x, dz = player.autoTarget.z - player.pos.z, d = Math.hypot(dx, dz);
    const want = Math.atan2(-dx, -dz); let dy = want - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    player.yaw += dy * Math.min(1, dt * 2.5);
    if (d < 3) { player.autoTarget = null; destMarker.visible = false; }
    else { player.pos.x += dx / d * Math.min(d, sp * dt); player.pos.z += dz / d * Math.min(d, sp * dt); }
    const cruise = Math.max(0, heightAt(player.pos.x, player.pos.z)) + (grown ? 45 : 30);
    player.pos.y += (cruise - player.pos.y) * Math.min(1, dt * 1.2);
  }
  player.pos.addScaledVector(_f, fw * sp * dt);
  player.pos.x += Math.cos(player.yaw) * st * sp * 0.6 * dt; player.pos.z -= Math.sin(player.yaw) * st * sp * 0.6 * dt;
  if (keys.Space) player.pos.y += 18 * dt;
  if (keys.KeyC || keys.ControlLeft) player.pos.y -= 22 * dt;
  const g = Math.max(0, heightAt(player.pos.x, player.pos.z));
  player.pos.y = Math.min(g + (grown ? 160 : 70), Math.max(g + 5, player.pos.y));
  const L = Math.hypot(player.pos.x, player.pos.z); if (L > 430) { player.pos.x *= 430 / L; player.pos.z *= 430 / L; }
  camera.position.copy(player.pos); camera.rotation.set(player.pitch, player.yaw, 0);
  if (meAvatar) meAvatar.visible = false;
}

// --- fire breath particles
const fireParts = [], fireGeo = new THREE.IcosahedronGeometry(0.8, 0);
const fireCols = [0xfff07a, 0xffa22a, 0xff5a12];
function breathe(from, to) {
  if (NET.host) NET.fx.push({ seq: ++NET.fxSeq, f: [from.x, from.y, from.z], t: [to.x, to.y, to.z] });   // guests see the fire too
  const dir = to.clone().sub(from), len = dir.length(); dir.normalize();
  for (let i = 0; i < 46; i++) {
    const m = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({ color: fireCols[i % 3], transparent: true, depthWrite: false }));
    m.position.copy(from); m.visible = false; scene.add(m);
    const v = dir.clone().multiplyScalar(len / rr(0.7, 1.0)).add(new THREE.Vector3(rr(-4, 4), rr(-2, 2), rr(-4, 4)));
    fireParts.push({ m, v, delay: i * 0.025, life: 0 });
  }
}
function updateFire(dt) {
  for (let i = fireParts.length - 1; i >= 0; i--) {
    const f = fireParts[i];
    if (f.delay > 0) { f.delay -= dt; continue; }
    f.m.visible = true; f.life += dt;
    f.m.position.addScaledVector(f.v, dt); f.m.scale.setScalar(0.6 + f.life * 4); f.m.material.opacity = Math.max(0, 1 - f.life);
    if (f.life >= 1) { scene.remove(f.m); f.m.material.dispose(); fireParts.splice(i, 1); }
  }
}

// --- dragons in the sky (circling their roost, striking, or carrying you)
const _hp = new THREE.Vector3();
function updateDragons(dt, time) {
  const mine = dragonOf(P);
  state.dragonEye = !!(mine && mine.stage === 'grown' && !mine.restless);
  for (const p of players) {   // friends carrying eggs home (host only)
    if (p.ai || p.id === P || !p.carrying || !p.rpos) continue;
    const c = roostOf(p.id), n = c && nestPos(c);
    if (n && Math.hypot(n.x - p.rpos.x, n.z - p.rpos.z) < 11) {
      p.carrying = false; hatchery(p.id, c);
      tell(p.id, { big: 'THE EGG IS HOME', small: `It needs ${iconsOf(DRAGON_FEED.egg)} at each of the next 3 harvests to hatch`, sfx: 'win' });
      log(`🐦 Ravens report: ${nameOf(p.id)} has a dragon egg in its Roost 🥚`);
    }
  }
  if (state.carrying) {   // deliver a carried egg
    const c = roostOf(P), n = c && nestPos(c);
    if (n && Math.hypot(n.x - player.pos.x, n.z - player.pos.z) < 11) {
      state.carrying = false; carryEgg.visible = false; hatchery(P, c);
      announce('THE EGG IS HOME', `It needs ${iconsOf(DRAGON_FEED.egg)} at each of the next 3 harvests to hatch`); log('🥚 Your egg rests in the Roost'); sfx('win'); updateHUD();
    }
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh) continue;
    const g = d.mesh, ud = g.userData, grown = d.stage === 'grown';
    let flap = 3.2;
    const rider = p.id === P && state.riding ? { x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: player.yaw, pitch: player.pitch }
      : (!p.ai && p.riding && p.rpos) ? p.rpos : null;
    if (rider) {
      const s = g.scale.x;
      g.position.set(rider.x + Math.sin(rider.yaw) * 1.5 * s, rider.y - 7.2 * s, rider.z + Math.cos(rider.yaw) * 1.5 * s);
      g.rotation.set(-(rider.pitch || 0) * 0.6, rider.yaw + Math.PI, 0);
      d.pos.copy(g.position); flap = 4.5;
    } else if (false) {
      const s = g.scale.x;
      // rider sits high behind the head: the neck and horns sit low in view, the world stays visible
      g.position.set(camera.position.x + Math.sin(player.yaw) * 1.5 * s, camera.position.y - 7.2 * s, camera.position.z + Math.cos(player.yaw) * 1.5 * s);
      g.rotation.set(-player.pitch * 0.6, player.yaw + Math.PI, 0);
      d.pos.copy(g.position); flap = 4.5;
    } else {
      const home = nestPos(d.roost);
      let tx, ty, tz;
      if (d.strike) {
        const t = d.strike.t; tx = t.x; tz = t.z; ty = heightAt(t.x, t.z) + 24;
        if (Math.hypot(d.pos.x - tx, d.pos.z - tz) < 8 && !d.strike.breathed) {
          d.strike.breathed = true; ud.head.getWorldPosition(_hp); breathe(_hp.clone(), new THREE.Vector3(tx, heightAt(tx, tz), tz));
        }
        if (d.strike.breathed && (d.strike.timer += dt) > 2.5) d.strike = null;
      } else if (d.restless) { tx = home.x; tz = home.z; ty = home.y + 2; }    // a hungry dragon sulks on its roost
      else {
        d.ang += dt * (grown ? 0.22 : 0.35);
        const r = grown ? 24 : 12; tx = home.x + Math.cos(d.ang) * r; tz = home.z + Math.sin(d.ang) * r; ty = home.y + (grown ? 26 : 12);
      }
      const dx = tx - d.pos.x, dy = ty - d.pos.y, dz = tz - d.pos.z, dist = Math.hypot(dx, dy, dz);
      const sp = Math.min(dist, (d.strike ? 38 : 16) * dt);
      if (dist > 0.01) { d.pos.x += dx / dist * sp; d.pos.y += dy / dist * sp; d.pos.z += dz / dist * sp; }
      if (Math.hypot(dx, dz) > 0.5) g.rotation.y = Math.atan2(dx, dz);
      g.rotation.x = 0;
      g.position.copy(d.pos);
      if (d.restless && dist < 3) flap = 0.4;
    }
    ud.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * flap + p.id) * 0.6; });
    ud.tail.forEach((s, i) => { s.rotation.y = Math.sin(time * 1.8 + i * 0.6 + p.id) * 0.12; });
    // dragons are huge: seen from far away, but not across the whole isle (unless you have the Dragon's Eye)
    g.visible = p.id === P || state.dragonEye || Math.hypot(d.pos.x - player.pos.x, d.pos.z - player.pos.z) < 230;
  }
}
function dragonStatus() {
  const me = players[P], d = me.dragon;
  if (!d) {
    if (state.carrying) return '🥚 Carry the egg to your Roost!';
    if (roostOf(P)) return '🥚 Fetch an egg from the Cradle (volcano): walk up and press E';
    return '🐉 Dragons: build a Roost beside a Keep (key 4)';
  }
  if (d.stage === 'egg') return `🥚 Egg warming ${d.progress}/3 · eats ${iconsOf(DRAGON_FEED.egg)} each harvest`;
  if (d.stage === 'wyrmling') return `🐲 Wyrmling ${d.progress}/3 · eats ${iconsOf(DRAGON_FEED.wyrmling)} each harvest · F ride`;
  return `🐉 Grown dragon${d.restless ? ' · RESTLESS: needs ' + iconsOf(UPKEEP) : ''} · 🔥 ${d.fireCD ? 'in ' + d.fireCD : 'ready (ride + G)'} · 👁️ Dragon's Eye`;
}

// ---------------------------------------------------------------- day / night
const C = h => new THREE.Color(h);
// t, sky top, horizon, sun colour, sun intensity, hemi sky, hemi ground, hemi intensity, water
const DAYKEYS = [
  [0.00, 0x56649e, 0xf3a06a, 0xffaa66, 1.3, 0xb8c4ea, 0x5a4632, 0.95, 0x2f6f92],   // dawn
  [0.10, 0x4a86c8, 0xf6d6ab, 0xffe2b8, 2.5, 0xcfe3ff, 0x5a4632, 1.3, 0x2f7fa6],    // morning
  [0.36, 0x3b80d2, 0xd4e6f2, 0xfff4e2, 2.8, 0xd8ecff, 0x5e4a34, 1.4, 0x3388b0],    // noon
  [0.64, 0x4878bc, 0xf4cf9a, 0xffd59a, 2.4, 0xcfe3ff, 0x5a4632, 1.25, 0x2f7fa6],   // afternoon
  [0.76, 0x3b3c78, 0xf27a46, 0xff7a40, 1.3, 0xa69cc8, 0x4a3628, 0.95, 0x2a5a7c],   // sunset
  [0.81, 0x1b2050, 0x6e4a72, 0x8494cc, 0.75, 0x6f80b8, 0x34302c, 0.95, 0x173550],   // twilight
  [0.90, 0x080d24, 0x1f2d50, 0x9ab2ee, 0.8, 0x6474b4, 0x2c2a32, 0.95, 0x0f2440],    // midnight
  [0.97, 0x1b2050, 0x5c4a74, 0x8494cc, 0.75, 0x6f80b8, 0x34302c, 0.95, 0x173550],   // before dawn
  [1.00, 0x56649e, 0xf3a06a, 0xffaa66, 1.3, 0xb8c4ea, 0x5a4632, 0.95, 0x2f6f92],
];
const dayCols = { top: C(0), hor: C(0), sun: C(0), hs: C(0), hg: C(0), water: C(0) };
const _ca = new THREE.Color(), _cb = new THREE.Color();
function lerpHex(a, b, k, out) { return out.copy(_ca.setHex(a)).lerp(_cb.setHex(b), k); }
const sunAngle = t => t < 0.78 ? t / 0.78 * Math.PI : Math.PI + (t - 0.78) / 0.22 * Math.PI;   // long days, short nights
let dayT = 0.74, dayCount = 1, night = 0, lastTod = null;
// time-of-day rules: dusk market (Guild 3:1), night raids, dawn bounty
function isDusk() { return dayT >= 0.70 && dayT < 0.80; }   // ~48 s
function isNight() { return dayT >= 0.80; }                  // ~96 s
function todAnnounce(tod) {
  if (tod === 'dusk') announce('🌇 DUSK MARKET', 'Until nightfall the Guild trades 3:1 and the houses take any fair deal');
  if (tod === 'night') announce('🌙 NIGHT FALLS', 'Raid rival Hamlets in the dark, but beware their towers and their lords');
  if (tod === 'dawn') announce('🌅 DAWN', 'The next harvest is bountiful: +1 for every Hamlet and Keep');
}
const _sunDir = new THREE.Vector3();
function updateDayNight(dt) {
  if (state.phase === 'play' && (!state.paused || NET.online)) { dayT += dt / DAY_LENGTH; if (dayT >= 1) { dayT -= 1; dayCount++; log(`🌅 Dawn of day ${dayCount}`); if (!NET.guest) state.dawnBounty = true; } }
  let i = 0; while (DAYKEYS[i + 1][0] < dayT) i++;
  const A = DAYKEYS[i], Bk = DAYKEYS[i + 1], k = (dayT - A[0]) / (Bk[0] - A[0]);
  lerpHex(A[1], Bk[1], k, dayCols.top); lerpHex(A[2], Bk[2], k, dayCols.hor); lerpHex(A[3], Bk[3], k, dayCols.sun);
  lerpHex(A[5], Bk[5], k, dayCols.hs); lerpHex(A[6], Bk[6], k, dayCols.hg); lerpHex(A[8], Bk[8], k, dayCols.water);
  const sunI = A[4] + (Bk[4] - A[4]) * k, hemiI = A[7] + (Bk[7] - A[7]) * k;
  const a = sunAngle(dayT); _sunDir.set(-Math.cos(a) * 0.9, Math.sin(a), 0.42).normalize();
  night = 1 - smooth(-0.12, 0.18, _sunDir.y);
  skyU.top.value.copy(dayCols.top); skyU.horizon.value.copy(dayCols.hor); skyU.sunCol.value.copy(dayCols.sun).multiplyScalar(1 - night);
  skyU.sunDir.value.copy(_sunDir); skyU.moonDir.value.copy(_sunDir).negate(); skyU.night.value = night;
  skyU.bottom.value.copy(dayCols.water).multiplyScalar(0.8);
  scene.fog.color.copy(dayCols.hor);
  // the sun by day, the moon by night (same light, so shadows always work)
  const lightDir = _sunDir.y > -0.05 ? _sunDir : _sunDir.clone().negate();
  sun.position.copy(lightDir).multiplyScalar(300); sun.color.copy(dayCols.sun); sun.intensity = sunI;
  hemi.color.copy(dayCols.hs); hemi.groundColor.copy(dayCols.hg); hemi.intensity = hemiI;
  water.material.color.copy(dayCols.water);
  cloudMat.color.setRGB(1, 1, 1).lerp(dayCols.hor, 0.35).lerp(dayCols.top, night * 0.6);
  stars.material.opacity = night * 0.9;
  windowMat.emissiveIntensity = 0.15 + night * 1.6;
  glowMat.opacity = 0.1 + night * 0.85;
  lavaLight.intensity = 350 + night * 900;
  if (state.phase === 'play') {
    const names = [[0.06, '🌅 Dawn'], [0.30, '☀️ Morning'], [0.44, '☀️ Midday'], [0.70, '🌤️ Afternoon'], [0.80, '🌇 Dusk'], [0.97, '🌙 Night'], [1.01, '🌌 Before dawn']];
    $('clock').textContent = `Day ${dayCount} · ${names.find(n => dayT < n[0])[1]}` + (isDusk() ? ' · Guild 3:1' : isNight() ? ' · raids possible' : state.dawnBounty ? ' · bountiful harvest next' : '');
    const tod = isDusk() ? 'dusk' : isNight() ? 'night' : dayT < 0.06 ? 'dawn' : 'day';
    if (tod !== lastTod) { if (lastTod) todAnnounce(tod); lastTod = tod; }
  }
}

// ---------------------------------------------------------------- ONLINE (Milestone 4)
// The host's browser runs the whole game (rules, dice, AI houses, dragons) and sends each friend a
// snapshot 10× a second. Friends ("guests") render the snapshot and send their actions back.
// The Render server (server/server.js) only relays messages inside a room and serves these files.
const NET = { online: false, host: false, guest: false, ws: null, code: null, seats: [], lobby: null, last: null, fx: [], fxSeq: 0, fxSeen: 0, t: 0, deckLeft: 25, name: '', aiFill: 1, prevKey: '' };
const deckCount = () => NET.guest ? NET.deckLeft : deck.length;
const wsSend = m => { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(m)); };
const netAct = a => wsSend({ t: 'up', msg: { t: 'act', ...a } });
const seatCid = pid => NET.seats.find(s => s.seat === pid)?.cid;
// send a personal message (log line, announcement, flashes) to one player
function tell(pid, m) {
  if (pid === P) return applyTell(m);
  if (NET.host && players[pid] && !players[pid].ai) { const cid = seatCid(pid); if (cid) wsSend({ t: 'to', cid, msg: { t: 'msg', ...m } }); }
}
function applyTell(m) {
  if (m.log) log(m.log);
  if (m.big) announce(m.big, m.small || '');
  if (m.flash) m.flash.forEach(k => flashRes(k, m.loss));
  if (m.lore) $('loreStatus').textContent = m.lore;
  if (m.raven) $('ravenStatus').textContent = m.raven;
  if (m.startGot) state.startGot = m.startGot;
  if (m.sfx) sfx(m.sfx);
  if (m.daze) knockDown(null, 2);
  if (m.duel != null && !duel && state.phase === 'play') startDuel(m.duel, true);   // an AI lord challenges a friend
}

// ---- the simulation (single player and host)
function simStep(dt, time) {
  updateAI(dt, time); updateDragons(dt, time); updateHumanAvatars(dt);
  if (state.pickFor != null && (state.pickT -= dt) <= 0) {   // a friend took too long with the Horn
    const pid = state.pickFor; state.pickFor = null; sendReavers(pid, aiChooseReaverTile(pid));
  }
  if (state.rolling > 0) {
    state.rolling -= dt;
    runes.forEach((r, i) => { r.material.map = runeTex[1 + Math.floor(Math.random() * 6)]; r.material.rotation += dt * (i ? 9 : -11); });
    if (state.rolling <= 0) {
      resolveHarvest(); state.rollsLeft = (state.rollsLeft || 1) - 1;
      if (state.rollsLeft <= 0) state.dawnBounty = false;   // the bounty lasts one harvest (both casts)
      state.harvestT = state.harvestLen = state.rollsLeft > 0 ? 3 : nextHarvestDelay();   // short pause, then the second cast
    }
  } else {
    state.harvestT -= dt;
    if (state.harvestT <= 0) state.rollsLeft > 0 ? startRoll() : startHarvest();
  }
}
// browsers stop animating hidden tabs: keep the host's world turning anyway
setInterval(() => { if (document.hidden && NET.host && state.phase === 'play') { simStep(0.1, performance.now() / 1000); netTick(0.1); } }, 100);

// friends (and, on guests, every other house) are shown as lords walking the isles
function updateHumanAvatars(dt) {
  for (const p of players) {
    if (p.id === P || !p.avatar || (p.ai && !NET.guest)) continue;
    const src = NET.guest ? p.netPos : p.rpos && { x: p.rpos.x, z: p.rpos.z, ry: p.rpos.yaw + Math.PI };
    if (!src) continue;
    p.pos = p.pos || { x: src.x, z: src.z };
    const k = Math.min(1, dt * 10);
    p.pos.x += (src.x - p.pos.x) * k; p.pos.z += (src.z - p.pos.z) * k;
    p.avatar.position.set(p.pos.x, walkHeight(p.pos.x, p.pos.z), p.pos.z);
    p.avatar.rotation.y = src.ry || 0;
    p.avatar.userData.egg.visible = !!p.carrying;
    const t = tileAtWorld(p.pos.x, p.pos.z);
    p.avatar.visible = !p.riding && (state.dragonEye || Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < SIGHT + 10 || (t && visible.has(t.id)));
  }
}

// ---- network clock: host sends snapshots, guests send where they are
function netTick(dt) {
  if ((NET.t += dt) < 0.1) return; NET.t = 0;
  if (NET.host && ['setup', 'play', 'won'].includes(state.phase)) {
    if (NET.fx.length > 20) NET.fx.splice(0, NET.fx.length - 20);
    for (const s of NET.seats) if (players[s.seat] && !players[s.seat].ai) wsSend({ t: 'to', cid: s.cid, msg: snapFor(s.seat) });
  }
  if (NET.guest && state.phase === 'play') netAct({ a: 'pos', x: player.pos.x, y: player.pos.y, z: player.pos.z, yaw: player.yaw, pitch: player.pitch, riding: !!state.riding });
}
function snapFor(seat) {
  const posOf = p => p.id === P ? { x: player.pos.x, y: player.pos.y, z: player.pos.z, ry: player.yaw + Math.PI }
    : p.ai ? (p.pos ? { x: p.pos.x, y: 0, z: p.pos.z, ry: p.avatar ? p.avatar.rotation.y : 0 } : null)
    : (p.rpos ? { x: p.rpos.x, y: p.rpos.y, z: p.rpos.z, ry: p.rpos.yaw + Math.PI } : null);
  return {
    t: 'snap',
    st: {
      phase: state.phase, harvestT: state.harvestT, harvestLen: state.harvestLen, rolling: state.rolling, rollNo: state.rollNo, rollsLeft: state.rollsLeft,
      lastRoll: state.lastRoll, rollSeq: state.rollSeq || 0, dice: state.dice || null, hornIdx: state.hornIdx, order: state.order,
      setupQueue: state.setupQueue, setupTurn: state.setupTurn, highwayHolder: state.highwayHolder, hostHolder: state.hostHolder ?? null,
      harvests: state.harvests, dawnBounty: !!state.dawnBounty, reaver: reaverTile.id, pickFor: state.pickFor ?? null, dayT, dayCount, deck: deck.length, winner: state.winner ?? null,
    },
    pl: players.map(p => ({
      id: p.id, res: p.res, built: p.built, longest: p.longest, knights: p.knights, freeRoads: p.freeRoads || 0, playedAt: p.playedAt,
      setupStep: p.setupStep || 0, setupCorner: p.setupCorner ?? null, ai: p.ai,
      scrolls: p.id === seat ? p.scrolls : p.scrolls.map(() => ({ type: 'hidden', boughtAt: 0 })),   // other hands stay secret
      pos: posOf(p), carrying: p.id === P ? !!state.carrying : !!p.carrying, riding: p.id === P ? !!state.riding : !!p.riding,
      dragon: p.dragon ? { stage: p.dragon.stage, progress: p.dragon.progress, restless: p.dragon.restless, fireCD: p.dragon.fireCD, roost: p.dragon.roost.id,
        pos: [p.dragon.pos.x, p.dragon.pos.y, p.dragon.pos.z], ry: p.dragon.mesh ? p.dragon.mesh.rotation.y : 0 } : null,
    })),
    c: corners.map(c => c.building ? [c.building.owner, c.building.type === 'keep' ? 2 : 1, c.roost ?? -1, c.tower ?? -1] : 0),
    e: edges.map(e => e.road ?? -1),
    sc: tiles.map(t => t.scorchedUntil ?? -1),
    eggs: cradleEggs.map(e => e.taken ? 1 : 0),
    fx: NET.fx.slice(-6),
  };
}

// ---- host: apply a friend's action (every rule is checked again here)
const cleanBundle = o => { if (!o || typeof o !== 'object') return null; const r = {}; for (const k of RES_KEYS) { const n = o[k] | 0; if (n < 0 || n > 40) return null; r[k] = n; } return r; };
function hostAct(pid, a) {
  const p = players[pid]; if (!p || p.ai) return;
  const no = msg => tell(pid, { log: '⚠️ ' + msg, sfx: 'bad' });
  switch (a.a) {
    case 'pos':
      p.rpos = { x: +a.x || 0, y: +a.y || 0, z: +a.z || 0, yaw: +a.yaw || 0, pitch: +a.pitch || 0 };
      p.riding = !!a.riding && !!p.dragon && p.dragon.stage !== 'egg' && !p.dragon.restless;
      return;
    case 'build': {
      const t = { kind: a.kind, c: a.c != null ? corners[a.c] : undefined, e: a.e != null ? edges[a.e] : undefined };
      if (!['road', 'hamlet', 'keep', 'roost', 'tower'].includes(t.kind) || (t.kind === 'road' ? !t.e : !t.c)) return;
      if (state.phase === 'setup') {
        if (setupPid() !== pid) return no('Wait for your turn on the war table');
        if (t.kind !== (p.setupStep % 2 === 0 ? 'hamlet' : 'road')) return;
      } else if (state.phase !== 'play') return;
      const prob = problemFor(t.kind, t, pid); if (prob) return no(prob);
      pay(t.kind, pid);
      ({ hamlet: () => buildHamlet(t.c, pid), keep: () => buildKeep(t.c, pid), roost: () => buildRoost(t.c, pid), tower: () => buildTower(t.c, pid), road: () => buildRoad(t.e, pid) })[t.kind]();
      if (state.phase === 'setup') advanceSetup(t, pid); else reportBuild(pid, t);
      refreshMarkers(); updateHUD(); checkWin();
      return;
    }
    case 'guild': {
      const give = cleanBundle(a.give), get = cleanBundle(a.get);
      if (give && get && guildOK(give, get, p.res)) { applyBundle(pid, give, get); tell(pid, { log: `⚖️ Guild trade: ${bundleTxt(give)} → ${bundleTxt(get)}`, flash: RES_KEYS.filter(k => get[k]), sfx: 'build' }); }
      return;
    }
    case 'raven': {
      const give = cleanBundle(a.give), get = cleanBundle(a.get);
      if (give && get && bundleSum(give) && bundleSum(get)) setTimeout(() => ravenDeal(pid, give, get), 1500);
      return;
    }
    case 'duel_result': {   // a friend finished a duel against an AI lord on their screen
      const q = players[a.opp]; if (!q || !q.ai) return;
      if (q.duelWith === pid) q.duelWith = null;
      const w = a.won ? pid : q.id, l = a.won ? q.id : pid;
      endDuelEffects(w, l, applyDuel(w, l, a.yield ? 1 : lootSize(w, l)));
      return;
    }
    case 'raid': {
      const c = corners[a.c], prob = raidProblem(pid, c, p.rpos);
      if (prob) return no(prob);
      raid(pid, c); return;
    }
    case 'toll': {
      const e = edges[a.e];
      if (!e || e.road === null || e.road === pid || !p.rpos) return;
      if (Math.hypot(p.rpos.x - (corners[e.a].x + corners[e.b].x) / 2, p.rpos.z - (corners[e.a].z + corners[e.b].z) / 2) > 9) return no('Stand at the gate to pay');
      if (!payToll(pid, e)) no('You have nothing to pay the toll');
      return;
    }
    case 'duel_human':
      if (players[a.target] && !players[a.target].ai && canDuel(pid, a.target)) autoDuel(pid, a.target);
      return;
    case 'scroll_buy': {
      if (state.phase !== 'play') return;
      if (!buyScroll(pid)) return no('You cannot study a scroll right now');
      log(`📜 ${nameOf(pid)} buys a Lore Scroll`); updateHUD(); checkWin();
      return;
    }
    case 'scroll_play': {
      const c = p.scrolls[a.idx]; if (!c || !canPlay(p, c)) return no('That scroll cannot be played now');
      let arg = a.arg;
      if (c.type === 'harvest' && !(Array.isArray(arg) && arg.length === 2 && arg.every(k => RES[k]))) return;
      if (c.type === 'decree' && !RES[arg]) return;
      if (c.type === 'sellsword' && (!tiles[arg] || tiles[arg] === reaverTile)) arg = null;
      playScroll(pid, a.idx, arg);
      return;
    }
    case 'reaver_pick':
      if (state.pickFor === pid && tiles[a.t] && tiles[a.t] !== reaverTile) { state.pickFor = null; sendReavers(pid, tiles[a.t]); }
      return;
    case 'egg': {
      const e = cradleEggs[a.i];
      if (!e || e.taken || p.dragon || p.carrying || !roostOf(pid) || !p.rpos || Math.hypot(e.x - p.rpos.x, e.z - p.rpos.z) > 8) return no('You cannot take that egg');
      e.taken = true; e.mesh.visible = false; p.carrying = true;
      if (Math.hypot(p.rpos.x - player.pos.x, p.rpos.z - player.pos.z) < SIGHT + 20) log(`👀 ${nameOf(pid)} carries off a dragon egg!`);
      return;
    }
    case 'fire': {
      const t = tiles[a.t], prob = scorchProblem(pid, t); if (prob) return no(prob);
      scorch(pid, t);
      const from = new THREE.Vector3(); p.dragon.mesh.userData.head.getWorldPosition(from);
      breathe(from, new THREE.Vector3(t.x, heightAt(t.x, t.z), t.z)); updateHUD();
      return;
    }
  }
}

// ---- guest: mirror the host's world
function addFlames(t) {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const p = placeIn(t, 4, HEX_R * 0.7), f = new THREE.Mesh(new THREE.ConeGeometry(rr(0.8, 1.5), rr(2.5, 4.5), 5), flameMat);
    f.position.set(p.x, p.y + 1.5, p.z); g.add(f);
    const s = new THREE.Sprite(glowMat); s.scale.set(7, 7, 1); s.position.set(p.x, p.y + 2, p.z); g.add(s);
  }
  scene.add(g); t.flames = g; if (t.banner) t.banner.material.color.setHex(0xff6a3a);
}
function removeFlames(t) { scene.remove(t.flames); t.flames = null; if (t.banner) t.banner.material.color.setHex(0xffffff); }
function syncCorner(c, v) {
  if (!v) return;
  const [owner, lvl, roost, tower] = v, type = lvl === 2 ? 'keep' : 'hamlet';
  if (!c.building || c.building.type !== type) {
    if (buildingObjs.get(c.id)) scene.remove(buildingObjs.get(c.id));
    c.building = { owner, type };
    const o = (type === 'keep' ? makeKeep : makeHamlet)(players[owner].house);
    o.traverse(m => { m.castShadow = true; m.receiveShadow = true; }); placeAtCorner(o, c); scene.add(o); buildingObjs.set(c.id, o); popIn(o);
  }
  if (roost >= 0 && c.roost == null) { c.roost = roost; const o = makeRoost(players[roost].house); placeAtCorner(o, c); scene.add(o); popIn(o); }
  if (tower >= 0 && c.tower == null) { c.tower = tower; const o = makeTower(players[tower].house); placeAtCorner(o, c); scene.add(o); popIn(o); }
}
function syncDragon(p, sd) {
  if (!sd) return;
  let d = p.dragon;
  if (!d) d = p.dragon = { roost: corners[sd.roost], mesh: null, egg: null, pos: new THREE.Vector3(...sd.pos), net: new THREE.Vector3(...sd.pos), ry: 0 };
  Object.assign(d, { stage: sd.stage, progress: sd.progress, restless: sd.restless, fireCD: sd.fireCD, ry: sd.ry }); d.net.set(...sd.pos);
  if (d.stage === 'egg' && !d.egg) { d.egg = makeEgg(); d.egg.position.copy(nestPos(d.roost)); d.egg.position.y += 0.4; scene.add(d.egg); }
  if (d.stage !== 'egg') {
    if (d.egg) { scene.remove(d.egg); d.egg = null; }
    if (!d.mesh) { d.mesh = makeDragon(p.house); d.pos.copy(d.net); }
    d.mesh.scale.setScalar(d.stage === 'grown' ? 1 : 0.45);
  }
}
function applySnapshot(s) {
  const prev = NET.last; NET.last = s;
  const st = s.st;
  for (const k of ['harvestT', 'harvestLen', 'rolling', 'rollNo', 'rollsLeft', 'lastRoll', 'hornIdx', 'order', 'setupQueue', 'setupTurn', 'highwayHolder', 'hostHolder', 'harvests', 'pickFor', 'dawnBounty']) state[k] = st[k];
  dayT = st.dayT; dayCount = st.dayCount; NET.deckLeft = st.deck;
  for (const sp of s.pl) {
    const p = players[sp.id]; if (!p) continue;
    Object.assign(p.res, sp.res); Object.assign(p.built, sp.built);
    Object.assign(p, { longest: sp.longest, knights: sp.knights, freeRoads: sp.freeRoads, playedAt: sp.playedAt, setupStep: sp.setupStep, setupCorner: sp.setupCorner, ai: sp.ai, scrolls: sp.scrolls, netPos: sp.pos, carrying: sp.carrying, riding: sp.riding });
    syncDragon(p, sp.dragon);
  }
  state.longest = players[P].longest;
  if (!!state.carrying !== !!s.pl[P].carrying) { state.carrying = s.pl[P].carrying; carryEgg.visible = state.carrying; }
  corners.forEach((c, i) => syncCorner(c, s.c[i]));
  edges.forEach((e, i) => { const r = s.e[i]; if (r >= 0 && e.road === null) { e.road = r; const o = makeRoad(e, players[r].house); scene.add(o); popIn(o); registerGate(o, e); } });
  tiles.forEach((t, i) => { t.scorchedUntil = s.sc[i]; const burning = s.sc[i] >= state.harvests; if (burning && !t.flames) addFlames(t); if (!burning && t.flames) removeFlames(t); });
  if (st.reaver !== reaverTile.id) placeReavers(tiles[st.reaver]);
  cradleEggs.forEach((e, i) => { e.taken = !!s.eggs[i]; e.mesh.visible = !e.taken; });
  for (const f of s.fx) if (f.seq > NET.fxSeen) { NET.fxSeen = f.seq; if (prev) breathe(new THREE.Vector3(...f.f), new THREE.Vector3(...f.t)); }
  if (prev) guestEvents(prev, s);
  if (st.phase !== state.phase) {
    if (st.phase === 'play' && state.phase === 'setup') guestEnterPlay();
    else if (st.phase === 'won') { state.phase = 'won'; showWin(players[st.winner]); }
    else state.phase = st.phase;
  }
  if (state.phase === 'setup') {
    const want = myLandingTurn() ? (players[P].setupStep % 2 === 0 ? 'hamlet' : 'road') : null;
    if (state.mode !== want) setMode(want);
    updateObjective();
  }
  if (st.pickFor === P && !state.reaverPick) { announce('REAVER RAID!', 'You hold the Horn: choose where the Reavers strike (25 s)'); startReaverPick('raid'); }
  else if (st.pickFor !== P && state.reaverPick && state.reaverReason === 'raid') { state.reaverPick = false; setWarMap(false); updateObjective(); }
  const key = JSON.stringify([state.res, s.c, s.e, state.harvests, state.phase]);
  if (key !== NET.prevKey) { NET.prevKey = key; refreshMarkers(); }
  updateHUD();
}
// a guest works out its own news from what changed between two snapshots
function guestEvents(prev, s) {
  const st = s.st, me = s.pl[P], pm = prev.pl[P];
  const delta = RES_KEYS.map(k => [k, me.res[k] - pm.res[k]]);
  if (st.rollSeq !== prev.st.rollSeq && st.dice) {
    const [d1, d2] = st.dice, sum = d1 + d2;
    runes[0].material.map = runeTex[d1]; runes[1].material.map = runeTex[d2];
    runes.forEach(r => { r.visible = true; r.material.rotation = 0; r.material.needsUpdate = true; });
    clearTimeout(state.runeHide); state.runeHide = setTimeout(() => runes.forEach(r => r.visible = false), 2600);
    if (sum === 7) {
      const lost = delta.filter(([, n]) => n < 0); lost.forEach(([k]) => flashRes(k, true));
      announce('REAVER RAID!', lost.length ? 'They plunder your Hold: ' + lost.map(([k, n]) => `${n} ${RES[k].icon}`).join(' ') : 'The Reavers come ashore');
      log(`🎲 Rune Stones show ${d1} + ${d2} = 7: Reaver Raid!`); sfx('raid');
    } else {
      harvestPopups(sum);
      const gain = delta.filter(([, n]) => n > 0); gain.forEach(([k]) => flashRes(k));
      const parts = gain.map(([k, n]) => `+${n} ${RES[k].icon}`);
      announce(`HARVEST ${st.rollNo || 1}/${ROLLS_PER_HARVEST} · ${sum}`, parts.length ? parts.join('  ') : 'Your lands yield nothing this time');
      log(`🎲 Rune Stones show ${d1} + ${d2} = ${sum}` + (parts.length ? ' → ' + parts.join(' ') : ''));
      if ((st.rollNo || 1) === 1) sfx('horn');
    }
  }
  s.c.forEach((v, i) => {
    const pv = prev.c[i]; if (!v || (pv && pv[1] === v[1] && pv[2] === v[2] && pv[3] === v[3])) return;
    const owner = v[0], kind = !pv ? 'hamlet' : pv[1] !== v[1] ? 'keep' : pv[2] !== v[2] ? 'roost' : 'tower';
    if (owner === P) log({ hamlet: '🏘️ Hamlet founded (+1★)', keep: '🏰 Keep raised (+1★)', roost: '🐉 Dragon Roost built: now fetch an egg from the Cradle (the volcano)', tower: '🏹 Scorpion Tower built' }[kind]);
    else if (state.phase === 'play') reportBuild(owner, { kind, c: corners[i] });
    else log(`${nameOf(owner)} lands at ${corners[i].tiles.map(id => tiles[id]).map(t => t.num ? RES[t.type].icon + t.num : '🌋').join(' ')}`);
  });
  s.e.forEach((r, i) => { if (r >= 0 && prev.e[i] < 0) { if (r === P) log('🧱 Wall built'); else if (state.phase === 'play') reportBuild(r, { kind: 'road', e: edges[i] }); } });
  if (st.highwayHolder !== prev.st.highwayHolder && st.highwayHolder != null)
    announce(st.highwayHolder === P ? 'THE GREAT WALL' : 'GREAT WALL SEIZED!', st.highwayHolder === P ? 'Your walls are the longest in Embervale. +2 Renown' : `${nameOf(st.highwayHolder)} now holds the Great Wall (+2★)`);
  if (st.hostHolder !== prev.st.hostHolder && st.hostHolder != null)
    announce(st.hostHolder === P ? 'THE MIGHTIEST HOST' : 'A MIGHTY HOST!', st.hostHolder === P ? 'Your Sellswords are the strongest force. +2 Renown' : `${nameOf(st.hostHolder)} commands the Mightiest Host (+2★)`);
  s.pl.forEach((sp, i) => {
    const pp = prev.pl[i]; if (!pp) return;
    const mine = sp.id === P, was = pp.dragon?.stage, now = sp.dragon?.stage;
    if (now && now !== was) {
      if (now === 'egg' && !mine) log(`🐦 Ravens report: ${nameOf(sp.id)} has a dragon egg in its Roost 🥚`);
      if (now === 'wyrmling') { announce(mine ? 'THE EGG HATCHES!' : 'A DRAGON IS BORN', mine ? 'Your Wyrmling is here (+1★). Press F to ride it!' : `${nameOf(sp.id)} has hatched a Wyrmling (+1★)`); sfx('win'); }
      if (now === 'grown') { announce(mine ? 'DRAGON ASCENDANT!' : 'BEWARE THE SKIES!', mine ? "Your dragon is grown (+2★): Dragonfire (G) and the Dragon's Eye are yours" : `${nameOf(sp.id)}'s dragon is fully grown. Scorpion Towers (key 5) keep its fire away`); sfx('win'); }
    }
    if (mine && sp.dragon && pp.dragon && sp.dragon.restless !== pp.dragon.restless)
      announce(sp.dragon.restless ? 'YOUR DRAGON IS RESTLESS!' : 'YOUR DRAGON IS CALM', sp.dragon.restless ? `It needs ${iconsOf(UPKEEP)}. No riding, fire or Dragon's Eye until fed` : 'Fed again: its powers return');
    if (!mine && sp.knights > pp.knights) log(`⚔️ ${nameOf(sp.id)} plays a Sellsword`);
    if (!mine && sp.scrolls.length > pp.scrolls.length) log(`📜 ${nameOf(sp.id)} buys a Lore Scroll`);
    if (mine && sp.scrolls.length > pp.scrolls.length) {
      const c = sp.scrolls[sp.scrolls.length - 1], S = SCROLLS[c.type];
      if (S) { $('loreStatus').textContent = `📜 You unroll a scroll: ${S.icon} ${S.name}!`; log(`📜 You buy a Lore Scroll: ${S.icon} ${S.name}`); sfx('build'); }
      if (!$('lore').classList.contains('hidden')) renderLore();
    }
    if (mine && sp.scrolls.length < pp.scrolls.length && !$('lore').classList.contains('hidden')) renderLore();
    if (mine && sp.carrying && !pp.carrying) { announce('A DRAGON EGG!', 'Carry it home to your Roost. You walk slower while carrying it'); log('🥚 You lift a dragon egg. Bring it to your Roost!'); }
  });
}
function guestEnterPlay() {
  state.phase = 'play'; setMode(null);
  const got = state.startGot || [];
  announce('THE HOUSES HAVE LANDED', got.length ? 'Your starting supplies: ' + got.join(' ') : 'Let the harvests begin');
  log('🎺 Landing complete. The mist rolls in… explore to reveal the isles.');
  endLanding(); spawnAvatars(); updateHUD(); updateObjective();
}
function guestStep(dt, time) {
  const mine = dragonOf(P);
  state.dragonEye = !!(mine && mine.stage === 'grown' && !mine.restless);
  if (state.riding && (!mine || mine.restless || mine.stage === 'egg')) forceLand();
  if (state.rolling > 0) {
    state.rolling -= dt;
    runes.forEach((r, i) => { r.visible = true; r.material.map = runeTex[1 + Math.floor(Math.random() * 6)]; r.material.rotation += dt * (i ? 9 : -11); });
  }
  for (const p of players) {
    const d = p.dragon; if (!d || !d.mesh) continue;
    const g = d.mesh, ud = g.userData; let flap = 3.2;
    if (p.id === P && state.riding) {
      const s = g.scale.x;
      g.position.set(camera.position.x + Math.sin(player.yaw) * 1.5 * s, camera.position.y - 7.2 * s, camera.position.z + Math.cos(player.yaw) * 1.5 * s);
      g.rotation.set(-player.pitch * 0.6, player.yaw + Math.PI, 0); d.pos.copy(g.position); flap = 4.5;
    } else { d.pos.lerp(d.net, Math.min(1, dt * 8)); g.position.copy(d.pos); g.rotation.set(0, d.ry || 0, 0); if (d.restless) flap = 0.6; }
    ud.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * flap + p.id) * 0.6; });
    ud.tail.forEach((s2, i) => { s2.rotation.y = Math.sin(time * 1.8 + i * 0.6 + p.id) * 0.12; });
    g.visible = p.id === P || state.dragonEye || Math.hypot(d.pos.x - player.pos.x, d.pos.z - player.pos.z) < 230;
  }
  updateHumanAvatars(dt);
}

// ---- lobby
function lobbyStatus(t) { $('netStatus').textContent = t; $('lobbyStatus').textContent = t; }
function netConnect(then) {
  if (!/^https?:$/.test(location.protocol)) return lobbyStatus('Online play needs the Dragonhold server (see the README).');
  lobbyStatus('Connecting…');
  let ws;
  try { ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host); }
  catch (e) { return lobbyStatus('Could not reach the Dragonhold server.'); }
  NET.ws = ws;
  ws.onopen = then;
  ws.onerror = () => lobbyStatus('Could not reach the Dragonhold server. Online play works from the game\'s Render link.');
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch { return; } netMsg(m); };
  ws.onclose = () => { if (NET.online && state.phase !== 'won' && state.phase !== 'title') { announce('CONNECTION LOST', 'The link to the other houses was cut'); log('⚠️ Connection to the server lost'); } };
}
const myName = () => ($('netName').value.trim() || 'Lord').slice(0, 16);
$('createBtn').addEventListener('click', () => { NET.name = myName(); netConnect(() => wsSend({ t: 'create', seed })); });
$('joinBtn').addEventListener('click', () => {
  const code = $('joinCode').value.trim().toUpperCase();
  if (!code) return lobbyStatus('Type the code your friend gave you');
  NET.name = myName(); netConnect(() => wsSend({ t: 'peek', code }));
});
if (URLQ.get('join')) {   // opened from an invite link
  $('joinCode').value = URLQ.get('join');
  if (URLQ.get('name')) { $('netName').value = URLQ.get('name'); setTimeout(() => $('joinBtn').click(), 300); }
  else { lobbyStatus('You were invited! Type your name and press JOIN.'); setTimeout(() => $('netName').focus(), 300); }
}
function lobbySeatsList() {
  if (NET.host) return [{ name: NET.name, house: chosen, host: true }, ...NET.seats.map(s => ({ name: s.name, house: s.house }))];
  return NET.lobby ? NET.lobby.seats : [];
}
function renderLobby() {
  const code = NET.host ? NET.code : NET.lobby?.code || NET.code;
  $('lobbyCode').textContent = code || '…';
  $('lobbyLink').textContent = `${location.origin}/?join=${code}`;
  const seats = lobbySeatsList(), aiFill = NET.host ? NET.aiFill : (NET.lobby?.aiFill ?? 1);
  $('lobbySeats').innerHTML = seats.map((s, i) => { const h = HOUSES[s.house]; return `<div class="seat" style="--hc:${h.css}"><span class="sig">${h.sigil}</span><b>${s.name}</b> <span class="muted">${h.name}${s.host ? ' · host' : ''}${!NET.host && i === P ? ' · you' : ''}</span></div>`; }).join('') +
    Array.from({ length: Math.min(aiFill, 4 - seats.length) }, () => '<div class="seat ai"><span class="sig">🤖</span><b>AI house</b> <span class="muted">fills an empty seat</span></div>').join('');
  $('lobbyHost').classList.toggle('hidden', !NET.host);
  $('lobbyGuest').classList.toggle('hidden', NET.host);
  document.querySelectorAll('#aiFill [data-n]').forEach(x => { const n = +x.dataset.n; x.classList.toggle('sel', n === NET.aiFill); x.style.display = n <= 4 - seats.length ? '' : 'none'; });
}
function lobbyBroadcast() {
  const seats = lobbySeatsList();
  wsSend({ t: 'bcast', msg: { t: 'lobby', code: NET.code, seats, aiFill: NET.aiFill } });
  renderLobby();
}
function showLobby() { $('start').classList.add('hidden'); $('lobby').classList.remove('hidden'); renderLobby(); }
$('aiFill').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b || !NET.host) return; NET.aiFill = +b.dataset.n; lobbyBroadcast(); });
$('copyLink').addEventListener('click', () => { navigator.clipboard?.writeText($('lobbyLink').textContent).then(() => lobbyStatus('Invite link copied!'), () => lobbyStatus('Copy the link above by hand')); });
$('lobbyStart').addEventListener('click', () => {
  if (!NET.host) return;
  const seats = [{ id: 0, house: chosen, name: NET.name, ai: false }];
  NET.seats.forEach(s => seats.push({ id: s.seat, house: s.house, name: s.name, ai: false, remote: true }));
  const used = new Set(seats.map(s => s.house));
  shuffle(Object.keys(HOUSES).filter(k => !used.has(k))).slice(0, Math.max(0, Math.min(NET.aiFill, 4 - seats.length)))
    .forEach(k => seats.push({ id: seats.length, house: k, ai: true }));
  if (seats.length < 2) return lobbyStatus('Wait for a friend to join, or add at least one AI house');
  NET.seats.forEach(s => wsSend({ t: 'to', cid: s.cid, msg: { t: 'start', seats, you: s.seat } }));
  wsSend({ t: 'close' });
  startMatch(seats);
});
function netMsg(m) {
  switch (m.t) {
    case 'error': lobbyStatus('✖ ' + m.error); break;
    // --- host side
    case 'created': NET.online = NET.host = true; NET.code = m.code; NET.seats = []; showLobby(); lobbyStatus('Share the code or the link with your friends'); break;
    case 'join': {
      if (state.phase !== 'title' || NET.seats.length >= 3) return;
      const taken = new Set([chosen, ...NET.seats.map(s => s.house)]);
      const free = Object.keys(HOUSES).find(k => !taken.has(k)); if (!free) return;
      const seat = { cid: m.cid, name: m.name, house: free, seat: NET.seats.length + 1 };
      NET.seats.push(seat);
      wsSend({ t: 'to', cid: m.cid, msg: { t: 'welcome', code: NET.code } });
      lobbyBroadcast(); lobbyStatus(`${m.name} joined as ${HOUSES[free].name}`); sfx('build');
      break;
    }
    case 'left': {
      const s = NET.seats.find(x => x.cid === m.cid); if (!s) return;
      if (state.phase === 'title') { NET.seats = NET.seats.filter(x => x !== s); NET.seats.forEach((x, i) => x.seat = i + 1); lobbyBroadcast(); lobbyStatus(`${s.name} left`); return; }
      const p = players[s.seat]; if (!p || p.ai) return;
      Object.assign(p, { ai: true, think: 1, task: null, wander: null, wait: 0, carrying: false, riding: false });
      if (p.rpos) p.pos = { x: p.rpos.x, z: p.rpos.z };
      announce('A LORD DEPARTS', `${s.name} left: an AI steward now rules ${p.house.name}`); log(`👋 ${s.name} left the game; an AI steward takes over`);
      if (state.phase === 'setup' && setupPid() === p.id) {
        if (p.setupStep % 2 === 1) { const e = corners[p.setupCorner].edges.map(id => edges[id]).find(e => e.road === null); if (e) buildRoad(e, p.id); p.setupCorner = null; state.setupTurn++; }
        nextSetupTurn();
      }
      break;
    }
    case 'up': { const s = NET.seats.find(x => x.cid === m.cid); if (s && m.msg && m.msg.t === 'act') hostAct(s.seat, m.msg); break; }
    // --- guest side
    case 'peeked':
      if ((m.seed | 0) !== seed) location.replace(`?seed=${m.seed}&join=${encodeURIComponent(m.code)}&name=${encodeURIComponent(NET.name)}`);   // load the host's world first
      else wsSend({ t: 'join', code: m.code, name: NET.name });
      break;
    case 'welcome': NET.online = NET.guest = true; NET.code = m.code; showLobby(); lobbyStatus('You are in! Waiting for the host to start'); break;
    case 'lobby': NET.lobby = m; renderLobby(); break;
    case 'start': P = m.you; NET.last = null; startMatch(m.seats); break;
    case 'snap': if (NET.guest && state.phase !== 'title') applySnapshot(m); break;
    case 'msg': applyTell(m); break;
    case 'hostgone':
      lobbyStatus('The host left the game.');
      if (state.phase !== 'title') { announce('THE HOST HAS LEFT', 'This game cannot continue without them'); log('⚠️ The host left the game'); }
      break;
  }
}

// ---------------------------------------------------------------- DUELS (face to face)
// When two lords meet, either may challenge the other. Best of 3: Strike beats Feint, Feint beats Block,
// Block beats Strike; a tied round goes to the mightier lord. The winner takes 2 resources (3 if much mightier),
// the loser is knocked down for a moment. Might = 1 + Sellswords played + home ground + a grown dragon.
const DUEL_RANGE = 7;
const MOVES = { strike: { icon: '⚔️', name: 'Strike', beats: 'feint' }, block: { icon: '🛡️', name: 'Block', beats: 'strike' }, feint: { icon: '🌀', name: 'Feint', beats: 'block' } };
let duel = null, duelClock = 0, challengeTarget = null;
const duelCD = {};
const pairKey = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
function lordAt(pid) { const p = players[pid]; if (!p) return null; if (pid === P) return player.pos; if (NET.guest || p.ai) return p.pos; return p.rpos || p.pos; }
function homeGround(pid, at) { const t = at && tileAtWorld(at.x, at.z); return !!t && t.corners.some(cid => owns(corners[cid], pid)); }
function might(pid, at) { const p = players[pid]; return 1 + (p.knights || 0) + (homeGround(pid, at) ? 1 : 0) + (p.dragon && p.dragon.stage === 'grown' ? 1 : 0); }
function canDuel(a, b) {
  return state.phase === 'play' && a !== b && (duelCD[pairKey(a, b)] || 0) <= duelClock
    && !(a === P && state.riding) && !(b === P && state.riding) && !players[a]?.riding && !players[b]?.riding;
}
const lootSize = (w, l) => 2 + (might(w, lordAt(w)) >= might(l, lordAt(l)) + 2 ? 1 : 0);
function applyDuel(w, l, n) {   // the winner takes n random resources from the loser
  const taken = {};
  for (let i = 0; i < n; i++) {
    const pool = RES_KEYS.flatMap(k => Array(Math.max(0, players[l].res[k])).fill(k)); if (!pool.length) break;
    const k = pick(pool); players[l].res[k]--; players[w].res[k]++; taken[k] = (taken[k] || 0) + 1;
  }
  duelCD[pairKey(w, l)] = duelClock + 45;
  return taken;
}
function endDuelEffects(w, l, taken) {
  const loot = bundleTxt(taken), wa = lordAt(w);
  if (wa) floatText(`+${loot}`, wa.x, heightAt(wa.x, wa.z) + 6, wa.z, '#ffe27a');
  const lp = players[l];
  if (lp.ai) { lp.task = null; lp.wander = null; lp.wait = 4; lp.duelWith = null; }
  if (players[w].ai) players[w].duelWith = null;
  if (w !== P) tell(w, { big: 'DUEL WON!', small: `You take ${loot} from ${nameOf(l)}`, flash: RES_KEYS.filter(k => taken[k]), sfx: 'win' });
  if (l !== P) tell(l, { big: 'DUEL LOST', small: `${nameOf(w)} takes ${loot} from you`, flash: RES_KEYS.filter(k => taken[k]), loss: true, sfx: 'raid', daze: true });
  if (w !== P && l !== P) { const t = wa && tileAtWorld(wa.x, wa.z); if (t && visible.has(t.id)) log(`⚔️ ${nameOf(w)} defeats ${nameOf(l)} in a duel nearby`); }
  updateHUD();
}
function knockDown(fromPos, secs = 2) {
  if (fromPos) {
    const dx = player.pos.x - fromPos.x, dz = player.pos.z - fromPos.z, L = Math.hypot(dx, dz) || 1;
    const x = player.pos.x + dx / L * 8, z = player.pos.z + dz / L * 8;
    if (heightAt(x, z) > 0.6) player.pos.set(x, heightAt(x, z), z);
  }
  state.dazeT = secs; player.autoTarget = null; destMarker.visible = false;
}
// you start a fight
function challenge(opp) {
  if (duel || state.phase !== 'play') return;
  if (state.riding) return log('⚠️ Land your dragon first');
  if (!canDuel(P, opp)) return log(`⏳ ${nameOf(opp)} will not fight you again so soon`);
  if (!players[opp].ai) {   // two people: settled by might and luck on the host
    if (NET.guest) netAct({ a: 'duel_human', target: opp }); else autoDuel(P, opp);
    return;
  }
  startDuel(opp, false);
}
function startDuel(opp, challenged) {
  if (duel) return;
  const q = players[opp], qp = lordAt(opp);
  if (!NET.guest) { q.duelWith = P; q.duelT = 30; }
  duel = { opp, wins: [0, 0], rounds: 0, mine: might(P, player.pos), theirs: might(opp, qp), done: false };
  if (qp) {   // face each other
    player.yaw = Math.atan2(player.pos.x - qp.x, player.pos.z - qp.z); player.pitch = -0.05;
    if (q.avatar) q.avatar.rotation.y = Math.atan2(player.pos.x - qp.x, player.pos.z - qp.z);
  }
  player.autoTarget = null; destMarker.visible = false;
  $('duelWho').innerHTML = challenged ? `<b>${nameOf(opp)}</b> blocks your path and draws steel!` : `You challenge <b>${nameOf(opp)}</b>!`;
  $('duelMight').innerHTML = `Your might <b>${duel.mine}</b> · their might <b>${duel.theirs}</b><br><span class="muted">might = 1 + Sellswords + fighting on your own land + a grown dragon</span>`;
  $('duelLog').innerHTML = ''; renderDuel();
  $('duel').classList.remove('hidden'); if (!NET.online) state.paused = true; sfx('raid');
}
function renderDuel(msg) {
  const pip = n => '●'.repeat(n) + '○'.repeat(Math.max(0, 2 - n));
  $('duelScore').innerHTML = `You <span class="pips">${pip(duel.wins[0])}</span> &nbsp;vs&nbsp; <span class="pips">${pip(duel.wins[1])}</span> ${players[duel.opp].house.sigil}`;
  if (msg) { const d = document.createElement('div'); d.innerHTML = msg; $('duelLog').prepend(d); }
  document.querySelectorAll('#duelMoves button, #duelYield').forEach(b => { b.disabled = duel.done; b.style.opacity = duel.done ? 0.4 : 1; });
}
$('duelMoves').addEventListener('click', e => {
  const m = e.target.closest('[data-m]')?.dataset.m; if (!m || !duel || duel.done) return;
  const ai = pick(Object.keys(MOVES)); duel.rounds++;
  const w = MOVES[m].beats === ai ? 0 : MOVES[ai].beats === m ? 1 : duel.mine > duel.theirs ? 0 : duel.theirs > duel.mine ? 1 : -1;
  if (w >= 0) duel.wins[w]++;
  renderDuel(`${MOVES[m].icon} You ${MOVES[m].name.toLowerCase()} · ${MOVES[ai].icon} they ${MOVES[ai].name.toLowerCase()} → ` +
    (w === 0 ? '<b>you win the round</b>' : w === 1 ? '<b>they win the round</b>' : 'even') + (m === ai && w >= 0 ? ' (the mightier lord)' : ''));
  sfx(w === 0 ? 'build' : w === 1 ? 'bad' : 'build');
  if (duel.wins[0] >= 2 || duel.wins[1] >= 2 || duel.rounds >= 6) finishDuel(duel.wins[0] > duel.wins[1] || (duel.wins[0] === duel.wins[1] && duel.mine >= duel.theirs));
});
$('duelYield').addEventListener('click', () => { if (duel && !duel.done) finishDuel(false, true); });
function finishDuel(won, yielded = false) {
  duel.done = true;
  const opp = duel.opp, q = players[opp], qp = lordAt(opp) && { x: lordAt(opp).x, z: lordAt(opp).z };
  let text;
  if (NET.guest) {
    netAct({ a: 'duel_result', opp, won, yield: yielded });
    text = won ? 'VICTORY! Their goods are yours' : yielded ? 'You yield and pay 1 resource' : 'DEFEAT! They take your goods';
  } else {
    q.duelWith = null;
    const w = won ? P : opp, l = won ? opp : P;
    const taken = applyDuel(w, l, yielded ? 1 : lootSize(w, l));
    endDuelEffects(w, l, taken);
    RES_KEYS.forEach(k => taken[k] && flashRes(k, !won));
    text = won ? `VICTORY! You take ${bundleTxt(taken)}` : `${yielded ? 'You yield' : 'DEFEAT'}: they take ${bundleTxt(taken)}`;
  }
  duelCD[pairKey(P, opp)] = duelClock + 45;
  if (!won) knockDown(qp, yielded ? 0.5 : 2);
  renderDuel(`<div class="result ${won ? 'win' : 'lose'}">${text}</div>`);
  log(`⚔️ Duel with ${nameOf(opp)}: ${won ? 'won' : yielded ? 'yielded' : 'lost'}`);
  sfx(won ? 'win' : 'raid');
  setTimeout(() => { $('duel').classList.add('hidden'); duel = null; if (!NET.online) state.paused = false; updateHUD(); refreshMarkers(); }, 2300);
}
// people vs people online, and AI vs AI: might plus luck
function autoDuel(a, b) {
  const sa = might(a, lordAt(a)) + rand() * 3, sb = might(b, lordAt(b)) + rand() * 3;
  const w = sa >= sb ? a : b, l = w === a ? b : a;
  const taken = applyDuel(w, l, lootSize(w, l));
  endDuelEffects(w, l, taken);
  if (w === P) { announce('DUEL WON!', `You take ${bundleTxt(taken)} from ${nameOf(l)}`); RES_KEYS.forEach(k => taken[k] && flashRes(k)); sfx('win'); }
  if (l === P) { announce('DUEL LOST', `${nameOf(w)} takes ${bundleTxt(taken)} from you`); RES_KEYS.forEach(k => taken[k] && flashRes(k, true)); knockDown(lordAt(w)); sfx('raid'); }
}
// AI lords block your way: the more you lead (or the deeper into their land you walk), the likelier a fight
function aiDuelCheck(p, dt) {
  if (p.duelWith != null) { if ((p.duelT -= dt) <= 0) p.duelWith = null; return; }
  if ((p.duelLook = (p.duelLook || 0) - dt) > 0) return;
  p.duelLook = 1;
  for (const h of players) {
    if (h.ai || h === p) continue;
    const hp = lordAt(h.id); if (!hp) continue;
    if (Math.hypot(hp.x - p.pos.x, hp.z - p.pos.z) > 6 || !canDuel(p.id, h.id) || wallBlocks(p.id, p.pos.x, p.pos.z, hp.x, hp.z)) continue;   // safe behind your walls
    if (h.id === P && (duel || state.paused || state.reaverPick)) continue;
    const aggro = 0.25 + (renown(h.id) >= renown(p.id) + 2 ? 0.25 : 0) + (homeGround(p.id, p.pos) ? 0.3 : 0) + (resTotal(h.id) >= 5 ? 0.15 : 0);
    if (rand() > aggro) { duelCD[pairKey(p.id, h.id)] = duelClock + 20; continue; }   // lets you pass this time
    p.duelWith = h.id; p.duelT = 30; p.task = null;
    if (h.id === P) { announce('⚔️ CHALLENGE!', `${nameOf(p.id)} blocks your path!`); startDuel(p.id, true); }
    else tell(h.id, { duel: p.id });
    return;
  }
  for (const q of players) {
    if (!q.ai || q === p || q.duelWith != null || !q.pos) continue;
    if (Math.hypot(q.pos.x - p.pos.x, q.pos.z - p.pos.z) < 5 && canDuel(p.id, q.id) && !wallBlocks(p.id, p.pos.x, p.pos.z, q.pos.x, q.pos.z) && rand() < 0.3) { autoDuel(p.id, q.id); return; }
  }
}
// ---------------------------------------------------------------- NIGHT RAIDS
const RAID_RANGE = 9;
function raidProblem(pid, c, at) {
  if (!isNight()) return 'Raids only work at night';
  if (!c || !c.building || c.building.owner === pid) return 'Pick a rival Hamlet or Keep';
  if (c.raided === dayCount) return 'Already raided tonight';
  if (!at || Math.hypot(at.x - c.x, at.z - c.z) > RAID_RANGE) return 'Get closer to the building';
  const wb = wallBlocks(pid, at.x, at.z, c.x, c.z, true); if (wb && wb.road === c.building.owner) return 'Their wall protects it';
  if ((pid === P && state.riding) || players[pid].riding) return 'Land your dragon first';
  return null;
}
// host / single player: resolve a raid by `pid` on corner `c`
function raid(pid, c) {
  const owner = c.building.owner, where = `${nameOf(owner)}'s ${c.building.type === 'keep' ? 'Keep' : 'Hamlet'}`;
  c.raided = dayCount;
  const op = lordAt(owner);
  const ownerNear = op && Math.hypot(op.x - c.x, op.z - c.z) < 18 && !(owner === P ? state.riding : players[owner].riding);
  const towerSees = [c, ...c.adj.map(id => corners[id])].some(x => x.tower === owner);
  if (ownerNear) {   // caught red-handed: fight it out
    if (pid === P) { announce('CAUGHT!', `${nameOf(owner)} catches you at ${where}. Fight!`); startDuel(owner, true); }
    else if (owner === P) { announce('🌙 THIEF!', `You catch ${nameOf(pid)} raiding your ${c.building.type}. Fight!`); if (players[pid].ai) startDuel(pid, false); else autoDuel(owner, pid); }
    else if (players[owner].ai && !players[pid].ai) { players[owner].duelWith = pid; players[owner].duelT = 30; tell(pid, { big: 'CAUGHT!', small: `${nameOf(owner)} catches you at ${where}. Fight!`, duel: owner }); }
    else if (players[pid].ai && !players[owner].ai) { players[pid].duelWith = owner; players[pid].duelT = 30; tell(owner, { big: '🌙 THIEF!', small: `You catch ${nameOf(pid)} raiding your ${c.building.type}. Fight!`, duel: pid }); }
    else autoDuel(pid, owner);
    return 'caught';
  }
  if (towerSees) {
    if (pid === P) { announce('SPOTTED!', `A Scorpion Tower guards ${where}: the raid fails`); knockDown({ x: c.x, z: c.z }); }
    else tell(pid, { big: 'SPOTTED!', small: `A Scorpion Tower guards ${where}: the raid fails`, daze: true });
    tell(owner, { log: `🏹 Your Scorpion Tower drove off ${nameOf(pid)}'s night raid` });
    return 'tower';
  }
  const pool = RES_KEYS.flatMap(k => Array(Math.max(0, players[owner].res[k])).fill(k));
  if (!pool.length) { tell(pid, { big: '🌙 RAID', small: `${where} has an empty storehouse` }); return 'empty'; }
  const k = pick(pool); players[owner].res[k]--; players[pid].res[k]++;
  floatText(`+1 ${RES[k].icon}`, c.x, c.y + 9, c.z, '#c9b8ff');
  tell(pid, { big: '🌙 RAID!', small: `You steal 1 ${RES[k].icon} from ${where}`, log: `🌙 You steal 1 ${RES[k].icon} from ${where}`, flash: [k], sfx: 'build' });
  tell(owner, { big: '🌙 THIEVES!', small: `${nameOf(pid)} stole 1 ${RES[k].icon} from your ${c.building.type}`, log: `🌙 ${nameOf(pid)} stole 1 ${RES[k].icon} from your ${c.building.type} in the night`, flash: [k], loss: true, sfx: 'raid' });
  if (pid !== P && owner !== P && c.tiles.some(id => visible.has(id))) log(`🌙 ${nameOf(pid)} raids ${where}`);
  updateHUD(); refreshMarkers();
  return 'ok';
}
function tryRaid(c) {
  const prob = raidProblem(P, c, player.pos);
  if (prob) { log('⚠️ ' + prob); sfx('bad'); return; }
  if (NET.guest) { netAct({ a: 'raid', c: c.id }); c.raided = dayCount; return; }
  raid(P, c);
}
let raidTarget = null;
function updateRaid() {
  let best = null, bd = RAID_RANGE;
  if (state.phase === 'play' && isNight() && !duel && !state.riding) for (const c of corners) {
    if (!c.building || c.building.owner === P || c.raided === dayCount) continue;
    const d = Math.hypot(c.x - player.pos.x, c.z - player.pos.z);
    if (d < bd && !raidProblem(P, c, player.pos)) { bd = d; best = c; }
  }
  if (best !== raidTarget) {
    raidTarget = best; $('raidBtn').classList.toggle('hidden', !best);
    if (best) $('raidBtn').innerHTML = `🌙 Raid ${players[best.building.owner].house.sigil} ${best.building.type === 'keep' ? 'Keep' : 'Hamlet'} <span class="muted">(steal 1 · beware towers & lords)</span>`;
  }
}
$('raidBtn').addEventListener('click', () => { if (raidTarget) tryRaid(raidTarget); });
$('tollBtn').addEventListener('click', tryToll);
// AI lords go thieving at night
function aiRaidPlan(p) {
  if (!isNight() || p.carrying || rand() > 0.12) return false;
  const c = corners.filter(c => c.building && c.building.owner !== p.id && c.raided !== dayCount)
    .sort((a, b) => Math.hypot(a.x - p.pos.x, a.z - p.pos.z) - Math.hypot(b.x - p.pos.x, b.z - p.pos.z))[0];
  if (!c || Math.hypot(c.x - p.pos.x, c.z - p.pos.z) > 70) return false;
  p.task = { kind: 'raid', c }; return true;
}

// a "Challenge" button appears when a rival lord stands close to you
function updateChallenge() {
  let best = null, bd = DUEL_RANGE;
  if (state.phase === 'play' && !duel && !state.riding) for (const p of players) {
    if (p.id === P || !p.avatar || !p.avatar.visible || !p.pos) continue;
    const d = Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z);
    if (d < bd && canDuel(P, p.id) && !wallBlocks(P, player.pos.x, player.pos.z, p.pos.x, p.pos.z)) { bd = d; best = p; }
  }
  const id = best ? best.id : null;
  if (id !== challengeTarget) {
    challengeTarget = id; $('challengeBtn').classList.toggle('hidden', id === null);
    if (best) $('challengeBtn').innerHTML = `⚔️ Challenge ${best.house.sigil} ${!best.ai && best.name ? best.name : best.house.name.replace('House ', '')} <span class="muted">(might ${might(best.id, best.pos)} vs your ${might(P, player.pos)})</span>`;
  }
}
$('challengeBtn').addEventListener('click', () => { if (challengeTarget != null) challenge(challengeTarget); });

// ---------------------------------------------------------------- on-screen D-pad (touch screens)
let dpadOn = matchMedia('(pointer: coarse)').matches;
try { const v = localStorage.getItem('dh-dpad'); if (v) dpadOn = v === 'on'; } catch (_) {}
function setDpad(on) {
  dpadOn = on; try { localStorage.setItem('dh-dpad', on ? 'on' : 'off'); } catch (_) {}
  $('dpad').classList.toggle('hidden', !on); $('btnDpad').classList.toggle('on', on); $('hud').classList.toggle('dpad-on', on);
}
$('btnDpad').addEventListener('click', () => setDpad(!dpadOn));
$('btnView').addEventListener('click', () => { const ks = Object.keys(VIEWS); setView(ks[(ks.indexOf(viewMode) + 1) % ks.length]); });
setView(viewMode);
setDpad(dpadOn);
document.querySelectorAll('#dpad [data-k]').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); keys[k] = true; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
  const off = () => { keys[k] = false; b.classList.remove('held'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
});

// title-screen camera orbit
let orbit = 0;
const clock = new THREE.Clock();
function loop() {
  const dt = Math.min(0.05, clock.getDelta()), time = clock.elapsedTime;
  if (state.phase === 'title' || state.phase === 'won' || state.phase === 'setup') {
    orbit += dt * 0.05;
    camera.position.set(Math.sin(orbit) * 210, 85, Math.cos(orbit) * 210);
    camera.lookAt(0, 8, 0);
  } else {
    if (!state.paused) updatePlayer(dt);
    if (state.phase === 'play' && !NET.guest && (NET.online || !state.paused)) simStep(dt, time);
    if (state.phase === 'play' && NET.guest) guestStep(dt, time);
    if (!state.paused) {
      state.recallCD = Math.max(0, state.recallCD - dt);
      if (ravenOffer && (ravenOffer.t -= dt) <= 0) { ravenOffer = null; $('raven').classList.add('hidden'); }
    }
  }
  if (NET.online) netTick(dt);
  // harvest bar
  if (state.phase === 'play') {
    $('harvestLabel').textContent = state.rolling > 0 ? `🎲 The Rune Stones are cast… (${state.rollNo}/${ROLLS_PER_HARVEST})` : state.rollsLeft > 0 ? '🎲 Second cast coming…' :
      `🎺 Next harvest in ${Math.ceil(state.harvestT)}s` + (state.lastRoll ? ` · last roll ${state.lastRoll}` : '');
    $('harvestFill').style.width = (state.rolling > 0 ? 100 : 100 * (1 - state.harvestT / state.harvestLen)) + '%';
    // single player: nothing to build or buy? call the harvest now instead of waiting
    const idle = !NET.online && !state.rolling && !(state.rollsLeft > 0) && state.harvestT > 3 && !state.riding
      && !['road', 'hamlet', 'keep', 'roost', 'tower', 'scroll'].some(k => canAfford(k) && (k === 'scroll' || !limitHit(k)));
    $('hurryBtn').classList.toggle('hidden', !idle);
  } else if (state.phase === 'setup') $('harvestLabel').textContent = 'Landing: found your first two Hamlets';

  updateDayNight(dt); computeVisibility(); applyFogToWorld(dt);
  if (state.phase === 'play') updateAim();
  if (state.phase === 'setup' || state.phase === 'play') drawMinimap();

  // world animation
  const wp = water.geometry.attributes.position, base = water.userData.base;
  for (let i = 0; i < wp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; wp.array[i * 3 + 1] = Math.sin(x * 0.05 + time) * 0.35 + Math.cos(z * 0.07 + time * 0.8) * 0.35; }
  wp.needsUpdate = true; water.geometry.computeVertexNormals();
  windmills.forEach(b => b.rotation.z += dt * 0.8);
  clouds.forEach(c => { c.position.x += dt * 3; if (c.position.x > 600) c.position.x = -600; });
  const top = heightAt(0, 0) + 2;
  smoke.forEach(s => { s.userData.age += dt * 0.12; if (s.userData.age > 1) s.userData.age = 0; const a = s.userData.age; s.position.set(Math.sin(a * 9 + s.id) * 3 + a * 18, top + a * 45, Math.cos(a * 7 + s.id) * 3); s.scale.setScalar(0.6 + a * 2.4); });
  cornerSigns.forEach((s, i) => { if (s.g.visible) { s.ring.rotation.y += dt * 0.6; if (s.label.visible) s.label.position.y += Math.sin(time * 2 + i) * 0.004; } });
  const glow = 0.75 + Math.sin(time * 3) * 0.2; signGold.opacity = glow;
  if (destMarker.visible) { destMarker.rotation.z += dt * 2; destMarker.scale.setScalar(1 + Math.sin(time * 5) * 0.12); }
  if (beacon.visible) beacon.material.opacity = 0.22 + Math.sin(time * 2.5) * 0.1;
  for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt * 3; const k = Math.min(1, p.t); p.o.scale.setScalar(0.2 + 0.8 * k + Math.sin(k * Math.PI) * 0.2); if (p.t >= 1) { p.o.scale.setScalar(1); pops.splice(i, 1); } }
  for (let i = pulse.length - 1; i >= 0; i--) { const p = pulse[i]; p.t += dt; const s = 5 + Math.sin(Math.min(1, p.t / 1.5) * Math.PI) * 4; p.s.scale.set(s, s * 1.38, 1); if (p.t > 1.5) { p.s.scale.set(5, 6.9, 1); pulse.splice(i, 1); } }
  updateFire(dt); updateFloats(dt); duelClock += dt; updateChallenge(); updateRaid(); updateGates(dt); updateToll();
  if (annTimer > 0) { annTimer -= dt; if (annTimer <= 0) $('announce').classList.remove('show'); }

  inkU.fadeNear.value = scene.fog.near * 1.4; inkU.fadeFar.value = scene.fog.far * 1.1;
  renderer.setRenderTarget(inkRT); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(inkScene, inkCam);
  requestAnimationFrame(loop);
}
loop();

// debug hooks for automated testing
window.__dh = { tollPasses, payToll, wallGates, gatePath, wallBlocks, walkHeight, get dayT() { return dayT; }, isNight, isDusk, raid, guildOK, nextHarvestDelay, keysW: () => !!keys.KeyW, project: (x, z) => { const v = new THREE.Vector3(x, heightAt(x, z) + 0.5, z).project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, front: v.z < 1 }; }, currentGoalTarget: () => currentGoal && currentGoal.target, get dragons() { return players.map(p => p.dragon); }, cradleEggs, tryEgg, toggleRide, dragonfire, scorch, dragonsOnHarvest, buildRoost, buildTower, updateDragons, aiDragonfire, buyScroll, playScroll, get deck() { return deck; }, toggleLore, resolveHarvest, get reaverTile() { return reaverTile; }, players, aiThink, updateAI, sendReavers, finishReaverPick, answerRaven, sendRaven, setDay: t => { dayT = t; }, HOUSES, state, explored, visible, mapTargetAt, tiles, corners, edges, player, tryBuild, setMode, startHarvest, renown, heightAt, checkWin };
