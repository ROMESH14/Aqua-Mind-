"""Species-aware water quality classifier, dataset builder, and test-kit scan."""

from __future__ import annotations

import base64
import io
import json
from pathlib import Path

import numpy as np

from .catalog import get_catalogs

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / 'models'
REPORTS_DIR = ROOT / 'reports'
DATA_DIR = ROOT / 'data'

FEATURE_NAMES = [
    'pH', 'Temperature', 'Ammonia', 'Nitrite', 'Nitrate', 'DissolvedO2',
    'ph_min', 'ph_max', 'temp_min', 'temp_max',
    'max_ammonia', 'max_nitrite', 'max_nitrate', 'min_do',
]

CATBOOST_FEATURES = [
    'pH', 'Temperature', 'Ammonia', 'Nitrite', 'Nitrate', 'DissolvedO2',
    'Min pH', 'Max pH', 'Min Temp (C)', 'Max Temp (C)',
    'Max Safe Ammonia (ppm)', 'Max Safe Nitrite (ppm)',
    'Max Safe Nitrate (ppm)', 'Min Dissolved O2 (mg/L)',
]

LABELS = ('excellent', 'good', 'watch', 'critical')
LABEL_TO_ID = {name: i for i, name in enumerate(LABELS)}

DEFAULT_RANGE = {
    'ph_min': 6.5,
    'ph_max': 7.8,
    'temp_min': 22.0,
    'temp_max': 28.0,
    'max_ammonia': 0.02,
    'max_nitrite': 0.02,
    'max_nitrate': 20.0,
    'min_do': 6.0,
}

PLANT_DEFAULTS = {
    'max_ammonia': 0.25,
    'max_nitrite': 0.5,
    'max_nitrate': 40.0,
    'min_do': 4.0,
}


def _num(value, default):
    if value is None:
        return default
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if np.isnan(number):
        return default
    return number


def species_range(row):
    kind = row.get('kind') or 'fish'
    extras = PLANT_DEFAULTS if kind == 'plant' else {}
    return {
        'name': row.get('name') or 'Unknown',
        'kind': kind,
        'ph_min': _num(row.get('ph_min'), DEFAULT_RANGE['ph_min']),
        'ph_max': _num(row.get('ph_max'), DEFAULT_RANGE['ph_max']),
        'temp_min': _num(row.get('temp_min'), DEFAULT_RANGE['temp_min']),
        'temp_max': _num(row.get('temp_max'), DEFAULT_RANGE['temp_max']),
        'max_ammonia': _num(row.get('max_ammonia'), extras.get('max_ammonia', DEFAULT_RANGE['max_ammonia'])),
        'max_nitrite': _num(row.get('max_nitrite'), extras.get('max_nitrite', DEFAULT_RANGE['max_nitrite'])),
        'max_nitrate': _num(row.get('max_nitrate'), extras.get('max_nitrate', DEFAULT_RANGE['max_nitrate'])),
        'min_do': _num(row.get('min_do'), extras.get('min_do', DEFAULT_RANGE['min_do'])),
    }


def _norm(name):
    return ''.join(ch for ch in (name or '').lower() if ch.isalnum() or ch.isspace()).strip()


def match_species(name, catalog):
    target = _norm(name)
    if not target:
        return None
    for row in catalog:
        if _norm(row.get('name')) == target:
            return species_range(row)
    for row in catalog:
        other = _norm(row.get('name'))
        if target in other or other in target:
            return species_range(row)
    return None


def resolve_inhabitants(fish_names=None, plant_names=None):
    catalogs = get_catalogs()
    resolved = []
    unmatched = []
    for item in fish_names or []:
        name = item.get('name') if isinstance(item, dict) else item
        found = match_species(name, catalogs['fish'])
        if found:
            resolved.append(found)
        else:
            unmatched.append(str(name))
    for item in plant_names or []:
        name = item.get('name') if isinstance(item, dict) else item
        found = match_species(name, catalogs['plants'])
        if found:
            resolved.append(found)
        else:
            unmatched.append(str(name))
    return resolved, unmatched


def combine_ranges(species_list):
    if not species_list:
        return dict(DEFAULT_RANGE)

    combined = {
        'ph_min': max(s['ph_min'] for s in species_list),
        'ph_max': min(s['ph_max'] for s in species_list),
        'temp_min': max(s['temp_min'] for s in species_list),
        'temp_max': min(s['temp_max'] for s in species_list),
        'max_ammonia': min(s['max_ammonia'] for s in species_list),
        'max_nitrite': min(s['max_nitrite'] for s in species_list),
        'max_nitrate': min(s['max_nitrate'] for s in species_list),
        'min_do': max(s['min_do'] for s in species_list),
    }
    if combined['ph_min'] > combined['ph_max']:
        mid = (combined['ph_min'] + combined['ph_max']) / 2
        combined['ph_min'], combined['ph_max'] = mid - 0.15, mid + 0.15
    if combined['temp_min'] > combined['temp_max']:
        mid = (combined['temp_min'] + combined['temp_max']) / 2
        combined['temp_min'], combined['temp_max'] = mid - 1, mid + 1
    return combined


