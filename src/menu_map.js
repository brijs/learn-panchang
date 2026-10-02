/* ================= Sections map: a game-style world map of all chapters ================= */
const MAP = (() => {
  const cv2 = $('mapcv'), g = cv2.getContext('2d');
  // world positions on the ground plane (x right, z toward viewer)
  const POS = {
    'Welcome': [-950, 560], 'Two clocks in the sky': [-760, 470], 'Five limbs of time': [-560, 560],
    'Tithi, the lunar day': [-360, 480], 'Vara, the weekday': [-170, 570], 'Why only seven? The Navagrahas': [-330, 300], 'Nakshatra, the star mansions': [-120, 370], 'Yoga, the union': [80, 460], 'Karana, half a tithi': [100, 250],
    'Months and rashis': [330, 390], 'Adhika Masa, the leap month': [520, 290], 'Eras and festivals': [700, 430], 'Your Panchang': [900, 320],
    'Why exactly five?': [-880, -120], 'Rashi, Nakshatra, Pada': [-660, -220],
    'The sky as a sphere': [-440, -230], 'Your sky, tonight': [-170, -290], 'Measuring angles in the sky': [-470, -480], 'Precession and ayanamsa': [-170, -560],
    'Rahu, Ketu and eclipses': [140, -280], 'Phases in motion': [340, -390], 'Sidereal vs synodic month': [540, -280], 'The Panchang clock': [760, -400]
  };
  const GCOL = ['#8FBF6A', '#E8B84A', '#F28C28', '#9AD6DC', '#7C8CFF', '#B69CFF'];
  const TRAILS = [['Five limbs of time', 'Why exactly five?'], ['Nakshatra, the star mansions', 'The sky as a sphere'], ['Your Panchang', 'Rahu, Ketu and eclipses']];
  const cam = { x: 0, z: 20, D: 2000, pitch: 56 * DEG, tx: 0, tz: 20, tD: 2000 };
  let LM = null, W2 = 800, H2 = 450, dpr = 1, hover = -1, drag = null, openT = 0, raf = 0, nodes = [];
  function size() { const r = cv2.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W2 = Math.max(200, r.width); H2 = Math.max(200, r.height); cv2.width = W2 * dpr; cv2.height = H2 * dpr; }
  const f = () => Math.min(W2, H2 * 1.6) * 1.05;
  function P3(x, z, y = 0) { const dx = x - cam.x, dz = z - cam.z, depth = cam.D - dz * Math.cos(cam.pitch) + y * Math.sin(cam.pitch) * .0; const s = f() / depth; return { x: W2 / 2 + dx * s, y: H2 * .52 + (dz * Math.sin(cam.pitch) - y) * s, s, depth }; }
  function blob(pts, col, a) { if (pts.length < 2) return; g.save(); g.globalAlpha = a; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fillStyle = col; g.fill(); g.restore(); }
  function ellipse(cx, cz, rx, rz, col, a, stroke) {
    const pts = []; for (let k = 0; k < 48; k++) { const t = k / 48 * TAU, w = 1 + .08 * Math.sin(t * 3 + cx) + .05 * Math.cos(t * 5 + cz); pts.push(P3(cx + Math.cos(t) * rx * w, cz + Math.sin(t) * rz * w)); }
    blob(pts, col, a); if (stroke) { g.save(); g.globalAlpha = a * 2.2; g.strokeStyle = stroke; g.lineWidth = 2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.stroke(); g.restore(); }
  }
  function road(a, b, col, w, dash, flow) {
    const pa = POS[a], pb = POS[b]; if (!pa || !pb) return; const pts = [];
    const mx = (pa[0] + pb[0]) / 2 + (pb[1] - pa[1]) * .18, mz = (pa[1] + pb[1]) / 2 - (pb[0] - pa[0]) * .18;
    for (let k = 0; k <= 20; k++) { const t = k / 20, x = (1 - t) * (1 - t) * pa[0] + 2 * t * (1 - t) * mx + t * t * pb[0], z = (1 - t) * (1 - t) * pa[1] + 2 * t * (1 - t) * mz + t * t * pb[1]; pts.push(P3(x, z)); }
    g.save(); g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = w * pts[10].s * 1.6;
    if (dash) { g.setLineDash([10 * pts[10].s * 1.6, 12 * pts[10].s * 1.6]); if (flow) g.lineDashOffset = -gt * 30; }
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke(); g.restore();
  }
  function mountain(x, z, h, col) { const b1 = P3(x - h * .8, z), b2 = P3(x + h * .8, z), top = P3(x, z, h); g.beginPath(); g.moveTo(b1.x, b1.y); g.lineTo(top.x, top.y); g.lineTo(b2.x, b2.y); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(160,170,230,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(b1.x, b1.y); g.lineTo(top.x, top.y); g.stroke(); }
    const STARS = (() => { const r = rng(9); return Array.from({ length: 260 }, () => [r(), r(), r() * 1.3 + .3, r() * TAU]); })();
  function draw() {
    // ease camera
    const k = .12; cam.x += (cam.tx - cam.x) * k; cam.z += (cam.tz - cam.z) * k; cam.D += (cam.tD - cam.D) * k;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sk = g.createLinearGradient(0, 0, 0, H2); sk.addColorStop(0, '#070A1C'); sk.addColorStop(.45, '#1B1F4B'); sk.addColorStop(1, '#0B1026'); g.fillStyle = sk; g.fillRect(0, 0, W2, H2);
    STARS.forEach(([x, y, r, ph]) => { g.globalAlpha = .4 + .5 * (.5 + .5 * Math.sin(gt * 1.5 + ph)); g.fillStyle = '#F6EFD9'; g.beginPath(); g.arc(x * W2, y * H2, r, 0, TAU); g.fill(); }); g.globalAlpha = 1;
    // deep space: nebulae and distant planets, drifting slightly with the camera
    const ox = -cam.x * .04, oz = -cam.z * .03;
    [[.18, .35, .32, 'rgba(120,80,200,.10)'], [.78, .22, .28, 'rgba(232,106,146,.07)'], [.55, .75, .38, 'rgba(70,120,220,.08)'], [.3, .85, .25, 'rgba(242,140,40,.05)']].forEach(([x, y, r, c]) => {
      const cx = x * W2 + ox, cy = y * H2 + oz, R = r * Math.max(W2, H2); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W2, H2); });
    const planet = (x, y, r, c1, c2, ring, bands) => {
      const cx = x * W2 + ox * 2, cy = y * H2 + oz * 2; g.save(); g.globalAlpha = .55;
      if (ring) { g.strokeStyle = 'rgba(216,201,160,.5)'; g.lineWidth = r * .18; g.beginPath(); g.ellipse(cx, cy, r * 2, r * .55, -.35, Math.PI, TAU); g.stroke(); }
      const gr = g.createRadialGradient(cx - r * .4, cy - r * .4, r * .1, cx, cy, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      if (bands) { g.save(); g.clip(); g.globalAlpha = .18; for (let k = -3; k <= 3; k++) { g.fillStyle = k % 2 ? '#fff' : '#6b4a2a'; g.fillRect(cx - r, cy + k * r * .28 - r * .06, r * 2, r * .12); } g.restore(); }
      g.fillStyle = 'rgba(5,7,20,.55)'; g.beginPath(); g.arc(cx + r * .35, cy + r * .3, r * 1.02, 0, TAU); g.fill();
      if (ring) { g.strokeStyle = 'rgba(216,201,160,.55)'; g.lineWidth = r * .18; g.beginPath(); g.ellipse(cx, cy, r * 2, r * .55, -.35, 0, Math.PI); g.stroke(); }
      g.restore();
    };
    planet(.9, .12, Math.min(W2, H2) * .07, '#F3E3B5', '#9C7A45', true, false);
    planet(.06, .9, Math.min(W2, H2) * .16, '#E9C27A', '#6B4A2A', false, true);
    planet(.62, .07, Math.min(W2, H2) * .025, '#E2553F', '#6A2018', false, false);
    planet(.33, .1, Math.min(W2, H2) * .018, '#9AD6DC', '#2A5A6A', false, false);
    // regions
    GROUPS.forEach(([kind, title, names], gi) => {
      const ps = names.map(n => POS[n]).filter(Boolean); if (!ps.length) return;
      const xs = ps.map(p => p[0]), zs = ps.map(p => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      ellipse(cx, cz, (Math.max(...xs) - Math.min(...xs)) / 2 + 110, (Math.max(...zs) - Math.min(...zs)) / 2 + 95, GCOL[gi], .09, GCOL[gi]);
      GROUPS[gi].c = [cx, cz - (Math.max(...zs) - Math.min(...zs)) / 2 - 95];
    });
    // roads
    const main = GROUPS.filter(gp => gp[0] === 'Guided tour').flatMap(gp => gp[2]);
    for (let i = 0; i < main.length - 1; i++) road(main[i], main[i + 1], 'rgba(232,184,74,.75)', 7, false);
    TRAILS.forEach(([a, b]) => road(a, b, 'rgba(242,140,40,.7)', 5, true, true));
    GROUPS.filter(gp => gp[0] !== 'Guided tour').forEach(gp => { for (let i = 0; i < gp[2].length - 1; i++) road(gp[2][i], gp[2][i + 1], 'rgba(182,156,255,.7)', 4, true, true); });
    // region flags
    GROUPS.forEach(([kind, title], gi) => { if (!GROUPS[gi].c) return; const q = P3(GROUPS[gi].c[0], GROUPS[gi].c[1]); const fs = clamp(15 * q.s * 1.5, 11, 20);
      g.font = `600 ${fs * .72}px ${F.body}`; const w1 = g.measureText(kind.toUpperCase()).width; g.font = `400 ${fs * 1.25}px ${F.disp}`; const w2 = g.measureText(title).width; const w = Math.max(w1, w2) + 24;
      g.fillStyle = 'rgba(8,11,30,.82)'; g.strokeStyle = GCOL[gi]; g.lineWidth = 1.5; g.beginPath(); g.roundRect ? g.roundRect(q.x - w / 2, q.y - fs * 2.3, w, fs * 2.4, 8) : g.rect(q.x - w / 2, q.y - fs * 2.3, w, fs * 2.4); g.fill(); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = GCOL[gi]; g.font = `600 ${fs * .72}px ${F.body}`; g.fillText(kind.toUpperCase(), q.x, q.y - fs * 1.62); g.fillStyle = '#EFE8D8'; g.font = `400 ${fs * 1.25}px ${F.disp}`; g.fillText(title, q.x, q.y - fs * .66); });
    // nodes (far to near)
    nodes = [];
    SCENES.forEach((s, k) => { const p = POS[s.name]; if (p) nodes.push({ k, p, q: P3(p[0], p[1]) }); });
    nodes.sort((a, b) => b.q.depth - a.q.depth);
    nodes.forEach(nd => {
      const { k, q } = nd, s = SCENES[k], gi = GROUPS.findIndex(gp => gp[2].includes(s.name)), col = GCOL[gi] || C.gold, r = clamp(24 * q.s * 1.5, 13, 34), cur = k === P.i, hv = k === hover;
      const bob = Math.sin(gt * 2 + k) * 2 * q.s;
      g.save(); g.globalAlpha = .35; g.fillStyle = '#000'; g.beginPath(); g.ellipse(q.x, q.y + 3, r * 1.05, r * .38, 0, 0, TAU); g.fill(); g.restore();
      const cy = q.y - r * .9 + bob; nd.cx = q.x; nd.cy = cy; nd.r = r;
      if (cur || hv) { const gl = g.createRadialGradient(q.x, cy, 0, q.x, cy, r * 2.6); gl.addColorStop(0, cur ? 'rgba(242,140,40,.55)' : 'rgba(232,184,74,.4)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(q.x - r * 3, cy - r * 3, r * 6, r * 6); }
      g.beginPath(); g.arc(q.x, cy, r, 0, TAU); const rg = g.createRadialGradient(q.x - r * .3, cy - r * .3, 1, q.x, cy, r); rg.addColorStop(0, '#2a3170'); rg.addColorStop(1, '#10153a'); g.fillStyle = rg; g.fill();
      g.lineWidth = hv || cur ? 3.5 : 2.2; g.strokeStyle = cur ? C.saffron : col; g.stroke();
      g.fillStyle = s.optional ? C.saffron : C.gold; g.font = `700 ${r * .62}px ${F.body}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label(k), q.x, cy + 1);
      if (s.sky) { g.fillStyle = '#9FE6F5'; g.beginPath(); g.arc(q.x + r * .72, cy - r * .72, r * .2, 0, TAU); g.fill(); }
      // readable flat label (two short lines when long)
      const fs = clamp(13 * q.s * 1.6, 11, 16), lines = splitName(s.name); g.font = `600 ${fs}px ${F.body}`;
      const tw = Math.max(...lines.map(l => g.measureText(l).width)) + 12, th = lines.length * (fs + 3) + 6; nd.lab = [q.x - tw / 2, q.y + 6, tw, th];
      g.fillStyle = hv ? 'rgba(232,184,74,.95)' : 'rgba(8,11,30,.8)'; g.beginPath(); g.roundRect ? g.roundRect(q.x - tw / 2, q.y + 6, tw, th, 6) : g.rect(q.x - tw / 2, q.y + 6, tw, th); g.fill();
      g.fillStyle = hv ? '#0B1026' : '#EFE8D8'; lines.forEach((l, i) => g.fillText(l, q.x, q.y + 9 + (fs + 3) * (i + .5)));
      if (cur) { const mr = r * .55, my = cy - r - mr * 1.4 + Math.abs(Math.sin(gt * 3)) * -4; const keep = ctx; ctx = g; moonDisc(q.x, my, mr, 180); face(q.x, my, mr * .95, { seed: 21 }); ctx = keep; }
    });
    // landmark: the Panchang finder
    { const q = P3(-860, 250), r = clamp(30 * q.s * 1.5, 18, 40), cy = q.y - r + Math.sin(gt * 2) * 2; LM = { cx: q.x, cy, r };
      const gl = g.createRadialGradient(q.x, cy, 0, q.x, cy, r * 3); gl.addColorStop(0, 'rgba(232,184,74,.45)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(q.x - r * 3, cy - r * 3, r * 6, r * 6);
      g.beginPath(); g.arc(q.x, cy, r, 0, TAU); g.fillStyle = hover === -2 ? C.goldSoft : C.gold; g.fill();
      g.fillStyle = '#0B1026'; g.fillRect(q.x - r * .45, cy - r * .35, r * .9, r * .75); g.fillStyle = C.gold; g.fillRect(q.x - r * .35, cy - r * .12, r * .7, r * .45); g.fillStyle = '#0B1026'; g.fillRect(q.x - r * .3, cy - r * .5, r * .12, r * .25); g.fillRect(q.x + r * .18, cy - r * .5, r * .12, r * .25);
      const fs = clamp(14 * q.s * 1.6, 12, 17); g.font = `700 ${fs}px ${F.body}`; const tw = g.measureText('Today’s Panchang · any date').width + 16; g.fillStyle = hover === -2 ? C.gold : 'rgba(232,184,74,.9)'; g.beginPath(); g.roundRect ? g.roundRect(q.x - tw / 2, q.y + 6, tw, fs + 12, 8) : g.rect(q.x - tw / 2, q.y + 6, tw, fs + 12); g.fill(); g.fillStyle = '#0B1026'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Today’s Panchang · any date', q.x, q.y + 12 + fs / 2); LM.lab = [q.x - tw / 2, q.y + 6, tw, fs + 12]; }
    // hover card
    if (hover >= 0) {
      const nd = nodes.find(n => n.k === hover); if (nd) {
        const s = SCENES[hover], txt1 = BLURB[s.name] || '', w = 280, x = clamp(nd.cx + nd.r + 14, 8, W2 - w - 8), y = clamp(nd.cy - 40, 8, H2 - 90);
        g.fillStyle = 'rgba(16,21,54,.96)'; g.strokeStyle = 'rgba(232,184,74,.6)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, 78, 10) : g.rect(x, y, w, 78); g.fill(); g.stroke();
        g.textAlign = 'left'; g.fillStyle = C.gold; g.font = `600 12px ${F.body}`; g.fillText(`${s.optional ? 'DEEP DIVE ' : 'CHAPTER '}${label(hover)}${s.sky ? ' · INTERACTIVE' : ''}`, x + 12, y + 18);
        g.fillStyle = '#EFE8D8'; g.font = `400 18px ${F.disp}`; g.fillText(s.name, x + 12, y + 42); g.fillStyle = C.muted; g.font = `400 13px ${F.body}`; g.fillText(txt1 + ' · click to open', x + 12, y + 64);
      }
    }
    g.textAlign = 'left'; g.fillStyle = 'rgba(163,168,207,.8)'; g.font = `400 12px ${F.body}`; g.fillText('Drag to pan · scroll to zoom · click a stop to open it', 12, H2 - 12);
    raf = requestAnimationFrame(draw);
  }
  function splitName(n) {
    if (n.length <= 16) return [n];
    let i = n.indexOf(', '); if (i > 0) return [n.slice(0, i + 1), n.slice(i + 2)];
    i = n.indexOf('? '); if (i > 0) return [n.slice(0, i + 1), n.slice(i + 2)];
    const mid = n.length / 2; let best = -1; for (let k = 0; k < n.length; k++) if (n[k] === ' ' && (best < 0 || Math.abs(k - mid) < Math.abs(best - mid))) best = k;
    return best > 0 ? [n.slice(0, best), n.slice(best + 1)] : [n];
  }
  const at = e => { const r = cv2.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function pick(p) { if (LM && (Math.hypot(p.x - LM.cx, p.y - LM.cy) < LM.r + 6 || (LM.lab && p.x > LM.lab[0] && p.x < LM.lab[0] + LM.lab[2] && p.y > LM.lab[1] && p.y < LM.lab[1] + LM.lab[3]))) return -2; for (let i = nodes.length - 1; i >= 0; i--) { const n = nodes[i]; if (n.cx != null && Math.hypot(p.x - n.cx, p.y - n.cy) < n.r + 6) return n.k; if (n.lab && p.x > n.lab[0] && p.x < n.lab[0] + n.lab[2] && p.y > n.lab[1] && p.y < n.lab[1] + n.lab[3]) return n.k; } return -1; }
  cv2.addEventListener('pointerdown', e => { const p = at(e); drag = { ...p, x0: cam.tx, z0: cam.tz, moved: false }; try { cv2.setPointerCapture(e.pointerId); } catch (er) { } });
  cv2.addEventListener('pointermove', e => {
    const p = at(e);
    if (drag) { const dx = p.x - drag.x, dy = p.y - drag.y; if (Math.hypot(dx, dy) > 5) drag.moved = true; const sc = cam.D / f(); cam.tx = clamp(drag.x0 - dx * sc, -1000, 1000); cam.tz = clamp(drag.z0 - dy * sc / Math.sin(cam.pitch), -700, 700); }
    hover = drag && drag.moved ? -1 : pick(p); cv2.style.cursor = drag && drag.moved ? 'grabbing' : hover !== -1 ? 'pointer' : 'grab';
  });
  cv2.addEventListener('pointerup', e => { const p = at(e); if (drag && !drag.moved) { const k = pick(p); if (k === -2) { sfx('chime'); goFinder(); } else if (k >= 0) { sfx('chime'); goScene(k); } } drag = null; });
  cv2.addEventListener('pointerleave', () => { hover = -1; });
  cv2.addEventListener('wheel', e => { e.preventDefault(); cam.tD = clamp(cam.tD * (1 + e.deltaY * .001), 700, 3000); }, { passive: false });
  function focusCurrent() { const p = POS[SCENES[P.i].name]; cam.tx = p ? clamp(p[0] * .25, -300, 300) : 0; cam.tz = p ? clamp(p[1] * .25, -150, 150) : 20; }
  return {
    open() { size(); focusCurrent(); cam.D = 3000; cam.tD = 2000; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); },
    close() { cancelAnimationFrame(raf); raf = 0; },
    pan(dx, dz) { cam.tx = clamp(cam.tx + dx, -1000, 1000); cam.tz = clamp(cam.tz + dz, -700, 700); },
    zoom(k) { cam.tD = clamp(cam.tD * k, 700, 3000); },
    resize() { if (raf) size(); }
  };
})();
function menuView(v) {
  try { localStorage.setItem('panchangMenuView', v); } catch (e) { }
  $('mapWrap').hidden = v !== 'map'; $('menuGrid').hidden = v === 'map';
  $('mvMap').setAttribute('aria-pressed', v === 'map'); $('mvList').setAttribute('aria-pressed', v !== 'map');
  if (v === 'map' && !$('menu').hidden) MAP.open(); else MAP.close();
}
$('mvMap').onclick = () => menuView('map'); $('mvList').onclick = () => menuView('list');
{ const _open = openMenu; openMenu = function (on) { _open(on); let v = matchMedia('(max-width:700px)').matches ? 'list' : 'map'; try { v = localStorage.getItem('panchangMenuView') || (matchMedia('(max-width:700px)').matches ? 'list' : 'map'); } catch (e) { } if (on) menuView(v); else MAP.close(); }; }
addEventListener('resize', () => MAP.resize());
addEventListener('keydown', e => {
  if ($('menu').hidden || $('mapWrap').hidden || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const k = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[e.key];
  if (k) { e.preventDefault(); MAP.pan(k[0], k[1]); } else if (e.key === '+' || e.key === '=') MAP.zoom(.85); else if (e.key === '-') MAP.zoom(1.18);
});
