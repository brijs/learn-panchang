/* ================= Player engine ================= */
const starts = []; let TOTAL = 0; const NMAIN = SCENES.filter(s => !s.optional).length; SCENES.forEach(s => { starts.push(TOTAL); if (!s.optional) TOTAL += s.dur; });
const P = { i: 0, t: 8.5, playing: false, waiting: false, cue: 0, sfxI: 0, S: {}, started: false, lastCaption: '' };
let AUTO = false, CCON = true;
const SKY = { jd: 2461312, rate: 0, speed: 1 / 24, bright: 0, grahas: true, trails: false, view: 'out', tz: 5.5, reset: 0, center: 0, shade: 'rashi', belt: true };
function skyToInputs() {
  const d = new Date((SKY.jd - 2440587.5) * 864e5 + SKY.tz * 3.6e6), p2 = n => String(n).padStart(2, '0');
  if (document.activeElement !== $('skDate')) $('skDate').value = `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
  if (document.activeElement !== $('skTime')) $('skTime').value = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
}
SKY.place = { place: 'Bengaluru', lat: 12.9716, lon: 77.5946, iana: 'Asia/Kolkata', tz: 5.5 };
function skyFromInputs() {
  const ds = $('skDate').value, ts = $('skTime').value || '00:00'; if (!ds) return;
  const [y, m, d] = ds.split('-').map(Number), [h, mi] = ts.split(':').map(Number); if (!(y >= 1900 && y <= 2099)) return;
  SKY.jd = Date.UTC(y, m - 1, d, h, mi) / 864e5 + 2440587.5 - SKY.tz / 24;
}
function offsetAt(iana, ms) {
  try { const f = new Intl.DateTimeFormat('en-US', { timeZone: iana, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); const p = Object.fromEntries(f.formatToParts(new Date(ms)).map(x => [x.type, x.value])); return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(ms / 6e4) * 6e4) / 3.6e6; } catch (er) { return null; }
}
function skyTZ() { if (SKY.place.iana) { const o = offsetAt(SKY.place.iana, (SKY.jd - 2440587.5) * 864e5); if (o != null) SKY.tz = o; } else SKY.tz = SKY.place.tz; }
function skyPlaceFromFinder() {
  const v = sel.value;
  if (v === 'custom') { const lat = parseFloat($('fLat').value) || 0, lon = parseFloat($('fLon').value) || 0, tz = parseFloat($('fTz').value) || 0; SKY.place = { place: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, lat, lon, tz, iana: null }; }
  else { const c = CITIES[+v]; SKY.place = { place: c[0], lat: c[1], lon: c[2], iana: c[3], tz: 0 }; }
  $('skPlace').value = v; $('skCustom').hidden = v !== 'custom'; $('skLat').value = SKY.place.lat; $('skLon').value = SKY.place.lon; $('skTz').value = SKY.place.tz;
  const tz = parseFloat($('fTz').value); SKY.tz = isFinite(tz) ? tz : 5.5; skyTZ();
}
function skySetPlace() {
  const v = $('skPlace').value; $('skCustom').hidden = v !== 'custom';
  if (v === 'custom') { const lat = clamp(parseFloat($('skLat').value) || 0, -66, 66), lon = parseFloat($('skLon').value) || 0, tz = parseFloat($('skTz').value) || 0; SKY.place = { place: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, lat, lon, tz, iana: null }; }
  else { const c = CITIES[+v]; SKY.place = { place: c[0], lat: c[1], lon: c[2], iana: c[3], tz: 0 }; $('skLat').value = c[1]; $('skLon').value = c[2]; }
  skyFromInputs(); skyTZ(); skyFromInputs();
}
function skyView(v) { SKY.view = v; $('skOut').setAttribute('aria-pressed', v === 'out'); $('skEarth').setAttribute('aria-pressed', v === 'earth'); }
function skySpeed(v) { SKY.speed = v; const sel2 = $('skSpeed'); let best = null, bd = 1e9; [...sel2.options].forEach(o => { const dd = Math.abs(Math.log(+o.value) - Math.log(v)); if (dd < bd) { bd = dd; best = o.value; } }); sel2.value = best; }
function skyRate(r) { SKY.rate = r; $('skPlayB').setAttribute('aria-pressed', r === -1); $('skPlayB').textContent = r === -1 ? '❚❚ Pause' : '◀ Back'; $('skPlayF').setAttribute('aria-pressed', r === 1); $('skPlayF').textContent = r === 1 ? '❚❚ Pause' : 'Play ▶'; $('skPlayF').setAttribute('aria-label', r === 1 ? 'Pause' : 'Play forwards'); $('skPlayB').setAttribute('aria-label', r === -1 ? 'Pause' : 'Play backwards'); }
const cc = $('cc'), hint = $('hint'), cont = $('cont');
function resize() {
  const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(320, Math.round(r.width * dpr)); cv.height = Math.round(cv.width * 9 / 16); scale = cv.width / W;
  if (HAS3) { R3.setPixelRatio(dpr); R3.setSize(r.width, r.width * 9 / 16, false); }
}
addEventListener('resize', resize);
function enter(i, t = 0) {
  P.i = (i + SCENES.length) % SCENES.length; P.t = t; P.S = {}; P.cue = 0; P.sfxI = 0; P.waiting = false; cont.hidden = true;
  const sc = SCENES[P.i];
  $('skyctl').hidden = !sc.sky;
  if (theater.classList.contains('on')) fitTheater();
  requestAnimationFrame(() => fitTheater());
  if (sc.sky) {
    skyPlaceFromFinder(); skyRate(0);
    SKY.jd = sc.sky === 'local' ? finderJD(SKY.tz) : jdNow(); skyView(sc.sky === 'local' ? 'earth' : 'out');
    if (sc.sky === 'phase') { skySpeed(.25); skyRate(1); } else if (sc.sky === 'clock') { skySpeed(1 / 86400); skyRate(1); } else if (sc.sky === 'nodes') skySpeed(1); else if (sc.sky === 'months') { const nowJ = jdNow(); SKY.jd = solve(fnEl, 0, nowJ - pos(nowJ).el / 12.19); skySpeed(1); skyRate(1); } else if (sc.sky === 'sphere') { skySpeed(1); skyRate(1); skyShade('rashi'); SKY.belt = true; $('skBelt').checked = true; } else skySpeed(1 / 24);
    document.querySelectorAll('#skyctl [data-for]').forEach(g => g.hidden = !g.dataset.for.split(' ').includes(sc.sky));
    $('skCenter').textContent = sc.sky === 'local' ? 'Clear focus' : 'Centre on Earth';
    skyToInputs();
    $('skLabelOut').textContent = sc.sky === 'local' ? 'Above your horizon' : 'Outside view'; $('skLabelIn').textContent = sc.sky === 'local' ? 'From the ground' : 'From Earth';
  }
  clear3(); sc.setup && sc.setup(P.S);
  while (P.cue < sc.cues.length && sc.cues[P.cue][0] < t) P.cue++;
  while (sc.sfx && P.sfxI < sc.sfx.length && sc.sfx[P.sfxI][0] < t) P.sfxI++;
  TRY = {};
  stopSpeech(); setCaption(''); hint.hidden = true; updateChips(); renderWords();
}
function setCaption(s) { P.lastCaption = s; cc.textContent = CCON ? s : ''; }
function play() { audioInit(); P.playing = true; P.started = true; P.waiting = false; cont.hidden = true; $('intro').hidden = true; hint.hidden = true; setPlayIcon(); }
function pause(fromInteract) {
  if (!P.playing) return; P.playing = false; setPlayIcon();
  if (TTS.speaking && P.cue > 0) { P.cue--; P.t = SCENES[P.i].cues[P.cue][0] - .01; }
  stopSpeech(); if (fromInteract) hint.hidden = false;
}
function next() { if (P.i < SCENES.length - 1) { enter(P.i + 1); play(); } }
function setPlayIcon() { $('playIcon').innerHTML = P.playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4l13 8-13 8z"/>'; $('play').setAttribute('aria-label', P.playing ? 'Pause' : 'Play'); }
function endOfScene() {
  if (AUTO && P.i < NMAIN - 1) { enter(P.i + 1); return; }
  P.playing = false; setPlayIcon(); P.t = SCENES[P.i].dur - .001;
  if (P.i < SCENES.length - 1) { P.waiting = true; setCaption(''); cont.textContent = (P.i === NMAIN - 1 ? 'Optional deep dive: ' : 'Continue: ') + `${SCENES[P.i + 1].name}  ▶`; cont.hidden = false; }
}
function tick(dt) {
  if (!P.playing) return;
  const sc = SCENES[P.i]; let hold = false;
  if (P.cue < sc.cues.length && P.t >= sc.cues[P.cue][0]) {
    if (TTS.speaking) hold = true;
    else { const c = sc.cues[P.cue]; setCaption(plain(c[1])); speak(c[1]); P.cue++; }
  }
  while (sc.sfx && P.sfxI < sc.sfx.length && P.t >= sc.sfx[P.sfxI][0]) { sfx(sc.sfx[P.sfxI][1]); P.sfxI++; }
  if (!hold) P.t += dt;
  if (P.t >= sc.dur) { if (TTS.speaking) { P.t = sc.dur; return; } endOfScene(); }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now; gt += dt;
  tick(dt);
  const sc = SCENES[P.i];
  if (sc.sky && SKY.rate) { SKY.jd = clamp(SKY.jd + dt * SKY.rate * SKY.speed, 2415021, 2488069); if ((gt % .5) < dt) skyTZ(); skyToInputs(); }
  $('skip').hidden = P.t >= sc.dur - .05 || !sc.cues.length;
  if (HAS3) { STARS3.rotation.y += dt * .004; STARS3.children[1].material.opacity = .75 + .25 * Math.sin(gt * 1.3); }
  sc.update && sc.update(P.t, P.S, dt);
  if (HAS3) R3.render(S3, CAM);
  ctx = cv.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, W, H);
  hits = [];
  if (!HAS3) sky2d();
  sc.draw(P.t, P.S);
  if (!HAS3) txt('3D view needs WebGL and an internet connection. Showing a simplified view.', 800, 876, { size: 16, color: C.dim });
  const tr = fin(P.t, 0, .9);
  if (tr < 1 && P.started) {
    ctx.save(); ctx.globalAlpha = 1 - easeOut(tr); ctx.fillStyle = '#070A1C'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1 - tr;
    circle(800, 450, 40 + 1000 * easeOut(tr), null, C.gold, 3); ctx.restore();
  }
  updateBar(); requestAnimationFrame(frame);
}

function skipToExplore() {
  const sc = SCENES[P.i];
  if (!P.started) { P.started = true; $('intro').hidden = true; audioInit(); }
  stopSpeech(); P.cue = sc.cues.length; P.sfxI = sc.sfx ? sc.sfx.length : 0; P.t = sc.dur; P.playing = false; setPlayIcon(); setCaption(''); hint.hidden = true;
  if (P.i < SCENES.length - 1) { P.waiting = true; cont.textContent = (P.i === NMAIN - 1 ? 'Optional deep dive: ' : 'Continue: ') + `${SCENES[P.i + 1].name}  ▶`; cont.hidden = false; }
}
$('skip').onclick = skipToExplore;
/* sky controls */
$('skDate').addEventListener('change', () => { skyFromInputs(); skyTZ(); skyFromInputs(); }); $('skTime').addEventListener('change', () => { skyFromInputs(); skyTZ(); skyFromInputs(); });
$('skPlace').addEventListener('change', skySetPlace); ['skLat', 'skLon', 'skTz'].forEach(id => $(id).addEventListener('change', skySetPlace));
/* fullscreen / theater */
const theater = $('theater');
let fitHist = [];
function fitTheater() {
  const st = $('stage');
  if (!theater.classList.contains('on')) { fitHist = []; if (st.style.width) st.style.width = ''; resize(); return; }
  let other = 0;
  for (const c of theater.children) { if (c === st || c.hidden || getComputedStyle(c).display === 'none') continue; const cs = getComputedStyle(c); other += c.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }
  let avail = window.innerHeight - other - 28;
  if (document.documentElement.classList.contains('phone') && avail < window.innerHeight * .62) avail = window.innerHeight - 16; // phones: stage fills the screen, controls scroll below
  let w = Math.floor(Math.max(240, Math.min(theater.clientWidth - 16, avail * 16 / 9)));
  const now = performance.now(); fitHist = fitHist.filter(h => now - h.t < 1500);
  // guard against layout feedback loops (A → B → A within a moment): settle on the smaller size
  const n = fitHist.length;
  if (n >= 2 && Math.abs(fitHist[n - 2].w - w) < 3 && Math.abs(fitHist[n - 1].w - w) >= 3) w = Math.min(w, fitHist[n - 1].w);
  const cur = parseFloat(st.style.width) || 0;
  if (Math.abs(cur - w) < 3) return; // nothing meaningful changed: leave the canvas alone
  fitHist.push({ t: now, w });
  st.style.width = w + 'px'; resize();
}
function setTheater(on) { theater.classList.toggle('on', on); $('fsLbl').textContent = on ? 'Exit full screen' : 'Full screen'; if (on) { $('fsBtn').classList.remove('nudge'); try { localStorage.setItem('fsUsed', '1'); } catch (er) { } } $('fsBtn').setAttribute('aria-pressed', on); requestAnimationFrame(fitTheater); }
$('fsBtn').onclick = () => {
  const on = !theater.classList.contains('on');
  if (on) { setTheater(true); try { const r = theater.requestFullscreen && theater.requestFullscreen(); if (r && r.catch) r.catch(() => { }); } catch (er) { } }
  else { setTheater(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); }
};
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && theater.classList.contains('on')) setTheater(false); else fitTheater(); });
addEventListener('resize', fitTheater);
if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (theater.classList.contains('on')) fitTheater(); }); [...theater.children].forEach(c => { if (c.id !== 'stage') ro.observe(c); }); }
addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('menu').hidden && $('finderPane').hidden && theater.classList.contains('on') && !document.fullscreenElement) setTheater(false); });
$('skNow').onclick = () => { SKY.jd = jdNow(); skyToInputs(); };
$('skPlayB').onclick = () => skyRate(SKY.rate === -1 ? 0 : -1); $('skPlayF').onclick = () => skyRate(SKY.rate === 1 ? 0 : 1);
$('skStepB').onclick = () => { SKY.jd -= Math.max(SKY.speed, 1 / 24); skyToInputs(); };
$('skStepF').onclick = () => { SKY.jd += Math.max(SKY.speed, 1 / 24); skyToInputs(); };
$('skSpeed').addEventListener('change', e => { SKY.speed = +e.target.value; });
$('skBright').addEventListener('input', e => { SKY.bright = +e.target.value / 100; });
$('skGraha').addEventListener('change', e => { SKY.grahas = e.target.checked; });
$('skTrail').addEventListener('change', e => { SKY.trails = e.target.checked; });
$('skOut').onclick = () => skyView('out'); $('skEarth').onclick = () => skyView('earth');
$('skReset').onclick = () => { SKY.reset++; };
$('skCenter').onclick = () => { SKY.center++; };
function skyShade(v) { SKY.shade = v; ['none', 'rashi', 'nak'].forEach(k => $('sh_' + k).setAttribute('aria-pressed', SKY.shade === k)); }
['none', 'rashi', 'nak'].forEach(k => $('sh_' + k).onclick = () => skyShade(k));
$('skBelt').addEventListener('change', e => { SKY.belt = e.target.checked; });
/* pointer */
function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
cv.addEventListener('pointerdown', e => {
  const p = toLogical(e); ptr = { ...p, down: true };
  const sc = SCENES[P.i], id = hitAt(p.x, p.y); P.S.touchedAny = true;
  if (sc.down && sc.down.call(sc, P.S, id, p)) { audioInit(); if (P.started && P.playing && !sc.free) pause(true); try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
});
cv.addEventListener('pointermove', e => { const p = toLogical(e); ptr.x = p.x; ptr.y = p.y; const sc = SCENES[P.i]; if (sc.move) sc.move.call(sc, P.S, p); cv.style.cursor = hitAt(p.x, p.y) ? 'pointer' : 'default'; });
addEventListener('pointerup', e => { const p = ptr.down ? toLogical(e) : null; ptr.down = false; const sc = SCENES[P.i]; sc.up && sc.up.call(sc, P.S, p); });
cv.addEventListener('wheel', e => { const sc = SCENES[P.i]; if (sc.wheel) { e.preventDefault(); sc.wheel(P.S, e.deltaY); } }, { passive: false });
cv.addEventListener('pointerleave', () => { if (!ptr.down) { ptr.x = ptr.y = -1; } });

/* controls */
$('begin').onclick = () => { enter(0); play(); };
cont.onclick = () => next();
$('play').onclick = () => {
  if (P.playing) return pause();
  if (P.waiting) return next();
  if (!P.started) enter(0);
  if (P.i === SCENES.length - 1 && P.t >= SCENES[P.i].dur - .05) enter(0);
  play();
};
$('prev').onclick = () => { enter(P.t > 3 ? P.i : P.i - 1); play(); };
$('next').onclick = () => { enter(P.i + 1); play(); };
function tog(id, fn) { const b = $(id); b.onclick = () => { const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v); fn(v); }; }
tog('tVoice', v => { AU.on.voice = v; if (!v) stopSpeech(); });
tog('tTabla', v => { AU.on.tabla = v; if (AU.ctx && AU.tabla) AU.tabla.gain.setTargetAtTime(v ? TABLA_VOL : 0, AU.ctx.currentTime, .15); });
tog('tSfx', v => { AU.on.sfx = v; if (AU.ctx) AU.sfx.gain.setTargetAtTime(v ? .5 : 0, AU.ctx.currentTime, .05); });
tog('tCC', v => { CCON = v; cc.textContent = v ? P.lastCaption : ''; });
tog('tAuto', v => { AUTO = v; });
addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if ((tag === 'BUTTON' || tag === 'SUMMARY') && (e.code === 'Space' || e.key === 'Enter')) return;
  if (!$('finderPane').hidden) { if (e.key === 'Escape' || ((e.key === 't' || e.key === 'T') && !/INPUT|SELECT|TEXTAREA/.test(tag))) { e.preventDefault(); closeFinder(); } return; }
  if (e.key === 't' || e.key === 'T') { e.preventDefault(); goFinder(); return; }
  const menuOpen = !$('menu').hidden;
  if (e.key === 'Escape' && menuOpen) { openMenu(false); return; }
  if (e.key === 'm' || e.key === 'M' || e.key === 'Home') { e.preventDefault(); openMenu(!menuOpen); return; }
  if (e.key === 'f' || e.key === 'F') { $('fsBtn').click(); return; }
  if (menuOpen) return;
  if (e.code === 'Space') { e.preventDefault(); $('play').click(); }
  else if (e.code === 'ArrowRight' || e.key === 'n' || e.key === 'N' || e.key === 'PageDown') { e.preventDefault(); $('next').click(); }
  else if (e.code === 'ArrowLeft' || e.key === 'p' || e.key === 'P' || e.key === 'PageUp') { e.preventDefault(); goScene(P.i - 1); }
  else if (e.key === 's' || e.key === 'S') { if (!$('skip').hidden) skipToExplore(); }
});
const bar = $('bar'), segs = SCENES.filter(s => !s.optional).map(s => { const d = document.createElement('div'); d.className = 'seg'; d.style.flex = s.dur; d.innerHTML = '<i></i>'; d.title = s.name; bar.appendChild(d); return d; });
bar.addEventListener('click', e => {
  const r = bar.getBoundingClientRect(), f = (e.clientX - r.left) / r.width * TOTAL;
  let i = starts.findIndex((s, k) => k < NMAIN && f >= s && f < s + SCENES[k].dur); if (i < 0) i = NMAIN - 1;
  const sc = SCENES[i]; let t = f - starts[i]; const c = [...sc.cues].reverse().find(c => c[0] <= t); t = c ? c[0] : 0;
  enter(i, t); play();
});
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function updateBar() {
  segs.forEach((d, k) => { d.firstChild.style.width = (k < P.i ? 100 : k > P.i ? 0 : clamp(P.t / SCENES[k].dur) * 100) + '%'; });
  $('time').textContent = SCENES[P.i].optional ? `Deep dive ${P.i - NMAIN + 1} of ${SCENES.length - NMAIN}` : `${fmtT(starts[P.i] + Math.min(P.t, SCENES[P.i].dur))} / ${fmtT(TOTAL)}`;
}
const GROUPS = [
  ['Guided tour', 'The basics', ['Welcome', 'Two clocks in the sky', 'Five limbs of time']],
  ['Guided tour', 'The five limbs', ['Tithi, the lunar day', 'Vara, the weekday', 'Why only seven? The Navagrahas', 'Nakshatra, the star mansions', 'Yoga, the union', 'Karana, half a tithi']],
  ['Guided tour', 'The calendar', ['Months and rashis', 'Adhika Masa, the leap month', 'Eras and festivals', 'Your Panchang']],
  ['Deep dive', 'Meaning', ['Why exactly five?', 'Rashi, Nakshatra, Pada']],
  ['Deep dive', 'The sky in 3D', ['The sky as a sphere', 'Your sky, tonight', 'Measuring angles in the sky', 'Precession and ayanamsa']],
  ['Deep dive', 'Moon, shadows and time', ['Rahu, Ketu and eclipses', 'Phases in motion', 'Sidereal vs synodic month', 'The Panchang clock']]
];
const BLURB = { 'Welcome': 'Meet Chandra', 'Two clocks in the sky': 'Sun and Moon as clocks', 'Five limbs of time': 'What Panchang means', 'Tithi, the lunar day': '12° steps, 20–26 hours', 'Vara, the weekday': 'Seven grahas, the hora star', 'Why only seven? The Navagrahas': 'Visible grahas, Rahu & Ketu', 'Nakshatra, the star mansions': '27 mansions and their stars', 'Yoga, the union': 'Sun + Moon', 'Karana, half a tithi': '6° steps, Vishti', 'Months and rashis': 'Amanta vs Purnimanta', 'Adhika Masa, the leap month': 'Keeping festivals in season', 'Eras and festivals': 'Samvats, Diwali vs Sankranti', 'Your Panchang': 'Wrap-up', 'Why exactly five?': 'The traditional view', 'Rashi, Nakshatra, Pada': '12 × 27 × 108 wheel', 'The sky as a sphere': 'Explore the zodiac in 3D', 'Your sky, tonight': 'Horizon view, any place', 'Measuring angles in the sky': 'Fists, fingers, degrees', 'Precession and ayanamsa': 'The wobbling axis', 'Rahu, Ketu and eclipses': 'Nodes, eclipse seasons', 'Phases in motion': 'Watch tithi & yoga tick', 'The Panchang clock': 'Ghati, pala, live almanac', 'Sidereal vs synodic month': '27.3 vs 29.5 days, and why' };
const idxOf = name => SCENES.findIndex(s => s.name === name);
{ const placed = new Set(GROUPS.flatMap(g => g[2])); const rest = SCENES.filter(s => !placed.has(s.name)).map(s => s.name); if (rest.length) GROUPS.push(['More', 'Other sections', rest]); }
const label = k => SCENES[k].optional ? 'D' + (k - NMAIN + 1) : String(k + 1).padStart(2, '0');
function goScene(k) { if (k < 0 || k >= SCENES.length) return; openMenu(false); enter(k); play(); }
const chips = [], tiles = [];
GROUPS.forEach(([kind, title, names]) => {
  const row = document.createElement('div'); row.className = 'navrow'; row.innerHTML = `<span class="navh"><em>${kind}</em>${title}</span>`; $('nav').appendChild(row);
  const card = document.createElement('section'); card.className = 'mgrp' + (kind === 'Deep dive' ? ' deep' : ''); card.innerHTML = `<h3><em>${kind}</em> ${title}</h3>`; $('menuGrid').appendChild(card);
  names.forEach(n => {
    const k = idxOf(n); if (k < 0) return;
    const b = document.createElement('button'); b.className = 'chip' + (SCENES[k].optional ? ' opt' : ''); b.innerHTML = `<b>${label(k)}</b>${n}`; b.onclick = () => goScene(k); row.appendChild(b); chips[k] = b;
    const t = document.createElement('button'); t.className = 'tile'; t.innerHTML = `<b>${label(k)}</b><span>${n}</span><small>${BLURB[n] || ''}${SCENES[k].sky ? ' · interactive' : ''}</small>`; t.onclick = () => goScene(k); card.appendChild(t); tiles[k] = t;
  });
});
function openMenu(on) { $('menu').hidden = !on; $('menuBtn').setAttribute('aria-expanded', on); if (on) { if (P.playing) pause(); const t = tiles[P.i]; if (t) t.focus({ preventScroll: true }); } }
$('menuBtn').onclick = () => openMenu($('menu').hidden); $('menuClose').onclick = () => openMenu(false);
$('menuFinder').onclick = () => { openMenu(false); goFinder(); };
$('introMenu').onclick = () => { $('intro').hidden = true; P.started = true; openMenu(true); };
function updateChips() { chips.forEach((c, k) => c && c.classList.toggle('on', k === P.i && P.started)); tiles.forEach((c, k) => c && c.classList.toggle('on', k === P.i)); }
function goFinder() { if (P.playing) pause(); if (!$('menu').hidden) openMenu(false); $('finderPane').hidden = false; $('finderPane').scrollTop = 0; setTimeout(() => { try { $('fDate').focus({ preventScroll: true }); } catch (er) { } }, 50); }
function closeFinder() { $('finderPane').hidden = true; }
addEventListener('keydown', ev => { if (ev.key === 'Escape' && !$('finderPane').hidden && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) closeFinder(); });
$('finderClose').onclick = closeFinder; ['finderBtn', 'finderPill', 'finderTop'].forEach(id => $(id).onclick = goFinder);
$('introFinder').onclick = () => { $('intro').hidden = true; P.started = true; goFinder(); };

/* words in this scene */
function renderWords() {
  const box = $('wordChips'); box.innerHTML = ''; $('def').hidden = true;
  (SCENES[P.i].terms || []).forEach(k => {
    const t = TERMS[k]; if (!t) return;
    const b = document.createElement('button'); b.className = 'word'; b.innerHTML = `${k} <span lang="sa">${t[0]}</span>`;
    b.onclick = () => { $('def').innerHTML = `<strong>${k}</strong> <span lang="sa">${t[0]}</span> ${t[1]} <button class="say" type="button">Hear it</button>`; $('def').hidden = false; $('def').querySelector('.say').onclick = () => speakWord(k, t[0]); speakWord(k, t[0]); };
    box.appendChild(b);
  });
}

/* voice menus */
function fillVoiceMenus() {
  const vs = allVoices(), en = $('vEn'), hi = $('vHi'); if (!en) return;
  const opt = (v, sel) => `<option value="${v.voiceURI.replace(/"/g, '&quot;')}"${sel ? ' selected' : ''}>${v.name} (${v.lang})</option>`;
  en.innerHTML = `<option value="auto"${TTS.enSel === 'auto' ? ' selected' : ''}>Automatic${TTS.en ? ': ' + TTS.en.name : ''}</option>` + vs.filter(v => /^en/i.test(v.lang)).sort((a, b) => scoreEn(b) - scoreEn(a)).map(v => opt(v, TTS.enSel === v.voiceURI)).join('');
  hi.innerHTML = `<option value="auto"${TTS.hiSel === 'auto' ? ' selected' : ''}>Automatic${TTS.hi ? ': ' + TTS.hi.name : ' (no Hindi voice found)'}</option><option value="same"${TTS.hiSel === 'same' ? ' selected' : ''}>Same as English voice</option>` + vs.filter(v => /^hi/i.test(v.lang)).sort((a, b) => scoreHi(b) - scoreHi(a)).map(v => opt(v, TTS.hiSel === v.voiceURI)).join('');
  $('vNote').textContent = TTS.hi ? '' : 'No Hindi voice was found on this device, so Sanskrit words use the English voice with a phonetic spelling. Microsoft Edge and Chrome include natural Indian voices.';
}
$('vEn').addEventListener('change', e => { TTS.enSel = e.target.value; pickVoices(); });
$('vHi').addEventListener('change', e => { TTS.hiSel = e.target.value; pickVoices(); });
{ const vs = $('vSrc'); if (!TTS.recorded) { vs.value = 'tts'; vs.disabled = true; vs.title = 'Recorded narration is not included in this copy'; } else vs.value = 'rec';
  vs.addEventListener('change', () => { TTS.useRec = vs.value === 'rec' && TTS.recorded; }); }
