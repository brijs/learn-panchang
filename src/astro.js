/* ===== Astronomy: Sun & Moon positions, sidereal (Lahiri), panchang limbs ===== */
const D2R = Math.PI / 180;
const norm = a => ((a % 360) + 360) % 360;
const wrap180 = a => norm(a + 180) - 180;

function deltaT(y) {
  const t = y - 2000;
  if (y >= 2050) { const u = (y - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - y); }
  if (y >= 2005) return 62.92 + 0.32217 * t + 0.005589 * t * t;
  if (y >= 1986) return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  if (y >= 1961) { const s = y - 1975; return 45.45 + 1.067 * s - s * s / 260 - s ** 3 / 718; }
  if (y >= 1941) { const s = y - 1950; return 29.07 + 0.407 * s - s * s / 233 + s ** 3 / 2547; }
  if (y >= 1920) { const s = y - 1920; return 21.20 + 0.84493 * s - 0.0761 * s * s + 0.0020936 * s ** 3; }
  if (y >= 1900) { const s = y - 1900; return -2.79 + 1.494119 * s - 0.0598939 * s * s + 0.0061966 * s ** 3 - 0.000197 * s ** 4; }
  const u = (y - 1820) / 100; return -20 + 32 * u * u;
}

function sunLon(jde) {
  const T = (jde - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * D2R;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const om = (125.04 - 1934.136 * T) * D2R;
  return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(om));
}

