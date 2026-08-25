import galleryManifest from '../data/galleryManifest.json';

const GALLERY = galleryManifest || {};

const ALIASES = {
  otocinclus: 'otocinclus-catfish',
  corydoras: 'bronze-corydoras',
  anubias: 'anubias-nana',
  vallisneria: 'vallisneria-straight',
  'java-moss': 'java-moss',
  'bala-shark': 'freshwater-angelshark-bala-shark',
  bichir: 'senegal-bichir-dinosaur-eel',
  cryptocoryne: 'cryptocoryne-wendtii',
  rotala: 'rotala-rotundifolia',
  ambulia: 'ambulia-limnophila',
  salvinia: 'salvinia-water-fern',
  'asian-arowana': 'asian-arowana-golden-red-dragon-fish',
  'iridescent-shark': 'iridescent-shark-pangasius',
  'indonesian-tiger-fish': 'indonesian-tiger-fish-datnoid',
  betta: 'betta-siamese-fighting-fish',
  'bamboo-shrimp': 'bamboo-shrimp-wood-shrimp',
  'dwarf-puffer': 'freshwater-pufferfish-dwarf-puffer',
  'celestial-pearl-danio': 'celestial-pearl-danio-galaxy-rasbora',
  'farlowella-catfish': 'farlowella-catfish-twig-catfish',
  'hillstream-loach': 'hillstream-loach-borneo-sucker',
  'jardini-arowana': 'jardini-arowana-australian-arowana',
  'dojo-loach': 'weather-loach-dojo-loach',
};

export function speciesSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveGallerySlug(name) {
  const slug = speciesSlug(name);
  if (!slug) return null;
  if (GALLERY[slug]) return slug;
  if (ALIASES[slug] && GALLERY[ALIASES[slug]]) return ALIASES[slug];

  const keys = Object.keys(GALLERY);
  const prefixed = keys.filter((key) => key.startsWith(`${slug}-`) || slug.startsWith(`${key}-`));
  if (prefixed.length === 1) return prefixed[0];
  if (prefixed.length > 1) {
    return prefixed.sort((a, b) => a.length - b.length)[0];
  }

  const contained = keys.filter((key) => key.includes(slug) || slug.includes(key));
  if (contained.length === 1) return contained[0];
  if (contained.length > 1) {
    return contained.sort((a, b) => b.length - a.length)[0];
  }
  return null;
}

export function speciesGallery(name) {
  const slug = resolveGallerySlug(name);
  return slug ? GALLERY[slug] : [];
}

export function speciesImageUrl(name) {
  return speciesGallery(name)[0] || '';
}

export const DEFAULT_FISH_IMAGE = '/deck-fish.png';
export const DEFAULT_PLANT_IMAGE = '/deck-plants.png';