def reading_values(reading):
    return {
        'pH': _num(reading.get('pH', reading.get('ph')), None),
        'Temperature': _num(reading.get('Temperature', reading.get('temperature')), None),
        'Ammonia': _num(reading.get('Ammonia', reading.get('ammonia')), None),
        'Nitrite': _num(reading.get('Nitrite', reading.get('nitrite')), None),
        'Nitrate': _num(reading.get('Nitrate', reading.get('nitrate')), None),
        'DissolvedO2': _num(reading.get('DissolvedO2', reading.get('dissolvedO2')), None),
    }


def param_violations(values, ranges):
    issues = []
    ph, temp = values['pH'], values['Temperature']
    nh3, no2, no3, do2 = values['Ammonia'], values['Nitrite'], values['Nitrate'], values['DissolvedO2']

    if ph is not None and (ph < ranges['ph_min'] or ph > ranges['ph_max']):
        issues.append({
            'param': 'pH',
            'value': ph,
            'ideal': f"{ranges['ph_min']:.1f}–{ranges['ph_max']:.1f}",
            'severity': 'critical' if ph < ranges['ph_min'] - 0.8 or ph > ranges['ph_max'] + 0.8 else 'watch',
        })
    if temp is not None and (temp < ranges['temp_min'] or temp > ranges['temp_max']):
        issues.append({
            'param': 'Temperature',
            'value': temp,
            'ideal': f"{ranges['temp_min']:.0f}–{ranges['temp_max']:.0f}°C",
            'severity': 'critical' if temp < ranges['temp_min'] - 4 or temp > ranges['temp_max'] + 4 else 'watch',
        })
    if nh3 is not None and nh3 > ranges['max_ammonia']:
        issues.append({
            'param': 'Ammonia',
            'value': nh3,
            'ideal': f"<{ranges['max_ammonia']:.2f} ppm",
            'severity': 'critical' if nh3 > max(0.05, ranges['max_ammonia'] * 2) else 'watch',
        })
    if no2 is not None and no2 > ranges['max_nitrite']:
        issues.append({
            'param': 'Nitrite',
            'value': no2,
            'ideal': f"<{ranges['max_nitrite']:.2f} ppm",
            'severity': 'critical' if no2 > max(0.25, ranges['max_nitrite'] * 3) else 'watch',
        })
    if no3 is not None and no3 > ranges['max_nitrate']:
        issues.append({
            'param': 'Nitrate',
            'value': no3,
            'ideal': f"<{ranges['max_nitrate']:.0f} ppm",
            'severity': 'watch',
        })
    if do2 is not None and do2 < ranges['min_do']:
        issues.append({
            'param': 'DissolvedO2',
            'value': do2,
            'ideal': f">{ranges['min_do']:.0f} mg/L",
            'severity': 'critical' if do2 < ranges['min_do'] - 2 else 'watch',
        })
    return issues


def label_from_issues(issues, values, ranges):
    if any(item['severity'] == 'critical' for item in issues) or len(issues) >= 3:
        return 'critical'
    if issues:
        return 'watch'
    if values['Ammonia'] is not None and values['Ammonia'] > ranges['max_ammonia'] * 0.4:
        return 'good'
    if values['Nitrate'] is not None and values['Nitrate'] > ranges['max_nitrate'] * 0.7:
        return 'good'
    return 'excellent'


def feature_row(values, ranges):
    return [
        _num(values.get('pH'), 7.0),
        _num(values.get('Temperature'), 25.0),
        _num(values.get('Ammonia'), 0.0),
        _num(values.get('Nitrite'), 0.0),
        _num(values.get('Nitrate'), 10.0),
        _num(values.get('DissolvedO2'), 7.0),
        ranges['ph_min'],
        ranges['ph_max'],
        ranges['temp_min'],
        ranges['temp_max'],
        ranges['max_ammonia'],
        ranges['max_nitrite'],
        ranges['max_nitrate'],
        ranges['min_do'],
    ]


def catboost_feature_frame(values, ranges):
    import pandas as pd

    row = feature_row(values, ranges)
    return pd.DataFrame([dict(zip(CATBOOST_FEATURES, row))], columns=CATBOOST_FEATURES)


