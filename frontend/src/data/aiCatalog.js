import { DEFAULT_FISH_IMAGE, DEFAULT_PLANT_IMAGE, speciesImageUrl } from '../utils/speciesImages';

export const FISH_PROFILES = {
  'Neon Tetra': {
    image: '/species/neon-tetra.jpg',
    scientificName: 'Paracheirodon innesi',
    description: 'Peaceful schooling fish with iridescent blue-red stripe. Ideal for planted community tanks.',
    care: 'Keep in groups of 6+. Soft, slightly acidic water. Avoid with large aggressive fish.',
    ideal: { ph: '6.0–7.0', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Corydoras': {
    image: '/species/corydoras.jpg',
    scientificName: 'Corydoras paleatus',
    description: 'Bottom-dwelling catfish that cleans substrate and adds activity to the lower tank level.',
    care: 'Keep on smooth gravel or sand. School of 4+ recommended.',
    ideal: { ph: '6.5–7.8', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Guppy': {
    image: '/species/guppy.jpg',
    scientificName: 'Poecilia reticulata',
    description: 'Hardy livebearer with vivid colors. Excellent for beginners.',
    care: 'Tolerates varied water. Males display brighter colors.',
    ideal: { ph: '6.8–7.8', temp: '22–28°C', ammonia: '<0.01 ppm' },
  },
  'Cherry Barb': {
    image: '/species/cherry-barb.jpg',
    scientificName: 'Puntius titteya',
    description: 'Active schooling barb with red coloration. Thrives in planted aquariums.',
    care: 'Group of 6+. Likes dense plants and moderate flow.',
    ideal: { ph: '6.5–7.5', temp: '23–27°C', ammonia: '<0.01 ppm' },
  },
  'Otocinclus': {
    image: '/species/otocinclus.jpg',
    scientificName: 'Otocinclus affinis',
    description: 'Small algae-eating catfish essential for controlling algae on leaves in planted tanks.',
    care: 'Needs established tank with biofilm. Very sensitive to ammonia spikes.',
    ideal: { ph: '6.5–7.5', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Dwarf Gourami': {
    image: '/species/dwarf-gourami.jpg',
    scientificName: 'Trichogaster lalius',
    description: 'Labyrinth fish with brilliant color. Calm surface dweller for planted aquascapes.',
    care: 'Avoid fin-nippers. Prefers calm water and floating plants.',
    ideal: { ph: '6.5–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Silver Dollar': {
    image: '/species/silver-dollar.jpg',
    scientificName: 'Metynnis argenteus',
    description: 'Large herbivore for big tanks. Eats soft plants — use hardy species only.',
    care: 'Needs 200L+ and school of 5+. Strong filtration required.',
    ideal: { ph: '6.0–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Bichir': {
    image: '/species/bichir.jpg',
    scientificName: 'Polypterus senegalus',
    description: 'Prehistoric-looking predator. Unique centerpiece for monster fish setups.',
    care: 'Secure lid — can jump. Feed meaty foods.',
    ideal: { ph: '6.5–7.5', temp: '25–28°C', ammonia: '<0.01 ppm' },
  },
  'Bala Shark': {
    image: '/species/bala-shark.jpg',
    scientificName: 'Balantiocheilos melanopterus',
    description: 'Fast-swimming schooling shark-minnow. Needs long tanks and strong filtration.',
    care: 'Minimum 400L for adult group. Provide open swimming space.',
    ideal: { ph: '6.5–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
};

export const PLANT_PROFILES = {
  'Java Fern': {
    image: '/species/java-fern.jpg',
    scientificName: 'Microsorum pteropus',
    description: 'Hardy rhizome plant that attaches to wood or rock. Thrives without CO₂.',
    care: 'Do not bury rhizome. Low to medium light.',
    ideal: { lighting: 'low–medium', co2: 'none', ph: '6.0–7.5', temp: '20–28°C' },
  },
  'Vallisneria': {
    image: '/species/vallisneria.jpg',
    scientificName: 'Vallisneria spiralis',
    description: 'Tall background grass that spreads via runners quickly.',
    care: 'Root in substrate. Medium light.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.5–8.0', temp: '20–28°C' },
  },
  'Anubias': {
    image: '/species/anubias.jpg',
    scientificName: 'Anubias barteri var. nana',
    description: 'Slow-growing broad leaves. Perfect for aquascape focal points.',
    care: 'Attach to hardscape. Avoid burying rhizome.',
    ideal: { lighting: 'low', co2: 'none', ph: '6.0–7.5', temp: '22–28°C' },
  },
  'Hornwort': {
    image: '/species/hornwort.jpg',
    scientificName: 'Ceratophyllum demersum',
    description: 'Floating or planted stem that absorbs excess nutrients. Shelter for fry.',
    care: 'Can float. Fast grower helps reduce nitrate.',
    ideal: { lighting: 'medium', co2: 'none', ph: '6.0–7.5', temp: '15–30°C' },
  },
  'Cryptocoryne': {
    image: '/species/cryptocoryne.jpg',
    scientificName: 'Cryptocoryne wendtii',
    description: 'Rosette plant with bronze-green leaves. Classic midground choice.',
    care: 'May melt after transplant. Stable parameters help.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.0–7.5', temp: '22–28°C' },
  },
  'Rotala': {
    image: '/species/rotala.jpg',
    scientificName: 'Rotala rotundifolia',
    description: 'Colorful stem plant that turns red under high light and CO₂.',
    care: 'Needs trimming to stay bushy. High light for best color.',
    ideal: { lighting: 'high', co2: 'medium–high', ph: '6.0–7.0', temp: '22–28°C' },
  },
  'Java Moss': {
    image: '/species/java-moss.jpg',
    scientificName: 'Taxiphyllum barbieri',
    description: 'Versatile moss for carpeting wood and shrimp habitats.',
    care: 'Low light tolerant. Attach with thread or glue.',
    ideal: { lighting: 'low', co2: 'none', ph: '5.5–8.0', temp: '18–30°C' },
  },
  'Amazon Sword': {
    image: '/species/amazon-sword.jpg',
    scientificName: 'Echinodorus grisebachii',
    description: 'Large centerpiece sword plant. Benefits from root tabs.',
    care: 'Deep root system. Can grow leaves above water.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.5–7.5', temp: '22–28°C' },
  },
};

function catalogImage(provided, fallback) {
  const src = String(provided || '');
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/media/')) {
    return src;
  }
  return fallback;
}

export function enrichFishList(list = []) {
  return list.map((rec) => {
    const profile = FISH_PROFILES[rec.name] || {};
    return {
      ...rec,
      image: catalogImage(rec.image, speciesImageUrl(rec.name) || profile.image || DEFAULT_FISH_IMAGE),
      scientificName: rec.scientificName || profile.scientificName || '',
      description: rec.description || profile.description || '',
      care: rec.care || profile.care || '',
      ideal: rec.ideal || profile.ideal || null,
    };
  });
}

export function enrichPlantList(list = []) {
  return list.map((plant) => {
    const profile = PLANT_PROFILES[plant.name] || {};
    return {
      ...plant,
      image: catalogImage(plant.image, speciesImageUrl(plant.name) || profile.image || DEFAULT_PLANT_IMAGE),
      scientificName: plant.scientificName || profile.scientificName || '',
      description: plant.description || profile.description || plant.detail || '',
      care: plant.care || profile.care || '',
      ideal: plant.ideal || profile.ideal || null,
    };
  });
}

const FISH_BY_TANK = {
  Community: ['Neon Tetra', 'Corydoras', 'Guppy'],
  Planted: ['Cherry Barb', 'Otocinclus', 'Dwarf Gourami'],
  'Monster Fish': ['Silver Dollar', 'Bichir', 'Bala Shark'],
};

function scoreFishCompat(name, params) {
  const temp = Number(params.temperature) || 25;
  const phVal = Number(params.ph) || 7;
  const nh3 = Number(params.ammonia) || 0;
  const volumeLiters = Number(params.volumeLiters) || 60;
  let score = 88;

  if (nh3 > 0.05) score -= 40;
  else if (nh3 > 0.01) score -= 15;
  if (temp > 30 || temp < 20) score -= 25;
  else if (temp > 28 || temp < 22) score -= 8;
  if (phVal < 6.0 || phVal > 8.0) score -= 12;
  if (name === 'Bala Shark' && volumeLiters < 300) score -= 20;
  if (name === 'Silver Dollar' && volumeLiters < 200) score -= 15;

  return Math.max(15, Math.min(98, score));
}

function scorePlantMatch(name, params) {
  let score = 85;
  const lighting = params.lighting || 'medium';
  const co2 = params.co2 || 'none';
  const temp = Number(params.temperature) || 25;
  const ph = Number(params.ph) || 7;
  const volume = Number(params.volumeLiters) || 60;
  const style = String(params.style || params.theme || '').toLowerCase();
  const experience = String(params.experience || 'beginner').toLowerCase();
  const substrate = String(params.substrate || 'gravel').toLowerCase();
  const maintenance = String(params.maintenance || 'medium').toLowerCase();
  const livestock = String(params.livestock || '').toLowerCase();

  if (name === 'Rotala' && lighting !== 'high') score -= 20;
  if (name === 'Java Fern' && lighting === 'high') score -= 5;
  if (name === 'Anubias' && lighting === 'high') score -= 8;
  if (co2 === 'none' && ['Rotala', 'Cryptocoryne'].includes(name)) score -= 10;
  if (co2 === 'high' && name === 'Java Fern') score -= 5;
  if (temp > 30) score -= 15;
  if (ph < 6 || ph > 8) score -= 10;

  if (volume < 40 && ['Amazon Sword', 'Vallisneria'].includes(name)) score -= 14;
  if (volume >= 80 && ['Amazon Sword', 'Vallisneria'].includes(name)) score += 6;

  if (substrate.includes('soil')) {
    if (['Cryptocoryne', 'Amazon Sword', 'Rotala', 'Vallisneria'].includes(name)) score += 8;
    if (['Java Fern', 'Anubias', 'Java Moss'].includes(name)) score -= 2;
  }
  if (substrate.includes('sand') && ['Java Fern', 'Anubias', 'Java Moss', 'Hornwort'].includes(name)) score += 6;

  if (experience === 'beginner') {
    if (['Java Fern', 'Anubias', 'Java Moss', 'Hornwort'].includes(name)) score += 8;
    if (name === 'Rotala') score -= 16;
  }
  if (experience === 'advanced' && name === 'Rotala') score += 8;

  if (maintenance === 'low') {
    if (['Java Fern', 'Anubias', 'Java Moss'].includes(name)) score += 8;
    if (name === 'Rotala') score -= 12;
  }

  if (style.includes('dutch') && ['Rotala', 'Cryptocoryne'].includes(name)) score += 8;
  if (style.includes('iwagumi') && ['Java Moss', 'Anubias'].includes(name)) score += 8;
  if (style.includes('jungle') && ['Vallisneria', 'Amazon Sword', 'Hornwort'].includes(name)) score += 8;
  if (style.includes('nature') && ['Java Fern', 'Anubias', 'Cryptocoryne'].includes(name)) score += 6;

  if (livestock.includes('shrimp') && ['Java Moss', 'Anubias', 'Java Fern'].includes(name)) score += 7;

  const hardness = String(params.waterHardness || 'medium').toLowerCase();
  const fertilizer = String(params.fertilizer || 'liquid').toLowerCase();
  const flow = String(params.flow || 'medium').toLowerCase();
  const goal = String(params.plantGoal || '').toLowerCase();
  const waterChange = String(params.waterChange || 'weekly').toLowerCase();
  const budget = String(params.budget || 'medium').toLowerCase();

  if (hardness === 'soft' && ['Cryptocoryne', 'Rotala'].includes(name)) score += 6;
  if (hardness === 'hard' && ['Vallisneria', 'Java Fern', 'Anubias'].includes(name)) score += 6;
  if (fertilizer === 'none') {
    if (['Java Fern', 'Anubias', 'Java Moss', 'Hornwort'].includes(name)) score += 8;
    if (['Rotala', 'Amazon Sword'].includes(name)) score -= 10;
  }
  if (fertilizer.includes('root') && ['Amazon Sword', 'Cryptocoryne', 'Vallisneria'].includes(name)) score += 7;
  if (fertilizer.includes('liquid') && ['Hornwort', 'Rotala'].includes(name)) score += 5;
  if (flow === 'low' && ['Anubias', 'Java Moss', 'Java Fern'].includes(name)) score += 5;
  if (flow === 'high' && ['Vallisneria', 'Hornwort'].includes(name)) score += 5;
  if (goal.includes('carpet') && name === 'Java Moss') score += 10;
  if (goal.includes('color') && name === 'Rotala') score += 10;
  if (goal.includes('low-tech') && ['Java Fern', 'Anubias', 'Java Moss', 'Hornwort'].includes(name)) score += 8;
  if (waterChange === 'monthly' && ['Java Fern', 'Anubias', 'Java Moss'].includes(name)) score += 6;
  if (budget === 'low' && ['Java Fern', 'Hornwort', 'Java Moss'].includes(name)) score += 6;
  if (budget === 'high' && name === 'Rotala') score += 5;

  return Math.max(20, Math.min(98, score));
}

export function localFishRecommendations(tankType, params) {
  const names = FISH_BY_TANK[tankType] || FISH_BY_TANK.Community;
  return enrichFishList(
    names
      .map((name) => ({ name, compat: scoreFishCompat(name, params) }))
      .sort((a, b) => b.compat - a.compat)
      .slice(0, 3)
  );
}

export function localPlantRecommendations(params) {
  return enrichPlantList(
    Object.keys(PLANT_PROFILES)
      .map((name) => ({
        name,
        match: `${scorePlantMatch(name, params)}% match`,
        detail: PLANT_PROFILES[name].description?.slice(0, 40) || '',
      }))
      .sort((a, b) => parseInt(b.match, 10) - parseInt(a.match, 10))
      .slice(0, 4)
  );
}

function normalizeTheme(theme, tankType) {
  const t = String(theme || tankType || 'community').toLowerCase();
  if (t.includes('plant')) return 'planted';
  if (t.includes('monster')) return 'monster';
  if (t.includes('nature')) return 'nature';
  return 'community';
}

export function designTank(params = {}) {
  const volume = Number(params.volumeLiters) || 60;
  const tankType = params.tankType || 'Community';
  const theme = normalizeTheme(params.theme, tankType);
  const lighting = params.lighting || 'medium';
  const livestock = params.livestock || 'mixed';
  const maxFish = Math.max(2, Math.round(volume / (theme === 'monster' ? 20 : 8)));
  const plantDensity = theme === 'planted' || theme === 'nature' ? 'high' : theme === 'monster' ? 'low' : 'medium';

  const hardscapePref = String(params.hardscape || '').toLowerCase();
  const hardscape = {
    planted: ['Driftwood focal piece', 'Dark aqua soil', 'Moss stones along the midground'],
    nature: ['Iwagumi stone triad', 'Fine sand paths', 'Sparse wood accents'],
    community: ['Mixed river rock', 'Sand substrate', 'Leaf litter pockets'],
    monster: ['Stacked slate caves', 'Heavy hardscape along the back', 'Open midwater swim lane'],
  }[theme];
  if (hardscapePref === 'wood') hardscape.unshift('Lead with one large driftwood piece');
  if (hardscapePref === 'rock') hardscape.unshift('Use a stone triangle as the main focal point');
  if (hardscapePref.includes('wood-rock')) hardscape.unshift('Combine driftwood and rocks so plants can attach');

  const zones = [
    { name: 'Foreground', role: theme === 'monster' ? 'Open sand and caves' : 'Carpet or low plants', coverage: plantDensity === 'high' ? '60%' : '30%' },
    { name: 'Midground', role: theme === 'monster' ? 'Rock hideouts' : 'Hardscape + mid-height plants', coverage: plantDensity === 'low' ? '25%' : '40%' },
    { name: 'Background', role: theme === 'planted' || theme === 'nature' ? 'Tall stem plants' : 'Backdrop and filter hide', coverage: plantDensity === 'high' ? '70%' : '35%' },
    { name: 'Open swim', role: livestock === 'schooling' ? 'Long unobstructed lane' : 'Center viewing window', coverage: theme === 'monster' ? '50%' : '30%' },
  ];

  const slotMaps = {
    planted: [
      { type: 'plant', label: 'Carpet', zone: 'foreground' }, { type: 'plant', label: 'Carpet', zone: 'foreground' },
      { type: 'open', label: 'Path', zone: 'open' }, { type: 'plant', label: 'Carpet', zone: 'foreground' },
      { type: 'wood', label: 'Wood', zone: 'mid' }, { type: 'plant', label: 'Mid plants', zone: 'mid' },
      { type: 'wood', label: 'Wood', zone: 'mid' }, { type: 'plant', label: 'Mid plants', zone: 'mid' },
      { type: 'plant', label: 'Stems', zone: 'back' }, { type: 'plant', label: 'Stems', zone: 'back' },
      { type: 'filter', label: 'Filter hide', zone: 'back' }, { type: 'plant', label: 'Stems', zone: 'back' },
    ],
    nature: [
      { type: 'sand', label: 'Sand', zone: 'foreground' }, { type: 'rock', label: 'Stone', zone: 'foreground' },
      { type: 'sand', label: 'Path', zone: 'open' }, { type: 'plant', label: 'Carpet', zone: 'foreground' },
      { type: 'rock', label: 'Stone', zone: 'mid' }, { type: 'open', label: 'View', zone: 'open' },
      { type: 'rock', label: 'Stone', zone: 'mid' }, { type: 'plant', label: 'Mid plants', zone: 'mid' },
      { type: 'plant', label: 'Stems', zone: 'back' }, { type: 'wood', label: 'Wood', zone: 'back' },
      { type: 'plant', label: 'Stems', zone: 'back' }, { type: 'filter', label: 'Filter hide', zone: 'back' },
    ],
    community: [
      { type: 'sand', label: 'Sand', zone: 'foreground' }, { type: 'open', label: 'Swim', zone: 'open' },
      { type: 'sand', label: 'Sand', zone: 'foreground' }, { type: 'plant', label: 'Low plants', zone: 'foreground' },
      { type: 'rock', label: 'Rock', zone: 'mid' }, { type: 'fish', label: 'School', zone: 'open' },
      { type: 'wood', label: 'Wood', zone: 'mid' }, { type: 'plant', label: 'Mid plants', zone: 'mid' },
      { type: 'plant', label: 'Background', zone: 'back' }, { type: 'filter', label: 'Filter', zone: 'back' },
      { type: 'plant', label: 'Background', zone: 'back' }, { type: 'heater', label: 'Heater hide', zone: 'back' },
    ],
    monster: [
      { type: 'sand', label: 'Open sand', zone: 'foreground' }, { type: 'open', label: 'Hunt lane', zone: 'open' },
      { type: 'sand', label: 'Open sand', zone: 'foreground' }, { type: 'rock', label: 'Cave', zone: 'foreground' },
      { type: 'rock', label: 'Cave', zone: 'mid' }, { type: 'fish', label: 'Centerpiece', zone: 'open' },
      { type: 'rock', label: 'Slate', zone: 'mid' }, { type: 'open', label: 'Swim', zone: 'open' },
      { type: 'rock', label: 'Backdrop', zone: 'back' }, { type: 'filter', label: 'Canister', zone: 'back' },
      { type: 'heater', label: 'Heater', zone: 'back' }, { type: 'rock', label: 'Backdrop', zone: 'back' },
    ],
  };

  const plants = localPlantRecommendations({
    tankType: theme === 'planted' ? 'Planted' : tankType,
    lighting,
    co2: theme === 'planted' ? 'medium' : 'none',
    temperature: params.temperature || 25,
    ph: params.ph || 7,
  }).slice(0, plantDensity === 'low' ? 2 : 4);

  const fishType = theme === 'monster' ? 'Monster Fish' : theme === 'planted' ? 'Planted' : tankType;
  const stocking = localFishRecommendations(fishType, {
    ph: params.ph || 7,
    temperature: params.temperature || 25,
    ammonia: 0,
  });

  return {
    theme,
    volumeLiters: volume,
    plantDensity,
    recommendedFishCount: maxFish,
    zones,
    hardscape,
    plants,
    stocking,
    stockingNotes: [
      `Aim for about ${maxFish} fish in a ${volume}L ${theme} layout.`,
      livestock === 'schooling'
        ? 'Keep open swim space along the front so schools can turn.'
        : livestock === 'predator'
          ? 'Choose tank mates too large to swallow and use a secure lid.'
          : 'Mix midwater fish with a small bottom-dwelling cleanup crew.',
      plantDensity === 'high'
        ? 'Plant densely in the back and keep a viewing path through the center.'
        : plantDensity === 'low'
          ? 'Use hardy plants only — monster fish will uproot delicate stems.'
          : 'Balance hardscape and plants so filtration stays easy to hide.',
    ],
    layoutSlots: slotMaps[theme],
    source: 'expert',
    message: 'Backend offline — rule-based layout from your inputs.',
  };
}
