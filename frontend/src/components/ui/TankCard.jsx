function TankCard({ tank, onDelete }) {
  const bubbleStyle = tank.bubblePosition === 'left'
    ? { left: '20px', right: 'auto' }
    : undefined;

  return (
    <div className="tank-card">
      <div className="tank-visual" style={{ background: tank.visualBg }}>
        {onDelete && (
          <button
            type="button"
            className="tank-delete"
            aria-label={`Delete ${tank.name}`}
            title="Delete tank"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tank);
            }}
          >
            −
          </button>
        )}
        <div className="tank-water" style={{ bottom: 0, left: 0, right: 0, height: `${tank.waterHeight}px` }}>
          <div className="tank-water-body" style={{ height: `${tank.waterHeight}px`, background: tank.waterBg }}>
            <div className="water-surface" />
          </div>
        </div>
        {tank.plants.map((plant, i) => (
          <div
            key={i}
            className="tank-plant"
            style={{
              left: plant.left,
              right: plant.right,
              fontSize: `${plant.size}px`,
            }}
          >
            {plant.emoji}
          </div>
        ))}
        {tank.fish.map((fish, i) => (
          <div
            key={i}
            className="tank-fish"
            style={{
              left: fish.left,
              top: fish.top,
              fontSize: `${fish.size}px`,
              animationDelay: `${fish.delay}s`,
            }}
          >
            {fish.emoji}
          </div>
        ))}
        <div className="tank-bubbles" style={bubbleStyle}>
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
        </div>
      </div>
      <div className="tank-info">
        <div className="tank-name">{tank.name}</div>
        <div className="tank-meta">{tank.meta}</div>
        <div className="tank-params">
          <div className="param-pill">
            <span className="param-val" style={{ color: tank.paramColors.ph }}>{tank.params.ph}</span>
            <span className="param-key">pH</span>
          </div>
          <div className="param-pill">
            <span className="param-val" style={{ color: tank.paramColors.temp }}>{tank.params.temp}</span>
            <span className="param-key">Temp</span>
          </div>
          <div className="param-pill">
            <span className="param-val" style={{ color: tank.paramColors.nh3 }}>{tank.params.nh3}</span>
            <span className="param-key">NH₃</span>
          </div>
        </div>
        <div className="tank-status">
          <div className={`status-dot ${tank.status}`} />
          <span style={{ color: tank.statusColor }}>{tank.statusText}</span>
        </div>
      </div>
    </div>
  );
}

export default TankCard;
