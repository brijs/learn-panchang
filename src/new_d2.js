/* ================= D10 · Two kinds of month ================= */
scene({
  name: 'Sidereal vs synodic month', dur: 50, optional: true, free: true, sky: 'months', terms: ['Nakshatra', 'Amavasya', 'Tithi', 'Masa'],
  cues: [[.8, "How long is a month for me? It depends on what you measure against."],
  [5, "Against the fixed stars, I go once around the sky, through all twenty-seven {nakshatras|नक्षत्र}, in about twenty-seven and a third days. That's the sidereal month."],
  [15, "But from new moon to new moon takes about twenty-nine and a half days. That's the synodic month, the one the tithis and the lunar months follow."],
  [24.5, "Why the difference? While I circle Earth, Earth is also travelling around the Sun, about twenty-seven degrees in that time."],
  [32.5, "So when I'm back in front of the same star, the Sun has moved on. I need about two more days to catch up and line up with it again."],
  [41.5, "Watch the two bars: the star bar fills first, and the new moon bar a couple of days later."]],
  sfx: [[.1, 'whoosh'], [15, 'chime'], [32.5, 'chord']],
  setup(S) {
    Object.assign(S, { az: 0, el: 62, dist: 31, anchor: null, doneSid: false, doneSyn: false });
    KEY.intensity = 0; AMB.intensity = .3;
    S.sun = sun3(.75, { intensity: 2.2 }); S.earth = earth3(.34); S.moon = moon3(.16, { earthshine: .6 });
    S.ghostE = earth3(.22); S.ghostM = moon3(.1, { earthshine: .8 });
    if (!HAS3) return;
    setOpacity(S.ghostE, .35); setOpacity(S.ghostM, .45);
    orbit(6, '#6FA8FF', .45, { dashed: true });
    S.mOrbit = orbit(1.45, '#DCE2FF', .5);
    S.nakG = add(new THREE.Group());
    for (let i = 0; i < 27; i++) sector(10.5, 11.4, i * 360 / 27 + .3, (i + 1) * 360 / 27 - .3, i % 2 ? '#3C4799' : '#2A3278', .8, { parent: S.nakG });
    S.lines = add(new THREE.Group());
  },
  down(S, id, p) {
    if (id === 'restart') { SKY.jd = S.anchor; skyRate(1); skyTZ(); skyToInputs(); sfx('pop'); return true; }
    dragStart(S, p, 'az', 'el'); return true;
  },
  move(S, p) { dragMove(S, p, -.25, .2, 15, 88); },
  up(S) { S.drag = null; },
  wheel(S, dy) { S.dist = clamp(S.dist * (1 + dy * .001), 12, 40); },
  update(t, S) {
    const jd = SKY.jd, p = pos(jd);
    // anchor to the new moon that starts the current lunation
    if (S.anchor == null || jd < S.anchor - .01 || jd > S.anchor + 31.5) {
      S.anchor = solve(fnEl, 0, jd - p.el / 12.19); if (S.anchor > jd + .01) S.anchor = solve(fnEl, 0, S.anchor - 29.53);
      const a = pos(S.anchor); S.l0 = a.ms; S.a0 = a;
      S.sidEnd = solve(fnMs, S.l0, S.anchor + 27.32); S.synEnd = solve(fnEl, 0, S.anchor + 29.53);
    }
    const d = jd - S.anchor, moved = norm(p.ms - S.l0);
    S.d = d; S.p = p;
    S.sidFrac = jd >= S.sidEnd ? 1 : moved / 360; S.synFrac = jd >= S.synEnd ? 1 : p.el / 360;
    if (jd >= S.sidEnd && !S.doneSid) { S.doneSid = true; sfx('chime'); } if (jd < S.sidEnd) S.doneSid = false;
    if (jd >= S.synEnd && !S.doneSyn) { S.doneSyn = true; sfx('bell'); } if (jd < S.synEnd) S.doneSyn = false;
    if (!HAS3) return;
    const ay = ayanamsa(jd); S.nakG.rotation.y = ay * DEG;
    const eL = norm(p.s + 180), e0 = norm(S.a0.s + 180);
    const E = posXZ(6, eL), E0 = posXZ(6, e0);
    S.earth.position.copy(E); S.ghostE.position.copy(E0);
    S.moon.position.copy(E).add(posXZ(1.45, p.m)); S.ghostM.position.copy(E0).add(posXZ(.9, S.a0.m));
    S.mOrbit.position.copy(E); S.moon.rotation.y = gt * .2;
    if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .6;
    S.E = E; S.E0 = E0; S.eL = eL; S.e0 = e0;
    if (!S.drag && t < 45) S.az += .01;
    camOrbit(S.dist, S.el, S.az, 0, -1, 0, 290);
  },
  draw(t, S) {
    title(t, 'D10', 'Sidereal vs synodic month');
    const p = S.p, ay = ayanamsa(SKY.jd);
    if (HAS3) {
      for (let i = 0; i < 27; i++) { const q = proj(posXZ(11.9, ay + (i + .5) * 360 / 27)); txt(NAK[i], q.x, q.y, { size: 12, color: C.muted }); }
      // direction to the starting star: parallel lines from where Earth was and where it is now
      const starDir = norm(S.l0 + ay);
      const from0 = proj(S.E0), to0 = proj(S.E0.clone().add(posXZ(4.2, starDir))), from1 = proj(S.E), to1 = proj(S.E.clone().add(posXZ(4.2, starDir)));
      ctx.setLineDash([6, 6]); lineTo2d(from0, to0, 'rgba(154,214,220,.45)', 2); lineTo2d(from1, to1, '#9AD6DC', 2.5); ctx.setLineDash([]);
      txt(`toward ${NAK[Math.floor(S.l0 / (360 / 27))]}'s stars`, to1.x, to1.y - 20, { size: 14, w: 600, color: '#9AD6DC' });
      // Sun direction from Earth now
      const s = proj(V3(0, 0, 0)); lineTo2d(from1, s, 'rgba(247,166,50,.6)', 2);
      const sq = proj(S.E.clone().multiplyScalar(.3)); txt('toward the Sun', sq.x, sq.y + 20, { size: 14, color: C.goldSoft });
      // arc Earth has travelled
      const pts = []; const span = wrap180(S.eL - S.e0); for (let k = 0; k <= 30; k++) pts.push(posXZ(6.6, S.e0 + span * k / 30));
      drawPath(pts, C.saffron, 3); const mid = proj(posXZ(7.3, S.e0 + span / 2)); txt(`Earth moved ${Math.abs(span).toFixed(0)}°`, mid.x, mid.y, { size: 15, w: 700, color: C.saffron });
      const g0 = proj(S.E0); txt('Earth at the last new moon', g0.x, g0.y + 30, { size: 13, color: C.muted });
      faceOn(S.moon, { seed: 20 });
    }
    // panel
    const X = 1100; panel(1070, 118, 470, 670, 1); ctx.save();
    const [ds, ts] = skyLocalStr(SKY.jd, SKY.tz);
    txt(`${ds} · ${ts}`, X, 150, { size: 20, font: F.disp, color: C.gold, align: 'left' });
    txt(`Day ${S.d.toFixed(1)} since the last new moon`, X, 180, { size: 15, color: C.ink, align: 'left' });
    const bar = (y, label, sub, frac, col, doneTxt) => {
      txt(label, X, y, { size: 16, w: 700, color: col, align: 'left' }); txt(sub, X + 410, y, { size: 14, color: C.muted, align: 'right' });
      rrect(X, y + 14, 410, 14, 7); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); rrect(X, y + 14, 410 * clamp(frac), 14, 7); ctx.fillStyle = col; ctx.fill();
      txt(frac >= 1 ? doneTxt : `${Math.round(frac * 100)}%`, X, y + 44, { size: 13, color: frac >= 1 ? col : C.muted, align: 'left', w: frac >= 1 ? 700 : 400 });
    };
    bar(222, 'Back at the same star', `sidereal · ${(S.sidEnd - S.anchor).toFixed(2)} days`, S.sidFrac, '#9AD6DC', '✓ completed: Chandra is back among the same stars');
    bar(290, 'Back to new moon', `synodic · ${(S.synEnd - S.anchor).toFixed(2)} days`, S.synFrac, C.gold, '✓ completed: new moon, Amavasya, again');
    // 27 nakshatra strip
    txt('NAKSHATRAS VISITED THIS LAP', X, 366, { size: 13, color: C.muted, w: 600, align: 'left' });
    const n0 = Math.floor(S.l0 / (360 / 27)), nNow = Math.floor(p.ms / (360 / 27)), steps = Math.min(27, Math.floor(norm(p.ms - n0 * 360 / 27) / (360 / 27)) + (S.sidFrac >= 1 ? 27 : 1));
    for (let k = 0; k < 27; k++) { const i = (n0 + k) % 27, on = k < steps || S.sidFrac >= 1; rrect(X + k * 15.2, 382, 12.5, 22, 3); ctx.fillStyle = i === nNow ? C.saffron : on ? 'rgba(154,214,220,.7)' : 'rgba(255,255,255,.08)'; ctx.fill(); }
    txt(`Now in ${NAK[nNow]} · about one nakshatra a day`, X, 424, { size: 14, color: C.ink, align: 'left' });
    moonDisc(X + 30, 480, 24, p.el); txt(`Tithi ${Math.floor(p.el / 12) + 1} of 30`, X + 70, 470, { size: 15, w: 600, color: C.ink, align: 'left' }); txt(`${p.el.toFixed(0)}° ahead of the Sun`, X + 70, 492, { size: 13, color: C.muted, align: 'left' });
    txt('WHY THEY DIFFER', X, 540, { size: 13, color: C.muted, w: 600, align: 'left' });
    wrapTxt('In one sidereal month Earth travels about 27° around the Sun, so the Sun appears to shift 27° against the stars. Chandra, moving about 13° a day, needs a little over 2 more days to catch it.', X, 564, 410, 19, { size: 14, color: C.ink, align: 'left' });
    txt('1/synodic = 1/sidereal − 1/year   →   1/29.53 ≈ 1/27.32 − 1/365.25', X, 650, { size: 13, color: C.goldSoft, align: 'left' });
    txt('In a year: ~13.4 laps of the stars, but only ~12.4 new moons.', X, 676, { size: 13, color: C.muted, align: 'left' });
    ctx.restore();
    button('restart', 1100, 710, 260, 42, 'Restart from new moon', false, { size: 17 });
    tryIt(560, 790, 'Drag to turn · scroll to zoom', t, 41.5);
  }
});