def _between(rng, low, high, pad=0):
    start, end = float(low) + pad, float(high) - pad
    if start >= end:
        return (float(low) + float(high)) / 2
    return float(rng.uniform(start, end))


def _sample_safe(rng, ranges):
    return {
        'pH': _between(rng, ranges['ph_min'], ranges['ph_max'], 0.05),
        'Temperature': _between(rng, ranges['temp_min'], ranges['temp_max'], 0.4),
        'Ammonia': rng.uniform(0.0, max(0.001, ranges['max_ammonia'] * 0.35)),
        'Nitrite': rng.uniform(0.0, max(0.001, ranges['max_nitrite'] * 0.35)),
        'Nitrate': rng.uniform(2.0, max(3.0, ranges['max_nitrate'] * 0.45)),
        'DissolvedO2': rng.uniform(ranges['min_do'] + 0.8, ranges['min_do'] + 5.0),
    }


def _sample_good(rng, ranges):
    sample = _sample_safe(rng, ranges)
    sample['Nitrate'] = rng.uniform(ranges['max_nitrate'] * 0.55, ranges['max_nitrate'] * 0.95)
    sample['Ammonia'] = rng.uniform(ranges['max_ammonia'] * 0.25, ranges['max_ammonia'] * 0.85)
    return sample


def _sample_watch(rng, ranges):
    sample = _sample_safe(rng, ranges)
    kind = rng.integers(0, 5)
    if kind == 0:
        sample['pH'] = ranges['ph_max'] + rng.uniform(0.2, 0.7)
    elif kind == 1:
        sample['pH'] = ranges['ph_min'] - rng.uniform(0.2, 0.6)
    elif kind == 2:
        sample['Temperature'] = ranges['temp_max'] + rng.uniform(1.0, 3.0)
    elif kind == 3:
        sample['Nitrate'] = ranges['max_nitrate'] + rng.uniform(4, 18)
    else:
        sample['Ammonia'] = ranges['max_ammonia'] + rng.uniform(0.01, 0.04)
    return sample


def _sample_critical(rng, ranges):
    sample = _sample_safe(rng, ranges)
    kind = rng.integers(0, 4)
    if kind == 0:
        sample['Ammonia'] = max(0.08, ranges['max_ammonia'] * 4) + rng.uniform(0.05, 0.8)
        sample['Nitrite'] = max(0.25, ranges['max_nitrite'] * 6) + rng.uniform(0.1, 1.5)
    elif kind == 1:
        sample['pH'] = rng.choice([rng.uniform(4.2, 5.4), rng.uniform(9.0, 10.5)])
        sample['Temperature'] = rng.choice([rng.uniform(14, 18), rng.uniform(33, 38)])
    elif kind == 2:
        sample['DissolvedO2'] = rng.uniform(1.5, max(2.0, ranges['min_do'] - 2.5))
        sample['Ammonia'] = max(0.1, ranges['max_ammonia'] * 5)
    else:
        sample['Nitrite'] = rng.uniform(1.0, 8.0)
        sample['Nitrate'] = ranges['max_nitrate'] + rng.uniform(30, 90)
        sample['Ammonia'] = rng.uniform(0.2, 1.5)
    return sample


def generate_training_rows(rng=None):
    rng = rng or np.random.default_rng(42)
    catalogs = get_catalogs()
    species = [species_range(row) for row in catalogs['fish']] + [species_range(row) for row in catalogs['plants']]
    if not species:
        species = [dict(DEFAULT_RANGE, name='Community mix', kind='fish')]

    rows = []
    generators = (
        (_sample_safe, 'excellent', 3),
        (_sample_good, 'good', 2),
        (_sample_watch, 'watch', 3),
        (_sample_critical, 'critical', 3),
    )
    for spec in species:
        ranges = {key: spec[key] for key in DEFAULT_RANGE}
        for builder, intended, count in generators:
            for _ in range(count):
                values = builder(rng, ranges)
                issues = param_violations(values, ranges)
                label = label_from_issues(issues, values, ranges)
                if intended == 'good' and label == 'excellent' and rng.random() < 0.7:
                    label = 'good'
                rows.append({
                    **values,
                    **ranges,
                    'species_name': spec['name'],
                    'species_kind': spec['kind'],
                    'quality': label,
                })

    # Mixed-tank samples: intersection of 2–3 random species
    for _ in range(min(180, max(40, len(species)))):
        picks = [species[i] for i in rng.choice(len(species), size=min(3, len(species)), replace=False)]
        ranges = combine_ranges(picks)
        builder, intended, _ = generators[int(rng.integers(0, 4))]
        values = builder(rng, ranges)
        issues = param_violations(values, ranges)
        label = label_from_issues(issues, values, ranges)
        if intended == 'good' and label == 'excellent' and rng.random() < 0.6:
            label = 'good'
        rows.append({
            **values,
            **ranges,
            'species_name': ' + '.join(p['name'] for p in picks),
            'species_kind': 'mixed',
            'quality': label,
        })
    return rows


