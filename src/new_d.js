/* ================= D7 · Rahu, Ketu and eclipses ================= */
function findEclipses(jd0, n) {
  const out = []; let base = solve(fnEl, 0, jd0 - norm(pos(jd0).el) / 12.19);
  for (let k = 0; out.length < n && k < 80; k++) {
    for (const tgt of [0, 180]) {
      const j = solve(fnEl, tgt, base + k * 29.530589 + (tgt ? 14.765 : 0)); if (j < jd0 - .5) continue;
      const b = moonLat(j), ab = Math.abs(b); let type = null;
      if (tgt === 0 && ab < 1.55) type = 'Solar eclipse'; if (tgt === 180) type = ab < 1.0 ? 'Lunar eclipse' : ab < 1.55 ? 'Faint lunar eclipse' : null;
      if (type) out.push({ jd: j, type, b, node: Math.abs(wrap180(pos(j).s - grahaPos('Rahu', j).l)) < 90 ? 'Rahu' : 'Ketu' });
    }
  }
  return out.sort((a, b) => a.jd - b.jd).slice(0, n);
}
scene({
  name: 'Rahu, Ketu and eclipses', dur: 72, optional: true, free: true, sky: 'nodes', terms: ['Rahu', 'Ketu', 'Chhaya Graha', 'Amavasya', 'Purnima', 'Vishuva'],
  cues: [[.8, "Rahu and Ketu aren't bodies at all. They're two points in the sky."],
  [5, "My orbit is tilted about five degrees to the Sun's path. The two places where my path crosses it are the nodes: {Rahu|राहु}, where I cross going north, and {Ketu|केतु}, where I cross going south."],
  [16.5, "Most months I pass a little above or below the Sun, so nothing happens. But when a new or full moon falls near a node, the three of us line up."],
  [26, "At {Amavasya|अमावस्या} near a node, I cover the Sun: a solar eclipse. At {Purnima|पूर्णिमा} near a node, I slip into Earth's shadow: a lunar eclipse."],
  [36, "That's the story of Rahu and Ketu swallowing the Sun and Moon. They're {chhaya grahas|छाया ग्रह}, shadow planets, because they mark exactly where the shadows fall."],
  [46, "The nodes slide backwards around the zodiac once every eighteen point six years, about eighteen months in each rashi. That's why they are always shown moving backwards."],
  [55, "And the equinoxes? They're the same kind of crossing: where the Sun's path meets Earth's equator. Rahu and Ketu are to my path what the equinoxes are to the Sun's."],
  [65, "Run time forwards to watch eclipse seasons come and go, or tap an eclipse in the list to jump to it."]],
  sfx: [[.1, 'whoosh'], [5, 'chime'], [26, 'gong'], [55, 'chord']],
  setup(S) {
    Object.assign(S, { az: 35, el: 22, dist: 12, resetSeen: SKY.reset, cenSeen: SKY.center, ex: 3, eq: null, list: null, listJD: 0 });
    KEY.intensity = 0; AMB.intensity = .3;
    S.earth = earth3(.45);
    if (!HAS3) return;
    disc(4.3, '#E8B84A', .07); S.eclRim = orbit(4.3, '#E8B84A', .8);
    S.nodeG = add(new THREE.Group()); S.tiltG = new THREE.Group(); S.nodeG.add(S.tiltG);
    disc(3, '#AAB4FF', .1, { parent: S.tiltG }); orbit(3, '#C8D0FF', .9, { parent: S.tiltG });
    S.moon = moon3(.2, { earthshine: .45 }); S.sun = sun3(.42, { intensity: 2.2 });
    S.rahu = planet3(.14, '#9A7BE8', { glow: .9 }); S.ketu = planet3(.14, '#C09BF0', { glow: .9 });
    S.shadow = add(new THREE.Mesh(new THREE.CylinderGeometry(.36, .18, 4.2, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })));
    S.eqG = add(new THREE.Group()); S.eqG.rotation.x = -EPS * DEG; disc(4.6, '#7FD3E6', .05, { parent: S.eqG }); orbit(4.6, '#7FD3E6', .8, { parent: S.eqG });
    S.eqx = [glowSprite('#7FD3E6', .6, 1), glowSprite('#7FD3E6', .6, 1)]; S.eqx[0].position.copy(posXZ(4.6, 0)); S.eqx[1].position.copy(posXZ(4.6, 180));
  },
  wheel(S, dy) { S.dist = clamp(S.dist * (1 + dy * .001), 6, 26); },
  down(S, id, p) {
    if (id === 'exag') { S.ex = S.ex === 1 ? 3 : 1; sfx('pop'); return true; }
    if (id === 'eqt') { S.eq = !(S.eqG ? S.eqG.visible : S.eq); sfx('pop'); return true; }
    if (id && id.startsWith('ec')) { const e = S.list[+id.slice(2)]; SKY.jd = e.jd; skyRate(0); skyTZ(); skyToInputs(); sfx('chime'); return true; }
    dragStart(S, p, 'az', 'el'); return true;
  },
  move(S, p) { dragMove(S, p, -.25, .2, -60, 85); },
  up(S) { S.drag = null; },
  update(t, S) {
    if (S.resetSeen !== SKY.reset || S.cenSeen !== SKY.center) Object.assign(S, { az: 35, el: 22, dist: 12, resetSeen: SKY.reset, cenSeen: SKY.center });
    const jd = SKY.jd, p = pos(jd), om = grahaPos('Rahu', jd).l, mb = moonLat(jd);
    Object.assign(S, { jd, p, om, mb, ay: ayanamsa(jd) });
    if (!S.list || Math.abs(jd - S.listJD) > 20) { S.list = findEclipses(jd - 1, 7); S.listJD = jd; }
    if (!HAS3) return;
    const tilt = 5.145 * S.ex;
    S.nodeG.rotation.y = om * DEG; S.tiltG.rotation.x = tilt * DEG;
    S.moon.position.copy(eclVec(p.m, mb * S.ex, 3)); S.moon.rotation.y = gt * .2;
    S.sun.position.copy(posXZ(6.2, p.s));
    S.rahu.position.copy(posXZ(3, om)); S.ketu.position.copy(posXZ(3, om + 180));
    const away = posXZ(1, p.s + 180); S.shadow.position.copy(away).multiplyScalar(2.2);
    S.shadow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(away.x, away.y, away.z).normalize().negate());
    S.eqG.visible = S.eq ?? (t > 55); S.eqx.forEach(g => g.visible = S.eqG.visible);
    if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .3;
    if (!S.drag && t < 65) S.az += .02;
    camOrbit(S.dist, S.el, S.az, 0, -.2, 0, 280);
  },
  draw(t, S) {
    title(t, 'D7', 'Rahu, Ketu and eclipses');
    const el = S.p.el, sunNode = Math.min(Math.abs(wrap180(S.p.s - S.om)), Math.abs(wrap180(S.p.s - S.om - 180)));
    if (HAS3) {
      const r = proj(wp(S.rahu)), k = proj(wp(S.ketu)); ctx.setLineDash([8, 8]); lineTo2d(r, k, 'rgba(180,160,240,.9)', 2); ctx.setLineDash([]);
      txt('Rahu · राहु', r.x, r.y - 30, { size: 20, w: 700, color: '#C9B8FF' }); txt('north node', r.x, r.y + 26, { size: 14, color: C.muted });
      txt('Ketu · केतु', k.x, k.y - 30, { size: 20, w: 700, color: '#E0CCFF' }); txt('south node', k.x, k.y + 26, { size: 14, color: C.muted });
      faceOn(S.moon, { seed: 15 }); const mq = proj(wp(S.moon)); txt(`Chandra ${S.mb >= 0 ? '+' : '−'}${Math.abs(S.mb).toFixed(1)}°`, mq.x, mq.y + 32, { size: 15, w: 600, color: '#DCE2FF' });
      lbl(posXZ(4.55, S.p.s + 150), 'Sun’s path (ecliptic)', { size: 15, color: C.goldSoft });
      lbl(S.tiltG.localToWorld(posXZ(3.2, 250)), `Moon’s path, tilted ${S.ex === 1 ? '5.1°' : '5.1° (drawn ×3)'}`, { size: 15, color: '#C8D0FF' });
      const sq = proj(wp(S.sun)); if (sq.vis) txt('Surya', sq.x, sq.y + 44, { size: 15, w: 600, color: C.goldSoft });
      if (S.eqG.visible) { lbl(S.eqx[0].position, 'Spring equinox', { size: 15, w: 600, color: '#9FE6F5', dy: -18 }); lbl(S.eqx[1].position, 'Autumn equinox', { size: 15, w: 600, color: '#9FE6F5', dy: -18 }); lbl(S.eqG.localToWorld(posXZ(4.8, 110)), 'celestial equator (Earth’s equator on the sky)', { size: 14, color: '#9FE6F5' }); }
      if (Math.abs(wrap180(el - 180)) < 30) { const sh = proj(posXZ(3.2, S.p.s + 180)); txt('Earth’s shadow', sh.x, sh.y + 30, { size: 14, color: C.muted }); }
    }
    // syzygy inset: what an eclipse looks like right now
    const nearNew = Math.abs(wrap180(el)) < Math.abs(wrap180(el - 180)), dl = nearNew ? wrap180(el) : wrap180(el - 180), bx = 70, by = 560, bw = 330, bh = 230;
    panel(bx, by, bw, bh, fin(t, 16, 17)); ctx.save(); ctx.globalAlpha = fin(t, 16, 17);
    ctx.save(); rrect(bx, by, bw, bh, 16); ctx.clip(); const cx = bx + bw / 2, cy = by + 118, k = 70;
    ctx.strokeStyle = 'rgba(232,184,74,.35)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(bx, cy); ctx.lineTo(bx + bw, cy); ctx.stroke(); ctx.setLineDash([]);
    if (nearNew) { surya2d(cx, cy, .27 * k); circle(cx + dl * k, cy - S.mb * k, .26 * k, '#0c1030', 'rgba(220,226,255,.5)', 1.5); }
    else { circle(cx, cy, 1.25 * k, 'rgba(120,40,40,.25)'); circle(cx, cy, .7 * k, 'rgba(90,20,20,.6)'); const inU = Math.hypot(dl, S.mb) < .7; moonDisc(cx + dl * k, cy - S.mb * k, .26 * k, 180, inU ? '#E08A5A' : '#FFF4D6'); }
    ctx.restore();
    txt(nearNew ? 'Next to the Sun (new moon side)' : 'Earth’s shadow (full moon side)', bx + 16, by + 24, { size: 14, w: 600, color: C.ink, align: 'left' });
    txt(`${Math.abs(dl).toFixed(1)}° from ${nearNew ? 'new' : 'full'} moon · ${Math.abs(S.mb).toFixed(2)}° off the ecliptic`, bx + 16, by + bh - 16, { size: 13, color: C.muted, align: 'left' });
    ctx.restore();
    // panel
    const X = 1100; panel(1070, 118, 470, 670, 1); ctx.save();
    const [ds, ts] = skyLocalStr(S.jd, SKY.tz);
    txt(ds, X, 150, { size: 22, font: F.disp, color: C.gold, align: 'left' }); txt(ts, X + 410, 150, { size: 16, color: C.ink, align: 'right' });
    const rs = norm(S.om - S.ay), ks = norm(rs + 180);
    txt(`Rahu  ${RASHI[Math.floor(rs / 30)]} ${Math.floor(rs % 30)}°  ·  Ketu  ${RASHI[Math.floor(ks / 30)]} ${Math.floor(ks % 30)}°`, X, 184, { size: 16, w: 600, color: '#C9B8FF', align: 'left' });
    const season = sunNode < 18;
    txt('Sun’s distance from nearest node', X, 222, { size: 15, color: C.muted, align: 'left' }); txt(`${sunNode.toFixed(0)}°`, X + 410, 222, { size: 18, w: 700, color: season ? C.saffron : C.ink, align: 'right' });
    rrect(X, 238, 410, 10, 5); ctx.fillStyle = 'rgba(220,226,255,.15)'; ctx.fill(); rrect(X, 238, 410 * 18 / 90, 10, 5); ctx.fillStyle = 'rgba(242,140,40,.45)'; ctx.fill(); circle(X + 410 * clamp(sunNode / 90), 243, 8, season ? C.saffron : '#fff');
    txt(season ? 'Eclipse season: a new or full moon now can be an eclipse' : 'Outside eclipse season (needs about 18° or less)', X, 268, { size: 14, color: season ? C.saffron : C.muted, align: 'left' });
    txt('UPCOMING ECLIPSES · TAP TO JUMP', X, 306, { size: 13, color: C.muted, w: 600, align: 'left' });
    (S.list || []).forEach((e, i) => {
      const y = 334 + i * 34, [d2] = skyLocalStr(e.jd, SKY.tz), cur = Math.abs(e.jd - S.jd) < 1;
      if (cur || (ptr.x > X - 12 && ptr.x < X + 428 && ptr.y > y - 15 && ptr.y < y + 15)) { rrect(X - 12, y - 15, 440, 30, 8); ctx.fillStyle = cur ? 'rgba(232,184,74,.2)' : 'rgba(255,255,255,.06)'; ctx.fill(); }
      circle(X + 7, y, 7, e.type.startsWith('Solar') ? '#F7A632' : e.type.startsWith('Faint') ? '#8C7A9A' : '#E08A5A');
      txt(d2, X + 22, y, { size: 15, w: 600, color: C.ink, align: 'left' }); txt(e.type, X + 150, y, { size: 15, color: C.ink, align: 'left' }); txt(`near ${e.node}`, X + 410, y, { size: 14, color: C.muted, align: 'right' });
      hits.push({ id: 'ec' + i, x: X - 12, y: y - 15, w: 440, h: 30 });
    });
    wrapTxt('Visible from somewhere on Earth, not necessarily from your place. Solar eclipses fall on Amavasya, lunar eclipses on Purnima.', X, 588, 410, 19, { size: 13, color: C.dim, align: 'left' });
    ctx.restore();
    button('exag', 1100, 660, 200, 40, S.ex === 1 ? 'Exaggerate tilt' : 'True 5° tilt', false, { size: 15 });
    button('eqt', 1310, 660, 200, 40, 'Equator & equinoxes', S.eqG ? S.eqG.visible : S.eq, { size: 15 });
    txt('The nodes regress: once around the zodiac in 18.6 years.', X, 730, { size: 14, color: C.muted, align: 'left' });
    tryIt(740, 800, 'Drag to turn · Play to run time · tap an eclipse', t, 65);
  }
});

