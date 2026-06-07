const VISUALS = [
  {
    visualBg: 'linear-gradient(180deg, #0a0a0a 0%, #141414 30%, #1c1c1c 60%, #2a1515 100%)',
    waterBg: 'linear-gradient(180deg, rgba(196,30,36,0.25), rgba(10,10,10,0.85))',
    waterHeight: 85,
    plants: [{ left: '10px', emoji: '🌿', size: 18 }, { right: '15px', emoji: '🪸', size: 22 }],
    fish: [{ left: '80px', top: '35px', emoji: '🐠', size: 14, delay: 0 }],
  },
  {
    visualBg: 'linear-gradient(180deg, #0a0a0a 0%, #121212 30%, #181818 60%, #1a1212 100%)',
    waterBg: 'linear-gradient(180deg, rgba(196,30,36,0.15), rgba(10,10,10,0.85))',
    waterHeight: 90,
    plants: [{ left: '5px', emoji: '🌿', size: 22 }, { left: '30px', emoji: '🎋', size: 26 }],
    fish: [{ left: '100px', top: '40px', emoji: '🐡', size: 12, delay: 0 }],
  },
  {
    visualBg: 'linear-gradient(180deg, #0a0a0a 0%, #101010 30%, #161616 60%, #1a1010 100%)',
    waterBg: 'linear-gradient(180deg, rgba(196,30,36,0.12), rgba(10,10,10,0.85))',
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
