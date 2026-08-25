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


def _name_requirement_bonus(name, volume, tank_type, payload):
    text = (name or '').lower()
    livestock = str(payload.get('livestock') or payload.get('temperament') or '').lower()
    experience = str(payload.get('experience') or 'beginner').lower()
    theme = str(payload.get('theme') or payload.get('style') or '').lower()
    planted = payload.get('planted') is True or 'plant' in (tank_type or '').lower() or 'plant' in theme or 'nature' in theme
    monster = 'monster' in (tank_type or '').lower() or 'monster' in theme or 'predator' in livestock
    shrimp = any(w in text for w in SHRIMP_WORDS)
    school = any(w in text for w in ('tetra', 'rasbora', 'danio', 'barb', 'guppy', 'endler', 'minnow', 'rainbow'))
    beginner = any(w in text for w in ('guppy', 'platy', 'molly', 'neon', 'zebra', 'cherry shrimp', 'amano', 'cory', 'white cloud'))
    predator = any(w in text for w in ('oscar', 'jaguar', 'arowana', 'datnoid', 'stingray', 'bichir', 'knife', 'eel', 'shark', 'pacu'))
    nano = any(w in text for w in ('ember', 'chili', 'celestial', 'shrimp', 'endler', 'otocinclus'))
    large = any(w in text for w in ('arowana', 'stingray', 'pacu', 'oscar', 'jaguar', 'flowerhorn', 'datnoid', 'iridescent'))
    planted_ok = any(w in text for w in ('oto', 'shrimp', 'rasbora', 'ember', 'cardinal', 'neon', 'ram', 'gourami', 'betta', 'celestial', 'cory'))
    bonus = 0
    vol = volume or 60
    if vol < 40 and nano:
        bonus += 12
    if vol < 200 and any(w in text for w in ('arowana', 'stingray', 'pacu', 'iridescent')):
        bonus -= 16
    if planted and planted_ok:
        bonus += 10
    if planted and predator:
        bonus -= 14
    if monster and predator:
        bonus += 10
    if monster and (shrimp or nano):
        bonus -= 22
    if 'school' in livestock and school:
        bonus += 10
    if 'school' in livestock and predator:
        bonus -= 16
    if 'predator' in livestock and predator:
        bonus += 12
    if 'mixed' in livestock and not predator:
        bonus += 5
    if experience == 'beginner' and beginner:
        bonus += 10
    if experience == 'beginner' and predator:
        bonus -= 14
    if experience == 'advanced' and (large or predator):
        bonus += 5
    return bonus


def score_fish(row, volume, ph, temp, ammonia, nitrite, nitrate, tank_type, payload=None):
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

    extra = _name_requirement_bonus(row.get('name'), volume, tank_type, payload or {})
    score += extra
    if extra >= 8:
        reasons.append('strong match for tank size and setup')
    elif extra <= -10:
        reasons.append('weaker match for these requirements')

    return _clamp(score), reasons


def _fish_names_from_payload(payload):
    payload = payload or {}
    names = payload.get('stockingNames') or []
    if not names and payload.get('stocking'):
        names = [
            item.get('name') if isinstance(item, dict) else item
            for item in payload.get('stocking') or []
        ]
    return [str(name) for name in names if name]


def _plant_vs_fish_delta(plant_name, fish_names, tank_type):
    text = ' '.join(fish_names or []).lower()
    name = (plant_name or '').lower()
    kind = (tank_type or '').lower()
    hardy = any(word in name for word in ('java fern', 'anubias', 'java moss'))
    delicate = 'rotala' in name
    rooted = any(word in name for word in ('amazon sword', 'vallisneria', 'cryptocoryne'))
    nipped = any(word in name for word in ('hornwort', 'rotala', 'vallisneria', 'amazon sword'))
    eaters = any(word in text for word in (
        'silver dollar', 'goldfish', 'pacu', 'tinfoil', 'flowerhorn', 'oscar',
        'giant gourami', 'kissing gourami',
    ))
    uprooters = any(word in text for word in (
        'cichlid', 'oscar', 'flowerhorn', 'convict', 'dempsey', 'jaguar', 'terror', 'frontosa',
    ))
    delta = 0
    if 'monster' in kind or eaters:
        if delicate:
            delta -= 30
        if hardy:
            delta += 12
        if nipped and not hardy:
            delta -= 14
    if eaters and delicate:
        delta -= 10
    if uprooters and rooted:
        delta -= 16
    if uprooters and hardy:
        delta += 8
    return delta


def score_plant(row, ph, temp, lighting, co2, tank_type, payload=None):
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
    extra = _plant_vs_fish_delta(row.get('name'), _fish_names_from_payload(payload), tank_type)
    score += extra
    if extra <= -12:
        reasons.append('not safe with the suggested fish')
    elif extra >= 8:
        reasons.append('hardy enough for the suggested fish')
    elif kind == 'monster fish':
        score -= 8
        reasons.append('large fish may uproot plants')

    return _clamp(score), reasons


MONSTER_WORDS = (
    'oscar', 'arowana', 'bichir', 'shark', 'jaguar', 'dempsey', 'flowerhorn', 'terror',
    'knifefish', 'frontosa', 'stingray', 'pacu', 'datnoid', 'shovelnose', 'redtail',
    'fire eel', 'ropefish', 'giant gourami', 'tinfoil', 'bala', 'convict', 'jewel',
    'blood parrot', 'silver dollar', 'iridescent', 'elephant nose', 'firemouth',
    'peacock cichlid', 'rainbow cichlid',
)
SHRIMP_WORDS = ('shrimp', 'prawn')


def _is_monster_name(name):
    text = (name or '').lower()
    return any(word in text for word in MONSTER_WORDS)


def _is_shrimp_name(name):
    text = (name or '').lower()
    return any(word in text for word in SHRIMP_WORDS)


def _pick_top_stocking(scored, volume, limit=4):
    min_fish = 1 if (volume or 60) < 3 else 2
    fish = [item for item in scored if not _is_shrimp_name(item.get('name'))]
    picked = []
    for item in fish:
        if len(picked) >= min_fish:
            break
        picked.append(item)
    for item in scored:
        if len(picked) >= limit:
            break
        if item not in picked:
            picked.append(item)
    return picked[:limit]


def recommend_fish_rules(payload, limit=4):
    catalogs = get_catalogs()
    tank_type = payload.get('tankType') or payload.get('tank_type') or 'Community'
    volume = _as_float(payload.get('volumeLiters') or payload.get('volume_liters'), 60)
    ph = _as_float(payload.get('ph') or payload.get('pH'), 7.0)
    temp = _as_float(payload.get('temperature') or payload.get('temp'), 25)
    ammonia = _as_float(payload.get('ammonia'), 0)
    nitrite = _as_float(payload.get('nitrite'), 0)
    nitrate = _as_float(payload.get('nitrate'), 10)
    kind = (tank_type or '').lower()

    scored = []
    for row in catalogs['fish']:
        name = row.get('name') or ''
        if 'monster' in kind and not _is_monster_name(name):
            continue
        if 'monster' not in kind and _is_monster_name(name) and not _is_shrimp_name(name):
            continue
        compat, reasons = score_fish(row, volume, ph, temp, ammonia, nitrite, nitrate, tank_type, payload)
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
        'recommendations': _pick_top_stocking(scored, volume, limit),
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
        pct, reasons = score_plant(row, ph, temp, lighting, co2, tank_type, payload)
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
