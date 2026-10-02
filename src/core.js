/* ================= Basics ================= */
const W = 1600, H = 900, TAU = Math.PI * 2, PI = Math.PI, DEG = Math.PI / 180;
const $ = id => document.getElementById(id);
const cv = $('cv'); let ctx = cv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t = clamp(t), t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const back = t => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const fin = (t, a, b) => clamp((t - a) / (b - a));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = { disp: '"Rozha One", Georgia, serif', body: 'Hind, "Segoe UI", sans-serif' };
const C = { gold: '#E8B84A', goldSoft: '#F4D891', saffron: '#F28C28', lotus: '#E86A92', ink: '#EFE8D8', muted: '#A3A8CF', dim: '#6D739E', night: '#0B1026', panel: '#1A2150', red: '#E2553F' };
let scale = 1, gt = 0;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* ================= 2D helpers (overlay) ================= */
function txt(s, x, y, o = {}) {
  ctx.save(); ctx.globalAlpha *= (o.a ?? 1);
  ctx.font = `${o.w || 400} ${o.size || 24}px ${o.font || F.body}`;
  ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 18; }
  if (o.shadow !== false && !o.glow) { ctx.shadowColor = 'rgba(5,7,20,.85)'; ctx.shadowBlur = 6; }
  ctx.fillText(s, x, y); ctx.restore();
}
function wrapTxt(s, x, y, maxW, lh, o = {}) {
  ctx.save(); ctx.font = `${o.w || 400} ${o.size || 20}px ${o.font || F.body}`;
  const words = s.split(' '); let line = '', yy = y;
  for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { txt(line, x, yy, o); line = w; yy += lh; } else line = test; }
  if (line) txt(line, x, yy, o); ctx.restore(); return yy + lh;
}
function circle(x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function rrect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function glow(x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
function panel(x, y, w, h, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; rrect(x, y, w, h, 16); ctx.fillStyle = 'rgba(16,21,54,.82)'; ctx.fill();
  ctx.strokeStyle = 'rgba(232,184,74,.35)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}
function chipTag(x, y, label, good) {
  ctx.save(); ctx.font = `600 17px ${F.body}`; const w = ctx.measureText(label).width + 24;
  rrect(x, y - 15, w, 30, 15); ctx.fillStyle = good === true ? 'rgba(92,201,138,.25)' : good === false ? 'rgba(226,85,63,.28)' : 'rgba(163,168,207,.2)'; ctx.fill();
  txt(label, x + w / 2, y + 1, { size: 17, w: 600, color: good === true ? '#9FE3B9' : good === false ? '#FFB4A6' : C.ink });
  ctx.restore(); return w;
}
function mandala(x, y, R, p, rot = 0, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.6;
  [1, .86, .62].forEach((k, i) => { const q = clamp(p * 1.6 - i * .15); if (q > 0) { ctx.beginPath(); ctx.arc(0, 0, R * k, -PI / 2, -PI / 2 + TAU * q); ctx.stroke(); } });
  const n = 16, shown = Math.floor(clamp((p - .3) / .6) * n);
  for (let i = 0; i < shown; i++) {
    ctx.save(); ctx.rotate(i * TAU / n);
    ctx.beginPath(); ctx.moveTo(0, -R * .62); ctx.quadraticCurveTo(R * .12, -R * .8, 0, -R * .98); ctx.quadraticCurveTo(-R * .12, -R * .8, 0, -R * .62); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -R * .93, 3, 0, TAU); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
// 2D moon (insets, finder)
function moonDisc(x, y, r, e, lit = '#FFF4D6') {
  e = ((e % 360) + 360) % 360;
  circle(x, y, r, '#3B4280');
  ctx.save(); ctx.translate(x, y);
  let ee = e, flip = false; if (ee > 180) { ee = 360 - ee; flip = true; }
  if (flip) ctx.scale(-1, 1);
  const k = r * Math.cos(ee * DEG);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, lit); g.addColorStop(1, '#EBCF93');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, -PI / 2, PI / 2, false);
  if (k >= 0) ctx.ellipse(0, 0, Math.max(k, .01), r, 0, PI / 2, -PI / 2, true);
  else ctx.ellipse(0, 0, Math.max(-k, .01), r, 0, PI / 2, 3 * PI / 2, false);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
// Chandra's face, readable on lit and dark sides
function face(x, y, r, o = {}) {
  if (r < 6) return;
  const blink = o.blink ?? ((gt + (o.seed || 0)) % 4.2 < .14);
  const ink = '#3E2B52', halo = 'rgba(255,246,220,.75)';
  ctx.save(); ctx.lineCap = 'round';
  ctx.globalAlpha = .38; circle(x - r * .5, y + r * .2, r * .13, C.lotus); circle(x + r * .5, y + r * .2, r * .13, C.lotus); ctx.globalAlpha = 1;
  const ex = r * .3, ey = y - r * .08, look = (o.look || 0) * r * .03;
  for (const s of [-1, 1]) {
    if (blink) {
      ctx.strokeStyle = halo; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(x + s * ex, ey, r * .08, .15 * PI, .85 * PI); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = r * .045; ctx.beginPath(); ctx.arc(x + s * ex, ey, r * .08, .15 * PI, .85 * PI); ctx.stroke();
    } else {
      circle(x + s * ex + look, ey, r * .11, halo); circle(x + s * ex + look, ey, r * .085, ink); circle(x + s * ex + look + r * .03, ey - r * .03, r * .03, '#fff');
    }
  }
  const sm = o.smile ?? 1;
  for (const [c, w] of [[halo, r * .09], [ink, r * .05]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y + r * .1, r * .26, (.5 - .32 * sm) * PI, (.5 + .32 * sm) * PI); ctx.stroke(); }
  ctx.restore();
}
function surya2d(x, y, r) {
  ctx.save(); ctx.translate(x, y); glow(0, 0, r * 3, 'rgba(247,183,51,.6)', .6);
  ctx.fillStyle = '#F7A632';
  for (let i = 0; i < 14; i++) { const a = gt * .15 + i * TAU / 14, l = r * 1.5; ctx.beginPath(); ctx.moveTo(Math.cos(a - .12) * r * .9, Math.sin(a - .12) * r * .9); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.lineTo(Math.cos(a + .12) * r * .9, Math.sin(a + .12) * r * .9); ctx.fill(); }
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#FFF3C4'); g.addColorStop(.6, '#F9C646'); g.addColorStop(1, '#F28C28');
  circle(0, 0, r, g); ctx.restore();
}
const STARS2D = (() => { const r = rng(7); return Array.from({ length: 260 }, () => ({ x: r() * W, y: r() * H, r: r() * 1.6 + .3, p: r() * TAU, s: r() * 1.5 + .5 })); })();
function sky2d() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070A1C'); g.addColorStop(1, '#1B1F4B'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of STARS2D) { ctx.globalAlpha = .4 + .5 * (.5 + .5 * Math.sin(gt * s.s + s.p)); circle(s.x, s.y, s.r, '#F6EFD9'); } ctx.globalAlpha = 1;
}

/* Canvas buttons / hit regions */
let hits = [], ptr = { x: -1, y: -1, down: false };
function button(id, x, y, w, h, label, active, o = {}) {
  const hover = ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h;
  hits.push({ id, x, y, w, h });
  ctx.save(); ctx.globalAlpha *= (o.a ?? 1);
  rrect(x, y, w, h, h / 2);
  ctx.fillStyle = active ? C.gold : hover ? 'rgba(232,184,74,.25)' : 'rgba(16,21,54,.88)'; ctx.fill();
  ctx.strokeStyle = active ? C.gold : 'rgba(232,184,74,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  txt(label, x + w / 2, y + h / 2 + 2, { size: o.size || 21, w: 500, color: active ? C.night : C.goldSoft, shadow: false });
  ctx.restore();
}
function hitAt(x, y) { for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (h.r ? Math.hypot(x - h.x, y - h.y) <= h.r : (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h)) return h.id; } return null; }
function hitCircle(id, x, y, r) { hits.push({ id, x, y, r }); }
let TRY = {};
function tryIt(x, y, label, t, from) {
  if (t < from || (typeof P !== 'undefined' && P.S.touchedAny)) return;
  if (TRY[label] == null) TRY[label] = gt; const age = gt - TRY[label]; if (age > 6) return;
  const a = fin(t, from, from + .6) * (1 - fin(age, 5, 6)) * (.8 + .2 * Math.sin(gt * 4));
  ctx.save(); ctx.globalAlpha = a; ctx.font = `600 19px ${F.body}`; const w = ctx.measureText(label).width + 36;
  rrect(x - w / 2, y - 19, w, 38, 19); ctx.fillStyle = C.saffron; ctx.fill();
  txt(label, x, y + 2, { size: 19, w: 600, color: '#1b0f05', shadow: false }); ctx.restore();
}
function title(t, n, name) {
  const a = fin(t, .2, 1);
  const lab = String(n).padStart(2, '0'); ctx.font = `600 22px ${F.body}`; const lw = ctx.measureText(lab).width;
  txt(lab, 60, 62, { size: 22, color: C.saffron, a, align: 'left', w: 600 });
  txt(name, 60 + Math.max(28, lw) + 12, 64, { size: 30, font: F.disp, color: C.gold, a, align: 'left' });
}
const MONTHS_EN_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ================= 3D engine (three.js) ================= */
const HAS3 = (() => { try { const c = document.createElement('canvas'); return !!window.THREE && !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } })();
let R3, S3, CAM, GROUP, STARS3, AMB, KEY, RC, PLANE0, TX = {};
const V3 = (x = 0, y = 0, z = 0) => HAS3 ? new THREE.Vector3(x, y, z) : { x, y, z };
function posXZ(r, deg, y = 0) { return V3(r * Math.cos(deg * DEG), y, -r * Math.sin(deg * DEG)); }
function canvasTex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
function makeTextures() {
  const r = rng(11);
  TX.moon = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = '#ddd2b8'; x.fillRect(0, 0, w, h);
    const blob = (cx, cy, rad, col) => { for (const dx of [-w, 0, w]) { const g = x.createRadialGradient(cx + dx, cy, 0, cx + dx, cy, rad); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx + dx - rad, cy - rad, rad * 2, rad * 2); } };
    for (let i = 0; i < 16; i++) blob(r() * w, h * (.25 + .5 * r()), 40 + r() * 120, 'rgba(95,90,86,.5)');
    for (let i = 0; i < 7000; i++) { x.fillStyle = `rgba(${r() < .5 ? '60,55,50' : '255,250,235'},${r() * .08})`; x.fillRect(r() * w, r() * h, 2, 2); }
    for (let i = 0; i < 420; i++) { const cx = r() * w, cy = r() * h, rad = 2 + Math.pow(r(), 3) * 26; x.fillStyle = 'rgba(80,74,68,.28)'; x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,250,235,.22)'; x.lineWidth = Math.max(1, rad * .18); x.beginPath(); x.arc(cx - rad * .15, cy - rad * .15, rad, PI * .9, PI * 1.9); x.stroke(); }
  });
  TX.earth = canvasTex(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a5fae'); g.addColorStop(.5, '#1d4f9e'); g.addColorStop(1, '#2a5fae'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let c = 0; c < 7; c++) { const cx = r() * w, cy = h * (.2 + .6 * r()); for (let k = 0; k < 16; k++) { x.fillStyle = r() < .75 ? '#3f8f55' : '#a88f5c'; x.beginPath(); x.ellipse(cx + (r() - .5) * 180, cy + (r() - .5) * 110, 20 + r() * 50, 14 + r() * 36, r() * PI, 0, TAU); x.fill(); } }
    x.fillStyle = '#eef4ff'; x.fillRect(0, 0, w, h * .06); x.fillRect(0, h * .94, w, h * .06);
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${.2 + r() * .3})`; x.beginPath(); x.ellipse(r() * w, r() * h, 30 + r() * 70, 6 + r() * 12, (r() - .5) * .4, 0, TAU); x.fill(); }
  });
  TX.sun = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#ffb33a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { x.fillStyle = r() < .5 ? `rgba(255,240,170,${r() * .4})` : `rgba(230,110,20,${r() * .35})`; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 3, 0, TAU); x.fill(); } });
  TX.glow = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  TX.dot = canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  TX.rays = canvasTex(512, 512, (x, w) => { x.translate(w / 2, w / 2); for (let i = 0; i < 18; i++) { x.rotate(TAU / 18); const g = x.createLinearGradient(0, 0, w / 2, 0); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,180,60,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(0, -10); x.lineTo(w / 2, 0); x.lineTo(0, 10); x.fill(); } });
  TX.bands = canvasTex(512, 256, (x, w, h) => { for (let y = 0; y < h; y += 4) { const v = Math.sin(y * .09) * .5 + Math.sin(y * .23) * .3; x.fillStyle = `rgb(${220 + v * 30},${180 + v * 40},${120 + v * 40})`; x.fillRect(0, y, w, 4); } });
}
function init3() {
  if (!HAS3) return;
  R3 = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, alpha: true });
  R3.setClearColor(0x000000, 0);
  S3 = new THREE.Scene();
  CAM = new THREE.PerspectiveCamera(40, 16 / 9, .05, 3000);
  AMB = new THREE.AmbientLight(0x9098d0, .3); S3.add(AMB);
  KEY = new THREE.DirectionalLight(0xfff4e0, 1.2); S3.add(KEY); S3.add(KEY.target);
  RC = new THREE.Raycaster(); PLANE0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  makeTextures();
  STARS3 = new THREE.Group();
  const mk = (n, size, band, op, seed) => {
    const r = rng(seed), g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x, y, z;
      if (band) { const th = r() * TAU; y = (r() + r() + r() - 1.5) * .12; x = Math.cos(th); z = Math.sin(th); }
      else { const u = r() * 2 - 1, th = r() * TAU; y = u; x = Math.sqrt(1 - u * u) * Math.cos(th); z = Math.sqrt(1 - u * u) * Math.sin(th); }
      const l = Math.hypot(x, y, z) || 1, R = 800; pos[i * 3] = x / l * R; pos[i * 3 + 1] = y / l * R; pos[i * 3 + 2] = z / l * R;
      const tint = r(); col[i * 3] = tint < .2 ? .75 : 1; col[i * 3 + 1] = tint < .2 ? .85 : .95; col[i * 3 + 2] = tint > .8 ? .75 : 1;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size, map: TX.dot, vertexColors: true, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  };
  STARS3.add(mk(2400, 5, false, .9, 3), mk(260, 11, false, 1, 5), mk(4000, 3.2, true, .45, 9));
  STARS3.children[2].rotation.z = .9; STARS3.children[2].rotation.x = .3;
  S3.add(STARS3);
  GROUP = new THREE.Group(); S3.add(GROUP);
}
function clear3() {
  if (!HAS3) return;
  S3.remove(GROUP);
  GROUP.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); });
  GROUP = new THREE.Group(); S3.add(GROUP);
  KEY.intensity = 1.2; KEY.color.set(0xfff4e0); KEY.position.set(3, 4, 5); KEY.target.position.set(0, 0, 0); AMB.intensity = .3; AMB.color.set(0x9098d0);
  CAM.clearViewOffset(); CAM.fov = 40; CAM.updateProjectionMatrix(); STARS3.visible = true; CAM.up.set(0, 1, 0);
}
function heroLight() { if (!HAS3) return; KEY.position.set(-3, 2.5, 6); KEY.intensity = 1.5; KEY.color.set(0xffe9c4); AMB.color.set(0xfff0dd); AMB.intensity = .45; }
function add(o, parent) { if (HAS3) (parent || GROUP).add(o); return o; }
function dummy() { const o = { position: V3(), rotation: { x: 0, y: 0, z: 0 }, scale: { set() { } }, userData: {}, visible: true, material: {}, getWorldPosition(v) { return this.position; }, add() { }, children: [] }; o.position.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; }; o.position.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }; return o; }
function moon3(r, o = {}) {
  if (!HAS3) { const d = dummy(); d.userData.r = r; return d; }
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.MeshStandardMaterial({ map: TX.moon, roughness: 1, metalness: 0, emissive: new THREE.Color(0x2a3070), emissiveIntensity: o.earthshine ?? .6, transparent: true }));
  m.userData.r = r; return add(m, o.parent);
}
function earth3(r, o = {}) {
  if (!HAS3) { const d = dummy(); d.userData.r = r; return d; }
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshStandardMaterial({ map: TX.earth, roughness: .8, emissive: new THREE.Color(0x10244f), emissiveIntensity: .8 }));
  m.rotation.z = .41; g.add(m); g.userData.body = m;
  const at = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, color: 0x6fb0ff, transparent: true, opacity: .45, depthWrite: false, blending: THREE.AdditiveBlending })); at.scale.set(r * 3.4, r * 3.4, 1); g.add(at);
  g.userData.r = r; return add(g, o.parent);
}
function sun3(r, o = {}) {
  if (!HAS3) { const d = dummy(); d.userData.r = r; return d; }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshBasicMaterial({ map: TX.sun })));
  const glw = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, color: 0xffb347, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending })); glw.scale.set(r * 7, r * 7, 1); g.add(glw);
  const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.rays, color: 0xffd27a, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending })); rays.scale.set(r * 4.6, r * 4.6, 1); g.add(rays);
  g.userData.rays = rays; g.userData.r = r;
  if (o.light !== false) { const pl = new THREE.PointLight(0xfff0d8, o.intensity ?? 2, 0, 0); g.add(pl); g.userData.light = pl; }
  return add(g, o.parent);
}
function planet3(r, color, o = {}) {
  if (!HAS3) { const d = dummy(); d.userData.r = r; return d; }
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: .6, emissive: new THREE.Color(color), emissiveIntensity: .28, map: o.bands ? TX.bands : null, transparent: true });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), mat); g.add(m); g.userData.body = m;
  if (o.ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(r * 1.4, r * 2.2, 64), new THREE.MeshBasicMaterial({ color: 0xd8c9a0, transparent: true, opacity: .65, side: THREE.DoubleSide })); rg.rotation.x = -PI / 2 + .45; g.add(rg); }
  const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, color: new THREE.Color(color), transparent: true, opacity: o.glow ?? .55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.set(r * 4, r * 4, 1); g.add(gl); g.userData.glow = gl;
  g.userData.r = r; return add(g, o.parent);
}
function orbit(fnR, color, op = .5, o = {}) {
  if (!HAS3) return dummy();
  const pts = []; const n = o.segs || 256;
  for (let i = 0; i <= n; i++) { const th = i / n * 360, rr = typeof fnR === 'function' ? fnR(th) : fnR; pts.push(new THREE.Vector3(rr * Math.cos(th * DEG), o.y || 0, -rr * Math.sin(th * DEG))); }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = o.dashed ? new THREE.LineDashedMaterial({ color: new THREE.Color(color), dashSize: o.dash || .12, gapSize: o.gap || .1, transparent: true, opacity: op }) : new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: op });
  const l = new THREE.Line(g, m); if (o.dashed) l.computeLineDistances(); return add(l, o.parent);
}
function sector(rIn, rOut, a0, a1, color, op, o = {}) {
  if (!HAS3) return dummy();
  const m = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, Math.max(4, Math.ceil((a1 - a0) / 2)), 1, a0 * DEG, (a1 - a0) * DEG),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -PI / 2; m.position.y = o.y || 0; return add(m, o.parent);
}
function disc(r, color, op, o = {}) {
  if (!HAS3) return dummy();
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -PI / 2; return add(m, o.parent);
}
function glowSprite(color, size, op = .8, o = {}) {
  if (!HAS3) return dummy();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow, color: new THREE.Color(color), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.set(size, size, 1); return add(s, o.parent);
}
function setOpacity(obj, a) { if (!HAS3 || !obj.traverse) return; obj.traverse(o => { if (o.material) { if (o.userData.baseOp == null) o.userData.baseOp = o.material.opacity ?? 1; o.material.transparent = true; o.material.opacity = o.userData.baseOp * a; } }); obj.visible = a > .01; }
function camOrbit(d, el, az, tx = 0, ty = 0, tz = 0, shift = 0) {
  if (!HAS3) return;
  CAM.position.set(tx + d * Math.cos(el * DEG) * Math.sin(az * DEG), ty + d * Math.sin(el * DEG), tz + d * Math.cos(el * DEG) * Math.cos(az * DEG));
  CAM.lookAt(tx, ty, tz);
  if (shift) CAM.setViewOffset(W, H, shift, 0, W, H); else CAM.clearViewOffset();
  CAM.updateMatrixWorld();
}
const _v = HAS3 ? new THREE.Vector3() : null;
function wp(obj) { return HAS3 ? obj.getWorldPosition(new THREE.Vector3()) : obj.position; }
function proj(v) {
  if (!HAS3) return { x: -999, y: -999, vis: false };
  _v.copy(v).project(CAM); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H, vis: _v.z < 1 };
}
function projR(v, r) {
  if (!HAS3) return 0;
  const right = new THREE.Vector3().setFromMatrixColumn(CAM.matrixWorld, 0).multiplyScalar(r);
  const a = proj(v), b = proj(v.clone().add(right)); return Math.hypot(b.x - a.x, b.y - a.y);
}
function faceOn(obj, o = {}) { const p = wp(obj); const q = proj(p); if (!q.vis) return; face(q.x, q.y, projR(p, obj.userData.r) * (o.k || .95), o); }
function planeHit(p) {
  if (!HAS3) return null;
  RC.setFromCamera(new THREE.Vector2(p.x / W * 2 - 1, -(p.y / H * 2 - 1)), CAM);
  const hit = new THREE.Vector3(); return RC.ray.intersectPlane(PLANE0, hit) ? hit : null;
}
function lineTo2d(a, b, color, w, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore(); }

/* ================= Audio ================= */
const AU = { ctx: null, on: { voice: true, music: true, sfx: true, tabla: true } };
function audioInit() {
  if (AU.ctx) { AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ac = AU.ctx = new AC();
  AU.master = ac.createGain(); AU.master.gain.value = .9; AU.master.connect(ac.destination);
  AU.verb = ac.createConvolver(); AU.verb.buffer = impulse(ac, 3.2, 2.6);
  const vg = ac.createGain(); vg.gain.value = .4; AU.verb.connect(vg); vg.connect(AU.master);
  AU.music = ac.createGain(); AU.music.gain.value = AU.on.music ? .18 : 0; AU.music.connect(AU.master); AU.music.connect(AU.verb);
  AU.sfx = ac.createGain(); AU.sfx.gain.value = AU.on.sfx ? .5 : 0; AU.sfx.connect(AU.master); AU.sfx.connect(AU.verb);
  const len = ac.sampleRate; AU.noise = ac.createBuffer(1, len, ac.sampleRate); const d = AU.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.tabla = ac.createGain(); AU.tabla.gain.value = AU.on.tabla ? TABLA_VOL : 0; const tlp = ac.createBiquadFilter(); tlp.type = 'lowpass'; tlp.frequency.value = 3200; tlp.Q.value = .5; AU.tabla.connect(tlp); tlp.connect(AU.master);
  const tv = ac.createGain(); tv.gain.value = .25; AU.tabla.connect(tv); tv.connect(AU.verb);
  AU.next = ac.currentTime + .2; AU.pi = 0; AU.tnext = ac.currentTime + .4; AU.ti = 0; setInterval(tanpura, 200);
}
function impulse(ac, sec, decay) { const len = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); } return b; }
const SA = 138.59, PATTERN = [SA * 1.5, SA * 2, SA * 2, SA];
function tanpura() {
  const ac = AU.ctx; if (!ac) return;
  if (AU.tnext < ac.currentTime - .5) AU.tnext = ac.currentTime + .1;
  while (AU.tnext < ac.currentTime + 1) {
    const cyc = Math.floor(AU.ti / 8), pat = cyc % 4 === 3 ? KEHERWA_FILL : KEHERWA, step = AU.ti % 8, beat = 60 / TABLA_BPM;
    if (AU.on.tabla) { const acc = step === 0 ? 1.15 : step === 4 ? .75 : .9; for (const [bol, off] of pat[step]) playBol(bol, AU.tnext + off * beat, acc); }
    AU.ti++; AU.tnext += beat;
  }
}
/* ── synthesized tabla: dayan (tuned to Sa) + bayan (bass with a pitch glide) ── */
const TABLA_BPM = 92, TABLA_VOL = .3, DAYAN = SA * 4;
// Keherwa theka (8 matras): Dha Ge Na Ti | Na Ka Dhi Na — each entry is a list of [bol, offset in beats]
const KEHERWA = [[['Dha', 0]], [['Ge', 0]], [['Na', 0]], [['Ti', 0]], [['Na', 0]], [['Ka', 0]], [['Dhi', 0]], [['Na', 0]]];
const KEHERWA_FILL = [[['Dha', 0]], [['Ti', 0], ['Ra', .5]], [['Ki', 0], ['Ta', .5]], [['Dha', 0]], [['Ti', 0], ['Ra', .5]], [['Ki', 0], ['Ta', .5]], [['Dha', 0], ['Ge', .5]], [['Na', 0], ['Dha', .5]]];
/* ── synthesized tabla (modal): a short strike excites tuned resonators, like a real drum head ── */
function tStrike(T, when, dur, lp, v) { // noise burst excitation
  const ac = T.ac, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = T.noise; f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = .7;
  g.gain.setValueAtTime(v, when); g.gain.exponentialRampToValueAtTime(.0001, when + dur);
  s.connect(f); f.connect(g); s.start(when, Math.random() * .5); s.stop(when + dur + .01); return g;
}
function tModes(T, exc, when, f0, modes, glide) { // modes: [ratio, Q, gain]
  const ac = T.ac;
  for (const [r, q, a] of modes) {
    const bp = ac.createBiquadFilter(), g = ac.createGain(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0 * r * (1 + glide), when); bp.frequency.exponentialRampToValueAtTime(f0 * r, when + .06);
    g.gain.value = a; exc.connect(bp); bp.connect(g); g.connect(T.out);
  }
}
function tDayan(T, when, v, kind) {
  const f0 = T.sa;
  if (kind === 'na') { // open edge stroke: pitched but short, skin and wood rather than ring
    v *= .55;
    tModes(T, tStrike(T, when, .008, 1800, v), when, f0, [[1, 150, 170], [2, 80, 30], [3, 45, 8]], .045);
    const skin = tStrike(T, when, .04, 1800, v * 1.1), bp = T.ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = .8; skin.connect(bp); bp.connect(T.out);
    tModes(T, tStrike(T, when, .012, 700, v), when, 1, [[240, 5, 10]], 0);
  } else if (kind === 'tin') { // softer, rounder
    v *= .7;
    tModes(T, tStrike(T, when, .008, 1500, v), when, f0, [[1, 120, 190], [2, 50, 14]], .035); tModes(T, tStrike(T, when, .012, 700, v), when, 1, [[230, 5, 7]], 0);
  } else if (kind === 'te') { // closed centre stroke: dry, damped
    tModes(T, tStrike(T, when, .018, 3000, v), when, f0, [[1, 14, 10], [1.6, 10, 7], [2.4, 8, 4]], 0);
  } else if (kind === 'ra') {
    tModes(T, tStrike(T, when, .012, 6000, v * .8), when, f0, [[1.1, 10, 9], [2.2, 8, 6]], 0);
  }
}
function tBayan(T, when, v, open) {
  const ac = T.ac;
  if (open) { // resonant 'ge' with the palm pushing the pitch up
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'sine'; o2.type = 'sine';
    o.frequency.setValueAtTime(72, when); o.frequency.exponentialRampToValueAtTime(112, when + .16); o.frequency.setTargetAtTime(104, when + .16, .25);
    o2.frequency.setValueAtTime(144, when); o2.frequency.exponentialRampToValueAtTime(224, when + .16); o2.frequency.setTargetAtTime(208, when + .16, .25);
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(v * .75, when + .008); g.gain.exponentialRampToValueAtTime(v * .28, when + .25); g.gain.exponentialRampToValueAtTime(.0001, when + .95);
    g2.gain.value = .1; lp.type = 'lowpass'; lp.frequency.value = 600;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(T.out); o.start(when); o2.start(when); o.stop(when + 1); o2.stop(when + 1);
    const th = tStrike(T, when, .03, 380, v * 1.4); th.connect(T.out);
  } else { // closed 'ka': flat slap
    const th = tStrike(T, when, .05, 700, v * 4); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 1.2; th.connect(bp); bp.connect(T.out);
  }
}
function tBol(T, bol, when, v) {
  switch (bol) {
    case 'Dha': tDayan(T, when, v, 'na'); tBayan(T, when, v, true); break;
    case 'Dhi': tDayan(T, when, v * .9, 'tin'); tBayan(T, when, v * .9, true); break;
    case 'Ge': tBayan(T, when, v, true); break;
    case 'Na': tDayan(T, when, v, 'na'); break;
    case 'Tin': tDayan(T, when, v, 'tin'); break;
    case 'Ti': case 'Ta': tDayan(T, when, v, 'te'); break;
    case 'Ra': tDayan(T, when, v * .8, 'ra'); break;
    case 'Ki': case 'Ka': tBayan(T, when, v, false); break;
  }
}
function playBol(bol, when, acc) {
  if (!AU.T) AU.T = { ac: AU.ctx, out: AU.tabla, noise: AU.noise, sa: DAYAN };
  tBol(AU.T, bol, when + (Math.random() - .5) * .012, acc * (.9 + Math.random() * .18));
}
function pluck(freq, when) {
  const ac = AU.ctx, g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 7; f.frequency.setValueAtTime(2600, when); f.frequency.exponentialRampToValueAtTime(420, when + 3.2);
  g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(.2, when + .02); g.gain.exponentialRampToValueAtTime(.001, when + 4.6);
  for (const dt of [-5, 0, 6]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = dt; o.connect(f); o.start(when); o.stop(when + 4.7); }
  f.connect(g); g.connect(AU.music);
}
function tone(freq, when, dur, vol, type = 'sine') {
  const ac = AU.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + .005);
  g.gain.exponentialRampToValueAtTime(.0001, when + dur); o.connect(g); g.connect(AU.sfx); o.start(when); o.stop(when + dur + .05); return o;
}
const SFX = {
  bell(f = 440, v = .5, d = 4) { const t = AU.ctx.currentTime;[[1, 1], [2, .45], [2.76, .5], [4.07, .22], [5.4, .18], [6.8, .1]].forEach(([k, a], i) => tone(f * k, t, d / (1 + i * .6), v * a * .5)); },
  chime() { SFX.bell(1046, .3, 2.2); },
  shimmer() { const t = AU.ctx.currentTime;[1, 1.25, 1.5, 2, 2.5, 3].forEach((k, i) => tone(880 * k, t + i * .06, 1.4, .07)); },
  tick() { const t = AU.ctx.currentTime; const o = tone(1500, t, .06, .1, 'triangle'); o.frequency.exponentialRampToValueAtTime(700, t + .05); },
  wood() { const t = AU.ctx.currentTime; tone(620, t, .14, .3); tone(1240, t, .05, .1, 'triangle'); },
  whoosh() {
    const ac = AU.ctx, t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = AU.noise; f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(250, t); f.frequency.exponentialRampToValueAtTime(2400, t + .45); f.frequency.exponentialRampToValueAtTime(380, t + .9);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3, t + .35); g.gain.linearRampToValueAtTime(0, t + .95);
    s.connect(f); f.connect(g); g.connect(AU.sfx); s.start(t); s.stop(t + 1);
  },
  chord() { const t = AU.ctx.currentTime;[277.18, 349.23, 415.3, 554.37].forEach((f, i) => tone(f, t + i * .04, 2.2, .09, 'triangle')); },
  big() { SFX.bell(277.18, .9, 6); setTimeout(() => SFX.shimmer(), 120); },
  run() { const t = AU.ctx.currentTime;[554, 622, 698, 831, 932, 1109].forEach((f, i) => tone(f, t + i * .09, 1.6, .11)); },
  pop() { const t = AU.ctx.currentTime; const o = tone(500, t, .12, .18); o.frequency.exponentialRampToValueAtTime(1000, t + .1); },
  gong() { const t = AU.ctx.currentTime; const o = tone(98, t, 5, .5); o.frequency.exponentialRampToValueAtTime(92, t + 5); tone(196.5, t, 3, .15); tone(293, t, 2, .08); }
};
function sfx(name) { if (!AU.ctx || !AU.on.sfx) return; try { SFX[name](); } catch (e) { } }

/* ================= Narration: hybrid voices ================= */
// Cue text marks Sanskrit words as {Latin|देवनागरी}. English runs use an Indian-English voice;
// the Devanagari is handed to a Hindi voice so the word is pronounced natively.
const TTS = { ok: 'speechSynthesis' in window, speaking: false, token: 0, timer: 0, en: null, hi: null, enSel: 'auto', hiSel: 'auto', hindiTerms: true };
const TERM_RE = /\{([^|}]+)\|([^}]+)\}/g;
const PHON = { Amavasya: 'Amaa-vaas-yaa', Purnima: 'Poor-nima', Panchang: 'Paan-chaang', tithi: 'tithee', Tithi: 'Tithee', Karana: 'Karan', karana: 'karan', Vara: 'Vaar', Nakshatra: 'Nuk-shutra', nakshatras: 'nuk-shutras', Yoga: 'Yog', Surya: 'Soorya', Rahu: 'Raahu', Ketu: 'Kay-tu', Graha: 'Gruh', Grahas: 'Gruhs', grahas: 'gruhs', Vishti: 'Vishti', Masa: 'Maas', Amanta: 'Aamaant', Purnimanta: 'Poornimaant', Sankranti: 'Sunkraanti', Paksha: 'Puksh', Shukla: 'Shookla', Krishna: 'Krishna' };
const plain = s => s.replace(TERM_RE, '$1');
function allVoices() { return TTS.ok ? speechSynthesis.getVoices() : []; }
function scoreEn(v) { if (!/^en/i.test(v.lang)) return -1; let s = /en[-_]IN/i.test(v.lang) ? 50 : /en[-_]GB/i.test(v.lang) ? 12 : 8; if (/natural|neural|online|premium|enhanced/i.test(v.name)) s += 40; if (/google/i.test(v.name)) s += 12; if (/neerja|prabhat|heera|rishi|veena|isha|sangeeta|aditi|raveena/i.test(v.name)) s += 10; return s; }
function scoreHi(v) { if (!/^hi/i.test(v.lang)) return -1; let s = 50; if (/natural|neural|online|premium|enhanced/i.test(v.name)) s += 40; if (/google/i.test(v.name)) s += 12; if (/swara|madhur|lekha|kalpana/i.test(v.name)) s += 8; return s; }
function best(list, score) { let b = null, bs = -1; for (const v of list) { const s = score(v); if (s > bs) { bs = s; b = v; } } return bs >= 0 ? b : null; }
function pickVoices() {
  const vs = allVoices();
  TTS.en = TTS.enSel !== 'auto' ? vs.find(v => v.voiceURI === TTS.enSel) || best(vs, scoreEn) : best(vs, scoreEn);
  TTS.hi = TTS.hiSel === 'same' ? null : TTS.hiSel !== 'auto' ? vs.find(v => v.voiceURI === TTS.hiSel) || best(vs, scoreHi) : best(vs, scoreHi);
  if (typeof fillVoiceMenus === 'function') fillVoiceMenus();
}
if (TTS.ok) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
function utter(text, voice, rate, pitch) {
  const u = new SpeechSynthesisUtterance(text);
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-IN';
  u.rate = rate; u.pitch = pitch; return u;
}
function buildUtterances(text) {
  const useHi = TTS.hi && TTS.hindiTerms;
  if (!useHi) { let s = text.replace(TERM_RE, (m, lat) => PHON[lat] || lat); return [utter(s, TTS.en, .95, 1.05)]; }
  const out = []; let last = 0, m, en = '';
  const flushEn = () => { if (/[A-Za-z0-9]/.test(en)) out.push(utter(en.trim(), TTS.en, .95, 1.05)); en = ''; };
  TERM_RE.lastIndex = 0;
  while ((m = TERM_RE.exec(text))) { en += text.slice(last, m.index); flushEn(); out.push(utter(m[2], TTS.hi, .88, 1.05)); last = TERM_RE.lastIndex; }
  en += text.slice(last); flushEn(); return out;
}
/* recorded narration (embedded MP3s), keyed by a hash of each line; browser voices are the fallback */
const VOICE_DATA = {/*VOICE*/};
TTS.recorded = Object.keys(VOICE_DATA).length > 0; TTS.useRec = TTS.recorded;
function vhash(s) { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(16).padStart(8, '0'); }
let recAudio = null;
function playRec(key, onDone) {
  const src = VOICE_DATA[key]; if (!src || !TTS.useRec) return false;
  try { if (recAudio) { recAudio.onended = null; recAudio.pause(); } } catch (e) { }
  const a = recAudio = new Audio('data:audio/mpeg;base64,' + src); a.onended = onDone; a.onerror = onDone;
  const pr = a.play(); if (pr && pr.catch) pr.catch(() => onDone && onDone()); return true;
}
function speak(text) {
  if (!AU.on.voice) { TTS.speaking = false; return; }
  if (TTS.useRec && VOICE_DATA['c' + vhash(text)]) {
    try { speechSynthesis.cancel(); } catch (e) { }
    const tok = ++TTS.token; TTS.speaking = true; duck(true);
    const done = () => { if (TTS.token === tok) { TTS.speaking = false; duck(false); } };
    clearTimeout(TTS.timer); TTS.timer = setTimeout(done, 30000);
    playRec('c' + vhash(text), done); return;
  }
  if (!TTS.ok) { TTS.speaking = false; return; }
  try { speechSynthesis.cancel(); } catch (e) { }
  const us = buildUtterances(text); if (!us.length) return;
  const tok = ++TTS.token; TTS.speaking = true; duck(true);
  const done = () => { if (TTS.token === tok) { TTS.speaking = false; duck(false); } };
  us[us.length - 1].onend = done; us.forEach(u => u.onerror = done);
  clearTimeout(TTS.timer); TTS.timer = setTimeout(done, plain(text).split(/\s+/).length / 2.1 * 1000 * 1.8 + 4000);
  us.forEach(u => speechSynthesis.speak(u));
}
function speakWord(lat, dev) {
  if (TTS.useRec && ((dev && playRec('d' + vhash(dev), null)) || playRec('w' + vhash(lat), null))) { TTS.token++; TTS.speaking = false; return; }
  if (!TTS.ok) return; try { speechSynthesis.cancel(); } catch (e) { }
  TTS.token++; TTS.speaking = false;
  if (TTS.hi && dev) speechSynthesis.speak(utter(dev, TTS.hi, .8, 1.05)); else speechSynthesis.speak(utter(PHON[lat] || lat, TTS.en, .85, 1.05));
}
function stopSpeech() { try { if (recAudio) { recAudio.onended = null; recAudio.pause(); } } catch (e) { } if (TTS.ok) try { speechSynthesis.cancel(); } catch (e) { } TTS.token++; TTS.speaking = false; duck(false); }
function duck(on) { if (!AU.ctx) return; if (AU.on.music) AU.music.gain.setTargetAtTime(on ? .09 : .18, AU.ctx.currentTime, .25); if (AU.on.tabla && AU.tabla) AU.tabla.gain.setTargetAtTime(on ? TABLA_VOL * .5 : TABLA_VOL, AU.ctx.currentTime, .25); }
