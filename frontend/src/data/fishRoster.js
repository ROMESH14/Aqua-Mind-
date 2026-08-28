const NAME_ALIASES = {
  Asian_Arowana_Golden_Red_Dragon_Fish: 'Asian Arowana',
  Bamboo_Shrimp_Wood_Shrimp: 'Bamboo Shrimp',
  Betta_Siamese_Fighting_Fish: 'Betta',
  Cardinal_Sulawesi_Shrimp: 'Cardinal Sulawesi Shrimp',
  Celestial_Pearl_Danio_Galaxy_Rasbora: 'Celestial Pearl Danio',
  Endler_s_Livebearer: "Endler's Livebearer",
  Farlowella_Catfish_Twig_Catfish: 'Farlowella Catfish',
  Freshwater_Angelshark_Bala_Shark: 'Bala Shark',
  Freshwater_Pufferfish_Dwarf_Puffer: 'Dwarf Puffer',
  Hillstream_Loach_Borneo_Sucker: 'Hillstream Loach',
  Indonesian_Tiger_Fish_Datnoid: 'Indonesian Tiger Fish',
  Iridescent_Shark_Pangasius: 'Iridescent Shark',
  Jardini_Arowana_Australian_Arowana: 'Jardini Arowana',
  Otocinclus_Catfish: 'Otocinclus',
  'Red-bellied_Pacu': 'Red-bellied Pacu',
  Senegal_Bichir_Dinosaur_Eel: 'Bichir',
  Weather_Loach_Dojo_Loach: 'Dojo Loach',
};

const MONSTER_FOLDERS = [
  'Asian_Arowana_Golden_Red_Dragon_Fish',
  'Black_Arowana',
  'Black_Ghost_Knifefish',
  'Blood_Parrot_Cichlid',
  'Clown_Knifefish',
  'Clown_Loach',
  'Common_Goldfish',
  'Convict_Cichlid',
  'Electric_Blue_Acara',
  'Elephant_Nose_Fish',
  'Fire_Eel',
  'Firemouth_Cichlid',
  'Flowerhorn_Cichlid',
  'Freshwater_Angelshark_Bala_Shark',
  'Frontosa_Cichlid',
  'Giant_Gourami',
  'Green_Terror',
  'Indonesian_Tiger_Fish_Datnoid',
  'Iridescent_Shark_Pangasius',
  'Jack_Dempsey',
  'Jaguar_Cichlid',
  'Jardini_Arowana_Australian_Arowana',
  'Jewel_Cichlid',
  'Kissing_Gourami',
  'Motoro_Freshwater_Stingray',
  'Oscar',
  'Peacock_Cichlid',
  'Pictus_Catfish',
  'Rainbow_Cichlid',
  'Rainbow_Shark',
  'Red-bellied_Pacu',
  'Redtail_Catfish',
  'Red_Tail_Shark',
  'Ropefish',
  'Senegal_Bichir_Dinosaur_Eel',
  'Silver_Arowana',
  'Tiger_Shovelnose_Catfish',
  'Tinfoil_Barb',
];

const SHRIMP_FOLDERS = [
  'Amano_Shrimp',
  'Bamboo_Shrimp_Wood_Shrimp',
  'Blue_Dream_Shrimp',
  'Cardinal_Sulawesi_Shrimp',
  'Cherry_Shrimp',
  'Red_Rili_Shrimp',
];

