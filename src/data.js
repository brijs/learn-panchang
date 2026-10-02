/* ================= Reference data (meanings, traditional associations) ================= */
const TERMS = {
  Panchang: ['पञ्चाङ्ग', '“Five limbs.” The almanac of the five time elements: tithi, vara, nakshatra, yoga and karana.'],
  Pancha: ['पञ्च', '“Five.”'],
  Anga: ['अङ्ग', '“Limb” or part.'],
  Surya: ['सूर्य', 'The Sun.'],
  Chandra: ['चन्द्र', 'The Moon. Also called Soma.'],
  Tithi: ['तिथि', 'Lunar day: the time the Moon takes to gain 12° on the Sun. 30 in a lunar month, lasting about 20 to 26 hours each.'],
  Paksha: ['पक्ष', '“Wing” or side. One half of the lunar month, 15 tithis long.'],
  Shukla: ['शुक्ल', '“Bright, white.” Shukla Paksha is the waxing half, new moon to full moon.'],
  Krishna: ['कृष्ण', '“Dark.” Krishna Paksha is the waning half, full moon to new moon.'],
  Amavasya: ['अमावस्या', '“Dwelling together” (amā + vasya): the new moon, when Sun and Moon share the same place in the sky.'],
  Purnima: ['पूर्णिमा', '“The full one”: the full moon.'],
  Vara: ['वार', 'Weekday, counted from sunrise to sunrise.'],
  Graha: ['ग्रह', '“That which grasps or seizes.” In Jyotisha, a celestial body held to influence life on Earth.'],
  Navagraha: ['नवग्रह', 'The nine grahas: the seven visible bodies plus Rahu and Ketu.'],
  'Chhaya Graha': ['छाया ग्रह', '“Shadow graha.” Rahu and Ketu, points in the sky with no body of their own.'],
  Rahu: ['राहु', 'The Moon’s north (ascending) node, where its path crosses the Sun’s path going north. Linked with eclipses.'],
  Ketu: ['केतु', 'The Moon’s south (descending) node, directly opposite Rahu.'],
  Hora: ['होरा', 'Planetary hour. Each day has 24, each ruled in turn by one of the seven grahas.'],
  Jyotisha: ['ज्योतिष', '“Science of light.” The Indian tradition of astronomy and astrology.'],
  Nakshatra: ['नक्षत्र', 'Lunar mansion: one of 27 star sectors of 13°20′ along the Moon’s path. The Moon spends about a day in each.'],
  Pada: ['पाद', '“Foot” or quarter. Each nakshatra has four padas of 3°20′.'],
  Yoga: ['योग', '“Union.” Sun’s and Moon’s longitudes added together, cut into 27 parts.'],
  Karana: ['करण', '“Doing, action.” Half a tithi (6°), so 60 in a lunar month.'],
  Chara: ['चर', '“Moving.” The 7 karanas that repeat through the month.'],
  Sthira: ['स्थिर', '“Fixed.” The 4 karanas that appear once a month, around the new moon.'],
  Vishti: ['विष्टि', 'The 7th movable karana, also called Bhadra. Traditionally avoided for auspicious beginnings.'],
  Akasha: ['आकाश', '“Space, ether.” The element tradition links with yoga.'],
  Prithvi: ['पृथ्वी', '“Earth.” The element tradition links with karana.'],
  Rashi: ['राशि', '“Heap, group.” One of 12 signs of 30° each.'],
  Sankranti: ['संक्रान्ति', '“Crossing.” The moment the Sun enters a new rashi.'],
  Masa: ['मास', 'Month.'],
  Amanta: ['अमान्त', '“Ending at amāvasya.” Months run new moon to new moon. Used in the South and West, including Karnataka.'],
  Purnimanta: ['पूर्णिमान्त', '“Ending at pūrṇimā.” Months run full moon to full moon. Used across North India.'],
  'Adhika Masa': ['अधिक मास', '“Extra month.” A lunar month with no Sankranti, added about every 32½ months.'],
  Ritu: ['ऋतु', 'Season. Six ritus of two months each.'],
  Samvat: ['संवत्', 'An era, or a year counted in it.'],
  Lagna: ['लग्न', 'The ascendant: the point of the ecliptic rising on the eastern horizon. It moves through all 12 rashis in a day.'],
  Ayanamsa: ['अयनांश', 'The gap between the equinox-based (tropical) zodiac and the star-based (sidereal) zodiac. About 24° today, growing about 1° every 72 years.'],
  Dhruva: ['ध्रुव', '“The fixed one.” The pole star, today Polaris.'],
  'Pancha Mahabhuta': ['पञ्च महाभूत', 'The five great elements: Prithvi (earth), Jala (water), Agni (fire), Vayu (air) and Akasha (space).'],
  Agni: ['अग्नि', 'Fire.'], Jala: ['जल', 'Water.'], Vayu: ['वायु', 'Air, wind.'],
  'Kranti Vritta': ['क्रान्तिवृत्त', 'The ecliptic: the Sun’s yearly path against the stars.'],
  'Vishuva': ['विषुव', 'Equinox: when the Sun crosses the celestial equator and day equals night.'],
  Ghati: ['घटी', 'A unit of 24 minutes. The day, sunrise to sunrise, has 60 ghatis.'],
  Pala: ['पल', 'One sixtieth of a ghati: 24 seconds. Each pala has 60 vipalas of 0.4 seconds.'],
  Prahara: ['प्रहर', 'A watch of the day or night: daylight and darkness are each split into four.'],
  Muhurta: ['मुहूर्त', 'A 48-minute period (two ghatis), 30 in a day. Also means an auspicious moment chosen for an event.'],
  Ayana: ['अयन', 'Half-year: Uttarayana while the Sun moves north, Dakshinayana while it moves south.'],
  Ugadi: ['युगादि', '“Beginning of an age.” New Year in Karnataka, Andhra and Telangana.']
};

