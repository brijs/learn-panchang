/* ================= Scenes ================= */
const SCENES = [];
const scene = o => SCENES.push(o);
const TITHI_DEV = ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा'];
const tName = n => n === 30 ? 'Amavasya' : TITHI[(n - 1) % 15];

/* 1 ─ Welcome */
scene({
  name: 'Welcome', dur: 15, terms: ['Panchang', 'Chandra'],
  cues: [[1, "Namaste! I'm {Chandra|चन्द्र}, the Moon."], [5, "Want to see how India has kept time for thousands of years? Let's go."]],
  sfx: [[.2, 'bell'], [2.2, 'shimmer'], [6, 'chime']],
  setup(S) { S.moon = moon3(.72, { earthshine: .3 }); heroLight(); },
  update(t, S) {
    S.iv = lerp(S.iv ?? 1, P.started ? 0 : 1, .08); // start screen: lift Chandra and the title clear of the buttons
    camOrbit(lerp(13, 7, ease(t / 4)) + S.iv * 1.8, 3, Math.sin(gt * .2) * 4, 0, -.85 - S.iv * .6, 0);
    S.moon.rotation.y = gt * .12; const s = Math.max(.001, back((t - 1.2) / 1.3)); S.moon.scale.set(s, s, s);
  },
  draw(t, S) {
    const p = proj(wp(S.moon)), r = projR(wp(S.moon), .72);
    if (HAS3) { mandala(p.x, p.y, Math.max(r * 1.85, 60), ease(t / 6), gt * .03, .85); face(p.x, p.y, r * .95, { look: Math.sin(gt * .7) }); }
    const iv = S.iv || 0;
    txt('Panchang', 800, 622 - iv * 118, { size: 118 - iv * 22, font: F.disp, color: C.gold, a: Math.max(iv, fin(t, 4.5, 6)), glow: 'rgba(232,184,74,.5)' });
    txt('Keeping time the Indian way  ·  पञ्चाङ्ग', 800, 692 - iv * 108, { size: 30 - iv * 3, color: C.muted, a: Math.max(iv, fin(t, 6, 7.5)) });
  }
});

/* 2 ─ Two clocks */
scene({
  name: 'Two clocks in the sky', dur: 30, terms: ['Surya', 'Chandra'],
  cues: [[.8, "Up in the sky, two great clocks are always ticking: {Surya|सूर्य}, the Sun, and me."],
  [6.5, "The Sun's clock gives us the year and its seasons. My clock gives us the month, as I wax and wane."],
  [13.5, "Most calendars you use today watch only the Sun."],
  [18, "But the Hindu calendar is lunisolar. It watches both of us at once."],
  [24, "Try the switch below to compare them."]],
  sfx: [[.1, 'whoosh'], [13.5, 'wood'], [18, 'chord']],
  setup(S) {
    S.mode = null; KEY.intensity = 0; AMB.intensity = .15;
    S.earth = earth3(.32); S.moon = moon3(.17, { earthshine: .45 }); S.sun = sun3(.34, { intensity: 2.2 });
    orbit(3, '#F7A632', .5, { dashed: true }); S.mo = orbit(1.4, '#C8D0FF', .55, { dashed: true });
  },
  down(S, id) { if (id === 'solar' || id === 'luni') { S.mode = id; sfx('pop'); return true; } },
  update(t, S) {
    const mode = S.mode || (t < 13 ? 'both' : t < 18 ? 'solar' : 'luni'); S.m = mode;
    S.sun.position.copy(posXZ(3, t * 10)); S.moon.position.copy(posXZ(1.4, t * 60));
    if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .5;
    setOpacity(S.moon, mode === 'solar' ? .25 : 1); setOpacity(S.mo, mode === 'solar' ? .25 : 1);
    camOrbit(10.5, 40, 12 * Math.sin(gt * .08), 0, -1.9, 0);
  },
  draw(t, S) {
    title(t, 2, 'Two clocks in the sky');
    const mode = S.m, ps = proj(wp(S.sun)), pm = proj(wp(S.moon));
    txt('Surya · the year', ps.x, ps.y - 80, { size: 22, color: C.goldSoft, a: fin(t, 6.5, 7.5) });
    txt('Chandra · the month', pm.x, pm.y - 40, { size: 22, color: '#DDE2FF', a: fin(t, 9, 10) * (mode === 'solar' ? .3 : 1) });
    if (HAS3) faceOn(S.moon, { seed: 1, k: 1 });
    const y0 = 640, x0 = 290, w = 1020;
    if (t > 12) {
      ctx.save(); ctx.globalAlpha = fin(t, 12, 13);
      if (mode !== 'luni') {
        for (let i = 0; i < 12; i++) { const x = x0 + i * w / 12; rrect(x + 3, y0, w / 12 - 6, 46, 8); ctx.fillStyle = 'rgba(247,166,50,.2)'; ctx.fill(); ctx.strokeStyle = 'rgba(247,166,50,.6)'; ctx.stroke(); txt(MONTHS_EN_ABBR[i], x + w / 24, y0 + 25, { size: 20, color: C.goldSoft }); }
        txt('Solar calendar: 12 months of fixed length, tied only to the Sun', 800, y0 - 26, { size: 22, color: C.muted });
      } else {
        rrect(x0, y0 + 42, w, 8, 4); ctx.fillStyle = 'rgba(247,166,50,.55)'; ctx.fill();
        MONTHS.forEach((n, i) => { const x = x0 + i * w / 12 + w / 24; moonDisc(x, y0 + 12, 13, 180); txt(n, x, y0 + 74, { size: 15.5, color: '#DDE2FF' }); });
        txt('Lunisolar: months follow the Moon, the year stays with the Sun', 800, y0 - 30, { size: 22, color: C.muted });
      }
      ctx.restore();
      button('solar', 520, 752, 260, 46, 'Solar only', mode === 'solar');
      button('luni', 820, 752, 260, 46, 'Lunisolar', mode === 'luni');
    }
  }
});

/* 3 ─ Five limbs (3D lotus) */
const LIMBS = [['तिथि', 'Tithi', 'lunar day'], ['वार', 'Vara', 'weekday'], ['नक्षत्र', 'Nakshatra', 'lunar mansion'], ['योग', 'Yoga', 'Sun + Moon sum'], ['करण', 'Karana', 'half a tithi']];
function petal(L, Wd, color, op, parent) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(Wd * .9, L * .25, Wd * .7, L * .8, 0, L); s.bezierCurveTo(-Wd * .7, L * .8, -Wd * .9, L * .25, 0, 0);
  const g = new THREE.ShapeGeometry(s, 24); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.pow(x / Wd, 2) * .35 * Wd - Math.sin(y / L * PI) * .08); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: .25, roughness: .55, side: THREE.DoubleSide, transparent: true, opacity: op }));
  const pts = s.getPoints(30).map(v => new THREE.Vector3(v.x, v.y, Math.pow(v.x / Wd, 2) * .35 * Wd - Math.sin(v.y / L * PI) * .08 + .004));
  m.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xE8B84A, transparent: true, opacity: .9 })));
  parent.add(m); return m;
}
scene({
  name: 'Five limbs of time', dur: 25, terms: ['Panchang', 'Pancha', 'Anga', 'Tithi', 'Vara', 'Nakshatra', 'Yoga', 'Karana'],
  cues: [[.8, "The almanac that tracks our two clocks is called the {Panchang|पञ्चाङ्ग}."],
  [5.5, "{Pancha|पञ्च} means five, and {anga|अङ्ग} means limb. So Panchang means five limbs of time."],
  [11.5, "{Tithi|तिथि}, the lunar day. {Vara|वार}, the weekday. {Nakshatra|नक्षत्र}, my star mansion. {Yoga|योग}, and {Karana|करण}."],
  [19.5, "Together, they describe any moment. Tap a petal to peek inside."]],
  sfx: [[.1, 'whoosh'], [12, 'bell'], [13.6, 'bell'], [15.2, 'bell'], [16.7, 'bell'], [17.8, 'bell']],
  setup(S) {
    S.sel = -1; KEY.position.set(2, 5, 3); KEY.intensity = 1.1; AMB.intensity = .5;
    if (!HAS3) return;
    const lotus = S.lotus = add(new THREE.Group());
    const pad = new THREE.Mesh(new THREE.CircleGeometry(2.0, 64, .2, TAU - .4), new THREE.MeshStandardMaterial({ color: 0x2f7a55, transparent: true, opacity: .4, side: THREE.DoubleSide, roughness: .8 }));
    pad.rotation.x = -PI / 2; pad.position.y = -.06; lotus.add(pad);
    S.hinges = []; S.inner = []; S.petals = [];
    for (let i = 0; i < 5; i++) {
      const pv = new THREE.Group(); pv.rotation.y = -i * TAU / 5; lotus.add(pv);
      const h = new THREE.Group(); h.position.z = .18; pv.add(h); S.hinges.push(h); S.petals.push(petal(1.6, .75, 0xE86A92, .93, h));
      const pv2 = new THREE.Group(); pv2.rotation.y = -i * TAU / 5 - TAU / 10; lotus.add(pv2);
      const h2 = new THREE.Group(); h2.position.z = .12; pv2.add(h2); S.inner.push(h2); petal(1.05, .5, 0xF7B6CB, .95, h2);
    }
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(.24, .28, .16, 32), new THREE.MeshStandardMaterial({ color: 0xE8B84A, emissive: 0x6b4a10, roughness: .4 })); pod.position.y = .08; lotus.add(pod);
    S.moon = moon3(.34, { earthshine: .4 }); S.moon.position.set(0, 1.0, 0);
  },
  down(S, id) { if (id && id.startsWith('petal')) { S.sel = +id.slice(5); sfx('chime'); speakWord(LIMBS[S.sel][1], LIMBS[S.sel][0]); return true; } },
  update(t, S) {
    camOrbit(6.6, 34, gt * 5, 0, .45, 0);
    if (!HAS3) return;
    const opens = [12, 13.6, 15.2, 16.7, 17.8];
    S.o = S.hinges.map((h, i) => { const o = S.sel >= 0 ? 1 : back((t - opens[i]) / .9); h.rotation.x = lerp(.12, 1.18, o); S.petals[i].material.color.set(S.sel === i ? 0xF28C28 : 0xE86A92); S.petals[i].material.emissive.set(S.sel === i ? 0xF28C28 : 0xE86A92); return o; });
    const oi = S.sel >= 0 ? 1 : fin(t, 11, 18); S.inner.forEach(h => h.rotation.x = lerp(.08, .72, oi));
    S.moon.position.y = 1.0 + Math.sin(gt * 1.5) * .05; S.moon.rotation.y = gt * .2;
  },
  draw(t, S) {
    title(t, 3, 'Five limbs of time');
    txt('पञ्च  +  अङ्ग', 800, 118, { size: 52, font: F.disp, color: C.gold, a: fin(t, 5.5, 6.5) });
    txt('five   +   limb   =   Panchang', 800, 168, { size: 26, color: C.muted, a: fin(t, 7, 8) });
    if (!HAS3) return;
    faceOn(S.moon, { seed: 2 });
    S.petals.forEach((m, i) => {
      const o = S.o[i]; if (o < .5) return; const a = fin(o, .5, 1);
      const tip = m.localToWorld(new THREE.Vector3(0, 1.75, .2)); tip.y += .35; const q = proj(tip);
      txt(LIMBS[i][0], q.x, q.y - 34, { size: 30, font: F.disp, color: S.sel === i ? C.saffron : C.gold, a });
      txt(LIMBS[i][1], q.x, q.y, { size: 25, w: 600, color: C.ink, a });
      txt(LIMBS[i][2], q.x, q.y + 27, { size: 18, color: C.muted, a });
      hits.push({ id: 'petal' + i, x: q.x - 90, y: q.y - 60, w: 180, h: 110 });
      const mid = proj(m.localToWorld(new THREE.Vector3(0, .9, 0))); hitCircle('petal' + i, mid.x, mid.y, 55);
    });
    if (S.sel >= 0) { const k = LIMBS[S.sel][1]; panel(300, 742, 1000, 70); txt(`${LIMBS[S.sel][0]}  ${k}: ${TERMS[k][1]}`, 800, 777, { size: 20, color: C.ink }); }
    else tryIt(800, 780, 'Tap a petal', t, 20);
  }
});