const SMALL_FOLDERS = [
  'African_Butterflyfish',
  'Angelfish',
  'Apistogramma_Cockatoo_Dwarf_Cichlid',
  'Betta_Siamese_Fighting_Fish',
  'Black_Neon_Tetra',
  'Bleeding_Heart_Tetra',
  'Bloodfin_Tetra',
  'Blue_Gourami',
  'Boesemani_Rainbowfish',
  'Bolivian_Ram',
  'Bristlenose_Pleco',
  'Bronze_Corydoras',
  'Buenos_Aires_Tetra',
  'Cape_Lopez_Killifish',
  'Cardinal_Tetra',
  'Celebes_Rainbowfish',
  'Celestial_Pearl_Danio_Galaxy_Rasbora',
  'Checkerboard_Barb',
  'Cherry_Barb',
  'Chili_Rasbora',
  'Chocolate_Gourami',
  'Clown_Pleco',
  'Congo_Tetra',
  'Diamond_Tetra',
  'Discus',
  'Dwarf_Chain_Loach',
  'Dwarf_Gourami',
  'Electric_Yellow_Cichlid',
  'Ember_Tetra',
  'Endler_s_Livebearer',
  'Fancy_Goldfish_Oranda',
  'Farlowella_Catfish_Twig_Catfish',
  'Flying_Fox',
  'Freshwater_Pufferfish_Dwarf_Puffer',
  'German_Blue_Ram',
  'Giant_Danio',
  'Glass_Catfish',
  'Glowlight_Tetra',
  'Gold_Barb',
  'Green_Neon_Tetra',
  'Guppy',
  'Harlequin_Rasbora',
  'Hillstream_Loach_Borneo_Sucker',
  'Honey_Gourami',
  'Keyhole_Cichlid',
  'Kribensis',
  'Kuhli_Loach',
  'Lemon_Tetra',
  'Licorice_Gourami',
  'Molly',
  'Neon_Dwarf_Rainbowfish',
  'Neon_Tetra',
  'Odessa_Barb',
  'Otocinclus_Catfish',
  'Panda_Corydoras',
  'Paradise_Fish',
  'Peacock_Gudgeon',
  'Pearlscale_Geophagus',
  'Pearl_Danio',
  'Pearl_Gourami',
  'Penguin_Tetra',
  'Peppered_Corydoras',
  'Platy',
  'Roseline_Shark',
  'Rosy_Barb',
  'Rummy_Nose_Tetra',
  'Serpae_Tetra',
  'Silver_Tip_Tetra',
  'Sterbai_Corydoras',
  'Swordtail',
  'Threadfin_Rainbowfish',
  'Tiger_Barb',
  'Turquoise_Rainbowfish',
  'Weather_Loach_Dojo_Loach',
  'White_Cloud_Mountain_Minnow',
  'Yoyo_Loach',
  'Zebra_Danio',
  'Zebra_Loach',
];

