const THEMES = {
  Planted: {
    visualBg: 'linear-gradient(180deg, #062018 0%, #0a3a32 38%, #0f5c4c 72%, #1a7a5c 100%)',
    waterBg: 'linear-gradient(180deg, rgba(94,234,212,0.28), rgba(6,32,24,0.88))',
  },
  Community: {
    visualBg: 'linear-gradient(180deg, #061820 0%, #0c3a52 40%, #146078 72%, #0d9488 100%)',
    waterBg: 'linear-gradient(180deg, rgba(45,212,191,0.32), rgba(8,36,52,0.9))',
  },
  'Monster Fish': {
    visualBg: 'linear-gradient(180deg, #030810 0%, #0a1c2c 36%, #123048 68%, #1a4060 100%)',
    waterBg: 'linear-gradient(180deg, rgba(34,211,238,0.18), rgba(3,8,16,0.92))',
  },
  Nano: {
    visualBg: 'linear-gradient(180deg, #082028 0%, #0e4a58 42%, #167888 74%, #22d3ee 100%)',
    waterBg: 'linear-gradient(180deg, rgba(103,232,249,0.3), rgba(8,32,40,0.86))',
  },
};

const FALLBACK_THEMES = [
  THEMES.Community,
  THEMES.Planted,
  THEMES['Monster Fish'],
];

const FISH_EMOJI = ['🐠', '🐟', '🐡', '🦐'];
const PLANT_EMOJI = ['🌿', '🌱', '🪸', '🎋'];

function paramColor(status) {
  if (status === 'ok') return 'var(--success)';
  if (status === 'warn') return 'var(--warn)';
  return 'var(--red-light)';
}

function totalCount(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.count) || 1), 0);
}

function sceneFish(items = []) {
  const fish = [];
  let placed = 0;
  items.forEach((item, i) => {
    const copies = Math.min(Math.max(1, Number(item.count) || 1), 3);
    for (let n = 0; n < copies && placed < 7; n += 1) {
      fish.push({
        left: `${10 + ((placed * 13) % 72)}%`,
        top: `${28 + (placed % 4) * 22}px`,
        emoji: /shrimp|prawn/i.test(item.name) ? '🦐' : FISH_EMOJI[i % FISH_EMOJI.length],
        size: 15 + (placed % 3) * 3,
        delay: placed * 0.55,
        duration: 4.2 + (placed % 4) * 0.7,
      });
      placed += 1;
    }
  });
  if (!fish.length) {
    fish.push({ left: '38%', top: '42px', emoji: '🐠', size: 18, delay: 0, duration: 5 });
  }
  return fish;
}

function scenePlants(items = []) {
  const plants = [];
  const count = Math.min(Math.max(items.length, items.length ? 1 : 2), 5);
  for (let i = 0; i < count; i += 1) {
    const name = items[i]?.name || '';
    plants.push({
      left: `${4 + i * 18}%`,
      emoji: /moss|fern/i.test(name) ? '🌿' : PLANT_EMOJI[i % PLANT_EMOJI.length],
      size: 22 + (i % 3) * 6,
    });
  }
  return plants;
}

export function mapTankForCard(tank, index = 0) {
  const status = tank.status || 'ok';
  const theme = THEMES[tank.tankType] || FALLBACK_THEMES[index % FALLBACK_THEMES.length];
  const fishNames = tank.fishNames || [];
  const plantNames = tank.plantNames || [];
  const hasReadings = tank.latestPH != null || tank.latestTemp != null || tank.latestAmmonia != null;

  return {
    id: tank.id,
    name: tank.name,
    meta: tank.meta || '—',
    volumeLiters: tank.volumeLiters,
    tankType: tank.tankType,
    fishNames,
    plantNames,
    fishTotal: totalCount(fishNames) || tank.fishCount || 0,
    plantTotal: totalCount(plantNames) || tank.plantCount || 0,
    visualBg: theme.visualBg,
    waterBg: theme.waterBg,
    fish: sceneFish(fishNames),
    plants: scenePlants(plantNames),
    hasReadings,
    params: {
      ph: tank.latestPH != null ? String(tank.latestPH) : '—',
      temp: tank.latestTemp != null ? `${tank.latestTemp}°C` : '—',
      nh3: tank.latestAmmonia != null ? String(tank.latestAmmonia) : '—',
    },
    paramColors: {
      ph: tank.latestPH != null ? paramColor(status) : 'var(--text-muted)',
      temp: tank.latestTemp != null ? paramColor(status) : 'var(--text-muted)',
      nh3: tank.latestAmmonia != null ? (tank.latestAmmonia > 0.01 ? 'var(--warn)' : 'var(--success)') : 'var(--text-muted)',
    },
    status,
    statusText: tank.statusText || 'No readings yet',
    statusColor: status === 'ok' ? 'var(--success)' : status === 'warn' ? 'var(--warn)' : 'var(--red-light)',
  };
}