/* 4 ─ Tithi */
const OA = 2.7, OE = .2, OTP = 300;
const rOrb = th => OA * (1 - OE * OE) / (1 + OE * Math.cos((th - OTP) * DEG));
function tithiHours(th) { const nu = (th - OTP) * DEG, e = .0549; const w = 13.176 * Math.pow(1 + e * Math.cos(nu), 2) / Math.pow(1 - e * e, 1.5); return 12 / (w - .9856) * 24; }
function wedgeGeo(a0, a1, rin, extra) {
  const pos = [], n = 6, p = (r, th) => [r * Math.cos(th * DEG), 0, -r * Math.sin(th * DEG)];
  for (let k = 0; k < n; k++) { const t0 = a0 + (a1 - a0) * k / n, t1 = a0 + (a1 - a0) * (k + 1) / n; const A = p(rin, t0), B = p(rin, t1), Cc = p(rOrb(t1) + extra, t1), D = p(rOrb(t0) + extra, t0); pos.push(...A, ...Cc, ...B, ...A, ...D, ...Cc); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return g;
}
scene({
  name: 'Tithi, the lunar day', dur: 54, terms: ['Tithi', 'Paksha', 'Shukla', 'Krishna', 'Amavasya', 'Purnima'],
  cues: [[.8, "{Tithi|तिथि} is the heart of the Panchang."],
  [4, "Picture the Sun and me lined up together. That's {Amavasya|अमावस्या}, the new moon."],
  [9.5, "Each day I race ahead. Every time I gain twelve more degrees on the Sun, one tithi is complete."],
  [17, "Fifteen tithis as I grow brighter: {Shukla Paksha|शुक्ल पक्ष}, the bright half, ending at {Purnima|पूर्णिमा}, the full moon."],
  [25.5, "Then fifteen more as I fade: {Krishna Paksha|कृष्ण पक्ष}, the dark half, back to Amavasya."],
  [33, "But my orbit is an ellipse, not a circle. Close to Earth I speed up; far away I slow down."],
  [40, "So a tithi follows my real speed each day. It can last anywhere from about twenty to twenty-six hours."],
  [47.5, "Go ahead. Drag me around my orbit."]],
  sfx: [[.1, 'whoosh'], [33, 'chord']],
  setup(S) {
    S.e = null; S.ea = 0; S.last = -1; S.drag = false; KEY.intensity = 0; AMB.intensity = .12;
    S.earth = earth3(.36); S.sun = sun3(1, { intensity: 2.4 }); S.sun.position.set(-12, 0, 0);
    S.moon = moon3(.27, { earthshine: .5 });
    orbit(rOrb, '#DCE2FF', .6);
    if (!HAS3) return;
    S.w = []; for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(wedgeGeo(180 + i * 12, 180 + (i + 1) * 12, .55, .42), new THREE.MeshBasicMaterial({ color: 0xE8B84A, transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false })); m.position.y = -.01; add(m); S.w.push(m); }
    const seg = []; for (let i = 0; i < 30; i++) { const th = 180 + i * 12, r = rOrb(th) + .42; seg.push(new THREE.Vector3(.55 * Math.cos(th * DEG), 0, -.55 * Math.sin(th * DEG)), new THREE.Vector3(r * Math.cos(th * DEG), 0, -r * Math.sin(th * DEG))); }
    add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: 0xE8B84A, transparent: true, opacity: .3 })));
  },
  down(S, id, p) { const q = proj(wp(S.moon)); if (Math.hypot(p.x - q.x, p.y - q.y) < 70 || id === 'orbit') { S.drag = true; this.move(S, p); return true; } },
  move(S, p) { if (!S.drag) return; const h = planeHit(p); if (!h) return; const th = Math.atan2(-h.z, h.x) / DEG; S.e = (((th - 180) % 360) + 360) % 360; },
  up(S) { S.drag = false; },
  update(t, S, dt) {
    if (S.e == null && t >= 9.5) { const th = 180 + S.ea; S.ea = (S.ea + dt * 12 * Math.pow(1 + OE * Math.cos((th - OTP) * DEG), 2) / 1.02) % 360; }
    const e = S.cur = S.e ?? S.ea, th = 180 + e;
    S.moon.position.copy(posXZ(rOrb(th), th)); S.moon.rotation.y = gt * .1;
    if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .4;
    const ti = Math.floor(e / 12) % 30;
    if (ti !== S.last) { if (S.last >= 0) sfx(ti === 15 ? 'shimmer' : ti === 0 ? 'bell' : 'tick'); S.last = ti; }
    if (S.w) S.w.forEach((m, i) => { const sh = i < 15; m.material.color.set(sh ? 0xE8B84A : 0x8C96E6); m.material.opacity = (i === ti ? .55 : i < ti ? .2 : .05) * fin(t, 9, 11); });
    camOrbit(10, 46, -6 + Math.sin(gt * .07) * 6, 0, -.3, 0, 230);
  },
  draw(t, S) {
    title(t, 4, 'Tithi · the lunar day');
    const e = S.cur || 0, ti = Math.floor(e / 12) % 30, th = 180 + e;
    if (HAS3) {
      const ra = fin(t, 9, 11);
      for (let i = 0; i < 30; i++) { const a = 180 + i * 12 + 6, q = proj(posXZ(rOrb(a) + .8, a)); txt(String(i % 15 + 1), q.x, q.y, { size: 16, color: i === ti ? C.goldSoft : i < 15 ? 'rgba(244,216,145,.75)' : 'rgba(190,196,255,.75)', a: ra, w: i === ti ? 700 : 400 }); }
      const pa = fin(t, 33, 34.5);
      if (pa > 0) {
        const pp = proj(posXZ(rOrb(OTP) + 1.9, OTP)), ap = proj(posXZ(rOrb(OTP + 180) + 1.7, OTP + 180));
        txt('Perigee · closest · fastest', pp.x, pp.y, { size: 18, w: 600, color: '#9FE3B9', a: pa }); txt('Apogee · farthest · slowest', ap.x, ap.y, { size: 18, w: 600, color: '#FFB4A6', a: pa });
      }
      const q = proj(wp(S.moon)); faceOn(S.moon, { seed: 3 });
      if (t > 47.5 && S.e == null) { ctx.save(); ctx.globalAlpha = .6 + .4 * Math.sin(gt * 5); circle(q.x, q.y, projR(wp(S.moon), .27) + 14, null, C.saffron, 3); ctx.restore(); }
      const sp = proj(wp(S.sun)); txt('Sunlight →', Math.max(70, sp.x + 60), sp.y - 70, { size: 18, color: C.goldSoft, a: .8 });
      hits.push({ id: 'orbit', x: 60, y: 120, w: 1000, h: 700 });
    }
    // panel
    const pa = fin(t, 4, 5), X = 1090, n = ti + 1;
    panel(1060, 118, 480, 690, pa);
    ctx.save(); ctx.globalAlpha = pa;
    txt('TITHI', X, 160, { size: 17, color: C.muted, align: 'left', w: 600 });
    txt(String(n), X, 228, { size: 92, font: F.disp, color: C.gold, align: 'left' });
    txt('of 30', X + (n > 9 ? 112 : 64), 248, { size: 24, color: C.muted, align: 'left' });
    txt(tName(n), X, 316, { size: 40, font: F.disp, color: C.ink, align: 'left' });
    txt(n === 30 ? 'अमावस्या' : TITHI_DEV[(n - 1) % 15], X + 420, 316, { size: 26, font: F.disp, color: C.dim, align: 'right' });
    txt(n <= 15 ? 'Shukla Paksha · bright half' : 'Krishna Paksha · dark half', X, 360, { size: 22, color: n <= 15 ? C.goldSoft : '#C7CBFF', align: 'left' });
    txt(`Moon ahead of Sun by ${Math.round(e)}°`, X, 396, { size: 20, color: C.muted, align: 'left' });
    for (let i = 0; i < 30; i++) { rrect(X + i * 14, 424, 11, 20, 3); ctx.fillStyle = i === ti ? C.saffron : i < 15 ? 'rgba(232,184,74,.5)' : 'rgba(150,160,230,.45)'; ctx.fill(); }
    txt('1 tithi = 12°   ·   30 × 12° = 360°', X, 470, { size: 19, color: C.goldSoft, align: 'left', a: fin(t, 10, 11) });
    // speed gauge
    const ga = fin(t, 33, 34.5);
    if (ga > 0) {
      ctx.globalAlpha = pa * ga; const hrs = tithiHours(th);
      txt('THIS TITHI LASTS ABOUT', X, 520, { size: 16, color: C.muted, align: 'left', w: 600 });
      txt(`${hrs.toFixed(1)} hours`, X, 560, { size: 38, font: F.disp, color: hrs < 23 ? '#9FE3B9' : hrs > 25 ? '#FFB4A6' : C.ink, align: 'left' });
      const gx = X, gw = 420, k = clamp((hrs - 20) / 7);
      const g = ctx.createLinearGradient(gx, 0, gx + gw, 0); g.addColorStop(0, '#5CC98A'); g.addColorStop(.5, '#E8B84A'); g.addColorStop(1, '#E2553F');
      rrect(gx, 594, gw, 10, 5); ctx.fillStyle = g; ctx.fill(); circle(gx + k * gw, 599, 10, '#fff', C.night, 3);
      txt('~20 h · near Earth', gx, 626, { size: 15, color: C.dim, align: 'left' }); txt('far · ~26 h', gx + gw, 626, { size: 15, color: C.dim, align: 'right' });
    }
    ctx.globalAlpha = pa;
    moonDisc(X + 40, 716, 36, e); txt('As seen from Earth', X + 96, 704, { size: 18, color: C.ink, align: 'left' }); txt(e < 180 ? 'waxing' : 'waning', X + 96, 730, { size: 16, color: C.muted, align: 'left' });
    ctx.restore();
    tryIt(560, 790, 'Drag Chandra around the orbit', t, 47.5);
  }
});