const NAK_DEV = ['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढा','उत्तराषाढा','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपदा','उत्तर भाद्रपदा','रेवती'];
// [meaning, symbol, star]
const NAK_INFO = [
  ['born of a horse', 'horse’s head', 'β & γ Arietis'], ['the bearer', 'womb', '35 Arietis'], ['the cutter', 'razor, flame', 'the Pleiades'],
  ['the red one', 'ox cart', 'Aldebaran'], ['deer’s head', 'deer’s head', 'λ Orionis'], ['the moist one', 'teardrop', 'Betelgeuse'],
  ['return of the light', 'quiver of arrows', 'Castor & Pollux'], ['the nourisher', 'cow’s udder, flower', 'δ Cancri'], ['the embrace', 'coiled serpent', 'Hydra’s head'],
  ['the mighty one', 'royal throne', 'Regulus'], ['the former reddish one', 'front legs of a bed', 'δ Leonis'], ['the latter reddish one', 'back legs of a bed', 'Denebola'],
  ['the hand', 'open hand', 'Corvus'], ['the bright one', 'shining jewel', 'Spica'], ['the independent one', 'sprout in the wind', 'Arcturus'],
  ['the forked branch', 'triumphal arch', 'α Librae'], ['following Radha', 'lotus', 'δ Scorpii'], ['the eldest', 'earring, umbrella', 'Antares'],
  ['the root', 'tied roots', 'Scorpion’s tail'], ['the early victory', 'elephant tusk, fan', 'δ Sagittarii'], ['the later victory', 'elephant tusk', 'Nunki'],
  ['hearing', 'ear, three footprints', 'Altair'], ['the wealthiest', 'drum', 'Delphinus'], ['a hundred healers', 'empty circle', 'λ Aquarii'],
  ['the former blessed feet', 'front of a cot, swords', 'Markab'], ['the latter blessed feet', 'back of a cot, twins', 'Algenib'], ['the wealthy one', 'fish, drum', 'ζ Piscium']
];
const NAK_NATURE = ['Kshipra','Ugra','Mishra','Dhruva','Mridu','Tikshna','Chara','Kshipra','Tikshna','Ugra','Ugra','Dhruva','Kshipra','Mridu','Chara','Mishra','Mridu','Tikshna','Tikshna','Ugra','Dhruva','Chara','Chara','Chara','Ugra','Dhruva','Mridu'];
const NATURE_INFO = {
  Dhruva: ['fixed', 'foundations, house-warming, planting and long-term commitments', true],
  Chara: ['movable', 'travel, vehicles and anything involving change', true],
  Kshipra: ['swift', 'trade, learning, medicine and short journeys', true],
  Mridu: ['soft', 'arts, music, friendship, marriage and new clothes', true],
  Mishra: ['mixed', 'routine and everyday work', null],
  Ugra: ['fierce', 'bold or decisive action; avoided for gentle ceremonies', false],
  Tikshna: ['sharp', 'endings, separations and strong measures; avoided for auspicious starts', false]
};
const YOGA_MEAN = ['support, pillar','affection','long life','good fortune','splendour','great danger','good deeds','steadiness','spear, pain','obstacle, knot','growth','the constant','striking','joy','thunderbolt, diamond','success','calamity','excellence','iron bar','auspicious','accomplished','achievable','auspicious','bright','sacred wisdom','the leader','poor support'];
const YOGA_BAD = new Set([0, 5, 8, 9, 12, 14, 16, 18, 26]);
const KAR_NOTE = {
  Bava: 'steady; good for lasting works', Balava: 'learning and religious acts', Kaulava: 'friendship and social matters',
  Taitila: 'home and family matters', Gara: 'farming and building', Vanija: 'trade and business',
  Vishti: 'also called Bhadra; avoided for auspicious beginnings', Shakuni: 'medicine and strategy',
  Chatushpada: 'work with animals and ancestral rites', Naga: 'harsh or permanent tasks; avoided for celebrations', Kimstughna: 'auspicious; good for beginnings'
};
const TITHI_GROUP = [
  ['Nanda', 'joy', 'celebrations, arts and pleasure', true], ['Bhadra', 'well-being', 'auspicious ceremonies, travel and building', true],
  ['Jaya', 'victory', 'competitions and overcoming obstacles', true], ['Rikta', 'empty', 'clearing and endings; new ventures are usually avoided', false],
  ['Purna', 'fullness', 'completion; generally auspicious', true]
];
function tithiSpecial(n) {
  const m = {
    4: 'Vinayaka Chaturthi, a day for Ganesha', 8: 'Ashtami, a day for Durga', 11: 'Ekadashi, a fasting day for Vishnu', 13: 'Pradosha, the evening is sacred to Shiva',
    15: 'Purnima: worship, fasting and Satyanarayana puja', 19: 'Sankashti Chaturthi, a fasting day for Ganesha', 23: 'Kalashtami, a day for Bhairava',
    26: 'Ekadashi, a fasting day for Vishnu', 28: 'Pradosha, the evening is sacred to Shiva', 29: 'Masik Shivaratri, the monthly night of Shiva',
    30: 'Amavasya: offerings to ancestors (tarpana); new ventures are usually avoided'
  };
  return m[n] || '';
}
const VARA_NOTE = [
  'Ruled by Surya. Health, authority, government work and worship of the Sun.',
  'Ruled by Chandra. Travel, family and anything that calls for calm.',
  'Ruled by Mangala. Courage, property and physical effort; many avoid starting auspicious events.',
  'Ruled by Budha. Learning, writing, trade and communication.',
  'Ruled by Guru. Education, teachers, spiritual work and auspicious beginnings.',
  'Ruled by Shukra. Arts, beauty, relationships and buying jewellery or clothes.',
  'Ruled by Shani. Discipline, hard work and service; new beginnings are often postponed.'
];
// eighth-of-daytime segment (1-based) by civil weekday Sun..Sat
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3], YAMA_SEG = [5, 4, 3, 2, 1, 7, 6], GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];

