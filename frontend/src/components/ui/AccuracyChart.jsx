function AccuracyChart({ rounds = [], peak }) {
  const points = (rounds || []).map((row) => ({
    round: row.round,
    pct: Number(row.accuracy_pct ?? ((row.accuracy || 0) * 100)),
    name: row.name || `Round ${row.round}`,
  }));

  if (!points.length) {
    return (
      <div className="wq-chart-empty">
        Train the water quality model to see accuracy climb across rounds.
      </div>
    );
  }

  const width = 640;
  const height = 200;
  const padL = 44;
  const padR = 20;
  const padT = 18;
  const padB = 36;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const minY = 50;
  const maxY = 100;
  const xAt = (i) => (points.length === 1
    ? padL + chartW / 2
    : padL + (i / (points.length - 1)) * chartW);
  const yAt = (pct) => padT + chartH - ((pct - minY) / (maxY - minY)) * chartH;
  const coords = points.map((p, i) => ({ ...p, x: xAt(i), y: yAt(p.pct) }));
  const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area = coords.length
    ? `M${coords[0].x},${coords[0].y} ${coords.slice(1).map((c) => `L${c.x},${c.y}`).join(' ')} L${coords[coords.length - 1].x},${padT + chartH} L${coords[0].x},${padT + chartH} Z`
    : '';
  const best = peak ?? Math.max(...points.map((p) => p.pct));

  return (
    <div className="wq-chart">
      <svg className="wq-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Training accuracy by round">
        <defs>
          <linearGradient id="wqAccFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(14,165,164,0.32)" />
            <stop offset="100%" stopColor="rgba(14,165,164,0)" />
          </linearGradient>
        </defs>
        {[60, 70, 80, 90, 100].map((tick) => (
          <g key={tick}>
            <line x1={padL} y1={yAt(tick)} x2={width - padR} y2={yAt(tick)} className="wq-chart-grid" />
            <text x={8} y={yAt(tick) + 4} className="wq-chart-axis">{tick}%</text>
          </g>
        ))}
        {area && <path d={area} fill="url(#wqAccFill)" />}
        <polyline points={line} className="wq-chart-line" />
        {coords.map((c) => (
          <g key={c.round}>
            <circle cx={c.x} cy={c.y} r={c.pct === best ? 6 : 4.5} className={c.pct === best ? 'wq-chart-dot best' : 'wq-chart-dot'} />
            <text x={c.x} y={c.y - 10} textAnchor="middle" className="wq-chart-val">{c.pct.toFixed(1)}%</text>
            <text x={c.x} y={height - 10} textAnchor="middle" className="wq-chart-axis">{c.name?.split(' ')[0] || `R${c.round}`}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default AccuracyChart;