/* 5 ─ Vara */
const PLAN = [['Shani', '#8C9BE0', 'Saturn', '29.5 years', 'शनि'], ['Guru', '#E9C27A', 'Jupiter', '11.9 years', 'गुरु'], ['Mangala', '#E2553F', 'Mars', '1.9 years', 'मंगल'], ['Surya', '#F7A632', 'Sun', '1 year', 'सूर्य'], ['Shukra', '#F3D7EC', 'Venus', '225 days*', 'शुक्र'], ['Budha', '#5CC98A', 'Mercury', '88 days*', 'बुध'], ['Chandra', '#DDE2F7', 'Moon', '27.3 days', 'चन्द्र']];
const STAR_SEQ = [3, 6, 2, 5, 1, 4, 0];
const VARA_LIST = [['Ravivara', 'Sunday'], ['Somavara', 'Monday'], ['Mangalavara', 'Tuesday'], ['Budhavara', 'Wednesday'], ['Guruvara', 'Thursday'], ['Shukravara', 'Friday'], ['Shanivara', 'Saturday']];
scene({
  name: 'Vara, the weekday', dur: 42, terms: ['Vara', 'Graha', 'Hora'],
  cues: [[.8, "{Vara|वार} is the weekday. Seven days, named after the seven {grahas|ग्रह} you can see with your own eyes."],
  [7.5, "{Ravi|रवि} the Sun, {Soma|सोम} the Moon, {Mangala|मंगल}, {Budha|बुध}, {Guru|गुरु}, {Shukra|शुक्र}, and {Shani|शनि}."],
  [14, "Watched from Earth, each takes its own time to circle the sky. {Shani|शनि} needs about twenty-nine and a half years. I need just twenty-seven days."],
  [22, "Line them up from slowest to fastest. Each of the day's twenty-four {horas|होरा}, or hours, is ruled by the next one in line, so each new day starts three steps along."],
  [30.5, "Follow those steps and a seven-pointed star appears, giving the order of the week."],
  [35.5, "One more thing: the Hindu day begins at sunrise, not at midnight."]],
  sfx: [[.1, 'whoosh'], [30.5, 'chime'], [35.5, 'chime']],
  setup(S) {
    S.steps = null; S.sel = null; KEY.position.set(0, 6, 6); KEY.intensity = 1.1; AMB.intensity = .35;
    S.earth = earth3(.22);
    S.p = PLAN.map((p, i) => { const pos = posXZ(2.9, 90 + i * 360 / 7); const o = i === 3 ? sun3(.34, { light: false }) : i === 6 ? moon3(.22, { earthshine: .6 }) : planet3(i === 1 ? .32 : i === 0 ? .26 : .2, p[1], { ring: i === 0, bands: i === 1 }); o.position.copy(pos); return o; });
    orbit(2.9, '#E8B84A', .25, { dashed: true });
  },
  down(S, id) {
    if (id === 'step') { S.steps = ((S.steps ?? S.auto) + 1) % 8; sfx('wood'); return true; }
    if (id && id.startsWith('pl')) { S.sel = +id.slice(2); sfx('chime'); speakWord(PLAN[S.sel][0], PLAN[S.sel][4]); return true; }
  },
  update(t, S) {
    S.auto = t < 30.5 ? 0 : Math.min(7, Math.floor((t - 30.5) / .6) + 1);
    S.p.forEach((o, i) => { o.rotation.y = gt * (.2 + i * .05); });
    camOrbit(9.4, 52, Math.sin(gt * .1) * 10, 0, -.35, 0, 300);
  },
  draw(t, S) {
    title(t, 5, 'Vara · the weekday');
    const steps = S.steps ?? S.auto, pts = S.p.map(o => proj(wp(o)));
    const named = t >= 7.5 ? Math.floor((t - 7.5) / .8) : -1;
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(232,184,74,.7)'; ctx.shadowBlur = 10;
    for (let k = 0; k < Math.min(steps, 7); k++) {
      const a = pts[STAR_SEQ[k]], b = pts[STAR_SEQ[(k + 1) % 7]];
      const q = (k === steps - 1 && S.steps == null) ? ease(((t - 30.5) % .6) / .6 + (t > 35 ? 1 : 0)) : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lerp(a.x, b.x, q), lerp(a.y, b.y, q)); ctx.stroke();
    }
    ctx.restore();
    PLAN.forEach((p, i) => {
      const q = pts[i], on = steps > 0 ? STAR_SEQ.slice(0, Math.min(steps + 1, 7)).includes(i) : STAR_SEQ.indexOf(i) <= named;
      if (i === 6 && HAS3) faceOn(S.p[6], { seed: 5, k: 1 });
      txt(p[0], q.x, q.y + 42, { size: 21, w: 600, color: on ? C.ink : C.muted });
      txt(p[3], q.x, q.y + 66, { size: 16, color: C.goldSoft, a: fin(t, 14, 15) });
      hitCircle('pl' + i, q.x, q.y + 20, 50);
    });
    txt('Arranged from slowest (Shani) to fastest (Chandra), as seen from Earth', 520, 120, { size: 19, color: C.muted, a: fin(t, 14, 15) });
    // list
    const X = 1080, pa = fin(t, 1, 2); panel(1050, 118, 490, 400, pa);
    VARA_LIST.forEach((v, k) => {
      const on = steps > k || (steps === 0 && named >= k);
      txt(v[0], X, 158 + k * 50, { size: 27, font: F.disp, color: on ? C.gold : C.dim, align: 'left', a: pa });
      txt(v[1], X + 430, 160 + k * 50, { size: 18, color: on ? C.ink : C.dim, align: 'right', a: pa });
    });
    button('step', 1050, 532, 250, 44, steps >= 7 ? 'Start again' : 'Draw next line', false, { size: 19 });
    if (t > 14) wrapTxt('* Mercury and Venus stay near the Sun as seen from Earth, so the old texts used their own orbits.', 1316, 530, 224, 19, { size: 14, color: C.dim, align: 'left', a: fin(t, 14, 15) });
    if (S.sel != null) {
      const p = PLAN[S.sel]; panel(1050, 592, 490, 170);
      txt(`${p[4]}  ${p[0]}`, X, 630, { size: 30, font: F.disp, color: C.gold, align: 'left' });
      txt(`${p[2]} · once around the zodiac: ${p[3].replace('*', '')}`, X, 670, { size: 18, color: C.ink, align: 'left' });
      txt(`Gives its name to ${VARA_LIST[STAR_SEQ.indexOf(S.sel)][0]} (${VARA_LIST[STAR_SEQ.indexOf(S.sel)][1]})`, X, 702, { size: 18, color: C.muted, align: 'left' });
      if (S.sel === 4 || S.sel === 5) txt('Own orbit; from Earth it keeps pace with the Sun', X, 734, { size: 16, color: C.dim, align: 'left' });
    } else {
      const sa = fin(t, 35.5, 36.5);
      if (sa > 0) {
        ctx.save(); ctx.globalAlpha = sa; panel(1050, 592, 490, 170);
        ctx.save(); rrect(1050, 592, 490, 170, 16); ctx.clip();
        surya2d(1160, 735 - ease((t - 35.5) / 4) * 60, 30); ctx.fillStyle = '#10153a'; ctx.fillRect(1050, 735, 490, 40);
        ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(1050, 735); ctx.lineTo(1540, 735); ctx.stroke(); ctx.restore();
        txt('The day begins', 1240, 640, { size: 24, color: C.ink, align: 'left' }); txt('at sunrise', 1240, 676, { size: 24, w: 600, color: C.goldSoft, align: 'left' });
        txt('not at midnight', 1240, 710, { size: 17, color: C.muted, align: 'left' }); ctx.restore();
      } else tryIt(1295, 640, 'Tap a planet', t, 22);
    }
  }
});

