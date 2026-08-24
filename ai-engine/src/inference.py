"""Model loading and inference for AquaMind ML endpoints."""

from pathlib import Path

import joblib
import numpy as np

from .features import get_feature_columns, readings_to_feature_row
from .rules import recommend_fish_rules, recommend_plant_rules
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
        from .catalog import get_catalogs
        return bool(get_catalogs()['fish'])

    @property
    def plant_ready(self):
        from .catalog import get_catalogs
        return bool(get_catalogs()['plants'])


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


def recommend_fish(payload):
    """POST /recommend/fish handler — Excel range rules."""
    return recommend_fish_rules(payload), 200


def recommend_plants(payload):
    """POST /recommend/plants handler — Excel range rules."""
    return recommend_plant_rules(payload), 200
