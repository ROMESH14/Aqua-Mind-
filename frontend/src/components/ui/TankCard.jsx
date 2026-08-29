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

const SPECIES_PREVIEW = 3;

function LifeSection({ title, items, total, kind, empty }) {
  const [expanded, setExpanded] = useState(false);
  const list = Array.isArray(items) ? items : [];
  const hasMore = list.length > SPECIES_PREVIEW;
  const shown = hasMore && !expanded ? list.slice(0, SPECIES_PREVIEW) : list;

  return (
    <section className={`tank-life${kind === 'plant' ? ' tank-life--plants' : ''}`}>
      <header className="tank-life-head">
        <span>{title}</span>
        <em>{total || 0}</em>
      </header>
      {list.length ? (
        <>
          <div className="tank-life-list">
            {shown.map((item, index) => (
              <SpeciesRow key={`${item.name}-${index}`} item={item} kind={kind} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              className="btn btn-ghost btn-sm tank-life-more"
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? 'Show less' : `View all ${list.length}`}
            </button>
          )}
        </>
      ) : (
        <p className="tank-life-empty">{empty}</p>
      )}
    </section>
  );
}

function TankCard({ tank, onEdit, onDelete }) {
  return (
    <article className="tank-card">
      <div className="tank-visual" style={{ background: tank.visualBg }}>
        {(onEdit || onDelete) && (
          <div className="tank-actions">
            {onEdit && (
              <button
                type="button"
                className="tank-edit"
                aria-label={`Edit ${tank.name}`}
                title="Edit tank"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tank);
                }}
              >
                ✎
              </button>
            )}
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
          </div>
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
        <LifeSection
          title="Fish in this tank"
          items={tank.fishNames}
          total={tank.fishTotal}
          kind="fish"
          empty="No fish added yet"
        />
        <LifeSection
          title="Plants in this tank"
          items={tank.plantNames}
          total={tank.plantTotal}
          kind="plant"
          empty="No plants added yet"
        />

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