/* 6 ─ Why only seven? */
const ROW = [['Surya', '#F7A632', 1], ['Chandra', '#DDE2F7', 1], ['Mangala', '#E2553F', 1], ['Budha', '#5CC98A', 1], ['Guru', '#E9C27A', 1], ['Shukra', '#F3D7EC', 1], ['Shani', '#8C9BE0', 1], ['Uranus', '#9AD6DC', 0], ['Neptune', '#4F6FD8', 0]];
scene({
  name: 'Why only seven? The Navagrahas', dur: 48, terms: ['Graha', 'Navagraha', 'Chhaya Graha', 'Rahu', 'Ketu', 'Jyotisha'],
  cues: [[.8, "Why only seven days? Because the ancient astronomers tracked what they could see."],
  [5.5, "The Sun, the Moon, Mars, Mercury, Jupiter, Venus and Saturn all shine to the naked eye. Uranus and Neptune need a telescope, so they were never counted."],
  [14.5, "In Sanskrit these bodies are called {grahas|ग्रह}: those that grasp, or influence. {Jyotisha|ज्योतिष} counts nine of them, the {Navagraha|नवग्रह}."],
  [23.5, "The last two are {Rahu|राहु} and {Ketu|केतु}. My path is tilted against the Sun's path, and they are the two points where the paths cross."],
  [33, "When the Sun and I meet at one of these points, an eclipse happens. The graha seems to grasp the light."],
  [39.5, "Rahu and Ketu are {chhaya grahas|छाया ग्रह}, shadow planets. With no body and no light to mark a day, they get no weekday, and the week keeps seven."]],
  sfx: [[.1, 'whoosh'], [14.5, 'chord'], [23.5, 'whoosh'], [34, 'gong'], [39.5, 'bell']],
  setup(S) {
    S.sel = null; KEY.position.set(0, 3, 8); KEY.intensity = 1.1; AMB.intensity = .35;
    if (!HAS3) return;
    S.A = add(new THREE.Group());
    S.row = ROW.map((p, i) => { const x = -5.6 + i * 1.4, o = i === 0 ? sun3(.36, { light: false, parent: S.A }) : i === 1 ? moon3(.24, { parent: S.A, earthshine: .7 }) : planet3(i === 4 ? .3 : i === 6 ? .26 : .19, p[1], { parent: S.A, ring: i === 6, bands: i === 4, glow: p[2] ? .6 : .1 }); o.position.set(x, .35 * Math.cos((i - 4) * .35), 0); return o; });
    setOpacity(S.row[7], .3); setOpacity(S.row[8], .3);
    S.Cg = add(new THREE.Group());
    S.earth = earth3(.3, { parent: S.Cg });
    disc(3.3, '#E8B84A', .07, { parent: S.Cg }); orbit(3.3, '#E8B84A', .7, { parent: S.Cg });
    S.tilt = new THREE.Group(); S.tilt.rotation.x = 16 * DEG; S.Cg.add(S.tilt);
    disc(2.2, '#AAB4FF', .09, { parent: S.tilt }); orbit(2.2, '#C8D0FF', .8, { parent: S.tilt });
    S.moonC = moon3(.17, { parent: S.tilt, earthshine: .5 }); S.sunC = sun3(.3, { parent: S.Cg, intensity: 2 });
    S.rahu = planet3(.12, '#8A6BD8', { parent: S.Cg, glow: .9 }); S.rahu.position.set(2.2, 0, 0);
    S.ketu = planet3(.12, '#8A6BD8', { parent: S.Cg, glow: .9 }); S.ketu.position.set(-2.2, 0, 0);
  },
  down(S, id) { if (id === 'rahu' || id === 'ketu' || id === 'graha') { S.sel = id; sfx('chime'); speakWord(id, { rahu: 'राहु', ketu: 'केतु', graha: 'ग्रह' }[id]); return true; } },
  update(t, S) {
    if (!HAS3) return;
    const aA = 1 - fin(t, 22.5, 23.8), aC = fin(t, 23.2, 24.8);
    setOpacity(S.A, aA); S.A.visible = aA > .01; S.Cg.visible = aC > .01; if (S.Cg.visible) setOpacity(S.Cg, aC);
    [7, 8].forEach(i => setOpacity(S.row[i], .3 * aA));
    S.row.forEach((o, i) => o.rotation.y = gt * .3);
    if (t < 23.5) camOrbit(10.5, 6, Math.sin(gt * .1) * 3, 0, .3, 0);
    else {
      camOrbit(8.2, 20, 28 + (t - 23.5) * 1.5, 0, -.25, 0);
      const ls = -15 + (t - 23.5) * 1.45; S.sunC.position.copy(posXZ(3.3, ls));
      S.moonC.position.copy(posXZ(2.2, (t - 34) * 36));
      if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .4;
    }
  },
  draw(t, S) {
    title(t, 6, 'Why only seven? The Navagrahas');
    if (HAS3 && t < 23.5) {
      const aA = 1 - fin(t, 22.5, 23.8);
      ctx.save(); ctx.globalAlpha = aA;
      S.row.forEach((o, i) => {
        const q = proj(wp(o)); const vis = ROW[i][2];
        txt(ROW[i][0], q.x, q.y + 58, { size: 19, w: 600, color: vis ? C.ink : C.dim, a: fin(t, 3, 4) });
        if (!vis) { txt('telescope only', q.x, q.y + 82, { size: 15, color: '#FFB4A6', a: fin(t, 10, 11) }); if (t > 11) lineTo2d({ x: q.x - 40, y: q.y - 36 }, { x: q.x + 40, y: q.y + 36 }, 'rgba(226,85,63,.8)', 3, fin(t, 11, 12)); }
      });
      const a = proj(wp(S.row[0])), b = proj(wp(S.row[6]));
      if (t > 5.5) { ctx.globalAlpha = aA * fin(t, 5.5, 6.5); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y - 70); ctx.lineTo(a.x, a.y - 85); ctx.lineTo(b.x, a.y - 85); ctx.lineTo(b.x, b.y - 70); ctx.stroke(); txt('visible to the naked eye → the seven weekday grahas', (a.x + b.x) / 2, a.y - 108, { size: 20, color: C.goldSoft }); }
      faceOn(S.row[1], { seed: 6 });
      ctx.restore();
      const ba = fin(t, 14.5, 15.5) * aA;
      if (ba > 0) {
        panel(260, 560, 1080, 220, ba); ctx.save(); ctx.globalAlpha = ba;
        txt('ग्रह', 380, 640, { size: 76, font: F.disp, color: C.gold });
        txt('Graha', 380, 712, { size: 26, w: 600, color: C.ink });
        txt('“That which grasps or influences”', 500, 612, { size: 28, font: F.disp, color: C.goldSoft, align: 'left' });
        wrapTxt('Jyotisha counts a graha by its influence, not its size. Nine are tracked, the Navagraha: the seven visible bodies, plus two shadow grahas, Rahu and Ketu.', 500, 660, 800, 30, { size: 20, color: C.ink, align: 'left' });
        ctx.restore(); hits.push({ id: 'graha', x: 260, y: 560, w: 1080, h: 220 });
      }
    }
    if (HAS3 && t >= 23.2) {
      const aC = fin(t, 23.2, 24.8); ctx.save(); ctx.globalAlpha = aC;
      const r = proj(wp(S.rahu)), k = proj(wp(S.ketu));
      ctx.setLineDash([8, 8]); lineTo2d(r, k, 'rgba(160,140,230,.8)', 2); ctx.setLineDash([]);
      txt('Rahu · राहु', r.x, r.y - 34, { size: 22, w: 600, color: '#C9B8FF' }); txt('north node', r.x, r.y + 30, { size: 15, color: C.muted });
      txt('Ketu · केतु', k.x, k.y - 34, { size: 22, w: 600, color: '#C9B8FF' }); txt('south node', k.x, k.y + 30, { size: 15, color: C.muted });
      hitCircle('rahu', r.x, r.y, 50); hitCircle('ketu', k.x, k.y, 50);
      const e1 = proj(posXZ(3.3, 110)), e2 = proj(S.tilt.localToWorld(posXZ(2.2, 250)));
      txt('Sun’s path (ecliptic)', e1.x, e1.y - 18, { size: 17, color: C.goldSoft }); txt('Moon’s path, tilted about 5° (exaggerated)', e2.x, e2.y + 26, { size: 17, color: '#C8D0FF' });
      faceOn(S.moonC, { seed: 7 });
      ctx.restore();
      // eclipse inset
      const ea = fin(t, 33, 34) * (1 - fin(t, 39, 40));
      if (ea > 0) {
        ctx.save(); ctx.globalAlpha = ea; panel(1180, 120, 360, 250);
        ctx.save(); rrect(1180, 120, 360, 250, 16); ctx.clip(); const cx = 1360, cy = 230, k2 = clamp((t - 33.3) / 3.2);
        surya2d(cx, cy, 44); circle(lerp(cx + 110, cx - 20, ease(k2 * 1.25)), cy, 46, '#0c1030'); ctx.restore();
        txt('Surya Grahan · solar eclipse', 1360, 338, { size: 18, w: 600, color: C.goldSoft }); ctx.restore();
      }
      const na = fin(t, 39.5, 40.5);
      if (na > 0) {
        panel(170, 700, 1260, 100, na); ctx.save(); ctx.globalAlpha = na;
        const names = ['Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'], cols = ['#F7A632', '#DDE2F7', '#E2553F', '#5CC98A', '#E9C27A', '#F3D7EC', '#8C9BE0', '#8A6BD8', '#8A6BD8'];
        names.forEach((n, i) => { const x = 250 + i * 138; circle(x, 732, 13, cols[i]); if (i > 6) circle(x, 732, 13, null, '#fff', 2); txt(n, x, 764, { size: 17, color: C.ink }); txt(i < 7 ? 'weekday' : 'shadow', x, 786, { size: 13, color: i < 7 ? C.goldSoft : '#C9B8FF' }); });
        ctx.restore();
      }
      if (S.sel === 'rahu' || S.sel === 'ketu') { panel(1180, 390, 360, 150); wrapTxt(TERMS[S.sel === 'rahu' ? 'Rahu' : 'Ketu'][1], 1200, 425, 320, 26, { size: 17, color: C.ink, align: 'left' }); }
    }
  }
});