$('vTest').onclick = () => speak("Namaste! This is {Chandra|चन्द्र}. Today's {tithi|तिथि} is {Amavasya|अमावस्या}, and the {karana|करण} is {Vishti|विष्टि}.");

/* ================= Finder ================= */
const CITIES = [
  ['Bengaluru', 12.9716, 77.5946, 'Asia/Kolkata'], ['Mumbai', 19.076, 72.8777, 'Asia/Kolkata'], ['New Delhi', 28.6139, 77.209, 'Asia/Kolkata'],
  ['Chennai', 13.0827, 80.2707, 'Asia/Kolkata'], ['Kolkata', 22.5726, 88.3639, 'Asia/Kolkata'], ['Hyderabad', 17.385, 78.4867, 'Asia/Kolkata'],
  ['Pune', 18.5204, 73.8567, 'Asia/Kolkata'], ['Ahmedabad', 23.0225, 72.5714, 'Asia/Kolkata'], ['Jaipur', 26.9124, 75.7873, 'Asia/Kolkata'],
  ['Varanasi', 25.3176, 82.9739, 'Asia/Kolkata'], ['Ujjain', 23.1765, 75.7885, 'Asia/Kolkata'], ['Mangaluru', 12.9141, 74.856, 'Asia/Kolkata'],
  ['Kathmandu', 27.7172, 85.324, 'Asia/Kathmandu'], ['Singapore', 1.3521, 103.8198, 'Asia/Singapore'], ['Dubai', 25.2048, 55.2708, 'Asia/Dubai'],
  ['London', 51.5074, -0.1278, 'Europe/London'], ['New York', 40.7128, -74.006, 'America/New_York'], ['Chicago', 41.8781, -87.6298, 'America/Chicago'],
  ['Edgewater, NJ', 40.8270, -73.9757, 'America/New_York'], ['San Francisco', 37.7749, -122.4194, 'America/Los_Angeles'], ['Toronto', 43.6532, -79.3832, 'America/Toronto'], ['Sydney', -33.8688, 151.2093, 'Australia/Sydney']
];
const sel = $('fCity');
CITIES.forEach((c, i) => { const o = document.createElement('option'); o.value = i; o.textContent = c[0]; sel.appendChild(o); });
const oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = 'Custom…'; sel.appendChild(oc);
function tzOffset(tz, y, m, d, h, mi) {
  try {
    const guess = Date.UTC(y, m - 1, d, h, mi);
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const get = ms => { const p = Object.fromEntries(f.formatToParts(new Date(ms)).map(x => [x.type, x.value])); return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - ms) / 3.6e6; };
    let off = get(guess); off = get(guess - off * 3.6e6); return off;
  } catch (e) { return null; }
}
function fillCity() {
  if (sel.value === 'custom') { $('adv').open = true; return; }
  const c = CITIES[+sel.value]; $('fLat').value = c[1]; $('fLon').value = c[2];
  const [y, m, d] = ($('fDate').value || '2026-01-01').split('-').map(Number), [h, mi] = ($('fTime').value || '12:00').split(':').map(Number);
  const off = tzOffset(c[3], y, m, d, h, mi); if (off != null) $('fTz').value = off;
}
sel.addEventListener('change', fillCity);
['fLat', 'fLon', 'fTz'].forEach(id => $(id).addEventListener('input', () => { sel.value = 'custom'; }));
$('fDate').addEventListener('change', () => { if (sel.value !== 'custom') fillCity(); });
function setNow() {
  const c = sel.value === 'custom' ? null : CITIES[+sel.value], now = new Date(); let parts;
  if (c) { const f = new Intl.DateTimeFormat('en-CA', { timeZone: c[3], hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); parts = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value])); }
  else { const off = +$('fTz').value || 0, d = new Date(now.getTime() + off * 3.6e6); parts = { year: d.getUTCFullYear(), month: String(d.getUTCMonth() + 1).padStart(2, '0'), day: String(d.getUTCDate()).padStart(2, '0'), hour: String(d.getUTCHours()).padStart(2, '0'), minute: String(d.getUTCMinutes()).padStart(2, '0') }; }
  $('fDate').value = `${parts.year}-${parts.month}-${parts.day}`; $('fTime').value = `${String(+parts.hour % 24).padStart(2, '0')}:${parts.minute}`;
  if (c) fillCity();
}
$('fNow').onclick = () => { setNow(); compute(); };
$('pf').addEventListener('submit', e => { e.preventDefault(); compute(); });
function showErr(s) { const e = $('fErr'); e.textContent = s; e.hidden = false; }
function compute() {
  $('fErr').hidden = true;
  const ds = $('fDate').value, ts = $('fTime').value || '12:00';
  const lat = parseFloat($('fLat').value), lon = parseFloat($('fLon').value), tz = parseFloat($('fTz').value);
  if (!ds) return showErr('Pick a date to continue.');
  const [y, m, d] = ds.split('-').map(Number), [h, mi] = ts.split(':').map(Number);
  if (y < 1900 || y > 2099) return showErr('Choose a date between 1900 and 2099. The Moon model is tuned for that range.');
  if (!isFinite(lat) || !isFinite(lon) || !isFinite(tz) || Math.abs(lat) > 66) return showErr('Enter a latitude between −66 and 66, a longitude, and a UTC offset in hours.');
  const jd = Date.UTC(y, m - 1, d, h, mi) / 864e5 + 2440587.5 - tz / 24, jdMid = Date.UTC(y, m - 1, d) / 864e5 + 2440587.5 - tz / 24;
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const r = panchang(jd, { lat, lon, jdLocalMidnight: jdMid, weekdayCivil: wd, gYear: y, gMonth: m });
  render(r, { y, m, d, h, mi, tz, jd, wd });
}
function fmtJD(jd, tz, base, short) {
  if (!jd) return '—';
  const dt = new Date((jd - 2440587.5) * 864e5 + tz * 3.6e6), hh = dt.getUTCHours(), mm = dt.getUTCMinutes();
  const t = `${(hh % 12) || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
  const same = dt.getUTCFullYear() === base.y && dt.getUTCMonth() + 1 === base.m && dt.getUTCDate() === base.d;
  return same || short ? t : `${MONTHS_EN_ABBR[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${t}`;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function render(r, b) {
  const f = jd => fmtJD(jd, b.tz, b), fs = jd => fmtJD(jd, b.tz, b, true);
  const tn = r.tithiNo, tLabel = (tn <= 15 ? 'Shukla ' : 'Krishna ') + r.tithi;
  const limb = (k, dev, v, n, five = true) => `<div class="limb${five ? ' five' : ''}"><div class="k"><span>${k}</span><span lang="sa">${dev}</span></div><div class="v">${v}</div><div class="n">${n}</div></div>`;
  const nearEdge = Math.min(Math.abs(r.tithiEnd - b.jd), Math.abs(r.tithiStart - b.jd)) * 1440 < 20;
  const [nm, nsym, nstar] = NAK_INFO[r.nakIdx];
  $('res').innerHTML = `
    <div class="moonbox"><canvas id="mc" width="400" height="400" aria-label="Moon phase"></canvas>
      <div class="big">${tLabel}</div>
      <div class="sub">${r.paksha} Paksha · Moon ${Math.round(r.p.el)}° ahead of the Sun<br>${Math.round((1 - Math.cos(r.p.el * DEG)) / 2 * 100)}% lit</div></div>
    <div class="limbs">
      ${limb('Tithi', 'तिथि', tLabel, `${tn <= 15 ? tn : tn - 15} of 15 · ends ${f(r.tithiEnd)}`)}
      ${limb('Vara', 'वार', r.vara[0], `${r.vara[1]} · lord ${r.vara[2]}${r.beforeSunrise ? ' · before sunrise, so the previous day' : ''}`)}
      ${limb('Nakshatra', 'नक्षत्र', r.nak, `“${nm}” · ${nstar} · pada ${r.pada} · ends ${f(r.nakEnd)}`)}
      ${limb('Yoga', 'योग', r.yoga, `“${YOGA_MEAN[r.yogaIdx]}” · ends ${f(r.yogaEnd)}`)}
      ${limb('Karana', 'करण', r.karana, `ends ${f(r.karanaEnd)}`)}
      ${limb('Lunar month', 'मास', r.amanta, r.purnimanta !== r.amanta ? `Amanta (South & West) · Purnimanta: ${r.purnimanta}` : (r.adhika ? 'Leap month: no Sankranti falls in it' : 'Same in Amanta and Purnimanta'), false)}
      ${limb('Sun · Moon rashi', 'राशि', `${RASHI[r.sunRashi]} · ${RASHI[r.moonRashi]}`, `Sun in ${RASHI_EN[r.sunRashi]}, Moon in ${RASHI_EN[r.moonRashi]} (sidereal)`, false)}
      ${limb('Sunrise · Sunset', 'सूर्योदय', `${f(r.sunrise)}`, `Sunset ${f(r.sunset)}${r.sunriseTithi ? ` · tithi at sunrise: ${r.sunriseTithi}` : ''}`, false)}
      ${limb('Samvat', 'संवत्', `Vikram ${r.vikram}`, `Shaka ${r.shaka} · both begin at Chaitra Shukla Pratipada`, false)}
    </div>`;
  drawMini($('mc'), r.p.el);
  // significance
  const n15 = (tn - 1) % 15, grp = TITHI_GROUP[n15 % 5], special = tithiSpecial(tn);
  const nat = NAK_NATURE[r.nakIdx], ni = NATURE_INFO[nat], ybad = YOGA_BAD.has(r.yogaIdx), knote = KAR_NOTE[r.karana] || '', kbad = r.karana === 'Vishti' || r.karana === 'Naga';
  const good = [], avoid = [];
  if (grp[3]) good.push(grp[2]); else avoid.push('starting new ventures (Rikta tithi)');
  if (ni[2]) good.push(ni[1]); else if (ni[2] === false) avoid.push('gentle or auspicious ceremonies (' + nat + ' nakshatra)');
  if (ybad) avoid.push(`important beginnings (${r.yoga} yoga)`); if (r.karana === 'Vishti') avoid.push('auspicious starts while Vishti (Bhadra) karana lasts');
  if (tn === 30) avoid.push('new ventures on Amavasya');
  let day = '';
  if (r.sunrise && r.sunset) {
    const len = r.sunset - r.sunrise, seg = len / 8, wd = b.wd;
    const span = k => [r.sunrise + (k - 1) * seg, r.sunrise + k * seg];
    const rk = span(RAHU_SEG[wd]), ym = span(YAMA_SEG[wd]), gk = span(GULIKA_SEG[wd]), mid = (r.sunrise + r.sunset) / 2, ab = [mid - len / 30, mid + len / 30];
    const pct = x => ((x - r.sunrise) / len * 100).toFixed(2);
    const bar = (s, c, l) => `<i style="left:${pct(s[0])}%;width:${(pct(s[1]) - pct(s[0])).toFixed(2)}%;background:${c}" title="${l}"></i>`;
    const nowMark = b.jd > r.sunrise && b.jd < r.sunset ? `<b style="left:${pct(b.jd)}%" title="Chosen time"></b>` : '';
    day = `<div class="sig day"><h4>Timings through the day</h4>
      <div class="daybar">${bar(rk, 'var(--bad)', 'Rahu Kalam')}${bar(ym, 'var(--warn)', 'Yamaganda')}${bar(gk, 'var(--gul)', 'Gulika Kalam')}${wd !== 3 ? bar(ab, 'var(--good)', 'Abhijit Muhurta') : ''}${nowMark}</div>
      <div class="dayends"><span>Sunrise ${fs(r.sunrise)}</span><span>Sunset ${fs(r.sunset)}</span></div>
      <ul class="tl">
        <li><em style="background:var(--bad)"></em><strong>Rahu Kalam</strong> ${fs(rk[0])} – ${fs(rk[1])}<span>Widely avoided for starting new work or travel.</span></li>
        <li><em style="background:var(--warn)"></em><strong>Yamaganda</strong> ${fs(ym[0])} – ${fs(ym[1])}<span>Considered unfavourable for beginnings.</span></li>
        <li><em style="background:var(--gul)"></em><strong>Gulika Kalam</strong> ${fs(gk[0])} – ${fs(gk[1])}<span>Tradition says work begun now tends to repeat; avoid for sad events.</span></li>
        ${wd !== 3 ? `<li><em style="background:var(--good)"></em><strong>Abhijit Muhurta</strong> ${fs(ab[0])} – ${fs(ab[1])}<span>The midday “victorious” window, good for most beginnings.</span></li>` : `<li><em style="background:var(--good)"></em><strong>Abhijit Muhurta</strong><span>Traditionally not used on Wednesdays.</span></li>`}
      </ul></div>`;
  }
  $('sig').innerHTML = `
    <h3>What the day means</h3>
    <p class="lede2">Traditional Jyotisha associations for this moment, shared for cultural context. For weddings, griha pravesha and other important muhurtas, families usually consult a priest or their regional panchang.</p>
    <div class="glance">
      <div><h4>Traditionally favoured</h4><ul>${good.length ? good.map(g => `<li>${esc(g[0].toUpperCase() + g.slice(1))}</li>`).join('') : '<li>Routine, everyday work</li>'}</ul></div>
      <div class="av"><h4>Traditionally avoided</h4><ul>${avoid.length ? avoid.map(g => `<li>${esc(g[0].toUpperCase() + g.slice(1))}</li>`).join('') : '<li>Nothing specific today, apart from Rahu Kalam</li>'}</ul></div>
    </div>
    <div class="sigs">
      <div class="sig"><h4>Tithi · ${esc(tLabel)}</h4><p>A <strong>${grp[0]}</strong> tithi (${grp[1]}): ${grp[2]}.${special ? ` <br>${esc(special)}.` : ''}</p><span class="tag ${grp[3] ? 'ok' : 'no'}">${grp[3] ? 'Generally favourable' : 'Caution for beginnings'}</span></div>
      <div class="sig"><h4>Vara · ${r.vara[0]}</h4><p>${VARA_NOTE[r.varaIdx]}</p></div>
      <div class="sig"><h4>Nakshatra · ${r.nak} <span lang="sa">${NAK_DEV[r.nakIdx]}</span></h4><p>“${nm}”. Symbol: ${nsym}. Deity: ${NAK_DEITY[r.nakIdx]}. A <strong>${nat}</strong> (${ni[0]}) nakshatra, good for ${ni[1]}.</p><span class="tag ${ni[2] ? 'ok' : ni[2] === false ? 'no' : ''}">${ni[2] ? 'Favourable' : ni[2] === false ? 'Use with care' : 'Mixed'}</span></div>
      <div class="sig"><h4>Yoga · ${r.yoga}</h4><p>“${YOGA_MEAN[r.yogaIdx]}”. Tradition links yoga with Akasha (space) and with health, mood and relationships.</p><span class="tag ${ybad ? 'no' : 'ok'}">${ybad ? 'A time to pause' : 'Favourable'}</span></div>
      <div class="sig"><h4>Karana · ${r.karana}</h4><p>${esc(knote[0].toUpperCase() + knote.slice(1))}. Tradition links karana with Prithvi (earth) and with action and results.</p><span class="tag ${kbad ? 'no' : 'ok'}">${kbad ? 'Avoid for new starts' : 'Workable'}</span></div>
      <div class="sig birth"><h4>Birth star · if this is a birth time</h4><p>Janma nakshatra <strong>${r.nak}</strong>, pada ${r.pada} · Moon rashi <strong>${RASHI[r.moonRashi]}</strong> (${RASHI_EN[r.moonRashi]}), ruled by ${RASHI_LORD[r.moonRashi]}, ${RASHI_ELEM[r.moonRashi % 4].toLowerCase()} sign · nakshatra lord ${NAK_LORD[r.nakIdx % 9]}.</p><p class="syl">Traditional name syllable: <strong>${PADA_SYL[r.nakIdx * 4 + r.pada - 1][0]}</strong> <span lang="sa">${PADA_SYL[r.nakIdx * 4 + r.pada - 1][1]}</span> <button class="say" type="button" id="saySyl">Hear it</button></p></div>
      ${day}
    </div>`;
  const ss = PADA_SYL[r.nakIdx * 4 + r.pada - 1]; $('saySyl').onclick = () => speakWord(ss[0], ss[1]);
  $('fNote').innerHTML = `${nearEdge ? '<strong>Heads up:</strong> the tithi changes within about 20 minutes of the time you chose, so printed panchangs may list the neighbouring tithi. ' : ''}` +
    `Results are for the exact time you entered. Printed panchangs usually name the whole day after the tithi and nakshatra in force at sunrise, shown on the sunrise card. Positions come from a compact Sun and Moon model, so change times are good to about a minute or two. Rahu Kalam, Yamaganda and Gulika divide the daylight into eight parts from local sunrise. Month names follow the Amanta convention used in Karnataka, with the Purnimanta name alongside.`;
}
function drawMini(c, e) {
  const keep = ctx; ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 400, 400);
  ctx.fillStyle = '#0B1026'; ctx.fillRect(0, 0, 400, 400);
  for (let i = 0; i < 40; i++) { ctx.globalAlpha = .3 + .5 * ((i * 37) % 10) / 10; circle((i * 97) % 400, (i * 53) % 400, 1.2, '#F6EFD9'); }
  ctx.globalAlpha = 1; glow(200, 200, 190, 'rgba(255,236,190,.5)', .35); moonDisc(200, 200, 120, e); face(200, 200, 118, { blink: false });
  ctx = keep;
}

/* ================= Boot ================= */
init3();
resize();
fillVoiceMenus();
sel.value = 0; setNow(); compute();
CITIES.forEach((c, i) => { const o = document.createElement('option'); o.value = i; o.textContent = c[0]; $('skPlace').appendChild(o); }); { const o = document.createElement('option'); o.value = 'custom'; o.textContent = 'Custom…'; $('skPlace').appendChild(o); }
enter(0, 8.5);
window.__panchangLines = () => ({ cues: SCENES.flatMap(s => s.cues.map(c => c[1])), terms: Object.keys(TERMS), devs: [...new Set([...Object.values(TERMS).map(t => t[0]), ...LIMBS.map(l => l[0]), ...PLAN.map(p => p[4]), ...NAK_DEV, ...PADA_SYL.map(s => s[1]), 'राहु', 'केतु', 'ग्रह'])] });
window.__seek = (i, t) => { P.started = true; $('intro').hidden = true; enter(i, t); };
const startLoop = () => requestAnimationFrame(t => { last = t; frame(t); });
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(startLoop, startLoop);

// discoverability: header link to the sections map, full-screen nudge
$('sectionsTop').onclick = () => { $('intro').hidden = true; P.started = true; openMenu(true); if (!theater.classList.contains('on')) $('stage').scrollIntoView({ block: 'center', behavior: 'smooth' }); };
$('introFs').onclick = () => $('fsBtn').click();
{ let used = false; try { used = localStorage.getItem('fsUsed') === '1'; } catch (er) { } if (!used) $('fsBtn').classList.add('nudge'); }
