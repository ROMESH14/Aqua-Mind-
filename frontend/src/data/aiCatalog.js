import { DEFAULT_FISH_IMAGE, DEFAULT_PLANT_IMAGE, speciesGallery } from '../utils/speciesImages';
import { estimateMinLiters, fishNamesForTank, fishTraits, pickTopStocking, plantCompatNote, plantVsFishDelta, stockingNameList } from './fishRoster';

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
    image: '/species/otocinclus-v2.jpg',
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
    image: '/species/silver-dollar-v2.jpg',
    scientificName: 'Metynnis argenteus',
    description: 'Large herbivore for big tanks. Eats soft plants — use hardy species only.',
    care: 'Needs 200L+ and school of 5+. Strong filtration required.',
    ideal: { ph: '6.0–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Bichir': {
    image: '/species/bichir-v2.jpg',
    scientificName: 'Polypterus senegalus',
    description: 'Prehistoric-looking predator. Unique centerpiece for monster fish setups.',
    care: 'Secure lid — can jump. Feed meaty foods.',
    ideal: { ph: '6.5–7.5', temp: '25–28°C', ammonia: '<0.01 ppm' },
  },
  'Bala Shark': {
    image: '/species/bala-shark-v2.jpg',
    scientificName: 'Balantiocheilos melanopterus',
    description: 'Fast-swimming schooling shark-minnow. Needs long tanks and strong filtration.',
    care: 'Minimum 400L for adult group. Provide open swimming space.',
    ideal: { ph: '6.5–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Oscar': {
    scientificName: 'Astronotus ocellatus',
    description: 'Large intelligent cichlid and a classic monster-tank centerpiece.',
    care: 'Needs 200L+ as an adult. Digs substrate and may eat smaller fish.',
    ideal: { ph: '6.0–8.0', temp: '23–28°C', ammonia: '<0.01 ppm' },
  },
  'Jaguar Cichlid': {
    scientificName: 'Parachromis managuensis',
    description: 'Powerful patterned predator for very large tanks.',
    care: 'Keep with similar-sized tank mates only. Provide caves and a tight lid.',
    ideal: { ph: '7.0–8.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Jack Dempsey': {
    scientificName: 'Rocio octofasciata',
    description: 'Hardy Central American cichlid with a bold personality.',
    care: 'Territorial when breeding. Use sturdy décor it cannot rearrange easily.',
    ideal: { ph: '6.5–8.0', temp: '22–28°C', ammonia: '<0.01 ppm' },
  },
  'Flowerhorn Cichlid': {
    scientificName: 'Amphilophus hybrid',
    description: 'Colorful hybrid cichlid kept as a single show fish.',
    care: 'Usually best alone. Needs strong filtration and frequent water changes.',
    ideal: { ph: '7.0–8.0', temp: '26–30°C', ammonia: '<0.01 ppm' },
  },
  'Green Terror': {
    scientificName: 'Andinoacara rivulatus',
    description: 'Metallic South American cichlid that becomes aggressive with age.',
    care: 'Give broken sight lines and tank mates too large to bully.',
    ideal: { ph: '6.5–8.0', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Silver Arowana': {
    scientificName: 'Osteoglossum bicirrhosum',
    description: 'Surface-hunting predator that needs a long, covered tank.',
    care: 'Secure lid — expert jumper. Feed meaty foods and keep open swim space.',
    ideal: { ph: '6.0–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Clown Knifefish': {
    scientificName: 'Chitala ornata',
    description: 'Nocturnal knifefish that glides along the lower tank.',
    care: 'Needs caves and dim lighting. Will eat small fish.',
    ideal: { ph: '6.0–7.5', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Frontosa Cichlid': {
    scientificName: 'Cyphotilapia frontosa',
    description: 'Deep-bodied African cichlid with a distinctive nuchal hump.',
    care: 'Prefers hard alkaline water and a group in a tall tank.',
    ideal: { ph: '7.8–9.0', temp: '24–28°C', ammonia: '<0.01 ppm' },
  },
  'Iridescent Shark': {
    scientificName: 'Pangasianodon hypophthalmus',
    description: 'Fast schooling catfish that quickly outgrows home tanks.',
    care: 'Needs a very large volume and open water. Not a true shark.',
    ideal: { ph: '6.5–7.5', temp: '22–26°C', ammonia: '<0.01 ppm' },
  },
  'Blood Parrot Cichlid': {
    scientificName: 'Amphilophus hybrid',
    description: 'Round-bodied hybrid cichlid popular in large community-monster mixes.',
    care: 'Feed sinking foods. Avoid very aggressive tank mates.',
    ideal: { ph: '6.5–7.8', temp: '24–28°C', ammonia: '<0.01 ppm' },
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

function usableImage(src) {
  const value = String(src || '');
  if (value.startsWith('/species/gallery/')) return value;
  if (value.startsWith('/media/')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '';
}

export function enrichFishList(list = []) {
  return list.map((rec) => {
    const profile = FISH_PROFILES[rec.name] || {};
    const gallery = speciesGallery(rec.name);
    const image = gallery[0] || usableImage(rec.image) || usableImage(profile.image) || DEFAULT_FISH_IMAGE;
    return {
      ...rec,
      image,
      images: gallery.length ? gallery : [image],
      scientificName: rec.scientificName || profile.scientificName || '',
      description: rec.description || profile.description || `${rec.name} for this tank type.`,
      care: rec.care || profile.care || 'Match count and tank mates to adult size.',
      ideal: rec.ideal || profile.ideal || null,
    };
  });
}

export function enrichPlantList(list = []) {
  return list.map((plant) => {
    const profile = PLANT_PROFILES[plant.name] || {};
    return {
      ...plant,
      image: speciesGallery(plant.name)[0] || usableImage(plant.image) || usableImage(profile.image) || DEFAULT_PLANT_IMAGE,
      images: speciesGallery(plant.name).length ? speciesGallery(plant.name) : [usableImage(plant.image) || usableImage(profile.image) || DEFAULT_PLANT_IMAGE],
      scientificName: plant.scientificName || profile.scientificName || '',
      description: plant.description || profile.description || plant.detail || '',
      care: plant.care || profile.care || '',
      ideal: plant.ideal || profile.ideal || null,
    };
  });
}

const FISH_BY_TANK = {
  Community: fishNamesForTank('Community'),
  Planted: fishNamesForTank('Planted'),
  'Monster Fish': fishNamesForTank('Monster Fish'),
};

const FISH_MIN_LITERS = {
  'Bala Shark': 300,
  'Silver Dollar': 200,
  Oscar: 200,
  'Jaguar Cichlid': 250,
  'Jack Dempsey': 150,
  'Flowerhorn Cichlid': 200,
  'Green Terror': 150,
  'Silver Arowana': 400,
  'Clown Knifefish': 300,
  'Frontosa Cichlid': 250,
  'Iridescent Shark': 400,
  'Blood Parrot Cichlid': 150,
  Bichir: 180,
};

function scoreFishCompat(name, params = {}) {
  const temp = Number(params.temperature) || 25;
  const phVal = Number(params.ph) || 7;
  const nh3 = Number(params.ammonia) || 0;
  const volumeLiters = Number(params.volumeLiters) || 60;
  const tankType = String(params.tankType || '').toLowerCase();
  const livestock = String(params.livestock || params.temperament || '').toLowerCase();
  const experience = String(params.experience || 'beginner').toLowerCase();
  const theme = String(params.theme || params.style || '').toLowerCase();
  const planted = params.planted === true || tankType.includes('plant') || theme.includes('plant') || theme.includes('nature');
  const monster = tankType.includes('monster') || theme.includes('monster') || livestock.includes('predator');
  const traits = fishTraits(name);
  const minLiters = FISH_MIN_LITERS[name] || estimateMinLiters(name);
  const n = String(name || '').toLowerCase();
  let score = 62;

  if (nh3 > 0.05) score -= 40;
  else if (nh3 > 0.01) score -= 15;
  if (temp >= 23 && temp <= 27) score += 8;
  else if (temp > 30 || temp < 20) score -= 25;
  else if (temp > 28 || temp < 22) score -= 8;
  if (phVal >= 6.5 && phVal <= 7.6) score += 8;
  else if (phVal < 6.0 || phVal > 8.2) score -= 14;
  else score -= 4;

  const ratio = volumeLiters / Math.max(minLiters, 1);
  if (ratio >= 1.4) score += 18;
  else if (ratio >= 1.1) score += 14;
  else if (ratio >= 0.95) score += 8;
  else if (ratio >= 0.75) score -= 10;
  else if (ratio >= 0.5) score -= 22;
  else score -= 38;

  if (volumeLiters < 40 && traits.nano) score += 16;
  if (volumeLiters < 40 && traits.large) score -= 20;
  if (volumeLiters >= 40 && volumeLiters < 90 && traits.school && !traits.large) score += 10;
  if (volumeLiters >= 150 && traits.large) score += 10;
  if (volumeLiters < 200 && minLiters >= 350) score -= 18;

  if (planted && traits.planted) score += 12;
  if (planted && traits.predator) score -= 16;
  if (planted && traits.plantEater) score -= 22;
  if (planted && traits.uprooter) score -= 10;
  if (planted && traits.shrimp) score += 6;

  if (monster && traits.predator) score += 12;
  if (monster && traits.shrimp) score -= 28;
  if (monster && traits.nano) score -= 20;
  if (monster && !traits.predator && !traits.large && minLiters < 150) score -= 8;

  if (livestock.includes('school') && traits.school) score += 12;
  if (livestock.includes('school') && traits.predator) score -= 18;
  if (livestock.includes('predator') && traits.predator) score += 14;
  if (livestock.includes('predator') && (traits.shrimp || traits.nano)) score -= 20;
  if (livestock.includes('mixed') && !traits.predator) score += 6;
  if (livestock.includes('shrimp') && traits.shrimp) score += 16;
  if (livestock.includes('shrimp') && traits.predator) score -= 22;

  if (experience === 'beginner' && traits.beginner) score += 12;
  if (experience === 'beginner' && traits.predator) score -= 16;
  if (experience === 'beginner' && minLiters >= 300) score -= 10;
  if (experience === 'advanced' && (traits.large || traits.predator)) score += 6;

  if (n.includes('discus')) {
    if (temp >= 27 && temp <= 30) score += 10;
    if (phVal >= 6.0 && phVal <= 7.0) score += 6;
    if (volumeLiters < 150) score -= 12;
  }
  if (n.includes('goldfish')) {
    if (temp <= 24) score += 8;
    if (temp >= 28) score -= 12;
  }
  if (n.includes('white cloud')) {
    if (temp <= 24) score += 8;
    if (temp >= 27) score -= 10;
  }

  return Math.max(12, Math.min(99, Math.round(score)));
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

  const tankKind = String(params.tankType || params.theme || '').toLowerCase();
  const hardy = ['Java Fern', 'Anubias', 'Java Moss'].includes(name);
  if (tankKind.includes('monster') || livestock.includes('predator')) {
    if (name === 'Rotala') score -= 30;
    if (['Hornwort', 'Amazon Sword', 'Vallisneria', 'Cryptocoryne'].includes(name)) score -= 16;
    if (hardy) score += 14;
  }

  const fishNames = stockingNameList(params);
  score += plantVsFishDelta(name, fishNames);

  return Math.max(12, Math.min(98, score));
}

export function localFishRecommendations(tankType, params) {
  const names = fishNamesForTank(tankType);
  const scored = names
    .map((name) => ({ name, compat: scoreFishCompat(name, { ...params, tankType }) }))
    .sort((a, b) => b.compat - a.compat);
  return enrichFishList(pickTopStocking(scored, params.volumeLiters, 4));
}

export function localPlantRecommendations(params) {
  const fishNames = stockingNameList(params);
  return enrichPlantList(
    Object.keys(PLANT_PROFILES)
      .map((name) => {
        const match = scorePlantMatch(name, params);
        const note = plantCompatNote(name, fishNames);
        const profile = PLANT_PROFILES[name];
        return {
          name,
          match: `${match}% match`,
          detail: profile.description?.slice(0, 40) || '',
          care: note ? `${profile.care} ${note}` : profile.care,
        };
      })
      .sort((a, b) => parseInt(b.match, 10) - parseInt(a.match, 10))
      .slice(0, 4)
  );
}

function normalizeTheme(theme, tankType, livestock) {
  const t = `${theme || ''} ${tankType || ''} ${livestock || ''}`.toLowerCase();
  if (t.includes('monster') || t.includes('predator')) return 'monster';
  if (t.includes('plant')) return 'planted';
  if (t.includes('nature')) return 'nature';
  return 'community';
}

export function designTank(params = {}) {
  const volume = Number(params.volumeLiters) || 60;
  const tankType = params.tankType || 'Community';
  const theme = normalizeTheme(params.theme, tankType, params.livestock);
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

  const fishType = tankType === 'Monster Fish' || theme === 'monster'
    ? 'Monster Fish'
    : tankType === 'Planted' || theme === 'planted'
      ? 'Planted'
      : tankType;
  const stocking = localFishRecommendations(fishType, {
    ...params,
    ph: params.ph || 7,
    temperature: params.temperature || 25,
    ammonia: 0,
    volumeLiters: volume,
  });

  const plants = localPlantRecommendations({
    ...params,
    tankType: theme === 'planted' ? 'Planted' : tankType,
    lighting,
    co2: params.co2 || (theme === 'planted' ? 'medium' : 'none'),
    temperature: params.temperature || 25,
    ph: params.ph || 7,
    stockingNames: stocking.map((item) => item.name),
  }).slice(0, plantDensity === 'low' ? 2 : 4);

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
      `Plants were picked to survive with ${stocking.map((item) => item.name).join(', ') || 'this livestock'}.`,
      plantDensity === 'high'
        ? 'Plant densely in the back and keep a viewing path through the center.'
        : plantDensity === 'low'
          ? 'Use hardy plants only — these fish will uproot or eat delicate stems.'
          : 'Balance hardscape and plants so filtration stays easy to hide.',
    ],
    layoutSlots: slotMaps[theme],
    hardware: recommendTankHardware(params, { theme, volume, plants, stocking }),
    shoppingList: buildTankKit(params, theme, volume, plants, stocking),
    tankStyle: String(params.tankStyle || 'glass').toLowerCase(),
    tankShape: String(params.tankShape || 'rectangle').toLowerCase(),
    source: 'expert',
    message: 'Backend offline — rule-based layout from your inputs.',
  };
}

export function recommendTankHardware(params = {}, extras = {}) {
  const volume = Number(extras.volume || params.volumeLiters) || 60;
  const theme = extras.theme || normalizeTheme(params.theme, params.tankType, params.livestock);
  const lighting = String(params.lighting || 'medium').toLowerCase();
  const livestock = String(params.livestock || '').toLowerCase();
  const co2 = String(params.co2 || 'none').toLowerCase();
  const temp = Number(params.temperature) || 25;
  const names = (extras.stocking || []).map((item) => item.name || '').join(' ').toLowerCase();
  const planted = theme === 'planted' || theme === 'nature' || String(params.tankType || '').toLowerCase().includes('plant');
  const monster = theme === 'monster' || String(params.tankType || '').toLowerCase().includes('monster') || livestock.includes('predator');
  const shrimp = /shrimp|prawn/.test(names);
  const jumpers = /arowana|killifish|hatchet|betta/.test(names);
  const goldfish = /goldfish/.test(names);
  const items = [];

  if (volume < 40 || shrimp) {
    items.push({
      key: 'filter',
      emoji: '🫧',
      name: 'Sponge filter + air pump',
      need: 'Required',
      description: `Gentle biological filter sized for a ${volume}L tank. Safe for shrimp and small fish.`,
      care: `Aim for about ${Math.round(volume * 4)} L/h of air so the sponge stays oxygenated.`,
      ideal: { volume: `${volume}L`, flow: `${Math.round(volume * 4)} L/h air` },
    });
  } else if (monster || volume >= 150) {
    items.push({
      key: 'filter',
      emoji: '🌀',
      name: 'Canister filter',
      need: 'Required',
      description: `External canister for a ${volume}L ${monster ? 'heavy-bioload' : ''} tank. Handles waste from large fish.`,
      care: `Choose ${Math.round(volume * 6)}–${Math.round(volume * 8)} L/h rated flow and clean the media monthly.`,
      ideal: { volume: `${volume}L`, flow: `${Math.round(volume * 7)} L/h` },
    });
  } else {
    items.push({
      key: 'filter',
      emoji: '🌀',
      name: 'Hang-on-back filter',
      need: 'Required',
      description: `HOB filter rated above ${volume}L so water stays clear and cycled.`,
      care: `Look for ${Math.round(volume * 5)} L/h or higher. Rinse sponges in tank water only.`,
      ideal: { volume: `${volume}L`, flow: `${Math.round(volume * 5)} L/h` },
    });
  }

  if (goldfish && temp <= 22) {
    items.push({
      key: 'heater',
      emoji: '🌡️',
      name: 'Heater (optional)',
      need: 'Optional',
      description: 'Goldfish prefer cooler water. A heater is only needed if the room drops below about 18°C.',
      care: 'If used, set 18–22°C and add a thermometer to confirm.',
      ideal: { temp: '18–22°C', power: '50–75W' },
    });
  } else {
    const power = volume < 40 ? '25–50W' : volume < 80 ? '75–100W' : volume < 150 ? '150–200W' : '200–300W or two heaters';
    items.push({
      key: 'heater',
      emoji: '🌡️',
      name: `Heater · ${power}`,
      need: 'Required',
      description: `Keeps this tropical tank near ${temp}°C. Large tanks stay more stable with two heaters.`,
      care: 'Place near filter flow and check with a separate thermometer.',
      ideal: { temp: `${temp}°C`, power },
    });
  }

  const lightName = planted && lighting === 'high'
    ? 'High-output planted LED'
    : planted
      ? 'Full-spectrum planted LED'
      : lighting === 'low'
        ? 'Low LED bar'
        : 'Standard full-spectrum LED';
  items.push({
    key: 'light',
    emoji: '💡',
    name: lightName,
    need: planted ? 'Required' : 'Required',
    description: planted
      ? `Light that matches your ${lighting} setting so ${ (extras.plants || []).map((p) => p.name).filter(Boolean).slice(0, 2).join(' and ') || 'these plants'} can grow.`
      : `A simple LED to view fish and keep a day/night cycle in a ${volume}L tank.`,
    care: planted ? 'Start at 6–7 hours a day to limit algae, then increase slowly.' : 'Run 8 hours a day on a timer.',
    ideal: { lighting, volume: `${volume}L` },
  });

  items.push({
    key: 'lid',
    emoji: '🛡️',
    name: jumpers ? 'Tight-fitting lid + clips' : 'Tank lid or mesh cover',
    need: 'Required',
    description: jumpers
      ? 'These fish jump. A clipped lid with small cable cut-outs is required.'
      : 'Cuts evaporation, keeps fish in, and protects the light from splash.',
    care: 'Leave a small gap for filter and heater cables.',
    ideal: { volume: `${volume}L` },
  });

  items.push({
    key: 'thermometer',
    emoji: '📏',
    name: 'Thermometer',
    need: 'Required',
    description: 'A digital or stick-on thermometer so the heater setting matches the real water temperature.',
    care: 'Place it opposite the heater, not against the glass heater strip.',
    ideal: { temp: `${temp}°C` },
  });

  items.push({
    key: 'test',
    emoji: '🧪',
    name: 'Liquid water test kit',
    need: 'Required',
    description: 'pH, ammonia, nitrite, and nitrate tests are needed to cycle and keep this tank safe.',
    care: 'Test twice a week for the first month, then weekly.',
    ideal: { ph: String(params.ph || '7.0'), ammonia: '0 ppm' },
  });

  if (monster || volume >= 200) {
    items.push({
      key: 'powerhead',
      emoji: '💨',
      name: 'Powerhead or wavemaker',
      need: 'Recommended',
      description: 'Extra flow keeps waste moving toward the filter in a large or messy tank.',
      care: `Add about ${Math.round(volume * 3)} L/h of extra circulation, aimed along the back glass.`,
      ideal: { flow: `${Math.round(volume * 3)} L/h`, volume: `${volume}L` },
    });
  }

  if (co2 !== 'none' || (planted && lighting === 'high')) {
    items.push({
      key: 'co2',
      emoji: '🫧',
      name: 'CO₂ kit + diffuser',
      need: planted && lighting === 'high' ? 'Required' : 'Recommended',
      description: 'Injected CO₂ keeps demanding stem plants healthy under stronger light.',
      care: 'Use a drop checker and start with a slow bubble rate. Turn CO₂ off at night.',
      ideal: { co2: co2 === 'none' ? 'medium' : co2, lighting },
    });
  }

  return items.map((item) => ({
    ...item,
    match: item.need === 'Required' ? 'Required' : item.need,
  }));
}

function buildTankKit(params, theme, volume, plants, stocking) {
  const substrate = String(params.substrate || '').includes('soil')
    ? 'Aqua soil (2–4 cm)'
    : String(params.substrate || '') === 'sand'
      ? 'Fine aquarium sand'
      : 'Inert gravel';
  const hardscape = String(params.hardscape || 'wood-rock');
  const hardscapeName = hardscape === 'wood'
    ? 'Driftwood piece'
    : hardscape === 'rock'
      ? 'Aquarium stones'
      : hardscape === 'none'
        ? 'Optional décor'
        : 'Driftwood and stones';

  const style = String(params.tankStyle || 'glass').toLowerCase();
  const shape = String(params.tankShape || 'rectangle').toLowerCase();
  const material = style === 'cement' ? 'Cement / concrete tank' : 'Glass aquarium';
  const shapeName = {
    rectangle: 'standard rectangle',
    cube: 'cube',
    bowfront: 'bowfront',
    cylinder: 'cylinder',
    hexagon: 'hexagon',
  }[shape] || 'standard rectangle';

  const hardware = recommendTankHardware(params, { theme, volume, plants, stocking });
  return [
    { group: 'Hardware', name: `${volume}L ${material}`, detail: `${shapeName} body with a lid or cover` },
    ...hardware.map((item) => ({ group: 'Hardware', name: item.name, detail: item.care || item.description })),
    { group: 'Setup', name: substrate, detail: 'Base layer for plants and fish' },
    { group: 'Setup', name: hardscapeName, detail: `Fits a ${theme} layout` },
    ...plants.map((plant) => ({ group: 'Plants', name: plant.name, detail: plant.scientificName || 'Live plant' })),
    ...stocking.slice(0, 4).map((fish) => ({ group: 'Fish', name: fish.name, detail: `About ${Math.max(2, Math.round(volume / 20))} of this type if schooling` })),
  ];
}