// Avakahada chakra: traditional starting syllable for each pada (regional variants exist)
const PADA_SYL = [['Chu','चु'],['Che','चे'],['Cho','चो'],['La','ला'], ['Li','ली'],['Lu','लू'],['Le','ले'],['Lo','लो'], ['A','अ'],['I','इ'],['U','उ'],['E','ए'],
 ['O','ओ'],['Va','वा'],['Vi','वी'],['Vu','वू'], ['Ve','वे'],['Vo','वो'],['Ka','का'],['Ki','की'], ['Ku','कू'],['Gha','घ'],['Nga','ङ'],['Chha','छ'],
 ['Ke','के'],['Ko','को'],['Ha','हा'],['Hi','ही'], ['Hu','हु'],['He','हे'],['Ho','हो'],['Da','डा'], ['Di','डी'],['Du','डू'],['De','डे'],['Do','डो'],
 ['Ma','मा'],['Mi','मी'],['Mu','मू'],['Me','मे'], ['Mo','मो'],['Ta','टा'],['Ti','टी'],['Tu','टू'], ['Te','टे'],['To','टो'],['Pa','पा'],['Pi','पी'],
 ['Pu','पू'],['Sha','ष'],['Na','ण'],['Tha','ठ'], ['Pe','पे'],['Po','पो'],['Ra','रा'],['Ri','री'], ['Ru','रू'],['Re','रे'],['Ro','रो'],['Ta','ता'],
 ['Ti','ती'],['Tu','तू'],['Te','ते'],['To','तो'], ['Na','ना'],['Ni','नी'],['Nu','नू'],['Ne','ने'], ['No','नो'],['Ya','या'],['Yi','यी'],['Yu','यू'],
 ['Ye','ये'],['Yo','यो'],['Bha','भा'],['Bhi','भी'], ['Bhu','भू'],['Dha','धा'],['Pha','फा'],['Dha','ढा'], ['Bhe','भे'],['Bho','भो'],['Ja','जा'],['Ji','जी'],
 ['Khi','खी'],['Khu','खू'],['Khe','खे'],['Kho','खो'], ['Ga','गा'],['Gi','गी'],['Gu','गू'],['Ge','गे'], ['Go','गो'],['Sa','सा'],['Si','सी'],['Su','सू'],
 ['Se','से'],['So','सो'],['Da','दा'],['Di','दी'], ['Du','दू'],['Tha','थ'],['Jha','झ'],['Na','ञ'], ['De','दे'],['Do','दो'],['Cha','चा'],['Chi','ची']];
