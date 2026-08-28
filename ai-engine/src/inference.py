"""Model loading and inference for AquaMind ML endpoints."""

from pathlib import Path

import joblib
import numpy as np

from .features import get_feature_columns, readings_to_feature_row
from .rules import recommend_fish_rules, recommend_plant_rules
from .thresholds import evaluate_forecast, evaluate_reading
from .water_quality_ml import (
    FEATURE_NAMES,
    LABELS,
    actions_for_issues,
    catboost_feature_frame,
    combine_ranges,
    feature_row,
    label_from_issues,
    load_train_report,
    param_violations,
    reading_values,
    resolve_inhabitants,
    score_from_label,
    species_status,
    summarize_result,
)

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
        {'emoji': '🐟', 'name': 'Oscar', 'compat': 88},
        {'emoji': '🐟', 'name': 'Jaguar Cichlid', 'compat': 86},
        {'emoji': '🐟', 'name': 'Jack Dempsey', 'compat': 84},
        {'emoji': '🐟', 'name': 'Flowerhorn Cichlid', 'compat': 83},
        {'emoji': '🐟', 'name': 'Green Terror', 'compat': 82},
        {'emoji': '🐟', 'name': 'Silver Arowana', 'compat': 80},
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
        self.quality_bundle = None
        self.catboost_model = None
        self.quality_meta = None
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

        catboost_path = MODELS_DIR / 'water_quality_catboost.cbm'
        user_train = Path(r'C:\Users\asus\OneDrive\Desktop\Finl Project\DataSet\Train\catboost_water.cbm')
        if user_train.is_file():
            catboost_path = user_train
        catboost_meta = MODELS_DIR / 'water_quality_catboost.pkl'
        if catboost_path.exists():
            from catboost import CatBoostClassifier
            self.catboost_model = CatBoostClassifier()
            self.catboost_model.load_model(str(catboost_path))
            self.quality_bundle = {
                'model': self.catboost_model,
                'feature_names': list(FEATURE_NAMES),
                'labels': list(LABELS),
                'algorithm': 'CatBoost',
                'source_file': str(catboost_path),
            }
            if catboost_meta.exists():
                saved = joblib.load(catboost_meta)
                if isinstance(saved, dict):
                    self.quality_bundle.update({k: v for k, v in saved.items() if k != 'model'})
                    self.quality_bundle['model'] = self.catboost_model

        quality_path = MODELS_DIR / 'water_quality_classifier_v1.pkl'
        if self.quality_bundle is None and quality_path.exists():
            self.quality_bundle = joblib.load(quality_path)

        import json
        quality_meta = MODELS_DIR / 'water_quality_meta.json'
        if quality_meta.exists():
            self.quality_meta = json.loads(quality_meta.read_text(encoding='utf-8'))
        else:
            self.quality_meta = load_train_report()

        meta_path = MODELS_DIR / 'water_meta.json'
        if meta_path.exists():
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
    def quality_ready(self):
        return self.catboost_model is not None or self.quality_bundle is not None

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


def _model_card():
    report = store.quality_meta or load_train_report() or {}
    return {
        'ready': store.quality_ready,
        'algorithm': report.get('algorithm') or ('CatBoost' if store.catboost_model is not None else None),
        'accuracy': report.get('best_accuracy'),
        'accuracy_pct': report.get('best_accuracy_pct'),
        'rounds': report.get('rounds', []),
        'best_round': report.get('best_round'),
        'dataset_rows': report.get('dataset_rows'),
        'fish_species': report.get('fish_species'),
        'plant_species': report.get('plant_species'),
        'feature_names': report.get('feature_names', FEATURE_NAMES),
        'source_file': (store.quality_bundle or {}).get('source_file'),
    }


def assess_water_quality(payload):
    """Score one reading against the tank's fish and plant ranges."""
    store.load()
    values = reading_values(payload.get('reading') or payload)
    species_list, unmatched = resolve_inhabitants(
        payload.get('fishNames') or payload.get('fish') or [],
        payload.get('plantNames') or payload.get('plants') or [],
    )
    ranges = combine_ranges(species_list)
    issues = param_violations(values, ranges)
    rule_label = label_from_issues(issues, values, ranges)

    source = 'rules'
    confidence = 0.74
    label = rule_label
    proba = None
    if store.quality_ready:
        row = np.array([feature_row(values, ranges)])
        if store.catboost_model is not None:
            frame = catboost_feature_frame(values, ranges)
            raw = store.catboost_model.predict(frame)
            pred_id = int(np.asarray(raw).ravel()[0])
            labels = list(LABELS)
            if store.quality_bundle and store.quality_bundle.get('labels'):
                labels = list(store.quality_bundle['labels'])
            label = labels[pred_id] if 0 <= pred_id < len(labels) else rule_label
            proba = float(np.max(store.catboost_model.predict_proba(frame)[0]))
            confidence = proba
        else:
            bundle = store.quality_bundle
            names = bundle.get('feature_names') or FEATURE_NAMES
            lookup = dict(zip(FEATURE_NAMES, row[0]))
            X = np.array([[lookup.get(name, 0) for name in names]])
            X_in = bundle['scaler'].transform(X) if bundle.get('scaler') is not None else X
            pred_id = int(bundle['model'].predict(X_in)[0])
            labels = bundle.get('labels') or list(LABELS)
            label = labels[pred_id] if 0 <= pred_id < len(labels) else rule_label
            if hasattr(bundle['model'], 'predict_proba'):
                proba = float(np.max(bundle['model'].predict_proba(X_in)[0]))
                confidence = proba
        if rule_label == 'critical' and label in ('excellent', 'good'):
            label = 'critical'
        source = 'ml'

    species_cards = species_status(species_list, values)
    actions = actions_for_issues(values, issues)
    score = score_from_label(label, issues, proba)
    tank_name = payload.get('tankName')

    return {
        'status': label,
        'label': label.capitalize(),
        'score': score,
        'confidence': round(float(confidence), 3),
        'summary': summarize_result(label, issues, species_cards, tank_name),
        'issues': issues,
        'actions': actions,
        'species': species_cards,
        'unmatched': unmatched,
        'ranges': ranges,
        'reading': values,
        'source': source,
        'model': _model_card(),
    }, 200


def quality_model_info():
    store.load()
    return _model_card(), 200
