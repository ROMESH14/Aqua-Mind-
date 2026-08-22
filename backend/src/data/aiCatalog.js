/** Rich species & plant profiles for AI advisor suggestions */

function speciesImageUrl(name) {
  const slug = String(name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `/species/${slug}.jpg`;
}

const FISH_PROFILES = {
  'Neon Tetra': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Neon_tetra.jpg/400px-Neon_tetra.jpg',
    scientificName: 'Paracheirodon innesi',
    description: 'Peaceful schooling fish with iridescent blue-red stripe. Ideal for planted community tanks.',
    care: 'Keep in groups of 6+. Soft, slightly acidic water. Avoid with large aggressive fish.',
    ideal: { ph: '6.0–7.0', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Corydoras': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Corydoras_paleatus.jpg/400px-Corydoras_paleatus.jpg',
    scientificName: 'Corydoras paleatus',
    description: 'Bottom-dwelling catfish that cleans substrate and adds activity to the lower tank level.',
    care: 'Keep on smooth gravel or sand. School of 4+ recommended. Very peaceful.',
    ideal: { ph: '6.5–7.8', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Guppy': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Guppy_male.jpg/400px-Guppy_male.jpg',
    scientificName: 'Poecilia reticulata',
    description: 'Hardy livebearer with vivid colors. Excellent for beginners and community setups.',
    care: 'Tolerates varied water. Males display brighter colors. Breed readily.',
    ideal: { ph: '6.8–7.8', temp: '22–28°C', ammonia: '<0.01 ppm' },
  },
  'Cherry Barb': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Puntius_titteya_male.jpg/400px-Puntius_titteya_male.jpg',
    scientificName: 'Puntius titteya',
    description: 'Active schooling barb with red coloration. Thrives in planted aquariums with stable parameters.',
    care: 'Group of 6+. Likes dense plants and moderate flow. Peaceful with similar-sized fish.',
    ideal: { ph: '6.5–7.5', temp: '23–27°C', ammonia: '<0.01 ppm' },
  },
  'Otocinclus': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Otocinclus_affinis.jpg/400px-Otocinclus_affinis.jpg',
    scientificName: 'Otocinclus affinis',
    description: 'Small algae-eating catfish. Essential for controlling algae on leaves and glass in planted tanks.',
    care: 'Needs established tank with biofilm. Supplement with algae wafers. Very sensitive to ammonia spikes.',
    ideal: { ph: '6.5–7.5', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Dwarf Gourami': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Colisa_lalia.jpg/400px-Colisa_lalia.jpg',
    scientificName: 'Trichogaster lalius',
    description: 'Labyrinth fish with brilliant color. Calm surface dweller suited to planted aquascapes.',
    care: 'Avoid fin-nippers. Prefers calm water and floating plants. Males can be territorial.',
    ideal: { ph: '6.5–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Silver Dollar': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Metynnis_argenteus.jpg/400px-Metynnis_argenteus.jpg',
    scientificName: 'Metynnis argenteus',
    description: 'Large disc-shaped herbivore for big tanks. Eats soft plants — use hardy species only.',
    care: 'Needs 200L+ and school of 5+. Strong filtration required.',
    ideal: { ph: '6.0–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Bichir': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Polypterus_senegalus.jpg/400px-Polypterus_senegalus.jpg',
    scientificName: 'Polypterus senegalus',
    description: 'Prehistoric-looking predator with labyrinth organ. Unique centerpiece for monster fish setups.',
    care: 'Secure lid — can jump. Feed meaty foods. Tank mates must be too large to swallow.',
    ideal: { ph: '6.5–7.5', temp: '25–28°C', ammonia: '<0.01 ppm' },
  },
  'Bala Shark': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Balantiocheilos_melanopterus.jpg/400px-Balantiocheilos_melanopterus.jpg',
    scientificName: 'Balantiocheilos melanopterus',
    description: 'Fast-swimming schooling shark-minnow. Needs long tanks and strong filtration.',
    care: 'Minimum 400L for adult group. Skittish — provide open swimming space.',
    ideal: { ph: '6.5–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
};

const PLANT_PROFILES = {
  'Java Fern': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Microsorum_pteropus.jpg/400px-Microsorum_pteropus.jpg',
    scientificName: 'Microsorum pteropus',
    description: 'Hardy rhizome plant that attaches to wood or rock. Thrives in low-tech setups without CO₂.',
    care: 'Do not bury rhizome. Low to medium light. Slow growth, very forgiving.',
    ideal: { lighting: 'low–medium', co2: 'none', ph: '6.0–7.5', temp: '20–28°C' },
  },
  'Vallisneria': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Vallisneria_spiralis.jpg/400px-Vallisneria_spiralis.jpg',
    scientificName: 'Vallisneria spiralis',
    description: 'Tall background grass that spreads via runners. Creates natural jungle backdrop quickly.',
    care: 'Root in substrate. Medium light. Trims by cutting runners or leaves at base.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.5–8.0', temp: '20–28°C' },
  },
  'Anubias': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Anubias_barteri_var_nana.jpg/400px-Anubias_barteri_var_nana.jpg',
    scientificName: 'Anubias barteri var. nana',
    description: 'Slow-growing broad leaves. Perfect for aquascape focal points and low-light corners.',
    care: 'Attach to hardscape. Avoid burying rhizome. Algae-resistant thick leaves.',
    ideal: { lighting: 'low', co2: 'none', ph: '6.0–7.5', temp: '22–28°C' },
  },
  'Hornwort': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ceratophyllum_demersum.jpg/400px-Ceratophyllum_demersum.jpg',
    scientificName: 'Ceratophyllum demersum',
    description: 'Floating or planted stem that absorbs excess nutrients. Natural shelter for fry.',
    care: 'No roots needed — can float. Fast grower helps reduce nitrate. Trim regularly.',
    ideal: { lighting: 'medium', co2: 'none', ph: '6.0–7.5', temp: '15–30°C' },
  },
  'Cryptocoryne': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Cryptocoryne_wendtii.jpg/400px-Cryptocoryne_wendtii.jpg',
    scientificName: 'Cryptocoryne wendtii',
    description: 'Rosette plant with bronze-green leaves. Classic midground choice for planted tanks.',
    care: 'May melt after transplant — normal. Stable parameters help. Medium light.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.0–7.5', temp: '22–28°C' },
  },
  'Rotala': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rotala_rotundifolia.jpg/400px-Rotala_rotundifolia.jpg',
    scientificName: 'Rotala rotundifolia',
    description: 'Colorful stem plant that turns red under high light and CO₂. Great for Dutch-style layouts.',
    care: 'Needs trimming to stay bushy. High light + CO₂ for best red coloration.',
    ideal: { lighting: 'high', co2: 'medium–high', ph: '6.0–7.0', temp: '22–28°C' },
  },
  'Java Moss': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Taxiphyllum_barbieri.jpg/400px-Taxiphyllum_barbieri.jpg',
    scientificName: 'Taxiphyllum barbieri',
    description: 'Versatile moss for carpeting wood, breeding boxes, and shrimp habitats.',
    care: 'Low light tolerant. Attach with thread or glue. Spread by fragmentation.',
    ideal: { lighting: 'low', co2: 'none', ph: '5.5–8.0', temp: '18–30°C' },
  },
  'Amazon Sword': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Echinodorus_bleheri.jpg/400px-Echinodorus_bleheri.jpg',
    scientificName: 'Echinodorus grisebachii',
    description: 'Large centerpiece sword plant. Nutrient-hungry — benefits from root tabs.',
    care: 'Deep root system. Root tabs recommended. Can grow leaves above water surface.',
    ideal: { lighting: 'medium', co2: 'low', ph: '6.5–7.5', temp: '22–28°C' },
  },
};

