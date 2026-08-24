function buildChartPoints(points, width = 700, height = 160) {
  const temps = points.map((p) => p.temperature);
  const minTemp = Math.min(...temps) - 1;
  const maxTemp = Math.max(...temps) + 1;
  const range = maxTemp - minTemp || 1;
  const padY = 20;
  const chartH = height - padY - 30;

  return points.map((point, i) => {
    const x = points.length === 1 ? width / 2 : 60 + (i / (points.length - 1)) * (width - 120);
    const y = padY + chartH - ((point.temperature - minTemp) / range) * chartH;
    return { x, y, temp: point.temperature, date: point.recordedAt };
  });
}

function formatLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' });
}

function TemperatureChart({ trends = [] }) {
  const series = trends.find((t) => t.points?.length > 0);
  if (!series) return null;

  const coords = buildChartPoints(series.points);
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = coords.length
    ? `M${coords[0].x},${coords[0].y} ${coords.slice(1).map((c) => `L${c.x},${c.y}`).join(' ')} L${coords[coords.length - 1].x},140 L${coords[0].x},140 Z`
    : '';
  const minTemp = Math.min(...coords.map((c) => c.temp));
  const maxTemp = Math.max(...coords.map((c) => c.temp));

  return (
    <div className="chart-area">
      {series.name && (
        <div className="chart-series-label">{series.name}</div>
      )}
      <svg className="chart-svg" viewBox="0 0 700 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="aquaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(14,165,164,0.35)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30" x2="700" y2="30" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="700" y2="80" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="130" x2="700" y2="130" className="chart-grid" strokeDasharray="4 4" />
        <text x="8" y="34" className="chart-label">{maxTemp.toFixed(0)}°</text>
        <text x="8" y="84" className="chart-label">{((maxTemp + minTemp) / 2).toFixed(0)}°</text>
        <text x="8" y="134" className="chart-label">{minTemp.toFixed(0)}°</text>
        {coords.map((c) => (
          <text key={c.date} x={c.x} y="150" className="chart-label" textAnchor="middle">
            {formatLabel(c.date)}
          </text>
        ))}
        {areaPath && <path className="chart-area-fill" d={areaPath} />}
        {linePoints && <polyline className="chart-line-primary" points={linePoints} />}
        {coords.map((c) => (
          <circle key={`dot-${c.date}`} cx={c.x} cy={c.y} r="4" className="chart-dot" />
        ))}
      </svg>
    </div>
  );
}

export default TemperatureChart;