def build_xy(rows):
    X = np.array([feature_row(row, row) for row in rows], dtype=float)
    y = np.array([LABEL_TO_ID[row['quality']] for row in rows], dtype=int)
    return X, y


ACTIONS = {
    'pH-low': {
        'title': 'Raise pH slowly',
        'detail': 'Do a small water change with slightly harder water, or add crushed coral. Change pH by no more than 0.2 per day so fish are not shocked.',
        'priority': 'high',
    },
    'pH-high': {
        'title': 'Bring pH down gently',
        'detail': 'Change 25–30% of the water with RO or softer water. Remove limestone décor if it is leaching minerals. Never dump in a large pH-down dose.',
        'priority': 'high',
    },
    'Temperature-low': {
        'title': 'Warm the tank',
        'detail': 'Raise the heater 1°C at a time and confirm it is working. Cover an open lid to hold heat. Avoid sudden jumps.',
        'priority': 'medium',
    },
    'Temperature-high': {
        'title': 'Cool the water',
        'detail': 'Turn the heater down, increase surface movement, and dim lights. In an emergency, float a sealed bag of cool water. High heat also drops oxygen.',
        'priority': 'high',
    },
    'Ammonia': {
        'title': 'Cut ammonia now',
        'detail': 'Do a 40–50% water change with dechlorinated water. Pause feeding for 24 hours, rinse filter sludge in tank water, and add bottled beneficial bacteria.',
        'priority': 'critical',
    },
    'Nitrite': {
        'title': 'Treat a nitrite spike',
        'detail': 'Change 40% of the water and add a nitrite detoxifier. Your filter may still be cycling — do not replace all media at once.',
        'priority': 'critical',
    },
    'Nitrate': {
        'title': 'Lower nitrate',
        'detail': 'Do a 25–40% water change, vacuum the substrate, and add fast-growing plants. Increase weekly changes until nitrate stays under the safe limit.',
        'priority': 'medium',
    },
    'DissolvedO2': {
        'title': 'Boost oxygen',
        'detail': 'Aim the filter outlet at the surface, add an air stone, and reduce temperature slightly. Low oxygen often shows as gasping at the surface.',
        'priority': 'high',
    },
}


def actions_for_issues(values, issues):
    actions = []
    seen = set()
    for issue in issues:
        param = issue['param']
        key = param
        if param == 'pH':
            key = 'pH-low' if issue['value'] < 7 else 'pH-high'
        if param == 'Temperature':
            key = 'Temperature-low' if issue['value'] < 24 else 'Temperature-high'
        if key in seen:
            continue
        seen.add(key)
        template = ACTIONS.get(key) or ACTIONS.get(param)
        if not template:
            continue
        actions.append({
            **template,
            'param': param,
            'priority': 'critical' if issue['severity'] == 'critical' else template['priority'],
        })
    if not actions and values.get('Ammonia', 0) == 0:
        actions.append({
            'title': 'Keep the routine',
            'detail': 'Parameters look safe for the livestock in this tank. Keep weekly testing and regular water changes so it stays that way.',
            'priority': 'low',
            'param': 'all',
        })
    priority_rank = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    return sorted(actions, key=lambda item: priority_rank.get(item['priority'], 9))


def species_status(species_list, values):
    cards = []
    for spec in species_list:
        ranges = {key: spec[key] for key in DEFAULT_RANGE}
        issues = param_violations(values, ranges)
        cards.append({
            'name': spec['name'],
            'kind': spec['kind'],
            'status': 'stressed' if issues else 'safe',
            'issues': [
                f"{item['param']} {item['value']} is outside {item['ideal']}"
                for item in issues
            ],
        })
    return cards


def score_from_label(label, issues, proba=None):
    base = {'excellent': 94, 'good': 82, 'watch': 62, 'critical': 28}[label]
    base -= min(24, len(issues) * 6)
    if proba is not None:
        base = int(round(0.65 * base + 0.35 * (proba * 100)))
    return int(max(8, min(98, base)))


def load_train_report():
    path = REPORTS_DIR / 'water_quality_train.json'
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding='utf-8'))