/* 7 ─ Nakshatra */
const NAKR = rng(27);
const NAK_STARS = Array.from({ length: 27 }, () => Array.from({ length: 2 + Math.floor(NAKR() * 4) }, () => [NAKR() * 2 - 1, NAKR() * 2 - 1, NAKR()]));
scene({
  name: 'Nakshatra, the star mansions', dur: 44, terms: ['Nakshatra', 'Pada'],
  cues: [[.8, "Now look beyond us, at the fixed stars."],
  [4.5, "Ancient astronomers divided my path into twenty-seven {nakshatras|नक्षत्र}, or lunar mansions."],
  [11, "Each spans thirteen degrees and twenty minutes, and I spend about a day in each."],
  [17.5, "Every name means something. {Rohini|रोहिणी}, the red one, is the star Aldebaran. {Krittika|कृत्तिका}, the cutter, is the Pleiades. {Chitra|चित्रा}, the bright one, is Spica."],
  [29.5, "The nakshatra I'm in when you are born becomes your birth star."],
  [34.5, "Tap any star group to meet it, and hear its name."]],
  sfx: [[.1, 'whoosh'], [4.5, 'shimmer'], [29.5, 'chime']],
  setup(S) {
    S.sel = null; S.last = -1; KEY.position.set(-4, 5, 4); AMB.intensity = .3;
    S.earth = earth3(.3); S.moon = moon3(.2, { earthshine: .55 });
    if (!HAS3) return;
    const seg = 360 / 27; S.sec = []; S.st = [];
    for (let i = 0; i < 27; i++) {
      S.sec.push(sector(3.0, 4.1, i * seg, (i + 1) * seg, i % 2 ? '#28306E' : '#1E245A', .55));
      const mid = (i + .5) * seg, sp = [];
      NAK_STARS[i].forEach(([a, b, s]) => { const p = posXZ(3.55 + b * .32, mid + a * 4.5, .12 + s * .08); const g = glowSprite('#FFF4D6', .3 + s * .25, .9); g.position.copy(p); sp.push(g); });
      if (sp.length > 1) add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(sp.map(g => g.position.clone())), new THREE.LineBasicMaterial({ color: 0xF4D891, transparent: true, opacity: .35 })));
      S.st.push(sp);
    }
    orbit(3.0, '#E8B84A', .4); orbit(4.1, '#E8B84A', .4);
  },
  down(S, id) { if (id && id.startsWith('nak')) { S.sel = +id.slice(3); sfx('shimmer'); speakWord(NAK[S.sel], NAK_DEV[S.sel]); return true; } if (id === 'hear') { const i = S.curI; speakWord(NAK[i], NAK_DEV[i]); return true; } },
  update(t, S) {
    const lam = S.lam = t * 2.4 + 5;
    S.moon.position.copy(posXZ(2.45, lam)); S.moon.rotation.y = gt * .2;
    const moonI = Math.floor(((lam % 360) + 360) % 360 / (360 / 27));
    const named = t >= 18 && t < 21.5 ? 3 : t >= 21.5 && t < 25 ? 2 : t >= 25 && t < 29 ? 13 : null;
    const cur = S.curI = S.sel ?? named ?? moonI;
    if (cur !== S.last) { if (S.last >= 0) sfx('tick'); S.last = cur; }
    if (S.sec) { const show = fin(t, 4.5, 8); S.sec.forEach((m, i) => { m.material.color.set(i === cur ? '#E8B84A' : i % 2 ? '#28306E' : '#1E245A'); m.material.opacity = (i === cur ? .5 : .55) * clamp(show * 27 - i); }); S.st.forEach((sp, i) => sp.forEach(g => { g.material.opacity = (i === cur ? 1 : .7) * clamp(show * 27 - i); const s = (i === cur ? 1.5 : 1) * (.35 + .08 * Math.sin(gt * 3 + i)); g.scale.set(s, s, 1); })); }
    camOrbit(12, 42, t * 4, 0, -.4, 0, 280);
  },
  draw(t, S) {
    title(t, 7, 'Nakshatra · the star mansions');
    const cur = S.curI ?? 0, seg = 360 / 27;
    if (HAS3) {
      for (let i = 0; i < 27; i++) {
        const q = proj(posXZ(4.5, (i + .5) * seg)); txt(String(i + 1), q.x, q.y, { size: 16, color: i === cur ? C.gold : C.dim, w: i === cur ? 700 : 400, a: fin(t, 5, 8) });
        const c = proj(posXZ(3.55, (i + .5) * seg)); hitCircle('nak' + i, c.x, c.y, 40);
      }
      const cq = proj(posXZ(4.1, (cur + .5) * seg)); txt(NAK[cur], cq.x, cq.y - 38, { size: 22, w: 600, color: C.goldSoft, a: fin(t, 5, 6) });
      faceOn(S.moon, { seed: 4 });
    }
    const pa = fin(t, 5, 6), X = 1100, [mean, sym, star] = NAK_INFO[cur], nat = NAK_NATURE[cur], ni = NATURE_INFO[nat];
    panel(1070, 118, 470, 660, pa); ctx.save(); ctx.globalAlpha = pa;
    txt(`NAKSHATRA ${cur + 1} OF 27`, X, 158, { size: 16, color: C.muted, w: 600, align: 'left' });
    txt(NAK[cur], X, 208, { size: NAK[cur].length > 13 ? 36 : 44, font: F.disp, color: C.gold, align: 'left' });
    txt(NAK_DEV[cur], X, 256, { size: 28, font: F.disp, color: C.dim, align: 'left' });
    txt(`“${mean}”`, X, 302, { size: 26, font: F.disp, color: C.goldSoft, align: 'left' });
    const d0 = cur * seg, fmt = d => `${Math.floor(d)}°${String(Math.round((d % 1) * 60)).padStart(2, '0')}′`;
    [['Symbol', sym], ['Key star', star], ['Deity', NAK_DEITY[cur]], ['Span', `${fmt(d0)} – ${fmt(d0 + seg)}`], ['Nature', `${nat} (${ni[0]})`]].forEach(([k, v], i) => {
      txt(k, X, 356 + i * 38, { size: 17, color: C.muted, align: 'left' }); txt(v, X + 120, 356 + i * 38, { size: 19, color: C.ink, align: 'left' });
    });
    wrapTxt('Traditionally good for ' + ni[1] + '.', X, 560, 410, 26, { size: 17, color: C.muted, align: 'left' });
    txt('13°20′ each · 27 × 13°20′ = 360°', X, 650, { size: 18, color: C.goldSoft, align: 'left', a: fin(t, 11, 12) });
    ctx.restore();
    button('hear', 1100, 690, 220, 44, 'Hear the name  ▸', false, { size: 18, a: pa });
    tryIt(560, 790, 'Tap any star group', t, 34.5);
  }
});

/* 8 ─ Yoga */
scene({
  name: 'Yoga, the union', dur: 34, terms: ['Yoga', 'Akasha'],
  cues: [[.8, "{Yoga|योग} means union."],
  [3.5, "Add the Sun's longitude to mine, and cut the circle into twenty-seven parts of thirteen degrees twenty minutes. That gives twenty-seven yogas."],
  [12.5, "Each yoga has a name and a character. {Harshana|हर्षण} means joy, and {Siddhi|सिद्धि} means success. Both are welcomed for new beginnings."],
  [20.5, "Others, like {Vyatipata|व्यतीपात} and {Vaidhriti|वैधृति}, are traditionally a time to pause."],
  [25.5, "Tradition links yoga with space, {Akasha|आकाश}, and with health, mood and relationships. Slide me to explore."]],
  sfx: [[.1, 'whoosh'], [9, 'chord'], [12.5, 'chime'], [20.5, 'wood']],
  setup(S) {
    S.m = null; S.el = 60; S.drag = false; S.lastY = -1; KEY.intensity = 0; AMB.intensity = .25;
    S.earth = earth3(.28); S.sun = sun3(.26, { intensity: 1.8 }); S.moon = moon3(.19, { earthshine: .6 }); S.sum = glowSprite('#E8B84A', 1, 1);
    if (!HAS3) return; const seg = 360 / 27;
    S.sec = YOGA.map((y, i) => sector(3.0, 3.5, i * seg, (i + 1) * seg, YOGA_BAD.has(i) ? '#E2553F' : '#E8B84A', .2));
    orbit(3.0, '#E8B84A', .35); orbit(3.5, '#E8B84A', .35);
  },
  down(S, id, p) { if (id === 'slider') { S.drag = true; this.move(S, p); return true; } },
  move(S, p) { if (S.drag) S.m = clamp((p.x - 1100) / 400) * 359.9; },
  up(S) { S.drag = false; },
  update(t, S, dt) {
    const ls = 40, seg = 360 / 27;
    const target = t >= 12.5 && t < 16.5 ? 13 : t >= 16.5 && t < 20.5 ? 15 : t >= 20.5 && t < 23 ? 16 : t >= 23 && t < 25.5 ? 26 : null;
    if (S.m != null) S.el = S.m;
    else if (target != null) { const want = ((target + .5) * seg - 2 * ls + 720) % 360; let d = ((want - S.el + 540) % 360) - 180; S.el = (S.el + d * Math.min(1, dt * 3) + 360) % 360; }
    else S.el = (S.el + dt * 9) % 360;
    const lm = (ls + S.el) % 360, yg = (ls + lm) % 360; S.yg = yg; S.lm = lm; S.ls = ls;
    S.sun.position.copy(posXZ(2.45, ls)); S.moon.position.copy(posXZ(1.85, lm)); S.sum.position.copy(posXZ(3.25, yg, .05));
    S.yi = Math.floor(yg / seg);
    if (S.yi !== S.lastY) { if (S.lastY >= 0) sfx('tick'); S.lastY = S.yi; }
    if (S.sec) S.sec.forEach((m, i) => m.material.opacity = (i === S.yi ? .85 : YOGA_BAD.has(i) ? .28 : .16) * fin(t, 3.5, 6));
    setOpacity(S.sum, fin(t, 7, 9));
    camOrbit(12, 58, Math.sin(gt * .1) * 8, 0, -.3, 0, 300);
  },
  draw(t, S) {
    title(t, 8, 'Yoga · the union');
    const e = proj(wp(S.earth)), s = proj(wp(S.sun)), m = proj(wp(S.moon)), y = proj(wp(S.sum));
    if (HAS3) {
      lineTo2d(e, s, 'rgba(247,166,50,.8)', 3); lineTo2d(e, m, 'rgba(210,218,255,.8)', 3);
      if (t > 7) lineTo2d(e, y, C.gold, 5, fin(t, 7, 9));
      faceOn(S.moon, { seed: 8 });
      txt(YOGA[S.yi], y.x, y.y - 34, { size: 22, w: 600, color: YOGA_BAD.has(S.yi) ? '#FFB4A6' : C.goldSoft, a: fin(t, 8, 9) });
    }
    txt(`Sun ${Math.round(S.ls)}°  +  Moon ${Math.round(S.lm)}°  =  ${Math.round(S.yg)}°`, 100, 118, { size: 22, color: C.ink, align: 'left', a: fin(t, 3.5, 4.5) });
    const pa = fin(t, 3.5, 4.5), X = 1100, yi = S.yi, bad = YOGA_BAD.has(yi);
    panel(1070, 118, 470, 660, pa); ctx.save(); ctx.globalAlpha = pa;
    txt(`YOGA ${yi + 1} OF 27`, X, 158, { size: 16, color: C.muted, w: 600, align: 'left' });
    txt(YOGA[yi], X, 210, { size: 44, font: F.disp, color: C.gold, align: 'left' });
    txt(`“${YOGA_MEAN[yi]}”`, X, 262, { size: 26, font: F.disp, color: C.goldSoft, align: 'left' });
    chipTag(X, 310, bad ? 'Traditionally a time to pause' : 'Traditionally favourable', !bad);
    [['Formula', '(Sun + Moon) ÷ 13°20′'], ['Element', 'Akasha · space'], ['Shapes', 'health, mood, relationships']].forEach(([k, v], i) => { txt(k, X, 380 + i * 40, { size: 17, color: C.muted, align: 'left' }); txt(v, X + 110, 380 + i * 40, { size: 19, color: C.ink, align: 'left' }); });
    txt('27 yogas: 18 favourable, 9 to pause', X, 520, { size: 17, color: C.muted, align: 'left' });
    for (let i = 0; i < 27; i++) { rrect(X + i * 15, 545, 12, 22, 3); ctx.fillStyle = YOGA_BAD.has(i) ? 'rgba(226,85,63,.8)' : 'rgba(232,184,74,.7)'; ctx.globalAlpha = pa * (i === yi ? 1 : .55); ctx.fill(); if (i === yi) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } }
    ctx.globalAlpha = pa;
    txt('Slide Chandra', X, 618, { size: 16, color: C.muted, align: 'left' });
    rrect(1100, 655, 400, 10, 5); ctx.fillStyle = 'rgba(220,226,255,.2)'; ctx.fill();
    const kx = 1100 + (S.el / 360) * 400; rrect(1100, 655, kx - 1100, 10, 5); ctx.fillStyle = C.gold; ctx.fill(); moonDisc(kx, 660, 18, S.el);
    hits.push({ id: 'slider', x: 1080, y: 625, w: 440, h: 70 });
    txt(`Chandra’s lead over Surya: ${Math.round(S.el)}°`, X, 712, { size: 17, color: C.muted, align: 'left' });
    ctx.restore();
    tryIt(1305, 750, 'Slide Chandra', t, 25.5);
  }
});