const RASHI_DEV = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'];
const RASHI_SYM = ['ram','bull','twins','crab','lion','maiden','scales','scorpion','archer','makara (sea creature)','water-bearer','two fish'];
const RASHI_LORD = ['Mangala','Shukra','Budha','Chandra','Surya','Budha','Shukra','Mangala','Guru','Shani','Shani','Guru'];
const RASHI_ELEM = ['Fire','Earth','Air','Water'];
const ELEM_COL = { Fire: '#F28C28', Earth: '#8FBF6A', Air: '#9AD6DC', Water: '#6F9BFF' };
const NAK_LORD = ['Ketu','Shukra','Surya','Chandra','Mangala','Rahu','Guru','Shani','Budha'];
// Bright stars, J2000 [name, RA°, Dec°, mag, Indian name]
const BRIGHT = [['Sirius',101.29,-16.72,-1.4,'Lubdhaka'],['Canopus',95.99,-52.70,-.7,'Agastya'],['Arcturus',213.92,19.18,-.05,'Swati'],['Vega',279.23,38.78,.03,'Abhijit'],
 ['Capella',79.17,46.00,.08,'Brahmahridaya'],['Rigel',78.63,-8.20,.13,''],['Procyon',114.83,5.22,.34,''],['Betelgeuse',88.79,7.41,.5,'Ardra'],['Achernar',24.43,-57.24,.46,''],
 ['Altair',297.70,8.87,.76,'Shravana'],['Aldebaran',68.98,16.51,.86,'Rohini'],['Spica',201.30,-11.16,.97,'Chitra'],['Antares',247.35,-26.43,1.0,'Jyeshtha'],
 ['Pollux',116.33,28.03,1.14,'Punarvasu'],['Fomalhaut',344.41,-29.62,1.16,''],['Deneb',310.36,45.28,1.25,''],['Regulus',152.09,11.97,1.35,'Magha'],
 ['Castor',113.65,31.89,1.6,''],['Alcyone (Pleiades)',56.87,24.11,2.9,'Krittika'],['Denebola',177.26,14.57,2.1,'Uttara Phalguni'],['Hamal',31.79,23.46,2.0,'Ashwini'],
 ['Markab',346.19,15.21,2.5,'Purva Bhadrapada'],['Polaris',37.95,89.26,2.0,'Dhruva'],['Thuban',211.10,64.38,3.7,'']];
