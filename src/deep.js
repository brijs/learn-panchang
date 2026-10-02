/* ================= Optional deep dives ================= */
const EPS = 23.4393;
function eclToEq(l, b) { const L = l * DEG, B = b * DEG, e = EPS * DEG, x = Math.cos(B) * Math.cos(L), y = Math.cos(B) * Math.sin(L), z = Math.sin(B); const yq = y * Math.cos(e) - z * Math.sin(e), zq = y * Math.sin(e) + z * Math.cos(e); return { ra: norm(Math.atan2(yq, x) / DEG), dec: Math.asin(zq) / DEG }; }
function eqToEcl(ra, dec) { const A = ra * DEG, D = dec * DEG, e = EPS * DEG, x = Math.cos(D) * Math.cos(A), y = Math.cos(D) * Math.sin(A), z = Math.sin(D); const ye = y * Math.cos(e) + z * Math.sin(e), ze = -y * Math.sin(e) + z * Math.cos(e); return { l: norm(Math.atan2(ye, x) / DEG), b: Math.asin(ze) / DEG }; }
const eclVec = (l, b, R) => V3(R * Math.cos(b * DEG) * Math.cos(l * DEG), R * Math.sin(b * DEG), -R * Math.cos(b * DEG) * Math.sin(l * DEG));
const horVec = (alt, az, R) => V3(R * Math.cos(alt * DEG) * Math.sin(az * DEG), R * Math.sin(alt * DEG), -R * Math.cos(alt * DEG) * Math.cos(az * DEG));
const gmstDeg = jd => norm(280.46061837 + 360.98564736629 * (jd - 2451545));
function horiz(ra, dec, lst, lat) {
  const H = (lst - ra) * DEG, d = dec * DEG, p = lat * DEG;
  const e = -Math.cos(d) * Math.sin(H), n = Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.cos(H) * Math.sin(p), u = Math.sin(d) * Math.sin(p) + Math.cos(d) * Math.cos(H) * Math.cos(p);
  return { alt: Math.asin(clamp(u, -1, 1)) / DEG, az: norm(Math.atan2(e, n) / DEG) };
}
function angSep(l1, b1, l2, b2) { const a = eclVec(l1, b1, 1), c = eclVec(l2, b2, 1); return Math.acos(clamp(a.x * c.x + a.y * c.y + a.z * c.z, -1, 1)) / DEG; }
const BRIGHT_E = BRIGHT.map(s => { const e = eqToEcl(s[1], s[2]); return { name: s[0], ind: s[4], mag: s[3], l: e.l, b: e.b, ra: s[1], dec: s[2] }; });
const jdNow = () => Date.now() / 864e5 + 2440587.5;
const ayanY = y => 23.857 + 0.013966 * (y - 2000);
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const dirName = az => COMPASS[Math.round(norm(az) / 45) % 8];
const fmtDeg = d => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`;
function sidInfo(sid) {
  const n = Math.floor(sid / (360 / 27)), pd = Math.floor(sid / (360 / 108)), r = Math.floor(sid / 30);
  return { n, pd, pada: pd % 4 + 1, r, syl: PADA_SYL[pd] };
}
// generic drag helpers
function dragStart(S, p, a, b) { S.drag = { x: p.x, y: p.y, a0: S[a], b0: S[b], a, b, moved: false }; }
function dragMove(S, p, ka, kb, bmin, bmax) {
  const d = S.drag; if (!d) return false;
  const dx = p.x - d.x, dy = p.y - d.y; if (Math.hypot(dx, dy) > 6) d.moved = true;
  S[d.a] = d.a0 + dx * ka; S[d.b] = clamp(d.b0 + dy * kb, bmin, bmax); return true;
}
function circleLine(pts, color, op, parent) { if (!HAS3) return dummy(); return add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: op })), parent); }
function starSprites(R, fn) { return BRIGHT_E.map(s => { const g = glowSprite(s.name === 'Polaris' ? '#CFE3FF' : '#FFF4DC', clamp(1.3 - s.mag * .3, .35, 1.6) * R / 5 * .5, .95); g.position.copy(fn ? fn(s) : eclVec(s.l, s.b, R)); return g; }); }

/* D1 ─ Why exactly five? */
const FIVE = [
  ['Vara', 'वार', 'Agni', 'अग्नि', 'fire', '#F28C28', 'the solar day, sunrise to sunrise', 'physical vitality, health and the ruling graha', 'Without Vara you don’t know the day’s base energy or which graha rules it.'],
  ['Tithi', 'तिथि', 'Jala', 'जल', 'water', '#6F9BFF', 'the Sun–Moon angle, the lunar phase', 'emotions, relationships and prosperity', 'Without Tithi you miss the emotional tide, the tone between people.'],
  ['Nakshatra', 'नक्षत्र', 'Vayu', 'वायु', 'air', '#9AD6DC', 'the Moon’s place among 27 star groups', 'mindset, mood and karmic leaning', 'Without Nakshatra you can’t read the mood of the mind in that moment.'],
  ['Yoga', 'योग', 'Akasha', 'आकाश', 'space', '#B69CFF', 'Sun’s + Moon’s longitudes', 'harmony, health and the bond of the day', 'Without Yoga you can’t tell whether the day is cohesive or fractured.'],
  ['Karana', 'करण', 'Prithvi', 'पृथ्वी', 'earth', '#8FBF6A', 'half-tithis, 6° steps', 'execution, work and results', 'Without Karana you can’t tell whether practical work will bear fruit or stall.']
];
scene({
  name: 'Why exactly five?', dur: 56, optional: true, free: true, terms: ['Panchang', 'Pancha Mahabhuta', 'Agni', 'Jala', 'Vayu', 'Akasha', 'Prithvi'],
  cues: [[.8, "This deep dive explores how tradition explains the number five."],
  [5, "A Western calendar tracks the date. In the traditional view, the {Panchang|पञ्चाङ्ग} tracks the quality of time, whether a moment supports or resists what you do."],
  [14, "Each limb is linked with one of the five great elements, the {Pancha Mahabhutas|पञ्च महाभूत}."],
  [19.5, "{Vara|वार} is fire, {Agni|अग्नि}: the physical vitality of the day. {Tithi|तिथि} is water, {Jala|जल}: emotions and relationships."],
  [28, "{Nakshatra|नक्षत्र} is air, {Vayu|वायु}: the mood of the mind. {Yoga|योग} is space, {Akasha|आकाश}: the bond that holds the day together. And {Karana|करण} is earth, {Prithvi|पृथ्वी}: action and results."],
  [40.5, "Think of them as five coordinates, a GPS for time. Leave one out, and tradition says the moment has a blind spot."],
  [47.5, "The astronomy behind each limb is exact. The meanings are the tradition's interpretation. Tap a limb to switch it off."]],
  sfx: [[.1, 'whoosh'], [14, 'chord'], [19.5, 'bell'], [24, 'bell'], [28, 'bell'], [32, 'bell'], [35.5, 'bell'], [40.5, 'shimmer']],
  setup(S) {
    S.off = new Set(); S.sel = null; heroLight(); AMB.intensity = .5;
    S.orbs = FIVE.map((f, i) => { const o = planet3(.26, f[5], { glow: .35 }); o.position.copy(posXZ(2.5, 90 + i * 72, .2)); return o; });
    S.core = glowSprite('#FFE7A8', 1.6, 1); S.core.position.set(0, .2, 0);
    S.moon = moon3(.3, { earthshine: .4 }); S.moon.position.set(0, .2, 0);
    orbit(2.5, '#E8B84A', .3, { y: .2 });
  },
  down(S, id) { if (id && id.startsWith('five')) { const i = +id.slice(4); if (S.off.has(i)) S.off.delete(i); else S.off.add(i); S.sel = i; sfx(S.off.has(i) ? 'wood' : 'chime'); return true; } },
  update(t, S) {
    const litT = [19.5, 24, 28, 32, 35.5];
    S.orbs.forEach((o, i) => { const on = !S.off.has(i) && (t >= litT[i] || S.sel != null); setOpacity(o, on ? 1 : .18); o.rotation.y = gt * .4; });
    const n = S.orbs.filter((o, i) => !S.off.has(i) && (t >= litT[i] || S.sel != null)).length;
    S.n = n; const s = .4 + n * .35 + .08 * Math.sin(gt * 3); S.core.scale.set(s, s, 1); setOpacity(S.core, .25 + n * .15);
    S.moon.rotation.y = gt * .2;
    camOrbit(8, 42, Math.sin(gt * .1) * 10, 0, -.2, 0, 300);
  },
  draw(t, S) {
    title(t, 'D1', 'Why exactly five?');
    if (HAS3) {
      const c = proj(wp(S.core)); faceOn(S.moon, { seed: 11 });
      const litT = [19.5, 24, 28, 32, 35.5];
      S.orbs.forEach((o, i) => {
        const q = proj(wp(o)), f = FIVE[i], on = !S.off.has(i) && (t >= litT[i] || S.sel != null);
        if (on) lineTo2d(q, c, f[5], 3, .8);
        const a = t >= litT[i] - 1 || S.sel != null ? 1 : .35;
        txt(`${f[0]} · ${f[1]}`, q.x, q.y - 52, { size: 22, w: 600, color: on ? C.ink : C.dim, a });
        txt(`${f[2]} ${f[3]} · ${f[4]}`, q.x, q.y + 62, { size: 18, color: on ? f[5] : C.dim, a });
        hitCircle('five' + i, q.x, q.y, 55);
      });
      txt(S.n === 5 ? 'moment fully described' : `${5 - S.n} blind spot${5 - S.n > 1 ? 's' : ''}`, c.x, c.y + 70, { size: 18, w: 600, color: S.n === 5 ? C.goldSoft : '#FFB4A6', a: fin(t, 36, 37) + (S.sel != null ? 1 : 0) });
    }
    const X = 1100; panel(1070, 118, 470, 660, fin(t, 4, 5)); ctx.save(); ctx.globalAlpha = fin(t, 4, 5);
    txt('THE TRADITIONAL VIEW', X, 156, { size: 16, color: C.muted, w: 600, align: 'left' });
    if (S.sel == null) {
      wrapTxt('A calendar tracks dates. The Panchang is read to judge the quality of a moment.', X, 196, 410, 28, { size: 21, font: F.disp, color: C.goldSoft, align: 'left' });
      FIVE.forEach((f, i) => { const y = 300 + i * 62; circle(X + 8, y, 8, f[5]); txt(`${f[0]} → ${f[2]} (${f[4]})`, X + 26, y - 10, { size: 19, w: 600, color: C.ink, align: 'left' }); txt(f[7], X + 26, y + 14, { size: 16, color: C.muted, align: 'left' }); });
      wrapTxt('Like length, width and height for an object, tradition treats these five as the coordinates that fully specify a moment.', X, 632, 410, 22, { size: 16, color: C.muted, align: 'left' });
    } else {
      const f = FIVE[S.sel], off = S.off.has(S.sel);
      txt(`${f[1]}  ${f[0]}`, X, 206, { size: 40, font: F.disp, color: f[5], align: 'left' });
      txt(`Element: ${f[2]} ${f[3]} · ${f[4]}`, X, 256, { size: 20, color: C.ink, align: 'left' });
      txt('Measures', X, 304, { size: 16, color: C.muted, align: 'left' }); wrapTxt(f[6], X, 330, 410, 24, { size: 19, color: C.ink, align: 'left' });
      txt('Tradition links it with', X, 384, { size: 16, color: C.muted, align: 'left' }); wrapTxt(f[7], X, 410, 410, 24, { size: 19, color: C.ink, align: 'left' });
      chipTag(X, 478, off ? 'Switched off: blind spot' : 'On', off ? false : true);
      if (off) wrapTxt(f[8], X, 530, 410, 26, { size: 19, color: '#FFD0C4', align: 'left' });
    }
    txt('Astronomy: exact. Meanings: interpretive.', X, 740, { size: 15, color: C.dim, align: 'left' });
    ctx.restore();
    tryIt(560, 790, 'Tap a limb to switch it off', t, 47.5);
  }
});

/* D2 ─ Rashi · Nakshatra · Pada */
scene({
  name: 'Rashi, Nakshatra, Pada', dur: 46, optional: true, free: true, terms: ['Rashi', 'Nakshatra', 'Pada'],
  cues: [[.8, "Three rulers measure the same circle: twelve {rashis|राशि}, twenty-seven {nakshatras|नक्षत्र}, and a hundred and eight {padas|पाद}."],
  [8.5, "Each rashi spans thirty degrees. Each nakshatra spans thirteen degrees twenty minutes, split into four padas of three degrees twenty minutes."],
  [17.5, "So every rashi holds exactly nine padas, or two and a quarter nakshatras. Nakshatra and rashi borders meet only three times: at Ashwini, Magha and Mula."],
  [28.5, "Each rashi has a ruling graha and an element: fire, earth, air or water. And each pada has a sound, traditionally used to choose the first syllable of a baby's name."],
  [39, "Tap the wheel to explore, or look up your own birth star in the finder."]],
  sfx: [[.1, 'whoosh'], [17.5, 'chord'], [28.5, 'chime']],
  setup(S) {
    S.pd = null; S.az = 0; S.el = 52; KEY.position.set(-3, 6, 4); AMB.intensity = .35;
    S.earth = earth3(.45);
    if (!HAS3) return;
    S.rs = Array.from({ length: 12 }, (_, i) => sector(3.9, 4.6, i * 30 + .3, (i + 1) * 30 - .3, ELEM_COL[RASHI_ELEM[i % 4]], .3));
    S.ns = Array.from({ length: 27 }, (_, i) => sector(3.05, 3.75, i * 360 / 27 + .2, (i + 1) * 360 / 27 - .2, i % 2 ? '#2E3780' : '#232A68', .8, { y: .12 }));
    S.ps = Array.from({ length: 108 }, (_, i) => sector(2.35, 2.9, i * 360 / 108 + .15, (i + 1) * 360 / 108 - .15, Math.floor(i / 4) % 2 ? '#3B4595' : '#2C3480', .85, { y: .24 }));
  },
  down(S, id, p) {
    if (id === 'hear') { const s = PADA_SYL[S.cur]; speakWord(s[0], s[1]); return true; }
    if (id === 'birth') { goFinder(); return true; }
    dragStart(S, p, 'az', 'el'); return true;
  },
  move(S, p) { dragMove(S, p, -.25, .2, 15, 85); },
  up(S, p) {
    if (S.drag && !S.drag.moved && p) { const h = planeHit(p); if (h) { const r = Math.hypot(h.x, h.z); if (r > 2 && r < 4.9) { S.pd = Math.floor(norm(Math.atan2(-h.z, h.x) / DEG) / (360 / 108)); sfx('pop'); const s = PADA_SYL[S.pd]; speakWord(s[0], s[1]); } } }
    S.drag = null;
  },
  update(t, S) {
    const cur = S.cur = S.pd ?? Math.floor((t * 2.4) % 108);
    const n = Math.floor(cur / 4), r = Math.floor(cur / 9);
    if (S.rs) {
      S.rs.forEach((m, i) => m.material.opacity = i === r ? .85 : .28);
      S.ns.forEach((m, i) => { m.material.color.set(i === n ? '#E8B84A' : i % 2 ? '#2E3780' : '#232A68'); m.material.opacity = i === n ? .9 : .8; });
      S.ps.forEach((m, i) => { m.material.color.set(i === cur ? '#F28C28' : Math.floor(i / 4) === n ? '#8C7640' : Math.floor(i / 4) % 2 ? '#3B4595' : '#2C3480'); });
    }
    if (!S.drag) S.az += .02;
    camOrbit(14.5, S.el, S.az, 0, -.3, 0, 300);
  },
  draw(t, S) {
    title(t, 'D2', 'Rashi · Nakshatra · Pada');
    const cur = S.cur, n = Math.floor(cur / 4), r = Math.floor(cur / 9), pada = cur % 4 + 1, syl = PADA_SYL[cur];
    if (HAS3) {
      for (let i = 0; i < 12; i++) { const q = proj(posXZ(4.25, i * 30 + 15)); txt(RASHI[i], q.x, q.y, { size: 16, w: i === r ? 700 : 500, color: i === r ? '#fff' : '#E8E2D0' }); }
      for (let i = 0; i < 27; i++) { const q = proj(posXZ(3.4, (i + .5) * 360 / 27, .12)); txt(String(i + 1), q.x, q.y, { size: 14, color: i === n ? C.night : C.muted, w: 600 }); }
      const al = fin(t, 17.5, 19) * (1 - fin(t, 28, 29));
      if (al > 0) [0, 120, 240].forEach((d, k) => { const a = proj(posXZ(2.2, d, .3)), b = proj(posXZ(4.8, d, .3)); lineTo2d(a, b, '#FFFFFF', 4, al); txt(['Ashwini · Mesha', 'Magha · Simha', 'Mula · Dhanu'][k], b.x, b.y - 18, { size: 17, w: 600, color: C.goldSoft, a: al }); });
    }
    const X = 1100, pa = fin(t, 1, 2); panel(1070, 118, 470, 670, pa); ctx.save(); ctx.globalAlpha = pa;
    const el = RASHI_ELEM[r % 4];
    txt(`RASHI ${r + 1} OF 12`, X, 152, { size: 15, color: C.muted, w: 600, align: 'left' });
    txt(`${RASHI[r]}  ${RASHI_DEV[r]}`, X, 190, { size: 32, font: F.disp, color: C.gold, align: 'left' });
    txt(`${RASHI_EN[r]} · ${RASHI_SYM[r]}`, X, 226, { size: 17, color: C.ink, align: 'left' });
    txt(`Lord: ${RASHI_LORD[r]}`, X, 256, { size: 17, color: C.ink, align: 'left' }); chipTag(X + 200, 256, el, null);
    ctx.fillStyle = ELEM_COL[el]; rrect(X + 196, 244, 6, 24, 3); ctx.fill();
    txt(`NAKSHATRA ${n + 1} OF 27`, X, 304, { size: 15, color: C.muted, w: 600, align: 'left' });
    txt(`${NAK[n]}  ${NAK_DEV[n]}`, X, 340, { size: NAK[n].length > 12 ? 26 : 30, font: F.disp, color: C.gold, align: 'left' });
    txt(`“${NAK_INFO[n][0]}” · lord ${NAK_LORD[n % 9]}`, X, 374, { size: 17, color: C.ink, align: 'left' });
    txt(`PADA ${pada} OF 4`, X, 420, { size: 15, color: C.muted, w: 600, align: 'left' });
    txt(`${fmtDeg(cur * 10 / 3)} – ${fmtDeg((cur + 1) * 10 / 3)}  ·  pada ${cur + 1} of 108`, X, 450, { size: 17, color: C.ink, align: 'left' });
    txt('NAME SYLLABLE', X, 498, { size: 15, color: C.muted, w: 600, align: 'left' });
    txt(syl[0], X, 552, { size: 58, font: F.disp, color: C.saffron, align: 'left' });
    txt(syl[1], X + 190, 552, { size: 52, font: F.disp, color: C.goldSoft, align: 'left' });
    txt('Syllables vary a little between regional traditions.', X, 600, { size: 14, color: C.dim, align: 'left' });
    ctx.restore();
    button('hear', 1100, 624, 200, 42, 'Hear it  ▸', false, { size: 18, a: pa });
    button('birth', 1100, 680, 300, 42, 'Find your birth star ↓', true, { size: 18, a: pa });
    tryIt(560, 790, 'Tap the wheel · drag to turn', t, 39);
  }
});

/* ── shared sky helpers ── */
const GRAHAS = [['Surya', '#F7A632'], ['Chandra', '#DDE2F7'], ['Mangala', '#E2553F'], ['Budha', '#5CC98A'], ['Guru', '#E9C27A'], ['Shukra', '#F3D7EC'], ['Shani', '#8C9BE0'], ['Rahu', '#9A7BE8'], ['Ketu', '#C09BF0']];
function skyBodies(jd) {
  const p = pos(jd);
  return GRAHAS.map(([n, c]) => { let l, b; if (n === 'Surya') { l = p.s; b = 0; } else if (n === 'Chandra') { l = p.m; b = moonLat(jd); } else { const g = grahaPos(n, jd); l = g.l; b = g.b; } return { n, c, l, b }; });
}
function skyBodies1(n, jd) { if (n === 'Surya') return { l: pos(jd).s, b: 0 }; if (n === 'Chandra') return { l: pos(jd).m, b: moonLat(jd) }; return grahaPos(n, jd); }
function isRetro(n, jd) { if (n === 'Surya' || n === 'Chandra') return false; if (n === 'Rahu' || n === 'Ketu') return true; return wrap180(grahaPos(n, jd + 1).l - grahaPos(n, jd).l) < 0; }
const TRAIL_DAYS = { Surya: 30, Chandra: 3, Mangala: 120, Budha: 60, Guru: 240, Shukra: 90, Shani: 300, Rahu: 180, Ketu: 180 };
function makeBody(n, c, scale = 1, parent) {
  if (n === 'Surya') return sun3(.26 * scale, { intensity: 1.6, parent });
  if (n === 'Chandra') return moon3(.18 * scale, { earthshine: .6, parent });
  if (n === 'Rahu' || n === 'Ketu') return glowSprite(c, .55 * scale, 1, { parent });
  return planet3((n === 'Guru' ? .13 : n === 'Shani' ? .12 : .09) * scale, c, { glow: .7, ring: n === 'Shani', bands: n === 'Guru', parent });
}
function trailLine(color, parent) { return circleLine(Array.from({ length: 49 }, () => V3()), color, .7, parent); }
function skyLocalStr(jd, tz) {
  const d = new Date((jd - 2440587.5) * 864e5 + tz * 3.6e6), hh = d.getUTCHours(), mm = d.getUTCMinutes();
  const off = `UTC${tz >= 0 ? '+' : '−'}${Math.floor(Math.abs(tz))}${Math.abs(tz) % 1 ? ':' + String(Math.round(Math.abs(tz) % 1 * 60)).padStart(2, '0') : ''}`;
  return [`${d.getUTCDate()} ${MONTHS_EN_ABBR[d.getUTCMonth()]} ${d.getUTCFullYear()}`, `${(hh % 12) || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`, off];
}
function lbl(v, s, o) { const q = proj(v); if (q.vis) txt(s, q.x + (o.dx || 0), q.y + (o.dy || 0), o); return q; }
function rayDir(p) { RC.setFromCamera(new THREE.Vector2(p.x / W * 2 - 1, -(p.y / H * 2 - 1)), CAM); return RC.ray.direction; }
function insideCam(look, fov, shift, up) {
  if (Math.abs(CAM.fov - fov) > .01) { CAM.fov = fov; CAM.updateProjectionMatrix(); }
  CAM.position.set(0, 0, 0); if (up) CAM.up.copy(up); else CAM.up.set(0, 1, 0); CAM.lookAt(look);
  if (shift) CAM.setViewOffset(W, H, shift, 0, W, H); else CAM.clearViewOffset(); CAM.updateMatrixWorld();
}
function speedLabel() { const s = SKY.speed; return s < 1 / 60 ? '1 min' : s < 1 / 2 ? '1 hour' : s < 2 ? '1 day' : s < 10 ? '1 week' : '1 month'; }
// horizon (alt, az) → equatorial → ecliptic
function horToEq(alt, az, lst, lat) {
  const a = alt * DEG, A = az * DEG, p = lat * DEG;
  const dec = Math.asin(clamp(Math.sin(a) * Math.sin(p) + Math.cos(a) * Math.cos(p) * Math.cos(A), -1, 1));
  const Hh = Math.atan2(-Math.sin(A) * Math.cos(a), Math.sin(a) * Math.cos(p) - Math.cos(a) * Math.sin(p) * Math.cos(A));
  return { ra: norm(lst - Hh / DEG), dec: dec / DEG };
}
function horToEclVec(alt, az, lst, lat, R) { const q = horToEq(alt, az, lst, lat), e = eqToEcl(q.ra, q.dec); return eclVec(e.l, e.b, R); }
const angTo = (a, b) => a + wrap180(b - a);
// shaded zodiac regions: lunes (pole to pole) or the belt (±9°) for each rashi / nakshatra, built at sidereal longitudes
function zodiacShades(R, parentR, parentN) {
  const mk = (a0, a1, col, belt, parent) => {
    const g = new THREE.SphereGeometry(R, Math.max(3, Math.ceil((a1 - a0) / 3)), belt ? 4 : 36, (180 + a0) * DEG, (a1 - a0) * DEG, belt ? 81 * DEG : 0, belt ? 18 * DEG : PI);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false }));
    return add(m, parent);
  };
  const out = { r: { belt: [], full: [] }, n: { belt: [], full: [] } };
  for (let i = 0; i < 12; i++) for (const k of ['belt', 'full']) out.r[k].push(mk(i * 30, (i + 1) * 30, ELEM_COL[RASHI_ELEM[i % 4]], k === 'belt', parentR));
  for (let i = 0; i < 27; i++) for (const k of ['belt', 'full']) out.n[k].push(mk(i * 360 / 27, (i + 1) * 360 / 27, i % 2 ? '#7C8CFF' : '#F4D891', k === 'belt', parentN));
  return out;
}
function updateShades(Z, selR, selN) {
  const b = SKY.bright;
  for (const kind of ['r', 'n']) for (const k of ['belt', 'full']) Z[kind][k].forEach((m, i) => {
    const on = SKY.shade === (kind === 'r' ? 'rashi' : 'nak') && (k === 'belt') === SKY.belt;
    m.visible = on; if (on) m.material.opacity = (i === (kind === 'r' ? selR : selN) ? .42 : (i % 2 ? .1 : .16)) * (.85 + .7 * b);
  });
}
function poleArc(l, b, R, fn) { const pts = [], top = b >= 0 ? 90 : -90; for (let k = 0; k <= 30; k++) pts.push(fn(l, lerp(top, 0, k / 30), R)); return pts; }
function drawPath(pts, color, w, dash) { const qs = pts.map(v => proj(v)).filter(q => q.vis); if (qs.length < 2) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath(); qs.forEach((q, k) => k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); ctx.restore(); }
function explainBody(o, ay, lat) {
  const sid = norm(o.l - ay), inf = sidInfo(sid);
  return [`${o.n} is at ${fmtDeg(sid % 30)} ${RASHI[inf.r]}, in ${NAK[inf.n]} pada ${inf.pada}.`,
  `Follow the dashed line from the ecliptic pole through ${o.n} down to the ecliptic: where it lands is its longitude. The 30° slice it falls in is the rashi; the 13°20′ slice is the nakshatra.`,
  `Its height above or below the ecliptic (${o.b >= 0 ? '+' : '−'}${Math.abs(o.b).toFixed(1)}°) doesn’t change the answer.`];
}
function skyGoal(S, g) { S.goal = g; }
function stepGoal(S, dt) {
  const G = S.goal; if (!G) return; const k = 1 - Math.exp(-dt * 4);
  for (const key of Object.keys(G)) {
    if (key === 'tgt') { S.tgt.lerp(G.tgt, k); continue; }
    const target = (key === 'az' || key === 'yaw') ? angTo(S[key], G[key]) : G[key];
    S[key] = lerp(S[key], target, k);
  }
}

function aimD3(S, i) {
  const o = S.bodies[i];
  if (SKY.view === 'earth') { const e = eclToEq(o.l, o.b), h = horiz(e.ra, e.dec, S.lst, S.F.lat); return { yaw: h.az, pitch: clamp(h.alt, -5, 85), fov: S.follow ? S.fov : 38 }; }
  return { az: Math.atan2(Math.cos(o.l * DEG), -Math.sin(o.l * DEG)) / DEG, el: clamp(o.b + 22, -50, 70), dist: S.follow ? S.dist : 10, tgt: eclVec(o.l, o.b, 2.8) };
}
function followBtn(S, x, y) {
  if (S.sel == null) return;
  button('follow', x, y, 180, 30, S.follow ? 'Following  ●' : 'Keep following', S.follow, { size: 14 });
}
/* D3 ─ The sky as a sphere */
scene({
  name: 'The sky as a sphere', dur: 58, optional: true, free: true, sky: 'sphere', terms: ['Kranti Vritta', 'Vishuva', 'Ayanamsa', 'Rashi', 'Navagraha'],
  cues: [[.8, "Here's how astronomers, ancient and modern, measure the sky."],
  [4.5, "Imagine the sky as a giant sphere around Earth. Every star sits at a fixed spot on it."],
  [10, "The Sun's yearly path across this sphere is the ecliptic, {Kranti Vritta|क्रान्तिवृत्त}. Rashis and nakshatras are marked along it, and all the grahas wander close to it."],
  [19.5, "Earth's equator, projected onto the sky, makes the celestial equator. It's tilted twenty-three and a half degrees to the ecliptic, and that tilt gives us the seasons."],
  [29, "Positions are measured as longitude: degrees along the ecliptic from a zero point. The Western zodiac starts at the spring equinox. The Indian zodiac starts from the fixed stars, at the start of Ashwini, opposite Chitra."],
  [42.5, "So a graha's rashi and nakshatra is simply the slice of sky behind it, measured along the ecliptic, like segments of an orange."],
  [50, "Tap a graha in the list to fly to it. Use the controls below to change the date, run time, or stand on Earth."]],
  sfx: [[.1, 'whoosh'], [10, 'chime'], [19.5, 'chime'], [42.5, 'chord']],
  setup(S) {
    Object.assign(S, { az: 20, el: 24, dist: 17, yaw: 90, pitch: 25, fov: 65, tgt: HAS3 ? new THREE.Vector3() : V3(), show: { ecl: true, nak: true, eq: true, stars: false }, tap: null, sel: null, goal: null, resetSeen: SKY.reset, cenSeen: SKY.center, touched: false, F: finderPlace() });
    KEY.intensity = 0; AMB.intensity = .3;
    S.earth = earth3(.5);
    if (!HAS3) return;
    const R = 5;
    S.shell = add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), new THREE.MeshBasicMaterial({ color: 0x5566cc, transparent: true, opacity: .06, side: THREE.DoubleSide, depthWrite: false })));
    S.eclG = add(new THREE.Group()); S.rashiG = new THREE.Group(); S.eclG.add(S.rashiG); S.nakG = add(new THREE.Group()); S.starG = add(new THREE.Group());
    S.shR = add(new THREE.Group()); S.shN = add(new THREE.Group()); S.Z = zodiacShades(4.93, S.shR, S.shN);
    S.eqG = add(new THREE.Group()); S.eqG.rotation.x = -EPS * DEG; S.grid = [];
    S.eclLine = circleLine(Array.from({ length: 181 }, (_, i) => posXZ(R, i * 2)), '#E8B84A', .95, S.eclG);
    for (let i = 0; i < 12; i++) sector(4.55, 5.0, i * 30 + .3, (i + 1) * 30 - .3, ELEM_COL[RASHI_ELEM[i % 4]], .3, { parent: S.rashiG });
    for (let i = 0; i < 27; i++) sector(4.1, 4.5, i * 360 / 27 + .2, (i + 1) * 360 / 27 - .2, i % 2 ? '#3C4799' : '#2A3278', .75, { parent: S.nakG });
    S.eqLine = circleLine(Array.from({ length: 181 }, (_, i) => posXZ(R, i * 2)), '#7FD3E6', .9, S.eqG);
    for (let k = 0; k < 12; k++) { const g = new THREE.Group(); g.rotation.y = k * PI / 12; S.eqG.add(g); S.grid.push(circleLine(Array.from({ length: 91 }, (_, i) => V3(R * Math.cos(i * 4 * DEG), R * Math.sin(i * 4 * DEG), 0)), '#7FD3E6', .1, g)); }
    [-60, -30, 30, 60].forEach(la => S.grid.push(circleLine(Array.from({ length: 91 }, (_, i) => posXZ(R * Math.cos(la * DEG), i * 4, R * Math.sin(la * DEG))), '#7FD3E6', .1, S.eqG)));
    circleLine([V3(0, -6.3, 0), V3(0, 6.3, 0)], '#7FD3E6', .8, S.eqG);
    circleLine([V3(0, -5.8, 0), V3(0, 5.8, 0)], '#E8B84A', .4, S.eclG);
    starSprites(5.3).forEach(g => S.starG.add(g));
    S.m0 = glowSprite('#7FD3E6', .8, 1); S.m0.position.copy(posXZ(R, 0));
    S.m1 = glowSprite('#F28C28', .8, 1, { parent: S.rashiG }); S.m1.position.copy(posXZ(R, 0));
    S.bo = GRAHAS.map(([n, c]) => makeBody(n, c));
    S.tr = GRAHAS.map(([n, c]) => trailLine(c));
    // horizon for the "from Earth" view
    S.ground = add(new THREE.Mesh(new THREE.CircleGeometry(400, 96), new THREE.MeshBasicMaterial({ color: 0x10281b, side: THREE.DoubleSide, transparent: true, opacity: .62, depthWrite: false })));
    S.hor = circleLine(Array.from({ length: 181 }, () => V3()), '#F28C28', .7);
  },
  wheel(S, dy) { S.goal = null; if (SKY.view === 'earth') S.fov = clamp(S.fov * (1 + dy * .001), 15, 95); else S.dist = clamp(S.dist * (1 + dy * .001), 6, 32); },
  down(S, id, p) {
    if (id && id.startsWith('tg')) { const k = id.slice(2); S.show[k] = !S.show[k]; sfx('pop'); return true; }
    if (id === 'follow') { S.follow = !S.follow; sfx('pop'); return true; }
    if (id && id.startsWith('g')) { this.focus(S, +id.slice(1)); return true; }
    S.touched = true; S.goal = null; S.follow = false;
    if (SKY.view === 'earth') dragStart(S, p, 'yaw', 'pitch'); else dragStart(S, p, 'az', 'el'); return true;
  },
  focus(S, i) {
    if (S.sel === i) { S.sel = null; S.follow = false; S.goal = { dist: 17, tgt: new THREE.Vector3() }; return; }
    S.sel = i; S.touched = true; sfx('chime'); S.goal = aimD3(S, i);
  },
  move(S, p) { if (SKY.view === 'earth') dragMove(S, p, .1 * S.fov / 65, .1 * S.fov / 65, -10, 88); else dragMove(S, p, -.25, .2, -70, 85); },
  up(S, p) {
    if (S.drag && !S.drag.moved && p && HAS3) {
      let l = null;
      if (SKY.view === 'earth') { const d = rayDir(p), e = Math.asin(clamp(d.y, -1, 1)) / DEG; if (Math.abs(e) < 12) l = norm(Math.atan2(-d.z, d.x) / DEG); }
      else { const h = planeHit(p); if (h) { const r = Math.hypot(h.x - S.tgt.x, h.z - S.tgt.z); const r0 = Math.hypot(h.x, h.z); if (r0 > 3.8 && r0 < 5.4) l = norm(Math.atan2(-h.z, h.x) / DEG); } }
      if (l != null) { S.tap = l; sfx('pop'); }
    }
    S.drag = null;
  },
  update(t, S, dt) {
    if (S.resetSeen !== SKY.reset) { Object.assign(S, { az: 20, el: 24, dist: 17, yaw: 90, pitch: 25, fov: 65, touched: false, tap: null, sel: null, goal: null, follow: false, resetSeen: SKY.reset }); if (HAS3) S.tgt.set(0, 0, 0); }
    const jd = SKY.jd, ay = S.ay = ayanamsa(jd), bodies = S.bodies = skyBodies(jd);
    if (S.cenSeen !== SKY.center) { S.cenSeen = SKY.center; S.sel = null; S.follow = false; S.goal = SKY.view === 'earth' ? { fov: 65 } : { tgt: new THREE.Vector3() }; }
    S.F = SKY.place; S.lst = norm(gmstDeg(jd) + S.F.lon);
    if (S.follow && S.sel != null) S.goal = aimD3(S, S.sel);
    stepGoal(S, dt);
    if (!HAS3) return;
    const R = 5, b = SKY.bright, earthV = SKY.view === 'earth';
    S.rashiG.rotation.y = ay * DEG; S.nakG.rotation.y = ay * DEG; S.shR.rotation.y = ay * DEG; S.shN.rotation.y = ay * DEG; S.starG.rotation.y = (ay - 23.857) * DEG;
    S.shell.material.opacity = .015 + .2 * b; S.grid.forEach(l => l.material.opacity = .02 + .45 * b);
    S.eqLine.material.opacity = .45 + .55 * b; S.eclLine.material.opacity = .6 + .4 * b;
    S.eclG.visible = S.show.ecl && t > 9.5; S.nakG.visible = S.show.nak && t > 11; S.eqG.visible = S.show.eq && t > 19; S.starG.visible = S.show.stars;
    const selO = S.sel != null ? bodies[S.sel] : null, selSid = selO ? norm(selO.l - ay) : null;
    updateShades(S.Z, selO ? Math.floor(selSid / 30) : -1, selO ? Math.floor(selSid / (360 / 27)) : -1);
    const pulse = t > 29 ? .8 + .3 * Math.sin(gt * 4) : .01; S.m0.scale.set(pulse, pulse, 1); S.m1.scale.set(pulse, pulse, 1);
    S.earth.visible = !earthV; if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .3;
    bodies.forEach((o, i) => {
      const vis = i < 2 || SKY.grahas; S.bo[i].visible = vis; S.bo[i].position.copy(eclVec(o.l, o.b, i === 0 ? 5.02 : 4.98));
      const s = S.sel === i ? 1.6 + .2 * Math.sin(gt * 5) : 1; S.bo[i].scale.set(s, s, s);
      const tr = S.tr[i]; tr.visible = vis && SKY.trails;
      if (tr.visible) { const a = tr.geometry.attributes.position, span = TRAIL_DAYS[o.n]; for (let k = 0; k <= 48; k++) { const q = skyBodies1(o.n, jd - span * (1 - k / 48)); const v = eclVec(q.l, q.b, 4.97); a.setXYZ(k, v.x, v.y, v.z); } a.needsUpdate = true; }
    });
    // horizon
    S.ground.visible = S.hor.visible = earthV;
    if (earthV) {
      const zen = S.zen = horToEclVec(90, 0, S.lst, S.F.lat, 1);
      S.ground.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), zen); S.ground.position.copy(zen).multiplyScalar(-.03);
      const a = S.hor.geometry.attributes.position; for (let i = 0; i <= 180; i++) { const v = horToEclVec(0, i * 2, S.lst, S.F.lat, 4.9); a.setXYZ(i, v.x, v.y, v.z); } a.needsUpdate = true;
      const sunH = (() => { const e = eclToEq(bodies[0].l, 0); return horiz(e.ra, e.dec, S.lst, S.F.lat).alt; })(); S.sunAlt = sunH;
      STARS3.visible = sunH < -8;
      insideCam(horToEclVec(S.pitch, S.yaw, S.lst, S.F.lat, 1), S.fov, 280, zen);
    } else {
      STARS3.visible = true;
      if (!S.touched && !S.drag) S.az += .03;
      if (Math.abs(CAM.fov - 40) > .01) { CAM.fov = 40; CAM.updateProjectionMatrix(); }
      CAM.up.set(0, 1, 0); camOrbit(t < 4 ? lerp(22, S.dist, ease(t / 4)) : S.dist, S.el, S.az, S.tgt.x, S.tgt.y, S.tgt.z, 280);
    }
  },
  draw(t, S) {
    title(t, 'D3', 'The sky as a sphere');
    const earthV = SKY.view === 'earth', ay = S.ay;
    if (HAS3) {
      if (earthV && S.sunAlt > -12) { ctx.save(); ctx.globalAlpha = clamp((S.sunAlt + 12) / 18) * .22; ctx.fillStyle = '#4a7fc8'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      if (S.show.stars) BRIGHT_E.forEach(s => { if (s.mag < 1.4 || s.name === 'Polaris' || earthV && s.ind) lbl(eclVec(norm(s.l + ay - 23.857), s.b, 5.3), s.name + (earthV && s.ind ? ` · ${s.ind}` : ''), { size: 13, color: C.muted, align: 'left', dx: 10, dy: -10 }); });
      if (S.eclG.visible) for (let i = 0; i < 12; i++) lbl(posXZ(4.78, ay + i * 30 + 15), RASHI[i], { size: earthV ? 17 : 14, color: '#fff', w: 600 });
      if (S.nakG.visible && (earthV || SKY.shade === 'nak')) for (let i = 0; i < 27; i++) lbl(posXZ(4.3, ay + (i + .5) * 360 / 27), NAK[i], { size: 12, color: C.muted, dy: 14 });
      if (earthV) for (let a = 0; a < 360; a += 45) lbl(horToEclVec(1.5, a, S.lst, S.F.lat, 4.9), COMPASS[a / 45], { size: 22, w: 700, color: '#F6C79A', dy: -12 });
      S.bodies.forEach((o, i) => { if (i > 1 && !SKY.grahas) return; lbl(eclVec(o.l, o.b, 5), o.n + (isRetro(o.n, SKY.jd) && i > 1 && i < 7 ? ' ℞' : ''), { size: S.sel === i ? 18 : 15, w: 700, color: o.c, dy: -24 }); });
      if (!earthV) faceOn(S.bo[1], { seed: 14, k: 1 });
      if (S.sel != null) {
        const o = S.bodies[S.sel]; drawPath(poleArc(o.l, o.b, 4.99, eclVec), '#FFFFFF', 2.5, [8, 6]);
        const q = proj(eclVec(o.l, 0, 5)); if (q.vis) { circle(q.x, q.y, 7, '#fff'); txt(`${fmtDeg(norm(o.l - ay))} sidereal`, q.x, q.y + 22, { size: 15, w: 700, color: '#fff' }); }
        lbl(V3(0, 5.1, 0), 'ecliptic north pole', { size: 14, color: C.muted, dy: -14 });
      }
      if (t > 29 && !earthV) { lbl(posXZ(5.5, 0), '0° Western (spring equinox)', { size: 15, w: 600, color: '#9FE6F5', dy: 22 }); lbl(posXZ(5.5, ay), '0° Mesha (start of Ashwini)', { size: 15, w: 600, color: '#FFC58A', dy: -22 }); }
      if (S.eqG.visible) { lbl(S.eqG.localToWorld(posXZ(5.25, 200)), 'celestial equator', { size: 15, color: '#9FE6F5' }); lbl(S.eqG.localToWorld(V3(0, 6.5, 0)), 'North celestial pole', { size: 15, color: '#9FE6F5' }); }
      if (S.eclG.visible && !earthV) lbl(posXZ(5.35, ay + 250), 'ecliptic: the Sun’s path', { size: 15, color: C.goldSoft });
      if (S.tap != null) { const q = proj(posXZ(4.75, S.tap)); if (q.vis) circle(q.x, q.y, 9, null, '#fff', 3); }
      if (earthV) txt(`Standing at ${S.F.place} · drag to look · scroll to zoom`, 560, 110, { size: 16, color: C.muted });
    }
    const X = 1100, pa = fin(t, 3, 4); panel(1070, 118, 470, 566, pa); ctx.save(); ctx.globalAlpha = pa;
    const [ds, ts, off] = skyLocalStr(SKY.jd, SKY.tz);
    txt(ds, X, 150, { size: 22, font: F.disp, color: C.gold, align: 'left' }); txt(`${ts} · ${off}`, X + 410, 150, { size: 16, color: C.ink, align: 'right' });
    if (SKY.rate) txt(`${SKY.rate > 0 ? '▶' : '◀'} ${speedLabel()} per second`, X, 178, { size: 14, color: C.saffron, align: 'left', w: 600 });
    txt(`Ayanamsa ${fmtDeg(ay)}`, X + 410, 178, { size: 14, color: C.muted, align: 'right' });
    // panchang for this moment and place
    if (!S.pc || Math.abs(S.pcJD - SKY.jd) > 1 / 720 || S.pcPl !== SKY.place) { S.pc = clockData(SKY.jd, SKY.place, SKY.tz).r; S.pcJD = SKY.jd; S.pcPl = SKY.place; }
    const pc = S.pc;
    rrect(X - 12, 192, 434, 124, 10); ctx.fillStyle = 'rgba(232,184,74,.08)'; ctx.fill();
    const tIn = (pc.tithiNo - 1) % 15 + 1, kN = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'].indexOf(pc.karana) + 1;
    [['MASA', `${pc.amanta} (${pc.monthIdx + 1})`], ['TITHI', `${pc.paksha} ${pc.tithi} (${tIn})`], ['VARA', `${pc.vara[0]} (${pc.varaIdx + 1})`], ['NAKSHATRA', `${pc.nak} (${pc.nakIdx + 1}) · pada ${pc.pada}`],
    ['YOGA', `${pc.yoga} (${pc.yogaIdx + 1})`], ['KARANA', `${pc.karana} (${kN})`], ['RASHI', `Chandra ${RASHI[pc.moonRashi]} (${pc.moonRashi + 1})`], ['SAMVAT', `Vikram ${pc.vikram}`]].forEach(([k, v], i) => {
      const cx2 = X + (i % 2) * 212, cy2 = 208 + Math.floor(i / 2) * 29;
      txt(k, cx2, cy2 - 8, { size: 10.5, w: 600, color: C.muted, align: 'left' }); txt(v, cx2, cy2 + 7, { size: 14, w: 600, color: C.goldSoft, align: 'left' });
    });
    if (S.sel != null) {
      const o = S.bodies[S.sel], ex = explainBody(o, ay);
      txt(ex[0], X, 334, { size: 15, w: 600, color: o.c, align: 'left' });
      wrapTxt(ex[1], X, 354, 410, 17, { size: 13, color: C.ink, align: 'left' });
    } else if (S.tap == null) wrapTxt('Tap a graha below to fly to it, or tap the golden band to read any longitude.', X, 338, 410, 20, { size: 15, color: C.muted, align: 'left' });
    else { const sid = norm(S.tap - ay), inf = sidInfo(sid); txt(`Tapped: ${fmtDeg(S.tap)} tropical → ${fmtDeg(sid)} sidereal`, X, 338, { size: 15, color: C.ink, align: 'left' }); txt(`${RASHI[inf.r]} · ${NAK[inf.n]} pada ${inf.pada} · “${inf.syl[0]}”`, X, 362, { size: 16, w: 600, color: C.gold, align: 'left' }); }
    const y0 = 446; txt('GRAHAS · TAP TO FLY TO ONE', X, y0 - 26, { size: 13, color: C.muted, w: 600, align: 'left' });
    ctx.restore(); followBtn(S, X + 240, y0 - 41); ctx.save(); ctx.globalAlpha = pa;
    (S.bodies || []).forEach((o, i) => {
      const y = y0 + i * 24.5, sid = norm(o.l - ay), inf = sidInfo(sid), dim = i > 1 && !SKY.grahas, on = S.sel === i;
      if (on) { rrect(X - 12, y - 12, 440, 24, 7); ctx.fillStyle = 'rgba(232,184,74,.2)'; ctx.fill(); }
      else if (ptr.x > X - 12 && ptr.x < X + 428 && ptr.y > y - 12 && ptr.y < y + 12) { rrect(X - 12, y - 12, 440, 24, 7); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); }
      circle(X + 7, y, 7, o.c); txt(o.n, X + 22, y, { size: 15, w: 600, color: dim ? C.dim : C.ink, align: 'left' });
      txt(`${RASHI[inf.r]} ${Math.floor(sid % 30)}°`, X + 140, y, { size: 16, color: dim ? C.dim : C.ink, align: 'left' });
      txt(NAK[inf.n], X + 262, y, { size: 14, color: C.muted, align: 'left' });
      if (i > 1 && i < 7 && isRetro(o.n, SKY.jd)) txt('℞', X + 410, y, { size: 16, color: C.saffron, align: 'right' });
      hits.push({ id: 'g' + i, x: X - 12, y: y - 12, w: 440, h: 24 });
    });
    txt('℞ retrograde · Rahu & Ketu always move backwards', X, 670, { size: 12.5, color: C.dim, align: 'left' });
    ctx.restore();
    [['ecl', 'Ecliptic & rashis'], ['nak', 'Nakshatras'], ['eq', 'Celestial equator'], ['stars', 'Bright stars']].forEach(([k, l], i) => button('tg' + k, 1070 + (i % 2) * 238, 694 + Math.floor(i / 2) * 50, 228, 42, l, S.show[k], { size: 16 }));
    tryIt(560, 790, earthV ? 'Drag to look · scroll to zoom · tap a graha in the list' : 'Drag to turn · scroll to zoom · tap a graha in the list', t, 50);
  }
});

/* D4 ─ Measuring angles */
scene({
  name: 'Measuring angles in the sky', dur: 34, optional: true, free: true, terms: ['Tithi'],
  cues: [[.8, "Every measurement in the Panchang is an angle, seen from Earth."],
  [5, "Stretch out your arm. Your little finger covers about one degree. Three fingers, about five. A fist, about ten."],
  [13.5, "The Moon's disc is only half a degree wide, yet it travels about thirteen degrees a day, a little more than one fist."],
  [22, "Twelve degrees of lead over the Sun makes one {tithi|तिथि}. Tap any two objects to measure the angle between them."]],
  sfx: [[.1, 'whoosh'], [5, 'wood'], [13.5, 'chime']],
  setup(S) {
    const p = pos(jdNow()); S.ls = p.s; S.lm = p.m;
    S.bodies = [{ name: 'Moon', l: S.lm, b: 0 }, { name: 'Sun', l: S.ls, b: 0 }, ...BRIGHT_E.map(s => ({ name: s.name, l: s.l, b: s.b }))];
    let bi = 2, bd = 999; S.bodies.forEach((o, i) => { if (i > 1) { const d = angSep(S.lm, 0, o.l, o.b); if (d < bd) { bd = d; bi = i; } } });
    S.A = 0; S.B = bi; S.yaw = S.lm + 6; S.pitch = 5;
    KEY.intensity = 0; AMB.intensity = .3;
    if (!HAS3) return;
    CAM.fov = 58; CAM.updateProjectionMatrix();
    S.sun = sun3(1.1, { intensity: 2 }); S.sun.position.copy(eclVec(S.ls, 0, 50));
    S.moon = moon3(.9, { earthshine: .5 }); S.moon.position.copy(eclVec(S.lm, 0, 50));
    starSprites(52).forEach(g => g.scale.multiplyScalar(1.4));
    circleLine(Array.from({ length: 181 }, (_, i) => posXZ(49, i * 2)), '#E8B84A', .25);
  },
  down(S, id, p) { dragStart(S, p, 'yaw', 'pitch'); return true; },
  move(S, p) { dragMove(S, p, .08, .08, -80, 80); },
  up(S, p) {
    if (S.drag && !S.drag.moved && p) {
      let bi = -1, bd = 40; S.bodies.forEach((o, i) => { const q = proj(eclVec(o.l, o.b, 50)); if (!q.vis) return; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; bi = i; } });
      if (bi >= 0 && bi !== S.B) { S.A = S.B; S.B = bi; sfx('pop'); }
    }
    S.drag = null;
  },
  update(t, S) {
    if (!HAS3) return;
    CAM.position.set(0, 0, 0); CAM.lookAt(eclVec(S.yaw, S.pitch, 10)); CAM.updateMatrixWorld();
    S.moon.rotation.y = gt * .1;
  },
  draw(t, S) {
    title(t, 'D4', 'Measuring angles in the sky');
    const A = S.bodies[S.A], B = S.bodies[S.B], ang = angSep(A.l, A.b, B.l, B.b);
    if (HAS3) {
      S.bodies.forEach((o, i) => { if (i < 2) return; const q = proj(eclVec(o.l, o.b, 50)); if (q.vis) txt(o.name, q.x + 12, q.y - 12, { size: 14, color: i === S.A || i === S.B ? C.goldSoft : C.muted, align: 'left' }); });
      const mq = proj(wp(S.moon)); if (mq.vis) { faceOn(S.moon, { seed: 12 }); txt('Moon (size exaggerated)', mq.x, mq.y + 40, { size: 14, color: C.muted }); }
      const sq = proj(wp(S.sun)); if (sq.vis) txt('Sun', sq.x, sq.y + 50, { size: 15, color: C.goldSoft });
      const va = eclVec(A.l, A.b, 1), vb = eclVec(B.l, B.b, 1), pts = [];
      for (let k = 0; k <= 40; k++) { const v = new THREE.Vector3().copy(va).lerp(vb, k / 40).normalize().multiplyScalar(48); const q = proj(v); if (q.vis) pts.push(q); }
      if (ang < 175 && pts.length > 1) {
        ctx.save(); ctx.strokeStyle = C.saffron; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.beginPath(); pts.forEach((q, k) => k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); ctx.restore();
        const m = pts[Math.floor(pts.length / 2)]; txt(`${ang.toFixed(1)}°`, m.x, m.y - 22, { size: 26, font: F.disp, color: C.saffron });
      }
    }
    // hand guide
    const pa = fin(t, 5, 6); panel(1070, 118, 470, 670, pa); ctx.save(); ctx.globalAlpha = pa; const X = 1100;
    txt('MEASURING', X, 156, { size: 16, color: C.muted, w: 600, align: 'left' });
    txt(`${A.name} ↔ ${B.name}`, X, 196, { size: 26, font: F.disp, color: C.gold, align: 'left' });
    txt(`${ang.toFixed(1)}°`, X, 250, { size: 50, font: F.disp, color: C.ink, align: 'left' });
    const fists = Math.floor(ang / 10), fingers = Math.round(ang - fists * 10);
    txt(`≈ ${fists} fist${fists === 1 ? '' : 's'} + ${fingers} finger${fingers === 1 ? '' : 's'} at arm’s length`, X, 298, { size: 17, color: C.muted, align: 'left' });
    if ((S.A === 0 && S.B === 1) || (S.A === 1 && S.B === 0)) txt(`Moon’s lead over the Sun: ${Math.round(norm(S.lm - S.ls))}° → tithi ${Math.floor(norm(S.lm - S.ls) / 12) + 1}`, X, 326, { size: 17, color: C.goldSoft, align: 'left' });
    txt('YOUR HAND AS A RULER', X, 372, { size: 16, color: C.muted, w: 600, align: 'left' });
    const hand = (x, y, n, w, lbl, deg) => {
      for (let k = 0; k < n; k++) { rrect(x + k * (w + 3), y, w, 54, 7); ctx.fillStyle = '#E9B98E'; ctx.fill(); }
      txt(deg, x + (n * (w + 3)) / 2, y + 76, { size: 18, w: 600, color: C.ink }); txt(lbl, x + (n * (w + 3)) / 2, y + 98, { size: 14, color: C.muted });
    };
    hand(X + 6, 396, 1, 14, 'little finger', '1°'); hand(X + 78, 396, 3, 14, 'three fingers', '5°');
    rrect(X + 196, 396, 72, 54, 14); ctx.fillStyle = '#E9B98E'; ctx.fill(); txt('10°', X + 232, 472, { size: 18, w: 600, color: C.ink }); txt('fist', X + 232, 494, { size: 14, color: C.muted });
    rrect(X + 300, 396, 110, 26, 10); ctx.fillStyle = '#E9B98E'; ctx.fill(); rrect(X + 300, 420, 22, 30, 6); ctx.fill(); rrect(X + 388, 420, 22, 30, 6); ctx.fill();
    txt('~20°', X + 355, 472, { size: 18, w: 600, color: C.ink }); txt('spread hand', X + 355, 494, { size: 14, color: C.muted });
    [['Moon’s disc', '½°'], ['Moon’s daily motion', '~13°'], ['One tithi', '12° of lead'], ['One nakshatra', '13°20′']].forEach(([k, v], i) => { txt(k, X, 546 + i * 32, { size: 17, color: C.muted, align: 'left' }); txt(v, X + 410, 546 + i * 32, { size: 18, color: C.ink, align: 'right', w: 600 }); });
    ctx.restore();
    tryIt(560, 790, 'Drag to look around · tap two objects', t, 22);
  }
});

/* D5 ─ Precession & ayanamsa */
scene({
  name: 'Precession and ayanamsa', dur: 50, optional: true, free: true, terms: ['Ayanamsa', 'Dhruva', 'Vishuva', 'Sankranti'],
  cues: [[.8, "The fixed stars aren't quite as still as they seem, from where we watch."],
  [5, "Earth's axis wobbles slowly, like a spinning top, tracing a full circle about once every twenty-six thousand years."],
  [12.5, "This is precession. It moves the equinox backwards against the stars, about one degree every seventy-two years."],
  [20.5, "Around 285 CE the two zodiacs matched. Since then they have drifted about twenty-four degrees apart. That gap is the {ayanamsa|अयनांश}."],
  [30, "It even changes the pole star. Today it's Polaris, which Indian tradition calls {Dhruva|ध्रुव}. Around the year 14,000, it will be Vega."],
  [39.5, "And it's why Makar Sankranti, on January fourteenth, now comes about three weeks after the winter solstice. Drag the years to see it."]],
  sfx: [[.1, 'whoosh'], [12.5, 'chime'], [20.5, 'bell'], [30, 'shimmer'], [39.5, 'chord']],
  setup(S) {
    S.year = null; S.drag = null; S.az = 30; S.el = 18; KEY.position.set(-4, 3, 5); AMB.intensity = .35;
    S.earth = earth3(.8);
    if (!HAS3) return;
    S.axis = circleLine([V3(0, -1.7, 0), V3(0, 1.7, 0)], '#9FE6F5', .95); S.axis.userData.keep = true;
    for (let i = 0; i < 27; i++) sector(3.2, 3.7, i * 360 / 27 + .2, (i + 1) * 360 / 27 - .2, i % 2 ? '#3C4799' : '#2A3278', .75);
    circleLine(Array.from({ length: 181 }, (_, i) => posXZ(3.7, i * 2)), '#E8B84A', .6);
    circleLine(Array.from({ length: 181 }, (_, i) => eclVec(i * 2, 66.56, 7)), '#9FE6F5', .35);
    S.stars = ['Polaris', 'Vega', 'Thuban'].map(n => { const s = BRIGHT_E.find(b => b.name === n); const g = glowSprite('#FFF4DC', .7, 1); g.position.copy(eclVec(norm(s.l - 23.857), s.b, 7)); return { s, g }; });
    S.pole = glowSprite('#7FD3E6', 1.1, 1); S.eq = glowSprite('#7FD3E6', .9, 1); S.zero = glowSprite('#F28C28', .9, 1); S.zero.position.copy(posXZ(3.95, 0));
  },
  down(S, id, p) { if (id === 'yr') { S.yd = true; this.move(S, p); return true; } dragStart(S, p, 'az', 'el'); return true; },
  move(S, p) { if (S.yd) { S.year = Math.round(lerp(-3000, 16000, clamp((p.x - 1100) / 400)) / 50) * 50; return; } dragMove(S, p, -.25, .2, 5, 80); },
  up(S) { S.yd = false; S.drag = null; },
  update(t, S) {
    const auto = t < 12.5 ? 2026 : t < 20.5 ? lerp(2026, 285, ease((t - 12.5) / 7)) : t < 30 ? lerp(285, 2026, ease((t - 20.5) / 7)) : t < 39.5 ? lerp(2026, 14000, ease((t - 30) / 8)) : lerp(14000, 2026, ease((t - 39.5) / 5));
    const Y = S.Y = S.year ?? Math.round(auto); const ay = S.ay = ayanY(Y);
    if (HAS3) {
      const pl = eclVec(norm(90 - ay), 66.56, 1), dir = new THREE.Vector3(pl.x, pl.y, pl.z).normalize();
      S.earth.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); S.axis.quaternion.copy(S.earth.quaternion);
      S.earth.userData.body.rotation.z = 0; S.earth.userData.body.rotation.y = gt * 1.5;
      S.pole.position.copy(eclVec(norm(90 - ay), 66.56, 7)); S.eq.position.copy(posXZ(3.95, norm(-ay)));
    }
    if (!S.drag) S.az += .02;
    camOrbit(19, S.el, S.az, 0, 2.6, 0, 280);
  },
  draw(t, S) {
    title(t, 'D5', 'Precession and ayanamsa');
    const Y = S.Y, ay = S.ay, eqSid = norm(-ay), eqN = Math.floor(eqSid / (360 / 27));
    const poleL = norm(90 - ay); let near = null, nd = 99; BRIGHT_E.filter(s => ['Polaris', 'Vega', 'Thuban'].includes(s.name)).forEach(s => { const d = angSep(poleL, 66.56, norm(s.l - 23.857), s.b); if (d < nd) { nd = d; near = s; } });
    if (HAS3) {
      S.stars.forEach(({ s, g }) => { const q = proj(wp(g)); txt(s.name + (s.ind ? ` · ${s.ind}` : ''), q.x + 14, q.y - 12, { size: 15, color: C.ink, align: 'left' }); });
      const pq = proj(wp(S.pole)); txt('pole points here', pq.x, pq.y + 24, { size: 14, color: '#9FE6F5' });
      const eq = proj(wp(S.eq)); txt('spring equinox', eq.x, eq.y - 20, { size: 15, w: 600, color: '#9FE6F5' });
      const zq = proj(wp(S.zero)); txt('0° Mesha (fixed stars)', zq.x, zq.y + 22, { size: 15, w: 600, color: '#FFC58A' });
      const ep = proj(eclVec(90 - ay, 66.56, 7)); circle(ep.x, ep.y, 10, null, '#9FE6F5', 2);
    }
    const X = 1100; panel(1070, 118, 470, 670, 1); ctx.save();
    txt('YEAR', X, 156, { size: 16, color: C.muted, w: 600, align: 'left' });
    txt(Y < 0 ? `${-Y} BCE` : `${Y} CE`, X, 204, { size: 48, font: F.disp, color: C.gold, align: 'left' });
    [['Ayanamsa', `${ay >= 0 ? '' : '−'}${fmtDeg(Math.abs(ay))}`], ['Equinox falls in', NAK[eqN]], ['Nearest pole star', nd < 6 ? `${near.name} (${nd.toFixed(1)}° away)` : `none bright (${near.name} ${nd.toFixed(0)}° away)`]].forEach(([k, v], i) => { txt(k, X, 266 + i * 44, { size: 17, color: C.muted, align: 'left' }); txt(v, X + 410, 266 + i * 44, { size: 19, color: C.ink, align: 'right', w: 600 }); });
    const days = ay * 365.2422 / 360;
    txt('MAKAR SANKRANTI', X, 420, { size: 16, color: C.muted, w: 600, align: 'left' });
    wrapTxt(Math.abs(days) < 1 ? 'Falls on the winter solstice itself.' : `Falls about ${Math.abs(Math.round(days))} days ${days > 0 ? 'after' : 'before'} the winter solstice.`, X, 452, 410, 26, { size: 19, color: C.ink, align: 'left' });
    wrapTxt('Sankrantis follow the fixed stars; the solstice follows the seasons. The gap grows about one day every 71 years.', X, 510, 410, 22, { size: 15, color: C.muted, align: 'left' });
    txt('Drag the years', X, 620, { size: 16, color: C.muted, align: 'left' });
    rrect(1100, 650, 400, 10, 5); ctx.fillStyle = 'rgba(220,226,255,.2)'; ctx.fill();
    const k = clamp((Y + 3000) / 19000); rrect(1100, 650, 400 * k, 10, 5); ctx.fillStyle = C.gold; ctx.fill(); circle(1100 + 400 * k, 655, 12, '#fff', C.night, 3);
    txt('3000 BCE', 1100, 684, { size: 13, color: C.dim, align: 'left' }); txt('16,000 CE', 1500, 684, { size: 13, color: C.dim, align: 'right' });
    hits.push({ id: 'yr', x: 1080, y: 625, w: 440, h: 70 });
    txt('One full wobble ≈ 25,800 years', X, 740, { size: 15, color: C.dim, align: 'left' });
    ctx.restore();
    tryIt(560, 790, 'Drag the years · drag to turn', t, 39.5);
  }
});

/* D6 ─ Your sky, tonight */
function aimD6(S, i) { const h = S.hz[i]; return SKY.view === 'earth' ? { yaw: h.az, pitch: clamp(h.alt, -5, 85), fov: S.follow ? S.fov : 36 } : { az: 180 - h.az, el: clamp(h.alt + 20, 5, 80), dist: S.follow ? S.dist : 130 }; }
function finderPlace() {
  const lat = parseFloat($('fLat').value) || 12.97, lon = parseFloat($('fLon').value) || 77.59, tz = parseFloat($('fTz').value);
  const place = sel.value === 'custom' ? `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` : CITIES[+sel.value][0];
  return { lat, lon, tz: isFinite(tz) ? tz : 5.5, place };
}
function finderJD(tz) {
  const ds = $('fDate').value || '2026-01-01', ts = $('fTime').value || '20:00';
  const [y, m, d] = ds.split('-').map(Number), [h, mi] = ts.split(':').map(Number);
  return Date.UTC(y, m - 1, d, h, mi) / 864e5 + 2440587.5 - tz / 24;
}
scene({
  name: 'Your sky, tonight', dur: 30, optional: true, free: true, sky: 'local', terms: ['Lagna', 'Kranti Vritta', 'Navagraha'],
  cues: [[.8, "Finally, let's step outside, under the sky at the place and date set in the finder below."],
  [6.5, "The dark ground is your horizon. The glowing band is the ecliptic, with the rashis and nakshatras along it."],
  [13, "The rashi rising in the east is the {lagna|लग्न}, the ascendant. It changes about every two hours."],
  [19.5, "Find me, and the grahas. Drag to look around, run time forwards, or step outside to see your horizon from above."]],
  sfx: [[.1, 'whoosh'], [13, 'chime']],
  setup(S) {
    S.F = finderPlace(); Object.assign(S, { yaw: 90, pitch: 18, az: 200, el: 32, fov: 62, dist: 185, sel: null, goal: null, resetSeen: SKY.reset });
    KEY.intensity = 0; AMB.intensity = .35;
    if (!HAS3) return;
    S.ground = add(new THREE.Mesh(new THREE.CircleGeometry(60, 96), new THREE.MeshBasicMaterial({ color: 0x10281b, side: THREE.DoubleSide, transparent: true, opacity: .62, depthWrite: false }))); S.ground.rotation.x = -PI / 2; S.ground.position.y = -.4;
    S.hor = circleLine(Array.from({ length: 181 }, (_, i) => horVec(0, i * 2, 60)), '#F28C28', .6);
    S.dome = add(new THREE.Mesh(new THREE.SphereGeometry(59, 48, 24, 0, TAU, 0, PI / 2), new THREE.MeshBasicMaterial({ color: 0x5566cc, transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false })));
    S.grid = [];
    for (let a = 0; a < 360; a += 30) S.grid.push(circleLine(Array.from({ length: 46 }, (_, i) => horVec(i * 2, a, 58.5)), '#7FD3E6', .1));
    [30, 60].forEach(al => S.grid.push(circleLine(Array.from({ length: 121 }, (_, i) => horVec(al, i * 3, 58.5)), '#7FD3E6', .1)));
    S.eclW = add(new THREE.Group()); S.shR = new THREE.Group(); S.shN = new THREE.Group(); S.eclW.add(S.shR); S.eclW.add(S.shN); S.Z = zodiacShades(53, S.shR, S.shN);
    S.band = circleLine(Array.from({ length: 181 }, () => V3()), '#E8B84A', .85);
    S.eqBand = circleLine(Array.from({ length: 181 }, () => V3()), '#7FD3E6', .5);
    S.bo = GRAHAS.map(([n, c]) => makeBody(n, c, 4.2));
    S.tr = GRAHAS.map(([n, c]) => trailLine(c));
    S.st = starSprites(58).map((g, i) => ({ g, s: BRIGHT_E[i] }));
    // observer, visible from outside
    S.obs = add(new THREE.Group());
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.2, 4, 16), new THREE.MeshStandardMaterial({ color: 0xE8B84A, emissive: 0x6b4a10 })); body.position.y = 1.6; S.obs.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color: 0xF4D891, emissive: 0x6b4a10 })); head.position.y = 4.4; S.obs.add(head);
  },
  wheel(S, dy) { S.goal = null; if (SKY.view === 'earth') S.fov = clamp(S.fov * (1 + dy * .001), 15, 95); else S.dist = clamp(S.dist * (1 + dy * .001), 90, 320); },
  focus(S, i) {
    if (S.sel === i) { S.sel = null; S.follow = false; S.goal = { fov: 62, dist: 185 }; return; }
    S.sel = i; sfx('chime'); S.goal = aimD6(S, i);
  },
  down(S, id, p) {
    if (id === 'lookE') { S.goal = { yaw: 90, pitch: 15, az: 90, fov: 62 }; return true; }
    if (id === 'lookM') { this.focus(S, 1); return true; }
    if (id === 'follow') { S.follow = !S.follow; sfx('pop'); return true; }
    if (id && id.startsWith('g')) { this.focus(S, +id.slice(1)); return true; }
    S.goal = null; S.follow = false;
    if (SKY.view === 'earth') dragStart(S, p, 'yaw', 'pitch'); else dragStart(S, p, 'az', 'el'); return true;
  },
  move(S, p) { if (SKY.view === 'earth') dragMove(S, p, -.1, .1, -10, 88); else dragMove(S, p, -.25, .2, 5, 85); },
  up(S) { S.drag = null; },
  update(t, S, dt) {
    if (S.resetSeen !== SKY.reset) Object.assign(S, { yaw: 90, pitch: 18, az: 200, el: 32, fov: 62, dist: 185, sel: null, goal: null, follow: false, resetSeen: SKY.reset });
    S.F = SKY.place;
    if (S.cenSeen !== SKY.center) { S.cenSeen = SKY.center; S.sel = null; S.follow = false; S.goal = { fov: 62 }; }
    const F = S.F, jd = SKY.jd, lst = norm(gmstDeg(jd) + F.lon), ay = ayanamsa(jd);
    const H = (l, b) => { const e = eclToEq(l, b); return horiz(e.ra, e.dec, lst, F.lat); };
    const bodies = skyBodies(jd);
    Object.assign(S, { jd, lst, ay, H, bodies, hz: bodies.map(o => H(o.l, o.b)) });
    if (S.follow && S.sel != null) S.goal = aimD6(S, S.sel);
    stepGoal(S, dt);
    let best = null; for (let l = 0; l < 360; l += 1) { const a = H(l, 0), b = H(l + 1, 0); if ((a.alt <= 0) !== (b.alt <= 0) && a.az < 180) { let lo = l, hi = l + 1; for (let k = 0; k < 20; k++) { const md = (lo + hi) / 2; if ((H(md, 0).alt > 0) === (b.alt > 0)) hi = md; else lo = md; } best = (lo + hi) / 2; } }
    S.lagna = best;
    if (!HAS3) return;
    const earthV = SKY.view === 'earth', b = SKY.bright;
    { // rotate the ecliptic-frame group (zodiac shading) into the horizon frame
      const hv = (l, bb) => { const h = H(l, bb); return horVec(h.alt, h.az, 1); };
      const m = new THREE.Matrix4().makeBasis(hv(0, 0), hv(0, 90), hv(270, 0)); S.eclW.quaternion.setFromRotationMatrix(m);
      S.shR.rotation.y = ay * DEG; S.shN.rotation.y = ay * DEG;
      const selO = S.sel != null ? bodies[S.sel] : null, sid = selO ? norm(selO.l - ay) : 0;
      updateShades(S.Z, selO ? Math.floor(sid / 30) : -1, selO ? Math.floor(sid / (360 / 27)) : -1);
    }
    const arr = S.band.geometry.attributes.position, arr2 = S.eqBand.geometry.attributes.position;
    for (let i = 0; i <= 180; i++) { const h = H(i * 2, 0), v = horVec(h.alt, h.az, 55); arr.setXYZ(i, v.x, v.y, v.z); const q = horiz(i * 2, 0, lst, F.lat), w = horVec(q.alt, q.az, 56.5); arr2.setXYZ(i, w.x, w.y, w.z); }
    arr.needsUpdate = true; arr2.needsUpdate = true;
    S.bodies.forEach((o, i) => {
      const h = S.hz[i], vis = i < 2 || SKY.grahas; S.bo[i].visible = vis; S.bo[i].position.copy(horVec(h.alt, h.az, i === 0 ? 56 : i === 1 ? 54 : 55)); const sc2 = S.sel === i ? 1.5 + .2 * Math.sin(gt * 5) : 1; S.bo[i].scale.set(sc2, sc2, sc2);
      const tr = S.tr[i]; tr.visible = vis && SKY.trails;
      if (tr.visible) { const a = tr.geometry.attributes.position, span = i === 0 ? .5 : i === 1 ? .5 : 60; for (let k = 0; k <= 48; k++) { const jj = jd - span * (1 - k / 48), q = skyBodies1(o.n, jj), e = eclToEq(q.l, q.b), hh = horiz(e.ra, e.dec, i < 2 ? norm(gmstDeg(jj) + F.lon) : lst, F.lat), v = horVec(hh.alt, hh.az, 54.5); a.setXYZ(k, v.x, v.y, v.z); } a.needsUpdate = true; }
    });
    S.st.forEach(({ g, s }) => { const h = horiz(s.ra, s.dec, lst, F.lat); g.position.copy(horVec(h.alt, h.az, 58)); g.userData.h = h; });
    S.dome.material.opacity = .015 + .16 * b; S.grid.forEach(l => l.material.opacity = .02 + .45 * b); S.eqBand.material.opacity = .15 + .6 * b;
    S.obs.visible = !earthV; S.ground.scale.set(earthV ? 60 : 1, earthV ? 60 : 1, 1); S.ground.material.opacity = earthV ? .62 : .45;
    const sunAlt = S.hz[0].alt; AMB.intensity = sunAlt > -6 ? .6 : .35; STARS3.visible = sunAlt < -8 || !earthV;
    if (earthV) insideCam(horVec(S.pitch, S.yaw, 1), S.fov, 280);
    else { if (Math.abs(CAM.fov - 40) > .01) { CAM.fov = 40; CAM.updateProjectionMatrix(); } CAM.up.set(0, 1, 0); camOrbit(S.dist, S.el, S.az, 0, 5, 0, 280); }
  },
  draw(t, S) {
    title(t, 'D6', 'Your sky, tonight');
    const PL = S.F, earthV = SKY.view === 'earth', sunAlt = S.hz[0].alt;
    if (earthV && sunAlt > -12) { ctx.save(); ctx.globalAlpha = clamp((sunAlt + 12) / 18) * .45; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a5fae'); g.addColorStop(1, '#8fb6e6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (HAS3) {
      for (let a = 0; a < 360; a += 45) lbl(horVec(1, a, 60), COMPASS[a / 45], { size: 22, w: 700, color: '#F6C79A', dy: -16 });
      for (let i = 0; i < 12; i++) { const h = S.H(S.ay + i * 30 + 15, 0); if (h.alt > -2 || !earthV) lbl(horVec(h.alt, h.az, 55), RASHI[i], { size: 16, w: 600, color: C.goldSoft, dy: -16 }); }
      if (earthV) for (let i = 0; i < 27; i++) { const h = S.H(S.ay + (i + .5) * 360 / 27, 0); if (h.alt > -2) lbl(horVec(h.alt, h.az, 55), NAK[i], { size: 12, color: C.muted, dy: 16 }); }
      S.st.forEach(({ g, s }) => { if (g.userData.h.alt > 0 && (s.mag < 1.5 || s.ind)) lbl(wp(g), s.name + (s.ind ? ` · ${s.ind}` : ''), { size: 13, color: C.muted, align: 'left', dx: 10, dy: -10 }); });
      S.bodies.forEach((o, i) => { if ((i > 1 && !SKY.grahas) || (earthV && S.hz[i].alt < -1)) return; const q = lbl(wp(S.bo[i]), o.n, { size: 15, w: 600, color: o.c, dy: i < 2 ? 40 : 26 }); if (i === 1 && q.vis) faceOn(S.bo[1], { seed: 13 }); });
      if (S.sel != null) { const o = S.bodies[S.sel]; drawPath(poleArc(o.l, o.b, 54, (l, bb, R) => { const h = S.H(l, bb); return horVec(h.alt, h.az, R); }), '#FFFFFF', 2.5, [8, 6]); const h0 = S.H(o.l, 0), q = proj(horVec(h0.alt, h0.az, 55)); if (q.vis) { circle(q.x, q.y, 7, '#fff'); txt(`${fmtDeg(norm(o.l - S.ay))} sidereal`, q.x, q.y + 22, { size: 15, w: 700, color: '#fff' }); } }
      if (S.lagna != null) { const h = S.H(S.lagna, 0), q = proj(horVec(h.alt + .3, h.az, 55)); if (q.vis) { circle(q.x, q.y, 10, null, '#fff', 3); txt('Lagna rising', q.x, q.y - 26, { size: 16, w: 700, color: '#fff' }); } }
      if (!earthV) { lbl(V3(0, 12, 0), 'you are here', { size: 15, color: C.goldSoft }); lbl(horVec(40, S.az + 150, 58), 'celestial equator', { size: 14, color: '#9FE6F5' }); }
    }
    const X = 1100; panel(1070, 118, 470, 670, 1); ctx.save();
    const [ds, ts, off] = skyLocalStr(SKY.jd, SKY.tz);
    txt(`${PL.place} · ${ds}`, X, 150, { size: 17, color: C.muted, align: 'left' });
    txt(ts, X, 188, { size: 36, font: F.disp, color: C.gold, align: 'left' }); txt(off, X + 410, 188, { size: 14, color: C.muted, align: 'right' });
    if (SKY.rate) txt(`${SKY.rate > 0 ? '▶' : '◀'} ${speedLabel()} per second`, X + 410, 164, { size: 14, color: C.saffron, align: 'right', w: 600 });
    if (S.lagna != null) { const ls = norm(S.lagna - S.ay); txt('LAGNA', X, 232, { size: 14, color: C.muted, w: 600, align: 'left' }); txt(`${RASHI[Math.floor(ls / 30)]} ${fmtDeg(ls % 30)}`, X + 90, 232, { size: 20, font: F.disp, color: C.ink, align: 'left' }); }
    const m = S.hz[1], ms = norm(S.bodies[1].l - S.ay), inf = sidInfo(ms);
    txt('CHANDRA', X, 270, { size: 14, color: C.muted, w: 600, align: 'left' });
    txt(`${NAK[inf.n]} ${inf.pada} · ${RASHI[inf.r]}`, X + 90, 270, { size: 18, font: F.disp, color: C.ink, align: 'left' });
    let nb = null, nd = 999; BRIGHT_E.forEach(s => { const d = angSep(S.bodies[1].l, S.bodies[1].b, norm(s.l + S.ay - 23.857), s.b); if (d < nd) { nd = d; nb = s; } });
    txt(`Nearest bright star: ${nb.name}${nb.ind ? ` (${nb.ind})` : ''}, ${Math.round(nd)}°`, X, 298, { size: 15, color: C.muted, align: 'left' });
    txt('GRAHAS · TAP TO FLY', X, 338, { size: 14, color: C.muted, w: 600, align: 'left' }); ctx.restore(); followBtn(S, X + 230, 323); ctx.save(); if (S.sel == null) txt('where to look', X + 410, 338, { size: 14, color: C.muted, align: 'right' });
    if (S.sel != null) { const o = S.bodies[S.sel]; wrapTxt(explainBody(o, S.ay)[0] + ' Its slice of the zodiac is shaded when shading is on.', X, 632, 410, 18, { size: 13, color: o.c, align: 'left' }); }
    S.bodies.forEach((o, i) => {
      const y = 366 + i * 30, h = S.hz[i], up = h.alt > 0, dim = i > 1 && !SKY.grahas;
      if (S.sel === i) { rrect(X - 12, y - 14, 440, 28, 8); ctx.fillStyle = 'rgba(232,184,74,.2)'; ctx.fill(); }
      else if (ptr.x > X - 12 && ptr.x < X + 428 && ptr.y > y - 14 && ptr.y < y + 14) { rrect(X - 12, y - 14, 440, 28, 8); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); }
      hits.push({ id: 'g' + i, x: X - 12, y: y - 14, w: 440, h: 28 });
      circle(X + 7, y, 6, o.c); txt(o.n, X + 20, y, { size: 16, w: 600, color: dim ? C.dim : C.ink, align: 'left' });
      txt(RASHI[Math.floor(norm(o.l - S.ay) / 30)], X + 130, y, { size: 15, color: C.muted, align: 'left' });
      txt(up ? `${Math.round(h.alt)}° up, ${dirName(h.az)}` : 'below horizon', X + 410, y, { size: 15, color: up ? '#9FE3B9' : C.dim, align: 'right' });
    });
    if (S.sel == null) wrapTxt('Change the place in the sky controls below. Rahu and Ketu are calculated points, not visible objects.', X, 648, 410, 18, { size: 13, color: C.dim, align: 'left' });
    ctx.restore();
    button('lookE', 1100, 712, 190, 42, 'Look east', false, { size: 17 }); button('lookM', 1310, 712, 190, 42, 'Find Chandra', false, { size: 17 });
    tryIt(560, 790, earthV ? 'Drag to look · scroll to zoom · tap a graha' : 'Drag to turn · scroll to zoom · tap a graha', t, 19.5);
  }
});
