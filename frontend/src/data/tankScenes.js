/**
 * One photo per visual look. Form answers map onto this set.
 * Experience only changes density (beginner = simpler, advanced = lusher).
 */
const LARGE_FISH = ['Rainbow Shark', 'Red Tail Shark', 'Clown Loach', 'Giant Gourami'];
const COMMUNITY_FISH = ['Black Neon Tetra', 'Bleeding Heart Tetra', 'Bloodfin Tetra', 'Bronze Corydoras'];
const SCHOOL_FISH = ['Black Neon Tetra', 'Bloodfin Tetra', 'Bleeding Heart Tetra'];
const OSCAR_FISH = ['Oscar', 'Rainbow Shark', 'Red Tail Shark', 'Black Ghost Knifefish'];
const SHARK_CICHLID = ['Rainbow Cichlid', 'Rainbow Shark', 'Tinfoil Barb', 'Red Tail Shark'];
const LARGE_HINT = /shark|loach|gourami|oscar|knife|cichlid|tiger|arowana|bichir|barb/;

export const TANK_SCENES = [
  { src: '/tanks/scenes/aqua-soil-none-black.jpg', style: 'glass', theme: ['planted'], livestock: ['mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: [], density: 'simple' },
  { src: '/tanks/scenes/aqua-soil-none-black-stocked.jpg?v=2', style: 'glass', theme: ['planted', 'community'], livestock: ['mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: COMMUNITY_FISH, density: 'lush' },
  { src: '/tanks/scenes/scene-schooling-planted.jpg', style: 'glass', theme: ['planted', 'community'], livestock: ['schooling'], hardscape: ['none'], substrate: ['aqua-soil'], fish: SCHOOL_FISH, density: 'lush' },
  { src: '/tanks/scenes/layout-planted-betta-tetras.jpg', style: 'glass', theme: ['planted'], livestock: ['mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: ['Betta', ...SCHOOL_FISH], density: 'lush' },
  { src: '/tanks/scenes/layout-planted-nano.jpg', style: 'glass', theme: ['planted'], livestock: ['mixed', 'schooling'], hardscape: ['none'], substrate: ['aqua-soil'], fish: ['Celestial Pearl Danio', 'Chili Rasbora', 'Ember Tetra', "Endler's Livebearer"], density: 'simple' },
  { src: '/tanks/scenes/aqua-soil-none-black-sharks.jpg', style: 'glass', theme: ['monster', 'community'], livestock: ['predator', 'mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: SHARK_CICHLID, density: 'lush' },
  { src: '/tanks/scenes/layout-planted-shark-loach-gourami.jpg', style: 'glass', theme: ['monster', 'planted'], livestock: ['predator', 'mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: LARGE_FISH, density: 'lush' },
  { src: '/tanks/scenes/layout-planted-shark-loach-tiger.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['none'], substrate: ['aqua-soil'], fish: ['Rainbow Shark', 'Red Tail Shark', 'Clown Loach', 'Indonesian Tiger Fish'], density: 'lush' },
  { src: '/tanks/scenes/layout-planted-knives-sharks.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['none'], substrate: ['aqua-soil'], fish: ['Rainbow Shark', 'Red Tail Shark', 'Black Ghost Knifefish', 'Clown Knifefish'], density: 'lush' },
  { src: '/tanks/scenes/layout-planted-knives-bala.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['none'], substrate: ['aqua-soil'], fish: ['Black Ghost Knifefish', 'Clown Knifefish', 'Bala Shark', 'Rainbow Shark'], density: 'lush' },
  { src: '/tanks/scenes/aqua-soil-none-black-monster.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['none'], substrate: ['aqua-soil'], fish: OSCAR_FISH, density: 'lush' },

  { src: '/tanks/scenes/scene-aqua-soil-wood.jpg', style: 'glass', theme: ['planted', 'nature'], livestock: ['mixed'], hardscape: ['wood'], substrate: ['aqua-soil'], fish: [], density: 'lush' },
  { src: '/tanks/scenes/scene-aqua-soil-wood-large.jpg', style: 'glass', theme: ['planted', 'monster'], livestock: ['predator', 'mixed'], hardscape: ['wood'], substrate: ['aqua-soil'], fish: LARGE_FISH, density: 'lush' },
  { src: '/tanks/scenes/scene-aqua-soil-rock.jpg', style: 'glass', theme: ['planted', 'nature'], livestock: ['mixed'], hardscape: ['rock'], substrate: ['aqua-soil'], fish: [], density: 'lush' },
  { src: '/tanks/scenes/aqua-soil-wood-rock.jpg', style: 'glass', theme: ['planted', 'nature'], livestock: ['mixed'], hardscape: ['wood-rock'], substrate: ['aqua-soil'], fish: [], density: 'lush' },
  { src: '/tanks/scenes/aqua-soil-wood-rock-large.jpg', style: 'glass', theme: ['planted', 'monster'], livestock: ['predator', 'mixed'], hardscape: ['wood-rock'], substrate: ['aqua-soil'], fish: LARGE_FISH, density: 'lush' },

  { src: '/tanks/scenes/sand-wood-plain.jpg', style: 'glass', theme: ['community', 'nature'], livestock: ['mixed'], hardscape: ['wood', 'none'], substrate: ['sand'], fish: [], density: 'simple' },
  { src: '/tanks/scenes/sand-wood-plain-community.jpg', style: 'glass', theme: ['community'], livestock: ['mixed', 'schooling'], hardscape: ['wood'], substrate: ['sand'], fish: COMMUNITY_FISH, density: 'simple' },
  { src: '/tanks/scenes/sand-wood-plain-sharks.jpg', style: 'glass', theme: ['community', 'monster'], livestock: ['predator'], hardscape: ['wood'], substrate: ['sand'], fish: SHARK_CICHLID, density: 'simple' },
  { src: '/tanks/scenes/sand-wood-plain-monster.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['wood'], substrate: ['sand'], fish: OSCAR_FISH, density: 'simple' },
  { src: '/tanks/scenes/sand-wood-rock.jpg', style: 'glass', theme: ['community', 'monster', 'nature'], livestock: ['mixed'], hardscape: ['wood-rock'], substrate: ['sand', 'gravel'], fish: [], density: 'simple' },
  { src: '/tanks/scenes/sand-wood-rock-large.jpg', style: 'glass', theme: ['monster', 'community'], livestock: ['predator', 'mixed'], hardscape: ['wood-rock'], substrate: ['sand', 'gravel'], fish: LARGE_FISH, density: 'simple' },

  { src: '/tanks/scenes/gravel-rock-plain.jpg', style: 'glass', theme: ['community', 'nature'], livestock: ['mixed'], hardscape: ['rock', 'none'], substrate: ['gravel'], fish: [], density: 'simple' },
  { src: '/tanks/scenes/gravel-rock-plain-community.jpg', style: 'glass', theme: ['community'], livestock: ['mixed', 'schooling'], hardscape: ['rock'], substrate: ['gravel', 'sand'], fish: COMMUNITY_FISH, density: 'simple' },
  { src: '/tanks/scenes/gravel-rock-plain-sharks.jpg', style: 'glass', theme: ['monster', 'community'], livestock: ['predator'], hardscape: ['rock'], substrate: ['gravel'], fish: SHARK_CICHLID, density: 'simple' },
  { src: '/tanks/scenes/gravel-rock-plain-monster.jpg', style: 'glass', theme: ['monster'], livestock: ['predator'], hardscape: ['rock'], substrate: ['gravel'], fish: OSCAR_FISH, density: 'simple' },

  { src: '/tanks/scenes/scene-nature-iwagumi.jpg', style: 'glass', theme: ['nature'], livestock: ['mixed'], hardscape: ['rock', 'none'], substrate: ['sand', 'gravel'], fish: [], density: 'simple' },
  { src: '/tanks/scenes/scene-nature-iwagumi-school.jpg', style: 'glass', theme: ['nature'], livestock: ['schooling', 'mixed'], hardscape: ['rock', 'none'], substrate: ['sand'], fish: SCHOOL_FISH, density: 'simple' },

  { src: '/tanks/scenes/scene-cement-planted.jpg', style: 'cement', theme: ['planted', 'community'], livestock: ['mixed'], hardscape: ['none'], substrate: ['aqua-soil'], fish: [], density: 'lush' },
  { src: '/tanks/scenes/scene-cement-planted-large.jpg', style: 'cement', theme: ['planted', 'monster'], livestock: ['predator', 'mixed'], hardscape: ['none', 'wood', 'rock'], substrate: ['aqua-soil'], fish: LARGE_FISH, density: 'lush' },
  { src: '/tanks/scenes/scene-cement-wood-rock.jpg', style: 'cement', theme: ['community', 'monster', 'nature'], livestock: ['mixed', 'predator'], hardscape: ['wood-rock', 'wood', 'rock'], substrate: ['sand', 'gravel'], fish: [], density: 'simple' },
];

export function setupFromKit(form = {}, shoppingList = []) {
  const setup = (shoppingList || []).filter((item) => item.group === 'Setup');
  const text = setup.map((item) => item.name).join(' ').toLowerCase();
  let substrate = form.substrate || 'aqua-soil';
  let hardscape = form.hardscape || 'none';

  if (text.includes('sand')) substrate = 'sand';
  else if (text.includes('gravel')) substrate = 'gravel';
  else if (text.includes('soil')) substrate = 'aqua-soil';

  if (text.includes('driftwood') && (text.includes('stone') || text.includes('rock'))) hardscape = 'wood-rock';
  else if (text.includes('driftwood')) hardscape = 'wood';
  else if (text.includes('stone') || text.includes('rock')) hardscape = 'rock';
  else if (text.includes('optional')) hardscape = 'none';

  return { ...form, substrate, hardscape };
}

function wantedLivestock(form, fish) {
  const names = (fish || []).map((item) => item.name).join(' ').toLowerCase();
  if (LARGE_HINT.test(names) || String(form.livestock || '').includes('predator') || String(form.theme || '').includes('monster') || String(form.tankType || '').includes('Monster')) {
    return 'predator';
  }
  if (String(form.livestock || '') === 'schooling') return 'schooling';
  return 'mixed';
}

function wantedTheme(form) {
  const t = `${form.theme || ''} ${form.tankType || ''}`.toLowerCase();
  if (t.includes('monster')) return 'monster';
  if (t.includes('nature')) return 'nature';
  if (t.includes('plant')) return 'planted';
  return 'community';
}

function sceneScore(scene, want) {
  let score = 0;
  if (scene.style === want.style) score += 20;
  else score -= 25;
  if (scene.hardscape.includes(want.hardscape)) score += 18;
  else score -= 16;
  if (scene.substrate.includes(want.substrate)) score += 12;
  else score -= 6;
  if (scene.theme.includes(want.theme)) score += 10;
  if (scene.livestock.includes(want.livestock)) score += 10;
  if (scene.density === want.density) score += 3;

  if (want.names.length) {
    const overlap = scene.fish.filter((name) => want.names.includes(name)).length;
    if (scene.fish.length && overlap) score += overlap * 8;
    else if (scene.fish.length && !overlap) score -= 4;
    if (!scene.fish.length) score -= 8;
  } else if (scene.fish.length) {
    score -= 10;
  }
  return score;
}

export function scenePhoto(form = {}, plants = [], fish = [], shoppingList = []) {
  const setup = setupFromKit(form, shoppingList);
  const names = (fish || []).map((item) => item.name).filter(Boolean);
  const want = {
    style: setup.tankStyle === 'cement' ? 'cement' : 'glass',
    theme: wantedTheme(setup),
    livestock: wantedLivestock(setup, fish),
    hardscape: setup.hardscape || 'none',
    substrate: setup.substrate || 'aqua-soil',
    density: setup.experience === 'beginner' ? 'simple' : 'lush',
    names,
  };

  let best = TANK_SCENES[0];
  let bestScore = -Infinity;
  TANK_SCENES.forEach((scene) => {
    const score = sceneScore(scene, want);
    if (score > bestScore) {
      bestScore = score;
      best = scene;
    }
  });
  return best.src;
}

export const TANK_LAYOUTS = TANK_SCENES;