/* ================= D8 · Phases in motion ================= */
scene({
  name: 'Phases in motion', dur: 42, optional: true, free: true, sky: 'phase', terms: ['Tithi', 'Karana', 'Yoga', 'Nakshatra', 'Paksha'],
  cues: [[.8, "Let's watch the phases move."],
  [4, "The Sun hand and the Moon hand race around the zodiac. The Moon laps the Sun about once a month."],
  [10.5, "The angle between them is the phase. Each twelve degrees of it is one {tithi|तिथि}, and each six degrees is a {karana|करण}."],
  [19, "Add the two positions instead of subtracting them, and you get the {yoga|योग}. It runs a little faster, about fourteen degrees a day."],
  [28, "In the charts below, each rising line is a phase clock. When the Moon speeds up, the tithi steps get shorter."],
  [36, "Play, pause, change the speed, or tap the charts to jump in time."]],
  sfx: [[.1, 'whoosh'], [10.5, 'chime'], [19, 'chime']],
  setup(S) { S.cache = null; S.lastT = -1; },
  down(S, id, p) { if (id === 'strip') { SKY.jd = S.win0 + (p.x - 90) / 940 * S.span; skyTZ(); skyToInputs(); sfx('pop'); return true; } },
  update(t, S) {
    const jd = SKY.jd, p = pos(jd); S.p = p; S.jd = jd;
    const ti = Math.floor(p.el / 12); if (ti !== S.lastT) { if (S.lastT >= 0) sfx('tick'); S.lastT = ti; }
    S.span = 20; S.win0 = jd - 10;
    if (!S.cache || Math.abs(S.cache.jd - jd) > .5) {
      const smp = []; for (let k = 0; k <= 240; k++) { const j = S.win0 - .5 + k * (S.span + 1) / 240, q = pos(j); smp.push([j, q.el, q.yg, q.ms]); }
      const tb = []; let j = prevCross(fnEl, S.win0 - 1, 12, 12.19); while (j < S.win0 + S.span + 1) { tb.push(j); j = nextCross(fnEl, j + .01, 12, 12.19); }
      S.cache = { jd, smp, tb };
    }
    S.rates = { m: wrap180(pos(jd + .5).m - pos(jd - .5).m), s: wrap180(pos(jd + .5).s - pos(jd - .5).s) };
    camOrbit(10, 0, gt * 1.2);
  },
  draw(t, S) {
    title(t, 'D8', 'Phases in motion');
    const p = S.p, ay = ayanamsa(S.jd), ss = p.ss, ms = p.ms, cx = 320, cy = 290, R = 165;
    const A = l => (-90 + l) * DEG, P = (l, r) => ({ x: cx + Math.cos(A(l)) * r, y: cy + Math.sin(A(l)) * r });
    // dial
    circle(cx, cy, R + 34, 'rgba(16,21,54,.6)', 'rgba(232,184,74,.35)', 1.5);
    for (let i = 0; i < 27; i++) { const a = P(i * 360 / 27, R + 34), b = P(i * 360 / 27, R + 18); lineTo2d(a, b, 'rgba(160,170,230,.5)', 1); }
    for (let i = 0; i < 12; i++) { const q = P(i * 30 + 15, R + 50); txt(RASHI[i], q.x, q.y, { size: 13, color: '#F6C79A' }); const a = P(i * 30, R + 34), b = P(i * 30, R + 6); lineTo2d(a, b, 'rgba(242,140,40,.6)', 1.5); }
    // elongation arc (tithi phase)
    const shukla = p.el < 180;
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 10, A(ss), A(ss + p.el)); ctx.closePath(); ctx.fillStyle = shukla ? 'rgba(232,184,74,.22)' : 'rgba(140,150,230,.22)'; ctx.fill(); ctx.restore();
    for (let k = 1; k < 30; k++) { const a = P(ss + k * 12, R - 10), b = P(ss + k * 12, R - 26); lineTo2d(a, b, k <= Math.floor(p.el / 12) ? (shukla || k > 15 ? C.goldSoft : '#C7CBFF') : 'rgba(255,255,255,.18)', k % 5 ? 1.2 : 2.4); }
    // hands
    const hs = P(ss, R - 30), hm = P(ms, R - 50), hy = P(p.yg, R - 70);
    lineTo2d({ x: cx, y: cy }, hy, '#B69CFF', 3, fin(t, 19, 20)); if (t > 19) { circle(hy.x, hy.y, 9, '#B69CFF'); txt('Yoga', hy.x, hy.y - 18, { size: 14, w: 700, color: '#D9CCFF' }); }
    lineTo2d({ x: cx, y: cy }, hs, '#F7A632', 5); surya2d(hs.x, hs.y, 16);
    lineTo2d({ x: cx, y: cy }, hm, '#DCE2FF', 4); moonDisc(hm.x, hm.y, 15, p.el);
    moonDisc(cx, cy, 44, p.el); face(cx, cy, 43, { seed: 16 });
    txt(`Phase = Moon − Sun = ${p.el.toFixed(1)}°`, cx, cy + R + 70, { size: 20, w: 600, color: shukla ? C.goldSoft : '#C7CBFF' });
    txt(`Yoga = Sun + Moon = ${p.yg.toFixed(1)}°`, cx, cy + R + 94, { size: 16, color: '#D9CCFF', a: fin(t, 19, 20) });
    // readouts
    const X = 640, [ds, ts] = skyLocalStr(S.jd, SKY.tz);
    txt(`${ds} · ${ts}`, X, 120, { size: 22, font: F.disp, color: C.gold, align: 'left' });
    if (SKY.rate) txt(`${SKY.rate > 0 ? '▶' : '◀'} ${speedLabel()} per second`, X, 148, { size: 14, color: C.saffron, align: 'left', w: 600 });
    const row = (y, name, dev, val, frac, col, end, sub) => {
      txt(name, X, y, { size: 15, w: 600, color: C.muted, align: 'left' }); txt(dev, X + 104, y, { size: 16, font: F.disp, color: C.dim, align: 'left' });
      txt(val, X + 170, y, { size: 20, font: F.disp, color: C.ink, align: 'left' });
      rrect(X, y + 16, 400, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); rrect(X, y + 16, 400 * frac, 8, 4); ctx.fillStyle = col; ctx.fill();
      txt(sub, X, y + 40, { size: 13, color: C.muted, align: 'left' }); txt(end, X + 400, y + 40, { size: 13, color: C.muted, align: 'right' });
    };
    const hrs = j => { const h = (j - S.jd) * 24; return h < 1 ? `${Math.round(h * 60)} min left` : `${h.toFixed(1)} h left`; };
    const tn = Math.floor(p.el / 12) + 1, kI = Math.floor(p.el / 6), nI = Math.floor(ms / (360 / 27)), yI = Math.floor(p.yg / (360 / 27));
    const tEnd = nextCross(fnEl, S.jd, 12, 12.19), kEnd = nextCross(fnEl, S.jd, 6, 12.19), nEnd = nextCross(fnMs, S.jd, 360 / 27, 13.18), yEnd = nextCross(fnYg, S.jd, 360 / 27, 14.16);
    row(196, 'TITHI', 'तिथि', `${tn <= 15 ? 'Shukla' : 'Krishna'} ${tithiName(tn)}`, (p.el % 12) / 12, C.gold, hrs(tEnd), `phase ${p.el.toFixed(1)}° · steps of 12°`);
    row(268, 'KARANA', 'करण', karanaName(kI), (p.el % 6) / 6, '#F28C28', hrs(kEnd), 'half a tithi · steps of 6°');
    row(340, 'NAKSHATRA', 'नक्षत्र', `${NAK[nI]} ${Math.floor((ms % (360 / 27)) / (360 / 108)) + 1}`, (ms % (360 / 27)) / (360 / 27), '#9AD6DC', hrs(nEnd), `Moon ${ms.toFixed(1)}° sidereal · steps of 13°20′`);
    row(412, 'YOGA', 'योग', YOGA[yI], (p.yg % (360 / 27)) / (360 / 27), '#B69CFF', hrs(yEnd), `sum ${p.yg.toFixed(1)}° · steps of 13°20′`);
    txt(`Moon ${S.rates.m.toFixed(2)}°/day − Sun ${S.rates.s.toFixed(2)}°/day = phase grows ${(S.rates.m - S.rates.s).toFixed(2)}°/day`, X, 488, { size: 14, color: C.goldSoft, align: 'left' });
    txt(`→ this tithi takes about ${(12 / (S.rates.m - S.rates.s) * 24).toFixed(1)} hours · yoga grows ${(S.rates.m + S.rates.s).toFixed(2)}°/day`, X, 510, { size: 14, color: C.goldSoft, align: 'left' });
    // strip charts
    const x0 = 90, w = 940, tracks = [['Tithi · each ramp is one tithi (12° of phase)', 1, 12, C.gold], ['Karana · 6° of phase', 1, 6, '#F28C28'], ['Nakshatra · 13°20′ of Moon', 3, 360 / 27, '#9AD6DC'], ['Yoga · 13°20′ of Sun + Moon', 2, 360 / 27, '#B69CFF']];
    const X2 = j => x0 + (j - S.win0) / S.span * w;
    tracks.forEach(([name, idx, step, col], ti2) => {
      const y0 = 572 + ti2 * 62, h = 52;
      rrect(x0, y0, w, h, 6); ctx.fillStyle = 'rgba(16,21,54,.75)'; ctx.fill();
      ctx.save(); rrect(x0, y0, w, h, 6); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let prev = null;
      S.cache.smp.forEach(s => { const f = (s[idx] % step) / step, x = X2(s[0]), y = y0 + h - 4 - f * (h - 8); if (prev != null && f < prev - .5) { ctx.lineTo(x, y0 + 4); ctx.moveTo(x, y0 + h - 4); ctx.lineTo(x, y); } else ctx.lineTo(x, y); prev = f; }); ctx.stroke(); ctx.restore();
      txt(name, x0 + 8, y0 + 11, { size: 12.5, w: 600, color: col, align: 'left' });
    });
    // tithi boundaries & durations on first track
    const tb = S.cache.tb; ctx.save(); rrect(x0, 572, w, 52, 6); ctx.clip();
    for (let i = 0; i < tb.length; i++) { const x = X2(tb[i]); lineTo2d({ x, y: 572 }, { x, y: 624 }, 'rgba(232,184,74,.3)', 1); if (i + 1 < tb.length) { const hr = (tb[i + 1] - tb[i]) * 24, xm = (x + X2(tb[i + 1])) / 2; if (xm > x0 + 20 && xm < x0 + w - 10) txt(`${hr.toFixed(0)}h`, xm, 614, { size: 11, color: hr < 22 ? '#9FE3B9' : hr > 25 ? '#FFB4A6' : C.muted }); } }
    ctx.restore();
    const nx = X2(S.jd); lineTo2d({ x: nx, y: 566 }, { x: nx, y: 818 }, '#fff', 2); txt('now', nx, 558, { size: 13, w: 700, color: '#fff' });
    for (let d = -10; d <= 10; d += 5) txt(d === 0 ? '' : `${d > 0 ? '+' : ''}${d} d`, X2(S.jd + d), 830, { size: 12, color: C.dim });
    hits.push({ id: 'strip', x: x0, y: 566, w, h: 256 });
    // right: quick facts
    panel(1090, 118, 450, 400, fin(t, 3, 4)); ctx.save(); ctx.globalAlpha = fin(t, 3, 4); const Q = 1116;
    txt('HOW THE PHASES FIT', Q, 152, { size: 14, color: C.muted, w: 600, align: 'left' });
    [['Tithi', '(Moon − Sun) ÷ 12°', '30 a month'], ['Karana', '(Moon − Sun) ÷ 6°', '60 a month'], ['Nakshatra', 'Moon ÷ 13°20′', '27 a lap'], ['Yoga', '(Sun + Moon) ÷ 13°20′', '27 a cycle']].forEach(([a, b, c], i) => {
      txt(a, Q, 192 + i * 44, { size: 17, w: 600, color: C.ink, align: 'left' }); txt(b, Q + 110, 192 + i * 44, { size: 15, color: C.goldSoft, align: 'left' }); txt(c, Q + 400, 192 + i * 44, { size: 13, color: C.muted, align: 'right' });
    });
    wrapTxt('Tithi and karana depend only on the angle between Sun and Moon, so they are the same everywhere on Earth at the same instant. Only the local clock time differs.', Q, 386, 400, 21, { size: 14, color: C.muted, align: 'left' });
    ctx.restore();
    tryIt(1315, 548, 'Tap the charts to jump', t, 36);
  }
});

