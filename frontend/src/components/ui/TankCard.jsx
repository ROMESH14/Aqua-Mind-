import { useEffect, useState } from 'react';
import { DEFAULT_FISH_IMAGE, DEFAULT_PLANT_IMAGE, speciesImageUrl } from '../../utils/speciesImages';

function SpeciesRow({ item, kind }) {
  const fallback = kind === 'plant' ? DEFAULT_PLANT_IMAGE : DEFAULT_FISH_IMAGE;
  const [src, setSrc] = useState(speciesImageUrl(item.name) || fallback);
  const count = Number(item.count) || 1;

  useEffect(() => {
    setSrc(speciesImageUrl(item.name) || fallback);
  }, [item.name, fallback]);

  return (
    <div className={`tank-species tank-species--${kind}`}>
      <img
        className="tank-species-photo"
        src={src}
        alt={item.name}
        onError={() => setSrc(fallback)}
      />
      <div className="tank-species-copy">
        <span className="tank-species-name">{item.name}</span>
        <span className="tank-species-count">{count === 1 ? '1 in tank' : `${count} in tank`}</span>
      </div>
    </div>
  );
}

function TankCard({ tank, onDelete }) {
  return (
    <article className="tank-card">
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
        <div className="tank-rays" />
        <div className="tank-water" style={{ background: tank.waterBg }}>
          <div className="water-surface" />
        </div>
        <div className="tank-sand" />
        {tank.plants.map((plant, i) => (
          <div
            key={`p-${i}`}
            className="tank-plant"
            style={{ left: plant.left, fontSize: `${plant.size}px` }}
          >
            {plant.emoji}
          </div>
        ))}
        {tank.fish.map((fish, i) => (
          <div
            key={`f-${i}`}
            className="tank-fish"
            style={{
              left: fish.left,
              top: fish.top,
              fontSize: `${fish.size}px`,
              animationDelay: `${fish.delay}s`,
              animationDuration: `${fish.duration || 5}s`,
            }}
          >
            {fish.emoji}
          </div>
        ))}
        <div className="tank-bubbles">
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
        </div>
        <div className="tank-visual-fade">
          <div className="tank-visual-copy">
            <h3 className="tank-name">{tank.name}</h3>
            <div className="tank-badges">
              {tank.volumeLiters ? <span className="tank-badge">{tank.volumeLiters}L</span> : null}
              {tank.tankType ? <span className="tank-badge">{tank.tankType}</span> : null}
              {tank.fishTotal > 0 ? <span className="tank-badge">{tank.fishTotal} fish</span> : null}
              {tank.plantTotal > 0 ? <span className="tank-badge">{tank.plantTotal} plants</span> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="tank-info">
        <section className="tank-life">
          <header className="tank-life-head">
            <span>Fish in this tank</span>
            <em>{tank.fishTotal || 0}</em>
          </header>
          {tank.fishNames?.length ? (
            <div className="tank-life-list">
              {tank.fishNames.map((item) => (
                <SpeciesRow key={item.name} item={item} kind="fish" />
              ))}
            </div>
          ) : (
            <p className="tank-life-empty">No fish added yet</p>
          )}
        </section>

        <section className="tank-life tank-life--plants">
          <header className="tank-life-head">
            <span>Plants in this tank</span>
            <em>{tank.plantTotal || 0}</em>
          </header>
          {tank.plantNames?.length ? (
            <div className="tank-life-list">
              {tank.plantNames.map((item) => (
                <SpeciesRow key={item.name} item={item} kind="plant" />
              ))}
            </div>
          ) : (
            <p className="tank-life-empty">No plants added yet</p>
          )}
        </section>

        {tank.hasReadings ? (
          <div className="tank-readings">
            <span style={{ color: tank.paramColors.ph }}>pH {tank.params.ph}</span>
            <span style={{ color: tank.paramColors.temp }}>{tank.params.temp}</span>
            <span style={{ color: tank.paramColors.nh3 }}>NH₃ {tank.params.nh3}</span>
          </div>
        ) : (
          <div className="tank-status">
            <div className={`status-dot ${tank.status}`} />
            <span style={{ color: tank.statusColor }}>Water not logged yet</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default TankCard;