const FISH_BY_TANK = {
  Community: ['Neon Tetra', 'Corydoras', 'Guppy'],
  Planted: ['Cherry Barb', 'Otocinclus', 'Dwarf Gourami'],
  'Monster Fish': ['Silver Dollar', 'Bichir', 'Bala Shark'],
};

function scoreFishCompat(name, { ph, temperature, ammonia, volumeLiters }) {
  const profile = FISH_PROFILES[name];
  if (!profile) return 70;
  let score = 88;
  const temp = Number(temperature) || 25;
  const phVal = Number(ph) || 7;
  const nh3 = Number(ammonia) || 0;

  if (nh3 > 0.05) score -= 40;
  else if (nh3 > 0.01) score -= 15;
  if (temp > 30 || temp < 20) score -= 25;
  else if (temp > 28 || temp < 22) score -= 8;
  if (phVal < 6.0 || phVal > 8.0) score -= 12;

  if (name === 'Bala Shark' && volumeLiters < 300) score -= 20;
  if (name === 'Silver Dollar' && volumeLiters < 200) score -= 15;

  return Math.max(15, Math.min(98, score));
}

function scorePlantMatch(name, { lighting, co2, ph, temperature }) {
  const profile = PLANT_PROFILES[name];
  if (!profile) return 75;
  let score = 85;
  const ideal = profile.ideal;

  if (name === 'Rotala' && lighting !== 'high') score -= 20;
  if (name === 'Java Fern' && lighting === 'high') score -= 5;
  if (name === 'Anubias' && lighting === 'high') score -= 8;
  if (co2 === 'none' && ['Rotala', 'Cryptocoryne'].includes(name)) score -= 10;
  if (co2 === 'high' && name === 'Java Fern') score -= 5;

  const temp = Number(temperature) || 25;
  if (temp > 30) score -= 15;

  return Math.max(20, Math.min(98, score));
}