function folderToName(folder) {
  if (NAME_ALIASES[folder]) return NAME_ALIASES[folder];
  return String(folder || '')
    .replace(/_s_/g, "'s ")
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesFrom(folders) {
  return folders.map(folderToName);
}

export const MONSTER_FISH = [...namesFrom(MONSTER_FOLDERS), 'Silver Dollar'];
export const SHRIMP = namesFrom(SHRIMP_FOLDERS);
export const SMALL_FISH = namesFrom(SMALL_FOLDERS);
export const SMALL_AND_SHRIMP = [...SMALL_FISH, ...SHRIMP];
export const ALL_FISH_NAMES = [...new Set([...SMALL_FISH, ...MONSTER_FISH, ...SHRIMP])].sort();

export function isShrimpName(name) {
  return /shrimp|prawn/i.test(String(name || ''));
}

export function pickTopStocking(scored = [], volumeLiters, limit = 4) {
  const volume = Number(volumeLiters) || 60;
  const minFish = volume < 3 ? 1 : 2;
  const fish = scored.filter((item) => !isShrimpName(item.name));
  const picked = [];
  fish.forEach((item) => {
    if (picked.length < minFish) picked.push(item);
  });
  scored.forEach((item) => {
    if (picked.length >= limit) return;
    if (!picked.includes(item)) picked.push(item);
  });
  return picked.slice(0, limit);
}

export function fishNamesForTank(tankType) {
  const kind = String(tankType || '').toLowerCase();
  if (kind.includes('monster')) return MONSTER_FISH;
  if (kind.includes('plant')) return SMALL_AND_SHRIMP;
  return SMALL_AND_SHRIMP;
}

export function estimateMinLiters(name) {
  const n = String(name || '').toLowerCase();
  if (/shrimp|ember tetra|chili rasbora|endler|otocinclus|celestial pearl/.test(n)) return 20;
  if (/tetra|guppy|platy|danio|cory|killifish|white cloud|rasbora/.test(n)) return 40;
  if (/barb|gourami|ram|molly|swordtail|betta|loach|pleco|rainbow|hatchet|pencil/.test(n)) return 70;
  if (/angelfish|discus|geophagus|acara|goldfish|bolivian/.test(n)) return 120;
  if (/oscar|dempsey|terror|parrot|convict|jewel|firemouth|peacock|frontosa|silver dollar|bichir|knifefish/.test(n)) return 180;
  if (/jaguar|flowerhorn|clown knife|giant gourami|tinfoil|elephant/.test(n)) return 250;
  if (/arowana|stingray|pacu|iridescent|datnoid|shovelnose|redtail|bala shark|fire eel/.test(n)) return 380;
  return 80;
}

export function fishTraits(name) {
  const n = String(name || '').toLowerCase();
  return {
    shrimp: /shrimp|prawn/.test(n),
    school: /tetra|rasbora|danio|barb|guppy|endler|minnow|rainbow|hatchet|pencil/.test(n),
    planted: /oto|shrimp|rasbora|ember|cardinal|neon|ram|gourami|betta|celestial|cory/.test(n),
    beginner: /guppy|platy|molly|neon|zebra|cherry shrimp|amano|cory|white cloud/.test(n),
    predator: /oscar|jaguar|arowana|datnoid|stingray|bichir|knife|eel|shark|pacu|iridescent/.test(n),
    nano: /ember|chili|celestial|shrimp|endler|otocinclus/.test(n),
    large: /arowana|stingray|pacu|oscar|jaguar|flowerhorn|datnoid|iridescent/.test(n),
    plantEater: /silver dollar|goldfish|pacu|tinfoil|flowerhorn|oscar|giant gourami|kissing gourami|buenos aires|serpae/.test(n),
    uprooter: /cichlid|oscar|flowerhorn|convict|dempsey|jaguar|terror|frontosa|geophagus|goldfish/.test(n),
  };
}

function stockingNameList(params = {}) {
  if (Array.isArray(params.stockingNames)) return params.stockingNames.filter(Boolean);
  if (Array.isArray(params.stocking)) return params.stocking.map((item) => item.name || item).filter(Boolean);
  return [];
}

export function plantVsFishDelta(plantName, fishNames = []) {
  const text = (fishNames || []).join(' ').toLowerCase();
  if (!text) return 0;
  const hardy = ['Java Fern', 'Anubias', 'Java Moss'].includes(plantName);
  const delicate = plantName === 'Rotala';
  const rooted = ['Amazon Sword', 'Vallisneria', 'Cryptocoryne'].includes(plantName);
  const nipped = ['Hornwort', 'Rotala', 'Vallisneria', 'Amazon Sword'].includes(plantName);
  const eaters = /silver dollar|goldfish|pacu|tinfoil|flowerhorn|oscar|giant gourami|kissing gourami|buenos aires/.test(text);
  const uprooters = /cichlid|oscar|flowerhorn|convict|dempsey|jaguar|terror|frontosa|geophagus|goldfish/.test(text);
  const shrimp = /shrimp|prawn/.test(text);
  let delta = 0;
  if (eaters && delicate) delta -= 38;
  if (eaters && nipped) delta -= 24;
  if (eaters && hardy) delta += 16;
  if (uprooters && rooted) delta -= 22;
  if (uprooters && hardy) delta += 14;
  if (shrimp && hardy) delta += 10;
  if (shrimp && plantName === 'Java Moss') delta += 6;
  return delta;
}

export function plantCompatNote(plantName, fishNames = []) {
  const delta = plantVsFishDelta(plantName, fishNames);
  const hardy = ['Java Fern', 'Anubias', 'Java Moss'].includes(plantName);
  const names = fishNames || [];
  if (!names.length) return '';
  const label = names.length > 2 ? 'these fish' : names.join(', ');
  if (delta <= -18) return `Poor mix with ${label} — they eat or uproot this plant.`;
  if (hardy && delta >= 8) return `Tie to wood or rock so it stays safe with ${label}.`;
  if (delta >= 0) return `Works with the suggested fish in the same water range.`;
  return `Only use this plant if you can protect it from the suggested fish.`;
}

export { stockingNameList };
