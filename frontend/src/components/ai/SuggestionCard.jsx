import { useState } from 'react';
import EmptyState from '../ui/EmptyState';

export function AdvisorEmptyState(props) {
  return <EmptyState {...props} />;
}

function CatalogImage({ src, alt, className, fallback }) {
  const [url, setUrl] = useState(src || fallback);
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => { if (url !== fallback) setUrl(fallback); }}
    />
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
    </div>
  );
}

export function FishSuggestionCard({ item }) {
  return (
    <article className="suggestion-card">
      <div className="suggestion-image-wrap">
        <CatalogImage src={item.image} alt={item.name} className="suggestion-image" fallback="/deck-fish.png" />
        <span className="suggestion-score">{item.compat}%</span>
      </div>
      <div className="suggestion-body">
        <h3 className="suggestion-name">{item.name}</h3>
        {item.scientificName && <p className="suggestion-scientific">{item.scientificName}</p>}
        <p className="suggestion-desc">{item.description}</p>
        {item.care && <p className="suggestion-care"><strong>Care:</strong> {item.care}</p>}
        <IdealParams ideal={item.ideal} />
        <div className="compat-bar suggestion-bar">
          <div className="compat-fill" style={{ width: `${item.compat}%` }} />
        </div>
      </div>
    </article>
  );
}

export function PlantSuggestionCard({ item }) {
  const pct = parseInt(item.match, 10) || 0;
  return (
    <article className="suggestion-card">
      <div className="suggestion-image-wrap">
        <CatalogImage src={item.image} alt={item.name} className="suggestion-image" fallback="/deck-plants.png" />
        <span className="suggestion-score">{item.match}</span>
      </div>
      <div className="suggestion-body">
        <h3 className="suggestion-name">{item.name}</h3>
        {item.scientificName && <p className="suggestion-scientific">{item.scientificName}</p>}
        <p className="suggestion-desc">{item.description}</p>
        {item.care && <p className="suggestion-care"><strong>Care:</strong> {item.care}</p>}
        <IdealParams ideal={item.ideal} />
        <div className="compat-bar suggestion-bar">
          <div className="compat-fill" style={{ width: `${pct}%` }} />
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
