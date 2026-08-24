"""Generic range-matching rules for fish and plant recommendations."""

from .catalog import get_catalogs, media_url


def _clamp(score):
    return int(max(15, min(98, round(score))))


def _distance_penalty(value, low, high, weight):
    if value is None or low is None or high is None:
        return 0
    if low <= value <= high:
        return 0
    if value < low:
        span = max(0.1, abs(high - low) or 1)
        return min(weight, weight * ((low - value) / span))
    span = max(0.1, abs(high - low) or 1)
    return min(weight, weight * ((value - high) / span))


def _tank_type_penalty(tank_type, temperament):
    temp = (temperament or '').lower()
    kind = (tank_type or 'Community').lower()
    aggressive = any(w in temp for w in ('aggressive', 'predator', 'semi-aggressive', 'territorial'))
    peaceful = 'peaceful' in temp

    if kind == 'community':
        if aggressive:
            return 35
        return 0
    if kind == 'planted':
        if aggressive:
            return 25
        if peaceful:
            return 0
        return 5
    if kind == 'monster fish':
        if peaceful and not aggressive:
            return 20
        return 0
    return 0


def score_fish(row, volume, ph, temp, ammonia, nitrite, nitrate, tank_type):
    score = 100
    reasons = []

    ph_pen = _distance_penalty(ph, row.get('ph_min'), row.get('ph_max'), 28)
    if ph_pen:
        score -= ph_pen
        reasons.append('pH outside preferred range')
    temp_pen = _distance_penalty(temp, row.get('temp_min'), row.get('temp_max'), 28)
    if temp_pen:
        score -= temp_pen
        reasons.append('temperature outside preferred range')

    min_liters = row.get('min_liters') or 0
    if volume is not None and volume < min_liters:
        score -= min(35, 10 + (min_liters - volume) / max(min_liters, 1) * 25)
        reasons.append(f'tank smaller than {int(min_liters)} L')

    if ammonia is not None and row.get('max_ammonia') is not None and ammonia > row['max_ammonia']:
        score -= 40 if ammonia > 0.05 else 20
        reasons.append('ammonia above safe level')
    if nitrite is not None and row.get('max_nitrite') is not None and nitrite > row['max_nitrite']:
        score -= 15
        reasons.append('nitrite elevated')
    if nitrate is not None and row.get('max_nitrate') is not None and nitrate > row['max_nitrate']:
        score -= 10
        reasons.append('nitrate elevated')

    type_pen = _tank_type_penalty(tank_type, row.get('temperament'))
    if type_pen:
        score -= type_pen
        reasons.append('temperament vs tank type')

    return _clamp(score), reasons


def score_plant(row, ph, temp, lighting, co2, tank_type):
    score = 100
    reasons = []

    ph_pen = _distance_penalty(ph, row.get('ph_min'), row.get('ph_max'), 22)
    if ph_pen:
        score -= ph_pen
        reasons.append('pH outside preferred range')
    temp_pen = _distance_penalty(temp, row.get('temp_min'), row.get('temp_max'), 22)
    if temp_pen:
        score -= temp_pen
        reasons.append('temperature outside preferred range')

    light_need = row.get('light') or 'medium'
    lighting = (lighting or 'medium').lower()
    light_rank = {'low': 1, 'medium': 2, 'high': 3}
    gap = abs(light_rank.get(lighting, 2) - light_rank.get(light_need, 2))
    if gap:
        score -= 12 * gap
        reasons.append('lighting mismatch')

    co2_need = row.get('co2') or 'none'
    co2 = (co2 or 'none').lower()
    if co2_need in ('medium', 'high') and co2 == 'none':
        score -= 18
        reasons.append('CO2 recommended')
    elif co2_need == 'none' and co2 == 'high':
        score -= 6

    kind = (tank_type or '').lower()
    if kind == 'monster fish':
        score -= 8
        reasons.append('large fish may uproot plants')

    return _clamp(score), reasons


def recommend_fish_rules(payload, limit=6):
    catalogs = get_catalogs()
    tank_type = payload.get('tankType') or payload.get('tank_type') or 'Community'
    volume = _as_float(payload.get('volumeLiters') or payload.get('volume_liters'), 60)
    ph = _as_float(payload.get('ph') or payload.get('pH'), 7.0)
    temp = _as_float(payload.get('temperature') or payload.get('temp'), 25)
    ammonia = _as_float(payload.get('ammonia'), 0)
    nitrite = _as_float(payload.get('nitrite'), 0)
    nitrate = _as_float(payload.get('nitrate'), 10)

    scored = []
    for row in catalogs['fish']:
        compat, reasons = score_fish(row, volume, ph, temp, ammonia, nitrite, nitrate, tank_type)
        image = media_url('fish', row.get('folder'), row.get('image_rel'))
        scored.append({
            'emoji': '🐟',
            'name': row['name'],
            'compat': compat,
            'scientificName': row.get('scientific_name') or '',
            'description': row.get('detail') or '',
            'care': row.get('care') or '',
            'detail': '; '.join(reasons) if reasons else 'Good match for these parameters',
            'ideal': {
                'ph': f"{row.get('ph_min')}–{row.get('ph_max')}",
                'temp': f"{row.get('temp_min')}–{row.get('temp_max')}°C",
                'ammonia': f"<{row.get('max_ammonia')} ppm",
            },
            'image': image,
        })

    scored.sort(key=lambda item: item['compat'], reverse=True)
    warning = None
    if tank_type == 'Monster Fish':
        warning = 'Research species compatibility before adding new fish'
    source = 'rules'
    message = None if catalogs['fish_from_xlsx'] else 'Excel catalog missing — using built-in fallback species'
    return {
        'recommendations': scored[:limit],
        'warning': warning,
        'source': source,
        'message': message,
    }


def recommend_plant_rules(payload, limit=6):
    catalogs = get_catalogs()
    tank_type = payload.get('tankType') or 'Community'
    lighting = payload.get('lighting') or _default_lighting(tank_type)
    co2 = payload.get('co2') or _default_co2(tank_type)
    ph = _as_float(payload.get('ph') or payload.get('pH'), 7.0)
    temp = _as_float(payload.get('temperature') or payload.get('temp'), 25)

    scored = []
    for row in catalogs['plants']:
        pct, reasons = score_plant(row, ph, temp, lighting, co2, tank_type)
        image = media_url('plant', row.get('folder'), row.get('image_rel'))
        scored.append({
            'emoji': '🌱',
            'name': row['name'],
            'match': f'{pct}% match',
            'compat': pct,
            'scientificName': row.get('scientific_name') or '',
            'description': row.get('detail') or '',
            'care': row.get('care') or '',
            'detail': '; '.join(reasons) if reasons else (row.get('detail') or row.get('placement') or ''),
            'ideal': {
                'lighting': row.get('light'),
                'co2': row.get('co2'),
                'ph': f"{row.get('ph_min')}–{row.get('ph_max')}",
                'temp': f"{row.get('temp_min')}–{row.get('temp_max')}°C",
            },
            'image': image,
        })

    scored.sort(key=lambda item: item['compat'], reverse=True)
    message = None if catalogs['plants_from_xlsx'] else 'Excel catalog missing — using built-in fallback plants'
    return {
        'plants': scored[:limit],
        'source': 'rules',
        'message': message,
    }


def _as_float(value, default):
    if value is None or value == '':
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _default_lighting(tank_type):
    return {'Planted': 'high', 'Community': 'medium'}.get(tank_type, 'low')


def _default_co2(tank_type):
    return {'Planted': 'medium', 'Community': 'none'}.get(tank_type, 'none')
