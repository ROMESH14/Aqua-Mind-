"""Model loading and inference for AquaMind ML endpoints."""

from pathlib import Path

import joblib
import numpy as np

from .features import get_feature_columns, readings_to_feature_row
from .thresholds import evaluate_forecast, evaluate_reading

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / 'models'

WATER_TARGETS = ['Ammonia', 'pH', 'Temperature']

# Fallback catalogs when models are missing
SPECIES_CATALOG = {
    'Community': [
        {'emoji': '🐠', 'name': 'Neon Tetra', 'compat': 95},
        {'emoji': '🐟', 'name': 'Corydoras', 'compat': 90},
        {'emoji': '🐡', 'name': 'Guppy', 'compat': 88},
    ],
    'Planted': [
        {'emoji': '🐠', 'name': 'Cherry Barb', 'compat': 93},
        {'emoji': '🐟', 'name': 'Otocinclus', 'compat': 91},
        {'emoji': '🐡', 'name': 'Dwarf Gourami', 'compat': 84},
    ],
    'Monster Fish': [
        {'emoji': '🐟', 'name': 'Silver Dollar', 'compat': 92},
        {'emoji': '🐡', 'name': 'Bichir', 'compat': 85},
        {'emoji': '🦈', 'name': 'Bala Shark', 'compat': 78},
    ],
}

PLANT_CATALOG = [
    {'emoji': '🌱', 'name': 'Java Fern', 'match': '95% match', 'detail': 'Low light, hardy'},
    {'emoji': '🎋', 'name': 'Vallisneria', 'match': '90% match', 'detail': 'Fast growing'},
    {'emoji': '🌿', 'name': 'Anubias', 'match': '82% match', 'detail': 'Low maintenance'},
    {'emoji': '🌊', 'name': 'Hornwort', 'match': '78% match', 'detail': 'Natural filter'},
]


class ModelStore:
    """Lazy-load joblib models on startup."""

    def __init__(self):
        self.water_models = {}
        self.fish_bundle = None
        self.plant_bundle = None
        self.water_meta = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return
        self._loaded = True

        for target in WATER_TARGETS:
            path = MODELS_DIR / f'water_{target.lower()}_v1.pkl'
            if path.exists():
                self.water_models[target] = joblib.load(path)

        meta_path = MODELS_DIR / 'water_meta.json'
        if meta_path.exists():
            import json
            self.water_meta = json.loads(meta_path.read_text(encoding='utf-8'))

        fish_path = MODELS_DIR / 'fish_classifier_v1.pkl'
        if fish_path.exists():
            self.fish_bundle = joblib.load(fish_path)

        plant_path = MODELS_DIR / 'plant_classifier_v1.pkl'
        if plant_path.exists():
            self.plant_bundle = joblib.load(plant_path)

    @property
    def water_ready(self):
        return len(self.water_models) == len(WATER_TARGETS)

    @property
    def fish_ready(self):
        return self.fish_bundle is not None

    @property
    def plant_ready(self):
        return self.plant_bundle is not None


store = ModelStore()


def _predictions_from_forecasts(forecasts, latest_reading):
    """Map forecast values to UI prediction cards."""
    cards = []
    risk_flags = []

    for param, value in forecasts.items():
        flag = evaluate_forecast(param, value)
        if flag:
            risk_flags.append(flag)

    if latest_reading:
        current = evaluate_reading(latest_reading)
        risk_flags.extend(current.get('riskFlags', []))

    ammonia_f = forecasts.get('Ammonia')
    ph_f = forecasts.get('pH')
    temp_f = forecasts.get('Temperature')

    if ammonia_f is not None and ammonia_f > 0.01:
        cards.append({
            'icon': '📈',
            'title': 'Ammonia may rise',
            'sub': f'Forecast: {ammonia_f:.3f} ppm next reading',
            'variant': 'warn' if ammonia_f <= 0.05 else 'warn',
        })
    elif ammonia_f is not None:
        cards.append({
            'icon': '✅',
            'title': 'Ammonia looks stable',
            'sub': f'Forecast: {ammonia_f:.3f} ppm',
            'variant': 'success',
        })

    if ph_f is not None:
        if 6.8 <= ph_f <= 7.5:
            cards.append({
                'icon': '✅',
                'title': 'pH will remain stable',
                'sub': f'Expected ~{ph_f:.2f} next reading',
                'variant': 'success',
            })
        else:
            cards.append({
                'icon': '⚗️',
                'title': 'pH may drift',
                'sub': f'Forecast: {ph_f:.2f}',
                'variant': 'info',
            })

    if temp_f is not None:
        if temp_f > 27:
            cards.append({
                'icon': '🌡️',
                'title': 'Monitor temperature',
                'sub': f'Forecast: {temp_f:.1f}°C — check heater',
                'variant': 'info',
            })
        else:
            cards.append({
                'icon': '🌡️',
                'title': 'Temperature stable',
                'sub': f'Expected ~{temp_f:.1f}°C',
                'variant': 'success',
            })

    if not cards:
        cards.append({
            'icon': 'ℹ️',
            'title': 'Insufficient trend data',
            'sub': 'Log more readings for better forecasts',
            'variant': 'info',
        })

    return cards, risk_flags