/* 9 ─ Karana */
const KAR_COL = ['#E8B84A', '#F2C14E', '#F4D891', '#E9A64B', '#F28C28', '#D9B35F', '#E2553F'];
const karType = k => k === 0 || k >= 57 ? 'fixed' : (k - 1) % 7 === 6 ? 'vishti' : 'move';
const karCol = k => karType(k) === 'fixed' ? '#E86A92' : KAR_COL[(k - 1) % 7];
scene({
  name: 'Karana, half a tithi', dur: 42, terms: ['Karana', 'Chara', 'Sthira', 'Vishti', 'Prithvi'],
  cues: [[.8, "{Karana|करण} is half a {tithi|तिथि}: just six degrees of my lead over the Sun."],
  [6.5, "So every tithi has two karanas, and a lunar month has sixty."],
  [11, "There are eleven karanas. Seven movable ones, {Bava|बव} to {Vishti|विष्टि}, repeat eight times."],
  [17.5, "Four fixed ones, {Shakuni|शकुनि}, {Chatushpada|चतुष्पाद}, {Naga|नाग} and {Kimstughna|किंस्तुघ्न}, appear once, around the new moon."],
  [25, "Tradition links karana with earth, {Prithvi|पृथ्वी}, and with action. {Vishti|विष्टि}, also called {Bhadra|भद्रा}, is usually avoided for new beginnings."],
  [34, "Here's how Yoga and Karana compare."]],
  sfx: [[.1, 'whoosh'], [6.5, 'chime'], [25, 'wood'], [34, 'chord']],
  setup(S) {
    S.m = null; S.el = 30; S.drag = false; S.lastK = -1; S.cmp = null; KEY.intensity = 0; AMB.intensity = .15;
    S.earth = earth3(.3); S.sun = sun3(.9, { intensity: 2.3 }); S.sun.position.set(-11, 0, 0); S.moon = moon3(.2, { earthshine: .55 });
    if (!HAS3) return;
    S.sec = Array.from({ length: 60 }, (_, k) => sector(2.35, 2.85, 180 + k * 6 + .3, 180 + (k + 1) * 6 - .3, karCol(k), .3));
    orbit(2.05, '#DCE2FF', .5);
  },
  down(S, id, p) {
    if (id === 'slider') { S.drag = true; this.move(S, p); return true; }
    if (id === 'cmp') { S.cmp = !(S.cmp ?? (S.t >= 34)); sfx('pop'); return true; }
  },
  move(S, p) { if (S.drag) S.m = clamp((p.x - 1100) / 400) * 359.9; },
  up(S) { S.drag = false; },
  update(t, S, dt) {
    S.t = t;
    if (S.m != null) S.el = S.m; else if (t > 1) S.el = (S.el + dt * 8) % 360;
    const th = 180 + S.el; S.moon.position.copy(posXZ(2.05, th)); S.moon.rotation.y = gt * .2;
    S.k = Math.floor(S.el / 6);
    if (S.k !== S.lastK) { if (S.lastK >= 0) sfx('tick'); S.lastK = S.k; }
    if (S.sec) S.sec.forEach((m, k) => m.material.opacity = k === S.k ? .95 : .28);
    camOrbit(9.6, 52, Math.sin(gt * .1) * 8, 0, -.3, 0, 320);
  },
  draw(t, S) {
    title(t, 9, 'Karana · half a tithi');
    if (HAS3) faceOn(S.moon, { seed: 9 });
    const show = S.cmp ?? (t >= 34);
    const pa = fin(t, 1, 2) * (show ? 1 - (S.cmp ? 1 : fin(t, 34, 35)) : 1), X = 1100, w = 420, el = S.el, k = S.k, tn = Math.floor(el / 12);
    panel(1070, 118, 470, 660, pa); ctx.save(); ctx.globalAlpha = pa;
    txt('KARANA · half a tithi', X, 156, { size: 16, color: C.muted, w: 600, align: 'left' });
    rrect(X, 180, w, 50, 10); ctx.fillStyle = 'rgba(11,16,38,.8)'; ctx.fill(); ctx.strokeStyle = 'rgba(232,184,74,.5)'; ctx.stroke();
    const half = (el % 12) >= 6 ? 1 : 0; rrect(X + half * w / 2 + 4, 184, w / 2 - 8, 42, 8); ctx.fillStyle = 'rgba(242,140,40,.45)'; ctx.fill();
    txt('first half', X + w / 4, 206, { size: 18, color: C.ink }); txt('second half', X + 3 * w / 4, 206, { size: 18, color: C.ink });
    txt(`Tithi ${tn % 15 + 1} · ${tn < 15 ? 'Shukla' : 'Krishna'}`, X + w / 2, 250, { size: 16, color: C.dim });
    for (let i = 0; i < 60; i++) { const r = Math.floor(i / 30), c = i % 30, cw = w / 30; rrect(X + c * cw + 1, 280 + r * 34, cw - 2, 28, 3); ctx.fillStyle = karCol(i); ctx.globalAlpha = pa * (i === k ? 1 : .45); ctx.fill(); if (i === k) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } }
    ctx.globalAlpha = pa;
    txt('60 karanas in a lunar month', X, 366, { size: 16, color: C.dim, align: 'left' });
    [['#E8B84A', '7 movable (Chara) × 8'], ['#E86A92', '4 fixed (Sthira)'], ['#E2553F', 'Vishti / Bhadra']].forEach(([c, l], i) => { rrect(X + [0, 200, 0][i], 392 + [0, 0, 28][i] - 8, 14, 14, 3); ctx.fillStyle = c; ctx.fill(); txt(l, X + [0, 200, 0][i] + 22, 392 + [0, 0, 28][i], { size: 16, color: C.muted, align: 'left' }); });
    const nm = karanaName(k);
    txt('KARANA NOW', X, 468, { size: 16, color: C.muted, w: 600, align: 'left' });
    txt(nm, X, 508, { size: 40, font: F.disp, color: karType(k) === 'vishti' ? '#FFB4A6' : C.gold, align: 'left' });
    txt(`${k + 1} of 60 · ${karType(k) === 'fixed' ? 'fixed' : 'movable'}`, X + w, 508, { size: 17, color: C.muted, align: 'right' });
    wrapTxt(KAR_NOTE[nm].replace(/^./, c => c.toUpperCase()) + '.', X, 548, w, 24, { size: 17, color: C.ink, align: 'left' });
    rrect(1100, 655, 400, 10, 5); ctx.fillStyle = 'rgba(220,226,255,.2)'; ctx.fill();
    const kx = 1100 + (el / 360) * 400; rrect(1100, 655, kx - 1100, 10, 5); ctx.fillStyle = C.gold; ctx.fill(); moonDisc(kx, 660, 18, el);
    if (!show) hits.push({ id: 'slider', x: 1080, y: 625, w: 440, h: 70 });
    txt(`Chandra’s lead: ${Math.round(el)}° · each karana = 6°`, X, 712, { size: 16, color: C.muted, align: 'left' });
    ctx.restore();
    if (t > 30 || S.cmp != null) button('cmp', 1250, 36, 290, 44, show ? 'Hide comparison' : 'Compare Yoga & Karana', show, { size: 18 });
    if (show) {
      const ca = S.cmp ? 1 : fin(t, 34, 35); panel(200, 110, 1200, 660, ca);
      ctx.save(); ctx.globalAlpha = ca;
      txt('Yoga and Karana, side by side', 240, 160, { size: 32, font: F.disp, color: C.gold, align: 'left' });
      const rows = [['', 'Yoga · योग', 'Karana · करण'], ['Basis', 'Sun’s + Moon’s longitude', 'Moon’s lead over the Sun'], ['How many', '27 yogas', '11 karanas, 60 slots a month'], ['Each spans', '13°20′ of the sum', '6°, half a tithi'], ['Element (traditional)', 'Akasha · space', 'Prithvi · earth'], ['Shapes (traditional)', 'health, mood, relationships', 'action, work, results'], ['Watch for', 'Vyatipata, Vaidhriti', 'Vishti (Bhadra)']];
      rows.forEach((r, i) => {
        const y = 220 + i * 72; if (i) { ctx.strokeStyle = 'rgba(232,184,74,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(240, y - 36); ctx.lineTo(1360, y - 36); ctx.stroke(); }
        txt(r[0], 240, y, { size: 19, color: C.muted, align: 'left', w: 600 });
        txt(r[1], 550, y, { size: i ? 21 : 26, color: i ? C.ink : C.gold, align: 'left', font: i ? F.body : F.disp });
        txt(r[2], 940, y, { size: i ? 21 : 26, color: i ? C.ink : C.gold, align: 'left', font: i ? F.body : F.disp });
      });
      ctx.restore();
    } else tryIt(1305, 750, 'Slide Chandra', t, 28);
  }
});