function enrichFish(rec) {
  const profile = FISH_PROFILES[rec.name] || {};
  return {
    ...rec,
    image: speciesImageUrl(rec.name),
    scientificName: profile.scientificName || '',
    description: profile.description || rec.detail || '',
    care: profile.care || '',
    ideal: profile.ideal || null,
    emoji: rec.emoji || '🐟',
  };
}

function enrichPlant(plant) {
  const profile = PLANT_PROFILES[plant.name] || {};
  const matchPct = plant.match ? parseInt(plant.match, 10) : plant.compat;
  return {
    ...plant,
    image: speciesImageUrl(plant.name),
    scientificName: profile.scientificName || '',
    description: profile.description || plant.detail || '',
    care: profile.care || '',
    ideal: profile.ideal || null,
    match: plant.match || `${matchPct || 80}% match`,
    emoji: plant.emoji || '🌱',
  };
}

function localFishRecommendations(tankType, params) {
  const names = FISH_BY_TANK[tankType] || FISH_BY_TANK.Community;
  return names
    .map((name) => ({
      name,
      compat: scoreFishCompat(name, params),
      emoji: '🐟',
    }))
    .sort((a, b) => b.compat - a.compat)
    .slice(0, 3)
    .map(enrichFish);
}

function localPlantRecommendations(params) {
  return Object.keys(PLANT_PROFILES)
    .map((name) => ({
      name,
      match: `${scorePlantMatch(name, params)}% match`,
      detail: PLANT_PROFILES[name].description?.slice(0, 40) || '',
      emoji: '🌱',
    }))
    .sort((a, b) => parseInt(b.match, 10) - parseInt(a.match, 10))
    .slice(0, 4)
    .map(enrichPlant);
}

