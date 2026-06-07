function TemperatureChart() {
  return (
    <div className="chart-area">
      <svg className="chart-svg" viewBox="0 0 700 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(196,30,36,0.3)" />
            <stop offset="100%" stopColor="rgba(196,30,36,0)" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30" x2="700" y2="30" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="70" x2="700" y2="70" className="chart-grid" strokeDasharray="4 4" />
        <line x1="0" y1="110" x2="700" y2="110" className="chart-grid" strokeDasharray="4 4" />
        <text x="8" y="34" className="chart-label">28°</text>
        <text x="8" y="74" className="chart-label">26°</text>
        <text x="8" y="114" className="chart-label">24°</text>
        <text x="80" y="150" className="chart-label" textAnchor="middle">Mon</text>
        <text x="180" y="150" className="chart-label" textAnchor="middle">Tue</text>
        <text x="280" y="150" className="chart-label" textAnchor="middle">Wed</text>
        <text x="380" y="150" className="chart-label" textAnchor="middle">Thu</text>
        <text x="480" y="150" className="chart-label" textAnchor="middle">Fri</text>
        <text x="580" y="150" className="chart-label" textAnchor="middle">Sat</text>
        <text x="660" y="150" className="chart-label" textAnchor="middle">Sun</text>
        <path className="chart-area-fill" d="M80,95 L180,90 L280,85 L380,75 L480,80 L580,70 L660,65 L660,140 L80,140 Z" />
        <polyline className="chart-line-primary" points="80,95 180,90 280,85 380,75 480,80 580,70 660,65" />
        <polyline className="chart-line-secondary" points="80,105 180,108 280,100 380,95 480,102 580,98 660,90" />
        <circle cx="660" cy="65" r="4" className="chart-dot" />
        <circle cx="580" cy="70" r="4" className="chart-dot" />
      </svg>
    </div>
  );
}

export default TemperatureChart;