def predict_water_quality(readings):
    """POST /predict/water-quality handler."""
    store.load()

    if not readings or len(readings) < 3:
        return {
            'predictions': [],
            'forecasts': {},
            'riskFlags': [],
            'message': 'Need at least 3 readings for ML prediction',
        }, 200

    if not store.water_ready:
        return {
            'predictions': [],
            'forecasts': {},
            'riskFlags': [],
            'message': 'Model not trained — run scripts/train_water.py after exporting data',
        }, 503

    feat_row = readings_to_feature_row(readings)
    if feat_row is None:
        return {'predictions': [], 'forecasts': {}, 'riskFlags': []}, 400

    forecasts = {}
    for target, bundle in store.water_models.items():
        names = bundle['feature_names']
        X = np.array([[feat_row.get(n, 0) for n in names]])
        X_scaled = bundle['scaler'].transform(X)
        forecasts[target] = float(bundle['model'].predict(X_scaled)[0])

    latest = readings[-1] if readings else {}
    cards, risk_flags = _predictions_from_forecasts(forecasts, latest)

    return {
        'forecasts': forecasts,
        'predictions': cards,
        'riskFlags': risk_flags,
        'source': 'ml',
    }, 200


def _score_fish_candidate(bundle, species, tank_type, volume, ph, temp, ammonia):
    """Score a single species candidate."""
    import pandas as pd

    row = pd.DataFrame([{
        'species': species,
        'tank_type': tank_type or 'Community',
        'volume_liters': volume or 60,
        'ph': ph or 7.0,
        'temp': temp or 25,
        'ammonia': ammonia or 0,
    }])
    cat = bundle['encoder'].transform(row[bundle['cat_cols']].astype(str))
    num = row[bundle['num_cols']].astype(float).values
    X = np.hstack([cat, num])

    model = bundle['model']
    le = bundle['label_encoder']

    if species not in le.classes_:
        # Unknown species — use average proba if multiclass
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(X)[0]
            return int(proba.max() * 100)
        return 50

    idx = list(le.classes_).index(species)
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(X)[0]
        return int(proba[idx] * 100) if idx < len(proba) else 50
    pred = model.predict(X)[0]
    return 95 if pred == idx else 40


def recommend_fish(payload):
    """POST /recommend/fish handler."""
    store.load()

    tank_type = payload.get('tankType') or payload.get('tank_type') or 'Community'
    volume = payload.get('volumeLiters') or payload.get('volume_liters') or 60
    ph = payload.get('ph') or payload.get('pH') or 7.0
    temp = payload.get('temperature') or payload.get('temp') or 25
    ammonia = payload.get('ammonia') or 0

    warning = None
    if tank_type == 'Monster Fish':
        warning = 'Research species compatibility before adding new fish'

    if not store.fish_ready:
        recs = SPECIES_CATALOG.get(tank_type, SPECIES_CATALOG['Community'])
        return {
            'recommendations': recs,
            'warning': warning,
            'message': 'Fish model not trained — using catalog defaults',
            'source': 'catalog',
        }, 200

    bundle = store.fish_bundle
    catalog = bundle.get('catalog', SPECIES_CATALOG)
    candidates = catalog.get(tank_type, catalog.get('Community', []))

    scored = []
    for item in candidates:
        compat = _score_fish_candidate(
            bundle, item['name'], tank_type, volume, ph, temp, ammonia
        )
        scored.append({
            'emoji': item.get('emoji', '🐟'),
            'name': item['name'],
            'compat': compat,
        })

    scored.sort(key=lambda x: x['compat'], reverse=True)
    return {
        'recommendations': scored[:3],
        'warning': warning,
        'source': 'ml',
    }, 200


def _score_plant_candidate(bundle, plant_name, lighting, co2, ph, temp):
    import pandas as pd

    row = pd.DataFrame([{
        'lighting': lighting or 'medium',
        'co2': co2 or 'none',
        'plant_name': plant_name,
        'ph': ph or 7.0,
        'temp': temp or 25,
    }])
    cat = bundle['encoder'].transform(row[bundle['cat_cols']].astype(str))
    num = row[bundle['num_cols']].astype(float).values
    X = np.hstack([cat, num])

    model = bundle['model']
    le = bundle['label_encoder']

    if plant_name not in le.classes_:
        if hasattr(model, 'predict_proba'):
            return int(model.predict_proba(X)[0].max() * 100)
        return 50

    idx = list(le.classes_).index(plant_name)
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(X)[0]
        return int(proba[idx] * 100) if idx < len(proba) else 50
    return 95 if model.predict(X)[0] == idx else 40


def recommend_plants(payload):
    """POST /recommend/plants handler."""
    store.load()

    tank_type = payload.get('tankType') or 'Community'
    lighting = payload.get('lighting') or _default_lighting(tank_type)
    co2 = payload.get('co2') or _default_co2(tank_type)
    ph = payload.get('ph') or payload.get('pH') or 7.0
    temp = payload.get('temperature') or payload.get('temp') or 25

    if not store.plant_ready:
        return {
            'plants': PLANT_CATALOG,
            'message': 'Plant model not trained — using catalog defaults',
            'source': 'catalog',
        }, 200

    bundle = store.plant_bundle
    catalog = bundle.get('catalog', PLANT_CATALOG)

    scored = []
    for item in catalog:
        pct = _score_plant_candidate(bundle, item['name'], lighting, co2, ph, temp)
        scored.append({
            'emoji': item.get('emoji', '🌱'),
            'name': item['name'],
            'match': f'{pct}% match',
            'detail': item.get('detail', ''),
        })

    scored.sort(key=lambda x: int(x['match'].split('%')[0]), reverse=True)
    return {'plants': scored[:4], 'source': 'ml'}, 200


def _default_lighting(tank_type):
    return {'Planted': 'high', 'Community': 'medium'}.get(tank_type, 'low')


def _default_co2(tank_type):
    return {'Planted': 'medium', 'Community': 'none'}.get(tank_type, 'none')