// Meeus ch.47 main periodic terms for lunar longitude: D, M, M', F, coeff(1e-6 deg)
const MOON_TERMS = [
  [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
  [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
  [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
  [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
  [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
  [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
  [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
  [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
  [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
  [2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],
  [2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],
  [2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]
];

function moonLon(jde) {
  const T = (jde - 2451545) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sl = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    let k = c; if (Math.abs(m) === 1) k *= E; else if (Math.abs(m) === 2) k *= E * E;
    sl += k * Math.sin((d * D + m * M + mp * Mp + f * F) * D2R);
  }
  const A1 = (119.75 + 131.849 * T) * D2R, A2 = (53.09 + 479264.29 * T) * D2R;
  sl += 3958 * Math.sin(A1) + 1962 * Math.sin((Lp - F) * D2R) + 318 * Math.sin(A2);
  const om = (125.04 - 1934.136 * T) * D2R;
  return norm(Lp + sl / 1e6 - 0.00478 * Math.sin(om));
}

function ayanamsa(jde) { return 23.857 + 0.0139663 * (jde - 2451545) / 365.25; }

function pos(jd) {
  const y = 2000 + (jd - 2451545) / 365.25;
  const jde = jd + deltaT(y) / 86400;
  const s = sunLon(jde), m = moonLon(jde), ay = ayanamsa(jde);
  return { s, m, ss: norm(s - ay), ms: norm(m - ay), el: norm(m - s), yg: norm(s + m - 2 * ay) };
}

const fnEl = jd => pos(jd).el, fnMs = jd => pos(jd).ms, fnYg = jd => pos(jd).yg, fnSs = jd => pos(jd).ss;

// Find jd where fn(jd) == target (mod 360), starting from a guess
function solve(fn, target, jd) {
  for (let i = 0; i < 40; i++) {
    const v = fn(jd), d = wrap180(target - v);
    if (Math.abs(d) < 1e-6) break;
    const r = wrap180(fn(jd + 0.02) - v) / 0.02;
    jd += d / r;
  }
  return jd;
}
function nextCross(fn, jd, step, rate) {
  const v = fn(jd); const target = norm((Math.floor(v / step) + 1) * step);
  const ahead = norm(target - v);
  return solve(fn, target, jd + ahead / rate);
}
function prevCross(fn, jd, step, rate) {
  const v = fn(jd); const target = Math.floor(v / step) * step;
  const back = norm(v - target);
  return solve(fn, target, jd - back / rate);
}

function sunriseSet(jdMid, lat, lon, rise) {
  // jdMid: local midnight (as UT jd). Iterate hour angle.
  let jd = jdMid + (rise ? 6 : 18) / 24;
  const h0 = -0.833 * D2R, phi = lat * D2R;
  for (let i = 0; i < 6; i++) {
    const p = pos(jd);
    const lam = p.s * D2R, eps = (23.4393 - 3.563e-7 * (jd - 2451545)) * D2R;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const ra = norm(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / D2R);
    const cosH = (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
    if (cosH < -1 || cosH > 1) return null;
    const H = Math.acos(cosH) / D2R;
    const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545));
    const ha = wrap180(gmst + lon - ra);
    const want = rise ? -H : H;
    jd += wrap180(want - ha) / 360.9856;
  }
  return jd;
}

const TITHI = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima'];
const NAK = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const NAK_DEITY = ['the Ashvins','Yama','Agni','Prajapati','Soma','Rudra','Aditi','Brihaspati','the Nagas','the Pitrs','Bhaga','Aryaman','Savitr','Tvashtr','Vayu','Indra & Agni','Mitra','Indra','Nirriti','Apas','the Vishvedevas','Vishnu','the Vasus','Varuna','Aja Ekapada','Ahir Budhnya','Pushan'];
const YOGA = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
const KAR_MOV = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
const VARA = [['Ravivara','Sunday','Surya'],['Somavara','Monday','Chandra'],['Mangalavara','Tuesday','Mangala'],['Budhavara','Wednesday','Budha'],['Guruvara','Thursday','Guru'],['Shukravara','Friday','Shukra'],['Shanivara','Saturday','Shani']];
const MONTHS = ['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashvin','Kartika','Margashirsha','Pausha','Magha','Phalguna'];
const RASHI = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function karanaName(k) {
  if (k === 0) return 'Kimstughna';
  if (k >= 57) return ['Shakuni','Chatushpada','Naga'][k - 57];
  return KAR_MOV[(k - 1) % 7];
}
function tithiName(n) { // n 1..30
  if (n === 30) return 'Amavasya';
  return TITHI[(n - 1) % 15];
}

function panchang(jd, opts) {
  // opts: {lat, lon, jdLocalMidnight, weekdayCivil, gYear, gMonth}
  const p = pos(jd);
  const tIdx = Math.floor(p.el / 12);        // 0..29
  const tithiNo = tIdx + 1;
  const paksha = tIdx < 15 ? 'Shukla' : 'Krishna';
  const nIdx = Math.floor(p.ms / (360 / 27));
  const pada = Math.floor((p.ms % (360 / 27)) / (360 / 108)) + 1;
  const yIdx = Math.floor(p.yg / (360 / 27));
  const kIdx = Math.floor(p.el / 6);
  const res = {
    p, tithiNo, paksha, tithi: tithiName(tithiNo),
    tithiStart: prevCross(fnEl, jd, 12, 12.19), tithiEnd: nextCross(fnEl, jd, 12, 12.19),
    nak: NAK[nIdx], nakIdx: nIdx, pada, nakDeity: NAK_DEITY[nIdx], nakEnd: nextCross(fnMs, jd, 360 / 27, 13.18),
    yoga: YOGA[yIdx], yogaIdx: yIdx, yogaEnd: nextCross(fnYg, jd, 360 / 27, 14.16),
    karana: karanaName(kIdx), karanaEnd: nextCross(fnEl, jd, 6, 12.19),
    sunRashi: Math.floor(p.ss / 30), moonRashi: Math.floor(p.ms / 30)
  };
  // Lunar month (amanta): new moons bracketing
  const nm0 = solve(fnEl, 0, jd - p.el / 12.19);
  const nm1 = solve(fnEl, 0, jd + (360 - p.el) / 12.19);
  const r0 = Math.floor(fnSs(nm0) / 30), r1 = Math.floor(fnSs(nm1) / 30);
  let mIdx, adhika = false;
  if (r0 === r1) { adhika = true; mIdx = (r1 + 1) % 12; } else mIdx = r1;
  res.nm0 = nm0; res.nm1 = nm1; res.adhika = adhika;
  res.amanta = (adhika ? 'Adhika ' : '') + MONTHS[mIdx];
  res.monthIdx = mIdx;
  res.purnimanta = res.paksha === 'Krishna' && !adhika ? MONTHS[(mIdx + 1) % 12] : res.amanta;
  // Sunrise / weekday
  if (opts) {
    const sr = sunriseSet(opts.jdLocalMidnight, opts.lat, opts.lon, true);
    const ss = sunriseSet(opts.jdLocalMidnight, opts.lat, opts.lon, false);
    res.sunrise = sr; res.sunset = ss;
    let wd = opts.weekdayCivil; res.beforeSunrise = false;
    if (sr && jd < sr) { wd = (wd + 6) % 7; res.beforeSunrise = true; }
    res.vara = VARA[wd]; res.varaIdx = wd;
    if (sr) {
      const ps = pos(sr); const tn = Math.floor(ps.el / 12) + 1;
      res.sunriseTithi = (tn <= 15 ? 'Shukla ' : 'Krishna ') + tithiName(tn);
      res.sunriseNak = NAK[Math.floor(ps.ms / (360 / 27))];
    }
    // Eras: new year at Chaitra Shukla Pratipada
    let shaka = opts.gYear - 78;
    if (opts.gMonth <= 5 && mIdx >= 9) shaka -= 1;
    if (opts.gMonth <= 5 && mIdx === 0 && adhika) shaka -= 1;
    res.shaka = shaka; res.vikram = shaka + 135;
  }
  return res;
}

if (typeof module !== 'undefined') module.exports = { pos, panchang, solve, fnEl, sunriseSet, prevCross, nextCross, fnSs };