/* ================= D9 · The Panchang clock ================= */
const SAMVATSARA = ['Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angirasa','Shrimukha','Bhava','Yuva','Dhatu','Ishvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tarana','Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikriti','Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrit','Shobhakrit','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka','Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadi','Ananda','Rakshasa','Nala','Pingala','Kalayukti','Siddharthi','Raudri','Durmati','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya'];
const RITU = [['Vasanta', 'spring'], ['Grishma', 'summer'], ['Varsha', 'monsoon'], ['Sharad', 'autumn'], ['Hemanta', 'early winter'], ['Shishira', 'late winter']];
const devNum = n => String(n).replace(/\d/g, d => '०१२३४५६७८९'[d]);
function clockData(jd, pl, tz) {
  const loc = new Date((jd - 2440587.5) * 864e5 + tz * 3.6e6), y = loc.getUTCFullYear(), m = loc.getUTCMonth() + 1, d = loc.getUTCDate();
  const mid = Date.UTC(y, m - 1, d) / 864e5 + 2440587.5 - tz / 24;
  let sr = sunriseSet(mid, pl.lat, pl.lon, true), srMid = mid;
  if (sr && jd < sr) { srMid = mid - 1; sr = sunriseSet(srMid, pl.lat, pl.lon, true); }
  const ss = sr ? sunriseSet(srMid, pl.lat, pl.lon, false) : null, sr2 = sr ? sunriseSet(srMid + 1, pl.lat, pl.lon, true) : null;
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const r = panchang(jd, { lat: pl.lat, lon: pl.lon, jdLocalMidnight: mid, weekdayCivil: wd, gYear: y, gMonth: m });
  return { r, sr, ss, sr2, wd };
}
scene({
  name: 'The Panchang clock', dur: 38, optional: true, free: true, sky: 'clock', terms: ['Ghati', 'Pala', 'Prahara', 'Muhurta', 'Samvat', 'Masa', 'Ritu', 'Ayana'],
  cues: [[.8, "Here is time, told the Indian way."],
  [4.5, "The day starts at sunrise and is divided into sixty {ghatis|घटी} of twenty-four minutes. Each ghati has sixty {palas|पल}, and each pala sixty {vipalas|विपल}."],
  [15.5, "The outer ring glows for daylight. Day and night are each split into four {praharas|प्रहर}, or watches."],
  [22.5, "Around the dial, the Panchang fills in: the year in Vikram Samvat, the {masa|मास}, the {paksha|पक्ष}, tithi, vara, nakshatra, yoga and karana."],
  [31.5, "It's live and ticking. Change the date, time or place below to read any moment."]],
  sfx: [[.1, 'whoosh'], [15.5, 'bell']],
  setup(S) { S.cd = null; S.cjd = 0; S.lastPala = -1; },
  update(t, S) {
    const jd = SKY.jd, pl = SKY.place;
    if (!S.cd || Math.abs(jd - S.cjd) > 1 / 1440 || S.pl !== pl) { S.cd = clockData(jd, pl, SKY.tz); S.cjd = jd; S.pl = pl; }
    S.jd = jd;
    camOrbit(10, 0, gt * 1.2);
  },
  draw(t, S) {
    title(t, 'D9', 'The Panchang clock');
    const { r, sr, ss, sr2 } = S.cd, jd = S.jd;
    const cx = 400, cy = 480, R = 290;
    if (!sr) { txt('No sunrise at this place and date (polar day or night).', cx, cy, { size: 20, color: C.muted }); return; }
    const gh = (jd - sr) * 60, day = (ss - sr) * 60, full = (sr2 - sr) * 60;
    const ghati = Math.floor(gh), palaF = (gh - ghati) * 60, pala = Math.floor(palaF), vip = Math.floor((palaF - pala) * 60);
    if (pala !== S.lastPala) { if (S.lastPala >= 0 && SKY.rate && SKY.speed < .001) sfx('wood'); S.lastPala = pala; }
    const A = g => (-90 + g / full * 360) * DEG;
    // day / night ring
    ctx.save(); ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(cx, cy, R, A(0), A(day)); ctx.strokeStyle = 'rgba(247,166,50,.45)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R, A(day), A(full)); ctx.strokeStyle = 'rgba(70,80,160,.5)'; ctx.stroke(); ctx.restore();
    circle(cx, cy, R - 24, 'rgba(12,16,42,.85)', 'rgba(232,184,74,.5)', 2);
    for (let g = 0; g < 60; g++) { const a = (-90 + g * 6) * DEG, r1 = R - 24, r2 = r1 - (g % 5 ? 10 : 22); lineTo2d({ x: cx + Math.cos(a) * r1, y: cy + Math.sin(a) * r1 }, { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2 }, g % 5 ? 'rgba(244,216,145,.5)' : C.gold, g % 5 ? 1.2 : 2.5); if (g % 5 === 0) txt(devNum(g), cx + Math.cos(a) * (r1 - 42), cy + Math.sin(a) * (r1 - 42), { size: 22, font: F.disp, color: C.goldSoft }); }
    // praharas on the ring
    for (let k = 0; k < 8; k++) { const g0 = k < 4 ? k * day / 4 : day + (k - 4) * (full - day) / 4, g1 = k < 4 ? (k + 1) * day / 4 : day + (k - 3) * (full - day) / 4, am = (A(g0) + A(g1)) / 2; lineTo2d({ x: cx + Math.cos(A(g0)) * (R - 17), y: cy + Math.sin(A(g0)) * (R - 17) }, { x: cx + Math.cos(A(g0)) * (R + 17), y: cy + Math.sin(A(g0)) * (R + 17) }, 'rgba(255,255,255,.6)', 1.5); txt(`${k + 1}`, cx + Math.cos(am) * R, cy + Math.sin(am) * R, { size: 14, w: 700, color: '#fff' }); }
    const sunA = A(gh); surya2d(cx + Math.cos(sunA) * (R + 36), cy + Math.sin(sunA) * (R + 36), 14);
    txt('sunrise', cx, cy - R - 32, { size: 14, color: C.goldSoft }); const sa = A(day); txt('sunset', cx + Math.cos(sa) * (R + 40), cy + Math.sin(sa) * (R + 40) + 18, { size: 14, color: C.goldSoft });
    // hands (60-unit dial): ghati, pala, vipala
    const hand = (frac, len, w, col) => { const a = (-90 + frac * 360) * DEG; lineTo2d({ x: cx - Math.cos(a) * 18, y: cy - Math.sin(a) * 18 }, { x: cx + Math.cos(a) * len, y: cy + Math.sin(a) * len }, col, w); };
    hand(gh / 60, R - 120, 10, C.gold); hand(palaF / 60, R - 70, 5, '#DCE2FF'); hand(vip / 60, R - 44, 2, C.saffron);
    circle(cx, cy, 30, '#141A3F', C.gold, 2); moonDisc(cx, cy, 22, r.p.el);
    txt(`${devNum(ghati)} घटी  ${devNum(pala)} पल  ${devNum(vip)} विपल`, cx, cy + 92, { size: 24, font: F.disp, color: C.goldSoft });
    txt(`${ghati} ghati ${pala} pala ${vip} vipala since sunrise`, cx, cy + 122, { size: 15, color: C.muted });
    const prah = gh < day ? Math.floor(gh / (day / 4)) + 1 : 5 + Math.floor((gh - day) / ((full - day) / 4));
    txt(`Prahara ${Math.min(prah, 8)} of 8 · muhurta ${Math.min(30, Math.floor(gh / 2) + 1)} of 30`, cx, cy + 146, { size: 15, color: C.muted });
    // almanac panel
    const X = 800, W2 = 740, pa = fin(t, 1, 2); panel(770, 110, 780, 700, pa); ctx.save(); ctx.globalAlpha = pa;
    const [ds, ts, off] = skyLocalStr(jd, SKY.tz);
    txt(`${SKY.place.place} · ${ds} · ${ts} (${off})`, X, 144, { size: 16, color: C.muted, align: 'left' });
    const samv = SAMVATSARA[((r.shaka + 11) % 60 + 60) % 60];
    const sidSun = r.p.ss, utt = [9, 10, 11, 0, 1, 2].includes(Math.floor(sidSun / 30)), ritu = RITU[Math.floor(r.monthIdx / 2)];
    const fa = k => fin(t, 22.5 + k * .6, 23.2 + k * .6);
    const big = (y, k, v, dev, sub, a) => { ctx.save(); ctx.globalAlpha = pa * a; txt(k, X, y, { size: 13, w: 600, color: C.muted, align: 'left' }); txt(v, X + 150, y, { size: 26, font: F.disp, color: C.ink, align: 'left' }); if (dev) txt(dev, X + W2 - 10, y, { size: 22, font: F.disp, color: C.dim, align: 'right' }); if (sub) txt(sub, X + 150, y + 26, { size: 14, color: C.muted, align: 'left' }); ctx.restore(); };
    big(196, 'SAMVAT', `Vikram ${r.vikram} · Shaka ${r.shaka}`, `विक्रम ${devNum(r.vikram)}`, `${samv} samvatsara (60-year cycle, as used in the South)`, fa(0));
    big(262, 'AYANA · RITU', `${utt ? 'Uttarayana' : 'Dakshinayana'} · ${ritu[0]}`, '', `Sun ${utt ? 'on its northward' : 'on its southward'} half-year · ${ritu[1]}`, fa(1));
    big(328, 'MASA', r.amanta, '', r.purnimanta !== r.amanta ? `Amanta · ${r.purnimanta} in Purnimanta` : (r.adhika ? 'Adhika (leap) month' : 'Same in Amanta and Purnimanta'), fa(2));
    const tn = r.tithiNo;
    big(394, 'PAKSHA · TITHI', `${r.paksha} ${r.tithi}`, `${TITHI_DEV[(tn - 1) % 15] && tn !== 30 ? TITHI_DEV[(tn - 1) % 15] : 'अमावस्या'}`, `tithi ${tn} of 30 · ends ${skyLocalStr(r.tithiEnd, SKY.tz)[1]}`, fa(3));
    big(460, 'VARA', r.vara[0], '', `${r.vara[1]}${r.beforeSunrise ? ' · before sunrise, so still the previous day' : ''}`, fa(4));
    big(526, 'NAKSHATRA', `${r.nak} · pada ${r.pada}`, NAK_DEV[r.nakIdx], `ends ${skyLocalStr(r.nakEnd, SKY.tz)[1]}`, fa(5));
    big(592, 'YOGA · KARANA', `${r.yoga} · ${r.karana}`, '', `yoga ends ${skyLocalStr(r.yogaEnd, SKY.tz)[1]} · karana ends ${skyLocalStr(r.karanaEnd, SKY.tz)[1]}`, fa(6));
    big(658, 'RASHI', `Surya ${RASHI[r.sunRashi]} · Chandra ${RASHI[r.moonRashi]}`, '', 'Sun’s rashi also names the solar month (Saura masa)', fa(7));
    ctx.save(); ctx.globalAlpha = pa * fa(8);
    txt(`Sunrise ${skyLocalStr(sr, SKY.tz)[1]} · Sunset ${skyLocalStr(ss, SKY.tz)[1]} · day ${day.toFixed(1)} ghati, night ${(full - day).toFixed(1)}`, X, 730, { size: 15, color: C.goldSoft, align: 'left' });
    txt('1 ghati = 24 min · 1 pala = 24 s · 1 vipala = 0.4 s · 1 muhurta = 2 ghati · 1 prahara ≈ 7½ ghati', X, 760, { size: 13, color: C.dim, align: 'left' });
    ctx.restore(); ctx.restore();
  }
});