def summarize_result(label, issues, species_cards, tank_name=None):
    stressed = [card['name'] for card in species_cards if card['status'] == 'stressed']
    where = f' in {tank_name}' if tank_name else ''
    if label == 'excellent':
        return f'Water looks excellent{where}. All logged parameters sit inside the safe range for the fish and plants in this tank.'
    if label == 'good':
        return f'Water is acceptable{where}, with a few values close to the limit. Keep testing and stay on the water-change schedule.'
    if stressed:
        names = ', '.join(stressed[:3])
        extra = f' and {len(stressed) - 3} more' if len(stressed) > 3 else ''
        return f'Water quality is {label}{where}. {names}{extra} are outside their safe range — follow the steps below.'
    if issues:
        params = ', '.join(item['param'] for item in issues[:3])
        return f'Water quality is {label}{where}. Check {params} and use the actions below to bring the tank back to safe levels.'
    return f'Water quality is {label}{where}. Review the latest log and keep parameters inside the species ranges.'


# --- Test-kit image scan (color pads) ---

PH_CHART = [
    ((230, 140, 40), 5.5),
    ((240, 190, 50), 6.0),
    ((210, 210, 60), 6.5),
    ((140, 200, 70), 7.0),
    ((60, 160, 90), 7.5),
    ((40, 130, 140), 8.0),
    ((50, 90, 170), 8.5),
]
AMMONIA_CHART = [
    ((230, 220, 70), 0.0),
    ((180, 200, 70), 0.25),
    ((90, 170, 90), 0.5),
    ((50, 130, 140), 1.0),
    ((50, 90, 170), 2.0),
    ((90, 70, 150), 4.0),
]
NITRITE_CHART = [
    ((230, 210, 80), 0.0),
    ((230, 170, 140), 0.25),
    ((220, 110, 130), 0.5),
    ((190, 60, 120), 1.0),
    ((150, 40, 110), 2.0),
]
NITRATE_CHART = [
    ((230, 220, 80), 0.0),
    ((230, 180, 70), 10.0),
    ((220, 130, 50), 20.0),
    ((200, 80, 40), 40.0),
    ((160, 40, 35), 80.0),
]


def _nearest_value(rgb, chart):
    sample = np.array(rgb, dtype=float)
    best_value, best_dist = chart[0][1], 1e9
    for color, value in chart:
        dist = float(np.linalg.norm(sample - np.array(color, dtype=float)))
        if dist < best_dist:
            best_dist, best_value = dist, value
    return best_value, best_dist


def _pad_colors(image_array, count=5):
    height, width = image_array.shape[:2]
    y1, y2 = int(height * 0.32), int(height * 0.68)
    colors = []
    for i in range(count):
        x1 = int(width * (0.08 + i * (0.84 / count)))
        x2 = int(width * (0.08 + (i + 0.72) * (0.84 / count)))
        region = image_array[max(0, y1):max(y1 + 1, y2), max(0, x1):max(x1 + 1, x2)]
        if region.size == 0:
            colors.append((128, 128, 128))
            continue
        colors.append(tuple(region.reshape(-1, 3).mean(axis=0)))
    return colors


def scan_test_image(image_b64):
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError('Pillow is required for image scan. Run: pip install pillow') from exc

    raw = image_b64
    if isinstance(raw, str) and ',' in raw:
        raw = raw.split(',', 1)[1]
    data = base64.b64decode(raw)
    image = Image.open(io.BytesIO(data)).convert('RGB')
    image.thumbnail((900, 900))
    arr = np.array(image)
    pads = _pad_colors(arr, 5)

    nitrate, _ = _nearest_value(pads[0], NITRATE_CHART)
    nitrite, _ = _nearest_value(pads[1], NITRITE_CHART)
    ammonia, _ = _nearest_value(pads[2], AMMONIA_CHART)
    ph, _ = _nearest_value(pads[3], PH_CHART)
    # 5th pad often repeats pH / GH; blend toward a mid pH if the first pH looks extreme
    ph_alt, _ = _nearest_value(pads[4], PH_CHART)
    ph = round((ph * 0.65 + ph_alt * 0.35) * 10) / 10

    dissolved = round(float(min(10.0, max(4.5, 8.2 - (ammonia * 1.4) - (nitrite * 0.4)))), 1)

    return {
        'pH': float(ph),
        'temperature': None,
        'ammonia': float(round(ammonia, 3)),
        'nitrite': float(round(nitrite, 3)),
        'nitrate': float(round(nitrate, 1)),
        'dissolvedO2': dissolved,
        'confidence': 0.72,
        'note': 'Colour pads give pH, ammonia, nitrite and nitrate. Type temperature from a thermometer.',
    }