/* 10 ─ Months */
const MONTH_FM = [['Chaitra', 180], ['Vaishakha', 206], ['Jyeshtha', 233], ['Ashadha', 258], ['Shravana', 287], ['Bhadrapada', 327], ['Ashvin', 7], ['Kartika', 33], ['Margashirsha', 60], ['Pausha', 100], ['Magha', 127], ['Phalguna', 153]];
scene({
  name: 'Months and rashis', dur: 38, terms: ['Masa', 'Rashi', 'Sankranti', 'Amanta', 'Purnimanta'],
  cues: [[.8, "Twelve lunar months make a year."],
  [4, "Each month is named after the nakshatra where the full moon shines. A full moon near {Chitra|चित्रा} gives {Chaitra|चैत्र}. Near {Vishakha|विशाखा}, {Vaishakha|वैशाख}."],
  [13.5, "Meanwhile, the Sun walks through twelve {rashis|राशि}. The moment it enters a new one is a {Sankranti|संक्रान्ति}."],
  [20.5, "When does a month begin? In the South and West, including Karnataka, a month runs from new moon to new moon. That's {Amanta|अमान्त}."],
  [29, "In the North, it runs from full moon to full moon: {Purnimanta|पूर्णिमान्त}. So the same day can carry two month names!"]],
  sfx: [[.1, 'whoosh'], [13.5, 'chime'], [20.5, 'wood'], [29, 'wood']],
  setup(S) {
    S.mode = null; S.lastR = -1; KEY.intensity = 0; AMB.intensity = .2;
    S.earth = earth3(.3); S.sun = sun3(.3, { intensity: 2 }); S.moon = moon3(.2, { earthshine: .5 });
    if (!HAS3) return;
    for (let i = 0; i < 12; i++) sector(2.6, 3.1, i * 30 + .4, (i + 1) * 30 - .4, i % 2 ? '#F28C28' : '#E8B84A', i % 2 ? .22 : .12);
    orbit(3.45, '#F7A632', .35, { dashed: true });
  },
  down(S, id) { if (id === 'am' || id === 'pm') { S.mode = id; sfx('pop'); return true; } },
  update(t, S) {
    const sl = S.sl = (t * 12 + 200) % 360; S.sun.position.copy(posXZ(3.45, sl)); S.moon.position.copy(posXZ(1.9, sl + 180));
    const ri = Math.floor(sl / 30); if (ri !== S.lastR) { if (S.lastR >= 0 && t > 13.5 && t < 20.5) sfx('chime'); S.lastR = ri; }
    if (S.earth.userData.body) S.earth.userData.body.rotation.y = gt * .4;
    camOrbit(12.2, 56, Math.sin(gt * .08) * 8, 0, -.3, 0, 330);
  },
  draw(t, S) {
    title(t, 10, 'Months and rashis');
    const sl = S.sl || 0, ri = Math.floor(sl / 30), fl = (sl + 180) % 360;
    if (HAS3) {
      for (let i = 0; i < 12; i++) { const q = proj(posXZ(2.85, i * 30 + 15)); txt(RASHI[i], q.x, q.y, { size: 17, color: i === ri ? '#FFD9A8' : '#F6C79A', w: i === ri ? 700 : 400 }); }
      const ma = fin(t, 4, 6);
      MONTH_FM.forEach(([n, l]) => { const near = Math.abs(((fl - l + 540) % 360) - 180) < 14, q = proj(posXZ(1.35, l)); txt(n, q.x, q.y, { size: near ? 19 : 15, w: near ? 700 : 400, color: near ? C.gold : 'rgba(220,226,255,.6)', a: ma }); });
      const sp = proj(wp(S.sun)); if (t > 13.5 && t < 21 && (sl % 30) < 5) glow(sp.x, sp.y, 90, 'rgba(242,140,40,.9)', .8);
      txt('Sun in ' + RASHI[ri], sp.x, sp.y - 44, { size: 18, w: 600, color: '#F6C79A', a: fin(t, 13.5, 14.5) });
      faceOn(S.moon, { seed: 10 });
      const mq = proj(wp(S.moon)); txt('full moon', mq.x, mq.y + 36, { size: 15, color: C.muted, a: fin(t, 4, 5) });
    }
    const pa = fin(t, 20.5, 21.5);
    if (pa > 0) {
      const mode = S.mode || (t < 29 ? 'am' : 'pm');
      panel(930, 118, 620, 590, pa); ctx.save(); ctx.globalAlpha = pa;
      const x0 = 965, w = 550, days = 45, dx = w / days;
      txt('Same days, two ways to name the month', x0, 158, { size: 21, color: C.ink, align: 'left', w: 500 });
      for (let d = 0; d <= days; d += 3) moonDisc(x0 + d * dx, 212, 10, (d / 29.53 * 360 + 90) % 360);
      const nm = (270 / 360) * 29.53, fm = (90 / 360) * 29.53;
      [['am', 'Amanta · South & West', [nm], ['Bhadrapada', 'Ashvin']], ['pm', 'Purnimanta · North', [fm, fm + 29.53], ['Bhadrapada', 'Ashvin', 'Kartika']]].forEach(([id, label, cuts, names], bi) => {
        const y = 290 + bi * 130, on = mode === id;
        txt(label, x0, y - 20, { size: 19, color: on ? C.gold : C.dim, align: 'left', w: 600 });
        const edges = [0, ...cuts.map(c => c * dx), w];
        for (let k = 0; k < edges.length - 1; k++) {
          rrect(x0 + edges[k] + 2, y, edges[k + 1] - edges[k] - 4, 42, 8);
          ctx.fillStyle = on ? (k % 2 ? 'rgba(232,184,74,.35)' : 'rgba(232,106,146,.35)') : 'rgba(255,255,255,.06)'; ctx.fill();
          if (edges[k + 1] - edges[k] > 60) txt(names[k], x0 + (edges[k] + edges[k + 1]) / 2, y + 23, { size: 17, color: on ? C.ink : C.dim });
        }
      });
      const mx = x0 + (nm - 9.3) * dx;
      ctx.strokeStyle = C.saffron; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(mx, 230); ctx.lineTo(mx, 480); ctx.stroke(); ctx.setLineDash([]);
      txt('Krishna Panchami', mx, 500, { size: 17, color: C.saffron, w: 600 });
      txt('Amanta: Bhadrapada   ·   Purnimanta: Ashvin', 1240, 545, { size: 19, color: C.ink });
      button('am', 965, 590, 260, 44, 'Amanta', mode === 'am', { size: 19 });
      button('pm', 1255, 590, 260, 44, 'Purnimanta', mode === 'pm', { size: 19 });
      ctx.restore();
    }
  }
});

/* 11 ─ Adhika Masa (2D chart over the stars) */
scene({
  name: 'Adhika Masa, the leap month', dur: 33, terms: ['Adhika Masa', 'Ritu', 'Sankranti'],
  cues: [[.8, "Here's a puzzle. Twelve of my months add up to about three hundred and fifty-four days."],
  [7.5, "The solar year is about three hundred and sixty-five. So we fall eleven days short, every single year."],
  [14, "Left alone, festivals would drift backwards through the seasons."],
  [18.5, "So when a lunar month passes with no {Sankranti|संक्रान्ति} at all, it becomes an extra month: {Adhika Masa|अधिक मास}."],
  [26, "That happens about once every thirty-two and a half months. 2026 itself had an Adhika Jyeshtha."]],
  sfx: [[.1, 'whoosh'], [7.5, 'wood'], [14, 'wood']],
  setup(S) { S.t0 = 14; S.adh = 0; },
  down(S, id) { if (id === 'replay') { S.t0 = S.t - .1; S.adh = 0; sfx('pop'); return true; } },
  update(t) { camOrbit(10, 0, gt * 1.5); },
  draw(t, S) {
    S.t = t; title(t, 11, 'Adhika Masa · the leap month');
    const x0 = 180, pxd = 1240 / 366, a1 = fin(t, 1, 2), a2 = fin(t, 7.5, 8.5);
    ctx.save(); ctx.globalAlpha = a1;
    rrect(x0, 150, 365.25 * pxd * ease((t - 1) / 2), 44, 8); ctx.fillStyle = 'rgba(247,166,50,.6)'; ctx.fill();
    txt('Solar year · 365¼ days', x0 + 14, 173, { size: 20, color: '#1b0f05', align: 'left', w: 600, shadow: false });
    for (let i = 0; i < 12; i++) { const w = 29.53 * pxd; rrect(x0 + i * w + 1, 210, Math.max(0, (w - 2) * clamp(ease((t - 1.5) / 2) * 12 - i)), 44, 6); ctx.fillStyle = 'rgba(200,210,255,.5)'; ctx.fill(); }
    txt('12 lunar months · 354 days', x0 + 14, 233, { size: 20, color: '#0B1026', align: 'left', w: 600, shadow: false });
    ctx.restore();
    if (a2 > 0) { ctx.save(); ctx.globalAlpha = a2; const gx = x0 + 354.37 * pxd; rrect(gx, 210, 10.88 * pxd, 44, 6); ctx.fillStyle = C.saffron; ctx.fill(); txt('11 days short', gx + 20, 282, { size: 20, color: C.saffron, w: 600 }); ctx.restore(); }
    const ba = fin(t, 13, 14);
    if (ba > 0) {
      ctx.save(); ctx.globalAlpha = ba;
      const by = 380, seasons = [['Shishira', '#7fa7d9'], ['Vasanta', '#8fd19e'], ['Grishma', '#f2c14e'], ['Varsha', '#5cb3c9'], ['Sharad', '#e9a64b'], ['Hemanta', '#b9a3e0']];
      seasons.forEach(([n, c], i) => { const x = x0 + i * 1240 / 6; rrect(x + 2, by, 1240 / 6 - 4, 48, 8); ctx.fillStyle = c; ctx.globalAlpha = ba * .3; ctx.fill(); ctx.globalAlpha = ba; txt(n, x + 1240 / 12, by + 25, { size: 20, color: C.ink }); });
      txt('Seasons (ritu), set by the Sun', x0, by - 22, { size: 18, color: C.muted, align: 'left' });
      const yr = clamp((t - S.t0) / 2.2, 0, 8.2); let adh = 0; const pts = [];
      for (let y = 0; y <= Math.floor(yr); y++) { const drift = 10.88 * y; while (drift - 29.53 * adh > 22) adh++; pts.push([y, 60 - drift + 29.53 * adh, 60 - drift]); }
      if (adh > S.adh) { S.adh = adh; sfx('big'); }
      const X = d => x0 + ((d % 365 + 365) % 365) * 1240 / 365, ry = y => 505 + y * 30;
      pts.forEach(([y, d, g], i) => {
        txt(`Year ${y + 1}`, x0 - 20, ry(y), { size: 16, color: C.dim, align: 'right' });
        if (g >= 0) circle(X(g), ry(y), 7, 'rgba(226,85,63,.6)');
        glow(X(d), ry(y), 22, 'rgba(232,184,74,.8)', .6); circle(X(d), ry(y), 9, C.gold);
        if (i > 0 && d > pts[i - 1][1]) txt('+ Adhika Masa', X(d) + 24, ry(y), { size: 17, color: C.gold, align: 'left', w: 600 });
      });
      circle(x0 + 860, 545, 8, C.gold); txt('Festival with Adhika Masa: stays in its season', x0 + 876, 545, { size: 17, color: C.ink, align: 'left' });
      circle(x0 + 860, 577, 7, 'rgba(226,85,63,.6)'); txt('Without it: drifts back 11 days a year', x0 + 876, 577, { size: 17, color: C.muted, align: 'left' });
      ctx.restore();
      if (t > 28) button('replay', 1160, 36, 280, 44, 'Play the years again', false, { size: 18 });
    }
  }
});

