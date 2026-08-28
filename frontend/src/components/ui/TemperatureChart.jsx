import { useState } from 'react';

const WIDTH = 720;
const HEIGHT = 168;
const PAD = { l: 44, r: 28, t: 14, b: 32 };

function num(value) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function formatDay(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatWhen(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function yTicks(min, max) {
  const span = max - min || 1;
  return [max, min + span / 2, min].map((value) => ({
    value,
    label: span < 4 ? `${value.toFixed(1)}°` : `${Math.round(value)}°`,
  }));
}

function xTicks(coords) {
  const ticks = [];
  const seen = new Set();
  coords.forEach((point, index) => {
    const label = formatDay(point.date);
    const isLast = index === coords.length - 1;
    if (!label || (seen.has(label) && !isLast)) return;
    if (isLast && ticks.length && point.x - ticks[ticks.length - 1].x < 64) {
      ticks[ticks.length - 1] = { ...point, label };
    } else {
      ticks.push({ ...point, label });
    }
    seen.add(label);
  });
  return ticks;
}

function TemperatureChart({ trends = [] }) {
  const [hover, setHover] = useState(null);
  const series = trends.find((item) => item.points?.length > 0);
  if (!series) return null;

  const points = series.points
    .map((point) => ({ temperature: num(point.temperature), recordedAt: point.recordedAt }))
    .filter((point) => point.temperature != null);
  if (!points.length) return null;

  const temps = points.map((point) => point.temperature);
  const high = Math.max(...temps);
  const low = Math.min(...temps);
  const latest = points[points.length - 1];
  const pad = high === low ? 0.8 : Math.max(0.4, (high - low) * 0.25);
  const minTemp = low - pad;
  const maxTemp = high + pad;
  const range = maxTemp - minTemp;
  const plotW = WIDTH - PAD.l - PAD.r;
  const plotH = HEIGHT - PAD.t - PAD.b;

  const coords = points.map((point, index) => ({
    x: points.length === 1 ? PAD.l + plotW / 2 : PAD.l + (index / (points.length - 1)) * plotW,
    y: PAD.t + plotH - ((point.temperature - minTemp) / range) * plotH,
    temp: point.temperature,
    date: point.recordedAt,
    isHigh: point.temperature === high,
    isLow: point.temperature === low,
  }));

  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `M${coords[0].x},${PAD.t + plotH} L${coords.map((point) => `${point.x},${point.y}`).join(' ')} L${coords[coords.length - 1].x},${PAD.t + plotH} Z`;

  return (
    <div className="chart-area">
      {series.name && <p className="chart-series-label">{series.name}</p>}
      <div className="chart-body">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Water temperature. Current ${latest.temperature.toFixed(1)}°, high ${high.toFixed(1)}°, low ${low.toFixed(1)}°`}
      >
        <defs>
          <linearGradient id="aquaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(14,165,164,0.32)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
        </defs>
        {yTicks(minTemp, maxTemp).map((tick) => {
          const y = PAD.t + plotH - ((tick.value - minTemp) / range) * plotH;
          return (
            <g key={tick.label}>
              <line x1={PAD.l} y1={y} x2={WIDTH - PAD.r} y2={y} className="chart-grid" strokeDasharray="4 4" />
              <text x={PAD.l - 8} y={y + 4} className="chart-label" textAnchor="end">{tick.label}</text>
            </g>
          );
        })}
        <path className="chart-area-fill" d={area} />
        <polyline className="chart-line-primary" points={line} />
        {coords.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={point.x}
            cy={point.y}
            r={point.isHigh || point.isLow || hover === index ? 6 : 4}
            className={`chart-dot${point.isHigh ? ' is-high' : ''}${point.isLow ? ' is-low' : ''}`}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`${point.temp.toFixed(1)}° · ${formatWhen(point.date)}`}</title>
          </circle>
        ))}
        {xTicks(coords).map((tick) => (
          <text key={tick.label} x={tick.x} y={HEIGHT - 10} className="chart-label" textAnchor="middle">
            {tick.label}
          </text>
        ))}
      </svg>
      <div className="chart-stats">
        <div className="chart-stat chart-stat-now">
          <span>Current</span>
          <strong>{latest.temperature.toFixed(1)}°</strong>
        </div>
        <div className="chart-stat chart-stat-high">
          <span>Highest</span>
          <strong>{high.toFixed(1)}°</strong>
        </div>
        <div className="chart-stat chart-stat-low">
          <span>Lowest</span>
          <strong>{low.toFixed(1)}°</strong>
        </div>
      </div>
      </div>
      {hover != null && coords[hover] && (
        <div className="chart-tip" style={{ left: `${(coords[hover].x / WIDTH) * 100}%` }}>
          <strong>{coords[hover].temp.toFixed(1)}°</strong>
          <span>{formatWhen(coords[hover].date)}</span>
        </div>
      )}
    </div>
  );
}

export default TemperatureChart;
