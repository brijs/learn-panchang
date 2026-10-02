/* ===== Low-precision planets (JPL Keplerian elements, 1800–2050) + mean lunar node ===== */
const KEPL = {
  Budha:   [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  Shukra:  [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  Earth:   [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  Mangala: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  Guru:    [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  Shani:   [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]
};
function helio(k, T) {
  const el = KEPL[k], a = el[0] + el[6] * T, e = el[1] + el[7] * T, I = (el[2] + el[8] * T) * DEG, L = el[3] + el[9] * T, wp = el[4] + el[10] * T, O = el[5] + el[11] * T;
  const w = (wp - O) * DEG, Om = O * DEG; let M = ((L - wp) % 360) * DEG, E = M;
  for (let i = 0; i < 8; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
  return [(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, sw * sI * xp + cw * sI * yp];
}
function grahaPos(k, jd) { // tropical ecliptic of date {l, b}
  const T = (jd - 2451545) / 36525;
  if (k === 'Rahu' || k === 'Ketu') { const om = norm(125.04452 - 1934.136261 * T); return { l: k === 'Rahu' ? om : norm(om + 180), b: 0 }; }
  const p = helio(k, T), g = helio('Earth', T), x = p[0] - g[0], y = p[1] - g[1], z = p[2] - g[2];
  return { l: norm(Math.atan2(y, x) / DEG + 1.396971 * T), b: Math.atan2(z, Math.hypot(x, y)) / DEG };
}
function moonLat(jd) {
  const T = (jd - 2451545) / 36525, D = (297.8501921 + 445267.1114034 * T) * DEG, Mp = (134.9633964 + 477198.8675055 * T) * DEG, F = (93.2720950 + 483202.0175233 * T) * DEG;
  return 5.128189 * Math.sin(F) + .280606 * Math.sin(Mp + F) + .277693 * Math.sin(Mp - F) + .173238 * Math.sin(2 * D - F);
}
