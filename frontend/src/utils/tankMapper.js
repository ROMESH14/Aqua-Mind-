const VISUALS = [
  {
    visualBg: 'linear-gradient(180deg, #0a2438 0%, #0f3554 40%, #143d5c 70%, #0d9488 100%)',
    waterBg: 'linear-gradient(180deg, rgba(45,212,191,0.45), rgba(10,53,84,0.92))',
    waterHeight: 85,
    plants: [{ left: '10px', emoji: '🌿', size: 18 }, { right: '15px', emoji: '🪸', size: 22 }],
    fish: [{ left: '80px', top: '35px', emoji: '🐠', size: 14, delay: 0 }],
  },
  {
    visualBg: 'linear-gradient(180deg, #051018 0%, #0a2438 35%, #0f3554 65%, #134e6f 100%)',
    waterBg: 'linear-gradient(180deg, rgba(34,211,238,0.35), rgba(8,28,44,0.9))',
    waterHeight: 90,
    plants: [{ left: '5px', emoji: '🌿', size: 22 }, { left: '30px', emoji: '🎋', size: 26 }],
    fish: [{ left: '100px', top: '40px', emoji: '🐡', size: 12, delay: 0 }],
  },
  {
    visualBg: 'linear-gradient(180deg, #030a10 0%, #0a2438 30%, #0f3554 60%, #0d9488 100%)',
    waterBg: 'linear-gradient(180deg, rgba(45,212,191,0.3), rgba(5,16,24,0.88))',
    waterHeight: 80,
    plants: [{ left: '8px', emoji: '🪸', size: 18 }],
    fish: [{ left: '70px', top: '30px', emoji: '🐠', size: 14, delay: 0 }],
  },
];

function paramColor(status) {
  if (status === 'ok') return 'var(--success)';
  if (status === 'warn') return 'var(--warn)';
  return 'var(--red-light)';
}

export function mapTankForCard(tank, index = 0) {
  const visual = VISUALS[index % VISUALS.length];
  const status = tank.status || 'ok';

  return {
    id: tank.id,
    name: tank.name,
    meta: tank.meta || '—',
    ...visual,
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
