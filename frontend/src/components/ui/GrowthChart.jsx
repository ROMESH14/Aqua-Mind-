function buildPoints(points, width = 700, height = 160) {
  const values = points.map((p) => p.lengthCm);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;
  const padY = 20;
  const chartH = height - padY - 30;

  return points.map((point, i) => {
    const x = points.length === 1 ? width / 2 : 60 + (i / (points.length - 1)) * (width - 120);
    const y = padY + chartH - ((point.lengthCm - min) / range) * chartH;
    return { x, y, value: point.lengthCm, date: point.recordedAt };
  });
}

function formatLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function GrowthChart({ records = [] }) {
  if (!records.length) return null;

  const coords = buildPoints(records);
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = coords.length
    ? `M${coords[0].x},${coords[0].y} ${coords.slice(1).map((c) => `L${c.x},${c.y}`).join(' ')} L${coords[coords.length - 1].x},140 L${coords[0].x},140 Z`
    : '';
  const minVal = Math.min(...coords.map((c) => c.value));
  const maxVal = Math.max(...coords.map((c) => c.value));

  return (
    <div className="chart-area">
      <svg className="chart-svg" viewBox="0 0 700 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(45,212,191,0.35)" />
            <stop offset="100%" stopColor="rgba(45,212,191,0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30" x2="700" y2="30" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="700" y2="80" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="130" x2="700" y2="130" className="chart-grid" strokeDasharray="4 4" />
        <text x="8" y="34" className="chart-label">{maxVal.toFixed(1)} cm</text>
        <text x="8" y="84" className="chart-label">{((maxVal + minVal) / 2).toFixed(1)}</text>
        <text x="8" y="134" className="chart-label">{minVal.toFixed(1)} cm</text>
        {coords.map((c) => (
          <text key={`${c.date}-${c.x}`} x={c.x} y="150" className="chart-label" textAnchor="middle">
            {formatLabel(c.date)}
          </text>
        ))}
        {areaPath && <path fill="url(#growthGrad)" d={areaPath} />}
        {linePoints && <polyline className="chart-line-primary" points={linePoints} />}
        {coords.map((c) => (
          <circle key={`dot-${c.date}-${c.x}`} cx={c.x} cy={c.y} r="4" className="chart-dot" />
        ))}
      </svg>
    </div>
  );
}

export default GrowthChart;
