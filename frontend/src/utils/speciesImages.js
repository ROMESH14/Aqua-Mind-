/** Local species/plant photos in public/species/ */
export function speciesImageUrl(name) {
  const slug = String(name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/species/${slug}.jpg`;
}

export const DEFAULT_FISH_IMAGE = '/deck-fish.png';
export const DEFAULT_PLANT_IMAGE = '/deck-plants.png';
