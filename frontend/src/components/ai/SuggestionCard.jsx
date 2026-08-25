import { useEffect, useState } from 'react';
import EmptyState from '../ui/EmptyState';
import { speciesGallery } from '../../utils/speciesImages';

export function AdvisorEmptyState(props) {
  return <EmptyState {...props} />;
}

function CatalogImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  return (
    <img
      src={failed ? fallback : (src || fallback)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function ImageCarousel({ images, name, alt, fallback, score }) {
  const fromItem = (images || []).filter(Boolean);
  const fromName = speciesGallery(name || alt);
  const slides = (fromItem.length >= 3 ? fromItem : fromName.length ? fromName : fromItem).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [name, alt]);

  const list = slides.length ? slides : [fallback];
  const src = list[index] || fallback;

  return (
    <div className="suggestion-photo">
      <div className="suggestion-image-wrap">
        <CatalogImage src={src} alt={`${alt} photo ${index + 1}`} className="suggestion-image" fallback={fallback} />
        <span className="suggestion-score">{score}</span>
      </div>
      <div className="suggestion-img-controls">
        <button
          type="button"
          className="suggestion-img-nav suggestion-img-prev"
          onClick={() => setIndex((current) => (current - 1 + list.length) % list.length)}
        >
          ‹ Back
        </button>
        <span className="suggestion-img-count">{index + 1} / {list.length}</span>
        <button
          type="button"
          className="suggestion-img-nav suggestion-img-next"
          onClick={() => setIndex((current) => (current + 1) % list.length)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

function IdealParams({ ideal }) {
  if (!ideal) return null;
  return (
    <div className="suggestion-ideal">
      {ideal.ph && <span>pH {ideal.ph}</span>}
      {ideal.temp && <span>{ideal.temp}</span>}
      {ideal.ammonia && <span>NH₃ {ideal.ammonia}</span>}
      {ideal.lighting && <span>Light: {ideal.lighting}</span>}
      {ideal.co2 && <span>CO₂: {ideal.co2}</span>}
      {ideal.flow && <span>{ideal.flow}</span>}
      {ideal.power && <span>{ideal.power}</span>}
      {ideal.volume && <span>{ideal.volume}</span>}
    </div>
  );
}

export function FishSuggestionCard({ item }) {
  return (
    <article className="suggestion-card">
      <ImageCarousel
        images={item.images}
        name={item.name}
        alt={item.name}
        fallback={item.image || '/deck-fish.png'}
        score={`${item.compat}%`}
      />
      <div className="suggestion-body">
        <h3 className="suggestion-name">{item.name}</h3>
        {item.scientificName && <p className="suggestion-scientific">{item.scientificName}</p>}
        <p className="suggestion-desc">{item.description}</p>
        {item.care && <p className="suggestion-care"><strong>Care:</strong> {item.care}</p>}
        <IdealParams ideal={item.ideal} />
        <div className="suggestion-match">
          <div className="compat-bar suggestion-bar" aria-hidden="true">
            <div className="compat-fill" style={{ width: `${item.compat}%` }} />
          </div>
          <span className="suggestion-match-pct">{item.compat}%</span>
        </div>
      </div>
    </article>
  );
}

export function PlantSuggestionCard({ item }) {
  const pct = parseInt(item.match, 10) || 0;
  return (
    <article className="suggestion-card">
      <ImageCarousel
        images={item.images}
        name={item.name}
        alt={item.name}
        fallback={item.image || '/deck-plants.png'}
        score={item.match}
      />
      <div className="suggestion-body">
        <h3 className="suggestion-name">{item.name}</h3>
        {item.scientificName && <p className="suggestion-scientific">{item.scientificName}</p>}
        <p className="suggestion-desc">{item.description}</p>
        {item.care && <p className="suggestion-care"><strong>Care:</strong> {item.care}</p>}
        <IdealParams ideal={item.ideal} />
        <div className="suggestion-match">
          <div className="compat-bar suggestion-bar" aria-label={`${pct} percent match`}>
            <div className="compat-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="suggestion-match-pct">{pct}%</span>
        </div>
      </div>
    </article>
  );
}

export function WaterInsightCard({ item }) {
  return (
    <article className={`ai-prediction-item suggestion-insight ${item.variant}`}>
      {item.image ? (
        <img src={item.image} alt="" className="suggestion-insight-img" />
      ) : (
        <span className="ai-pred-icon">{item.icon}</span>
      )}
      <div>
        <div className="ai-pred-title">{item.title}</div>
        <div className="ai-pred-sub">{item.sub}</div>
        {item.detail && <p className="suggestion-detail">{item.detail}</p>}
      </div>
    </article>
  );
}
