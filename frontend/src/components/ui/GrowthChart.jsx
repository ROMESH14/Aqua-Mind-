const HEIGHT = 200;
const Y_W = 52;
const SLOT = 80;
const PAD = { l: 8, r: 16, t: 16, b: 36 };
const COLORS = ['#0ea5a4', '#f97316', '#7c3aed', '#0369a1', '#e11d48', '#65a30d', '#d97706', '#0f766e'];

function dayKey(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatDay(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function niceStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  if (n <= 1) return pow;
  if (n <= 2) return 2 * pow;
  if (n <= 5) return 5 * pow;
  return 10 * pow;
}

function niceScale(low, high) {
  const pad = high === low ? 1 : Math.max(0.4, (high - low) * 0.15);
  const min = Math.max(0, low - pad);
  const max = high + pad;
  const step = niceStep((max - min) / 3);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(4)));
  }
  return { min: start, max: end, ticks };
}

function GrowthChart({ records = [] }) {
  const points = [...records]
    .filter((row) => row.lengthCm != null && row.fishName)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  if (!points.length) return null;

  const days = [];
  const seen = new Set();
  points.forEach((row) => {
    const key = dayKey(row.recordedAt);
    if (!key || seen.has(key)) return;
    seen.add(key);
    days.push({ key, date: row.recordedAt, label: formatDay(row.recordedAt) });
  });

  const names = [...new Set(points.map((row) => row.fishName))];
  const series = names.map((name, index) => ({
    name,
    color: COLORS[index % COLORS.length],
    rows: points.filter((row) => row.fishName === name),
  }));

  const values = points.map((row) => Number(row.lengthCm));
  const high = Math.max(...values);
  const low = Math.min(...values);
  const latest = Number(points[points.length - 1].lengthCm);
  const scale = niceScale(low, high);
  const range = scale.max - scale.min || 1;
  const plotH = HEIGHT - PAD.t - PAD.b;
  const plotW = Math.max(days.length * SLOT, SLOT);
  const svgW = PAD.l + plotW + PAD.r;
  const yAt = (value) => PAD.t + plotH - ((value - scale.min) / range) * plotH;
  const xAt = (index) => PAD.l + index * SLOT + 20;

  const plotted = series.map((item) => ({
    ...item,
    coords: item.rows.map((row) => {
      const index = days.findIndex((day) => day.key === dayKey(row.recordedAt));
      return {
        x: xAt(Math.max(0, index)),
        y: yAt(Number(row.lengthCm)),
        value: Number(row.lengthCm),
        date: row.recordedAt,
      };
    }),
  }));

  return (
    <div className="chart-body growth-chart-body">
      <div className="growth-chart-plot">
        <div className="growth-legend" aria-label="Fish on chart">
          {series.map((item) => (
            <span key={item.name} className="growth-legend-item">
              <i style={{ background: item.color }} />
              {item.name}
            </span>
          ))}
        </div>
        <div className="growth-sheet">
          <svg className="growth-y-axis" viewBox={`0 0 ${Y_W} ${HEIGHT}`} width={Y_W} height={HEIGHT} aria-hidden>
            {scale.ticks.map((tick) => (
              <text key={tick} x={Y_W - 6} y={yAt(tick) + 4} className="chart-label" textAnchor="end">
                {tick} cm
              </text>
            ))}
          </svg>
          <div className="growth-sheet-scroll">
            <svg
              className="growth-sheet-plot"
              width={svgW}
              height={HEIGHT}
              viewBox={`0 0 ${svgW} ${HEIGHT}`}
              preserveAspectRatio="xMinYMid meet"
              role="img"
              aria-label={`Length for ${names.join(', ')} across ${days.length} dates`}
            >
              {scale.ticks.map((tick) => (
                <line key={`h-${tick}`} x1={0} y1={yAt(tick)} x2={svgW} y2={yAt(tick)} className="chart-grid" />
              ))}
              {days.map((day, index) => (
                <g key={day.key}>
                  <line x1={xAt(index)} y1={PAD.t} x2={xAt(index)} y2={PAD.t + plotH} className="chart-grid" />
                  <text x={xAt(index)} y={HEIGHT - 10} className="chart-label" textAnchor="middle">{day.label}</text>
                </g>
              ))}
              {plotted.map((item) => (
                <g key={item.name}>
                  {item.coords.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={item.color}
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={item.coords.map((point) => `${point.x},${point.y}`).join(' ')}
                    />
                  )}
                  {item.coords.map((point, index) => (
                    <rect
                      key={`${item.name}-${point.date}-${index}`}
                      x={point.x - 3.5}
                      y={point.y - 3.5}
                      width="7"
                      height="7"
                      fill={item.color}
                    >
                      <title>{`${item.name}: ${point.value.toFixed(1)} cm · ${formatDay(point.date)}`}</title>
                    </rect>
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
      <div className="chart-stats">
        <div className="chart-stat chart-stat-now">
          <span>Current</span>
          <strong>{latest.toFixed(1)}</strong>
        </div>
        <div className="chart-stat chart-stat-high">
          <span>Longest</span>
          <strong>{high.toFixed(1)}</strong>
        </div>
        <div className="chart-stat chart-stat-low">
          <span>Shortest</span>
          <strong>{low.toFixed(1)}</strong>
        </div>
      </div>
    </div>
  );
}

export default GrowthChart;
