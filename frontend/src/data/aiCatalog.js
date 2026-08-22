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

export function enrichFishList(list = []) {
  return list.map((rec) => {
    const profile = FISH_PROFILES[rec.name] || {};
    return {
      ...rec,
      image: speciesImageUrl(rec.name) || rec.image || profile.image || DEFAULT_FISH_IMAGE,
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
      image: speciesImageUrl(plant.name) || plant.image || profile.image || DEFAULT_PLANT_IMAGE,
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

  if (name === 'Rotala' && lighting !== 'high') score -= 20;
  if (name === 'Java Fern' && lighting === 'high') score -= 5;
  if (name === 'Anubias' && lighting === 'high') score -= 8;
  if (co2 === 'none' && ['Rotala', 'Cryptocoryne'].includes(name)) score -= 10;
  if (co2 === 'high' && name === 'Java Fern') score -= 5;
  if (temp > 30) score -= 15;

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