function detailedWaterPredictions(readings) {
  const latest = readings[readings.length - 1] || readings[0];
  const first = readings[0];
  const predictions = [];
  const forecasts = {};

  const ph = Number(latest.pH ?? latest.ph) || 7;
  const temp = Number(latest.Temperature ?? latest.temperature ?? latest.temp) || 25;
  const ammonia = Number(latest.Ammonia ?? latest.ammonia ?? latest.nh3) || 0;

  const ph0 = Number(first.pH ?? first.ph) || ph;
  const temp0 = Number(first.Temperature ?? first.temperature ?? first.temp) || temp;
  const nh30 = Number(first.Ammonia ?? first.ammonia ?? first.nh3) || ammonia;

  const phTrend = ph - ph0;
  const tempTrend = temp - temp0;
  const nh3Trend = ammonia - nh30;

  forecasts.pH = ph + phTrend * 0.5;
  forecasts.Temperature = temp + tempTrend * 0.5;
  forecasts.Ammonia = Math.max(0, ammonia + nh3Trend * 0.5);

  if (ammonia > 0.01) {
    predictions.push({
      icon: '⚠️',
      title: 'Ammonia elevated — action needed',
      sub: `Current ${ammonia.toFixed(2)} ppm. Perform 30–50% water change and test again within 24 hours.`,
      variant: 'warn',
      detail: 'Toxic above 0.05 ppm. Check filter, reduce feeding, and verify cycle is complete.',
      image: '/deck-tank.png',
    });
  } else {
    predictions.push({
      icon: '✅',
      title: 'Ammonia within safe range',
      sub: `Reading ${ammonia.toFixed(3)} ppm — forecast ~${forecasts.Ammonia.toFixed(3)} ppm next log.`,
      variant: 'success',
      detail: 'Beneficial bacteria are processing waste effectively. Maintain weekly testing.',
      image: '/deck-tank.png',
    });
  }

  if (temp > 28) {
    predictions.push({
      icon: '🌡️',
      title: 'Temperature trending high',
      sub: `${temp}°C detected. Ideal range 24–28°C for most tropical species.`,
      variant: 'warn',
      detail: 'Reduce heater setting, increase surface agitation, or add a fan to lower temperature.',
      image: '/deck-betta.png',
    });
  } else if (temp < 22) {
    predictions.push({
      icon: '❄️',
      title: 'Temperature below tropical range',
      sub: `${temp}°C — many tropical fish prefer 24–28°C.`,
      variant: 'info',
      detail: 'Check heater wattage and placement. Cold water slows metabolism and immunity.',
      image: '/deck-goldfish.png',
    });
  } else {
    predictions.push({
      icon: '🌡️',
      title: 'Temperature stable',
      sub: `Forecast ~${forecasts.Temperature.toFixed(1)}°C on next reading.`,
      variant: 'success',
      detail: 'Stable temperature reduces stress and supports healthy fish and plant growth.',
      image: '/deck-fish.png',
    });
  }

  if (ph >= 6.8 && ph <= 7.5) {
    predictions.push({
      icon: '⚗️',
      title: 'pH in ideal community range',
      sub: `Current ${ph.toFixed(2)} — forecast ${forecasts.pH.toFixed(2)}.`,
      variant: 'success',
      detail: 'Suitable for most community and planted tank species. Avoid sudden pH swings.',
      image: '/deck-plants.png',
    });
  } else {
    predictions.push({
      icon: '⚗️',
      title: 'pH outside optimal range',
      sub: `${ph.toFixed(2)} detected. Target 6.8–7.5 for mixed community tanks.`,
      variant: 'info',
      detail: 'Use gradual buffering (crushed coral or driftwood) rather than rapid chemical adjustment.',
      image: '/deck-plants.png',
    });
  }

  return { predictions, forecasts };
}

module.exports = {
  FISH_PROFILES,
  PLANT_PROFILES,
  enrichFish,
  enrichPlant,
  enrichFishList: (list) => (list || []).map(enrichFish),
  enrichPlantList: (list) => (list || []).map(enrichPlant),
  localFishRecommendations,
  localPlantRecommendations,
  detailedWaterPredictions,
};