/* 12 ─ Eras & festivals */
const FEST = [
  ['Ugadi', 'Chaitra Shukla Pratipada', 'Lunar', 'New Year in Karnataka, Andhra and Telangana. It moves with the Moon, falling in March or April.'],
  ['Holi', 'Phalguna Purnima', 'Lunar', 'The full moon of Phalguna. It lands anywhere from late February to late March.'],
  ['Diwali', 'Ashvin / Kartika Amavasya', 'Lunar', 'The new moon of autumn: Ashvin Amavasya in Amanta, Kartika in Purnimanta. It falls in October or November.'],
  ['Makar Sankranti', 'Sun enters Makara', 'Solar', 'Tied to the Sun, not the Moon, so it stays near January 14 every year.']
];
function festIcon(i, x, y) {
  ctx.save();
  if (i === 0) { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 90, y - 40); ctx.quadraticCurveTo(x, y - 10, x + 90, y - 40); ctx.stroke(); for (let k = 0; k < 7; k++) { const px = x - 75 + k * 25, py = y - 40 + 26 * Math.sin(PI * (k + .5) / 7) - 2; ctx.fillStyle = k % 2 ? '#5CC98A' : '#3E9E68'; ctx.beginPath(); ctx.ellipse(px, py + 22, 8, 22, 0, 0, TAU); ctx.fill(); } circle(x, y + 30, 8, C.saffron); }
  else if (i === 1) { [['#E86A92', -40, -10], ['#5CC98A', 30, -30], ['#F2C14E', 20, 30], ['#7FA7FF', -25, 35]].forEach(([c, dx, dy], k) => { const r = 34 + 6 * Math.sin(gt * 3 + k); glow(x + dx, y + dy, r * 1.6, c, .9); circle(x + dx, y + dy, r * .45, c); }); }
  else if (i === 2) {
    const fl = 1 + .08 * Math.sin(gt * 12); glow(x, y - 20, 90, 'rgba(255,190,80,.9)', .7);
    ctx.fillStyle = '#C8743B'; ctx.beginPath(); ctx.moveTo(x - 60, y + 10); ctx.quadraticCurveTo(x, y + 70, x + 60, y + 10); ctx.quadraticCurveTo(x + 70, y + 5, x + 75, y - 2); ctx.lineTo(x - 60, y + 10); ctx.fill();
    ctx.fillStyle = '#FFE9A8'; ctx.beginPath(); ctx.moveTo(x + 50, y - 2); ctx.quadraticCurveTo(x + 50 - 20 * fl, y - 30, x + 55, y - 70 * fl); ctx.quadraticCurveTo(x + 50 + 20 * fl, y - 30, x + 60, y - 2); ctx.fill();
  } else { const sw = Math.sin(gt * 1.5) * .15; ctx.translate(x, y - 10); ctx.rotate(sw); ctx.fillStyle = '#E2553F'; ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(45, 0); ctx.lineTo(0, 55); ctx.lineTo(-45, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(45, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 55); ctx.bezierCurveTo(20, 80, -20, 95, 10, 120); ctx.stroke(); }
  ctx.restore();
}
scene({
  name: 'Eras and festivals', dur: 28, terms: ['Samvat', 'Ugadi', 'Amavasya', 'Purnima', 'Sankranti'],
  cues: [[.8, "Years are counted in eras. 2026 is Vikram {Samvat|संवत्} 2083, and Shaka Samvat 1948."],
  [8.5, "And festivals follow the Panchang. {Ugadi|युगादि} is Chaitra Shukla Pratipada. Holi is Phalguna {Purnima|पूर्णिमा}. Diwali falls on the new moon of autumn."],
  [18, "But Makar {Sankranti|संक्रान्ति} follows the Sun into Makara, so it stays near January fourteenth, every year."],
  [23.5, "Now you know why Diwali moves, and Sankranti doesn't."]],
  sfx: [[.1, 'whoosh'], [2.5, 'wood'], [5, 'wood'], [9, 'pop'], [11.5, 'pop'], [13.5, 'pop'], [18, 'pop'], [23.5, 'run']],
  setup(S) { S.sel = null; },
  down(S, id) { if (id && id.startsWith('fest')) { S.sel = +id.slice(4); sfx('chime'); return true; } },
  update(t) { camOrbit(10, 0, -gt * 1.5); },
  draw(t, S) {
    title(t, 12, 'Eras and festivals');
    [['2026', 'CE · Gregorian', ''], ['2083', 'Vikram Samvat', 'CE + 57'], ['1948', 'Shaka Samvat', 'CE − 78']].forEach(([n, l, r], i) => {
      const a = fin(t, .8 + i * 2.2, 1.8 + i * 2.2), x = 330 + i * 470;
      ctx.save(); ctx.globalAlpha = a; panel(x - 190, 110, 380, 190);
      const shown = i === 0 ? n : String(Math.round(lerp(2026, +n, easeOut((t - .8 - i * 2.2) / 1.2))));
      txt(shown, x, 185, { size: 76, font: F.disp, color: i ? C.gold : C.ink }); txt(l, x, 245, { size: 22, color: C.ink }); if (r) txt(r, x, 275, { size: 18, color: C.muted });
      ctx.restore();
    });
    const appear = [9, 11.5, 13.5, 18];
    FEST.forEach((f, i) => {
      const a = S.sel != null ? 1 : back((t - appear[i]) / .7), x = 125 + i * 350, y = 350; if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x + 150, y + 150); ctx.scale(.6 + .4 * a, .6 + .4 * a); ctx.translate(-x - 150, -y - 150);
      panel(x, y, 300, 300); if (S.sel === i) { rrect(x, y, 300, 300, 16); ctx.strokeStyle = C.saffron; ctx.lineWidth = 3; ctx.stroke(); }
      festIcon(i, x + 150, y + 100);
      txt(f[0], x + 150, y + 190, { size: f[0].length > 10 ? 26 : 30, font: F.disp, color: C.gold }); txt(f[1], x + 150, y + 228, { size: 18, color: C.ink });
      rrect(x + 105, y + 250, 90, 30, 15); ctx.fillStyle = f[2] === 'Solar' ? 'rgba(247,166,50,.35)' : 'rgba(200,210,255,.25)'; ctx.fill(); txt(f[2], x + 150, y + 266, { size: 16, w: 600, color: C.ink });
      ctx.restore(); hits.push({ id: 'fest' + i, x, y, w: 300, h: 300 });
    });
    if (S.sel != null) { panel(125, 680, 1350, 70); txt(FEST[S.sel][3], 800, 716, { size: 21, color: C.ink }); }
    else tryIt(800, 715, 'Tap a festival', t, 24);
  }
});

/* 13 ─ Outro */
scene({
  name: 'Your Panchang', dur: 13, terms: ['Panchang'],
  cues: [[.8, "Now it's your turn. Find the {Panchang|पञ्चाङ्ग} for any day. Maybe your birthday?"], [7.5, "Or keep going with the optional deep dives. Namaste, and see you in the sky!"]],
  sfx: [[.1, 'whoosh'], [7.5, 'bell']],
  setup(S) { S.moon = moon3(.8, { earthshine: .3 }); heroLight(); },
  down(S, id) { if (id === 'find') { goFinder(); return true; } if (id === 'deep') { next(); return true; } },
  update(t, S) { camOrbit(7, 3, Math.sin(gt * .2) * 5, 0, -.5, 0); S.moon.rotation.y = gt * .15; S.moon.position.y = Math.abs(Math.sin(gt * 3)) * .12 * (t < 8 ? 1 : .4); },
  draw(t, S) {
    const p = proj(wp(S.moon)), r = projR(wp(S.moon), .8);
    if (HAS3) {
      mandala(p.x, p.y, r * 1.9, 1, gt * .03, .6); face(p.x, p.y, r * .95, { smile: 1.1 });
      for (let k = 0; k < 10; k++) { const a = gt * .8 + k * TAU / 10, rr = r * 1.35 + 8 * Math.sin(gt * 2 + k); circle(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 3 + 2 * Math.sin(gt * 3 + k), C.goldSoft); }
    }
    txt('Find your Panchang', 800, 650, { size: 62, font: F.disp, color: C.gold, a: fin(t, 1, 2) });
    button('find', 460, 700, 320, 56, 'Open the finder ↓', true, { size: 23 });
    button('deep', 820, 700, 320, 56, 'Optional deep dives ▶', false, { size: 23 });
    txt('Why five? · Rashi & pada · measuring the sky · precession · your sky tonight', 800, 790, { size: 17, color: C.muted, a: fin(t, 2, 3) });
  }
});
