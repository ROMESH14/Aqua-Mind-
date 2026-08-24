"""Load AquaMind Excel catalogs and resolve local dataset photos."""

from functools import lru_cache
from pathlib import Path

import pandas as pd

ENGINE_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ENGINE_ROOT.parent

FISH_XLSX = REPO_ROOT / 'Fish - DataSet' / 'AquaMind_Complete_Dataset.xlsx'
PLANT_XLSX = REPO_ROOT / 'Plant - DataSet' / 'AquaMind_Plant_Dataset_with_images.xlsx'
FISH_IMAGES = REPO_ROOT / 'Fish - DataSet' / 'fish_images'
PLANT_IMAGES = REPO_ROOT / 'Plant - DataSet' / 'plant'

MEDIA_BASE = 'http://localhost:5001'

FALLBACK_FISH = [
    {
        'name': 'Neon Tetra',
        'scientific_name': 'Paracheirodon innesi',
        'temperament': 'Peaceful',
        'care_level': 'Easy',
        'diet': 'Omnivore',
        'ph_min': 6.0,
        'ph_max': 7.0,
        'temp_min': 20,
        'temp_max': 26,
        'min_liters': 40,
        'max_ammonia': 0.02,
        'max_nitrite': 0.02,
        'max_nitrate': 20,
        'care': 'Peaceful schooling fish. Keep in groups of 6+.',
        'detail': 'Ideal for planted community tanks.',
        'image_rel': None,
        'folder': 'Neon_Tetra',
        'kind': 'fish',
    },
    {
        'name': 'Corydoras',
        'scientific_name': 'Corydoras paleatus',
        'temperament': 'Peaceful',
        'care_level': 'Easy',
        'diet': 'Omnivore',
        'ph_min': 6.5,
        'ph_max': 7.8,
        'temp_min': 22,
        'temp_max': 26,
        'min_liters': 60,
        'max_ammonia': 0.02,
        'max_nitrite': 0.02,
        'max_nitrate': 20,
        'care': 'Bottom-dwelling catfish. School of 4+.',
        'detail': 'Cleans substrate in community tanks.',
        'image_rel': None,
        'folder': 'Bronze_Corydoras',
        'kind': 'fish',
    },
    {
        'name': 'Guppy',
        'scientific_name': 'Poecilia reticulata',
        'temperament': 'Peaceful',
        'care_level': 'Easy',
        'diet': 'Omnivore',
        'ph_min': 6.8,
        'ph_max': 7.8,
        'temp_min': 22,
        'temp_max': 28,
        'min_liters': 40,
        'max_ammonia': 0.02,
        'max_nitrite': 0.02,
        'max_nitrate': 40,
        'care': 'Hardy livebearer. Males display brighter colors.',
        'detail': 'Excellent for beginners.',
        'image_rel': None,
        'folder': 'Guppy',
        'kind': 'fish',
    },
]

FALLBACK_PLANTS = [
    {
        'name': 'Java Fern',
        'scientific_name': 'Microsorum pteropus',
        'plant_type': 'Rhizome',
        'placement': 'Midground',
        'growth_rate': 'Slow',
        'light': 'low',
        'co2': 'none',
        'care_level': 'Easy',
        'ph_min': 6.0,
        'ph_max': 7.5,
        'temp_min': 20,
        'temp_max': 28,
        'care': 'Do not bury rhizome. Low to medium light.',
        'detail': 'Hardy rhizome plant. Thrives without CO2.',
        'incompatible_fish': '',
        'folder': 'Java_Fern',
        'kind': 'plant',
    },
    {
        'name': 'Anubias',
        'scientific_name': 'Anubias barteri',
        'plant_type': 'Rhizome',
        'placement': 'Foreground',
        'growth_rate': 'Slow',
        'light': 'low',
        'co2': 'none',
        'care_level': 'Easy',
        'ph_min': 6.0,
        'ph_max': 7.5,
        'temp_min': 22,
        'temp_max': 28,
        'care': 'Attach to hardscape. Avoid burying rhizome.',
        'detail': 'Slow-growing broad leaves.',
        'incompatible_fish': '',
        'folder': 'Anubias_Nana',
        'kind': 'plant',
    },
    {
        'name': 'Hornwort',
        'scientific_name': 'Ceratophyllum demersum',
        'plant_type': 'Stem',
        'placement': 'Background',
        'growth_rate': 'Fast',
        'light': 'medium',
        'co2': 'none',
        'care_level': 'Easy',
        'ph_min': 6.0,
        'ph_max': 7.5,
        'temp_min': 15,
        'temp_max': 30,
        'care': 'Can float. Fast grower helps reduce nitrate.',
        'detail': 'Natural filter and fry shelter.',
        'incompatible_fish': '',
        'folder': 'Hornwort',
        'kind': 'plant',
    },
]


def _num(value, default=None):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _text(value, default=''):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    return str(value).strip()


def slug_folder(name):
    cleaned = ''.join(ch if ch.isalnum() or ch in ' _-' else '_' for ch in str(name or ''))
    return '_'.join(cleaned.replace('-', '_').split())


def _pick_image_file(folder_dir):
    if not folder_dir.is_dir():
        return None
    preferred = ['img_1.jpg', 'img_1.jpeg', 'img_1.png', '_thumb.jpg']
    for name in preferred:
        path = folder_dir / name
        if path.is_file():
            return name
    for path in sorted(folder_dir.iterdir()):
        if path.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'} and path.is_file():
            return path.name
    return None


def _match_folder(root, name, excel_rel=None):
    if excel_rel:
        rel = Path(str(excel_rel).replace('\\', '/'))
        parts = [p for p in rel.parts if p not in ('fish_images', 'plant', '.')]
        if len(parts) >= 2:
            folder, filename = parts[-2], parts[-1]
            if (root / folder / filename).is_file():
                return folder, filename
        if len(parts) == 1 and (root / parts[0]).is_file():
            return '', parts[0]

    slug = slug_folder(name)
    exact = root / slug
    if exact.is_dir():
        filename = _pick_image_file(exact)
        if filename:
            return slug, filename

    target = slug.lower()
    if root.is_dir():
        for child in root.iterdir():
            if child.is_dir() and (
                child.name.lower() == target
                or target in child.name.lower()
                or child.name.lower() in target
            ):
                filename = _pick_image_file(child)
                if filename:
                    return child.name, filename
    return slug, None


def media_url(kind, folder, filename):
    if not folder or not filename:
        return ''
    return f'{MEDIA_BASE}/media/{kind}/{folder}/{filename}'


def _level(text, mapping):
    raw = (text or '').lower()
    for key, aliases in mapping.items():
        if any(alias in raw for alias in aliases):
            return key
    return 'medium'


def _normalize_light(text):
    return _level(text, {
        'low': ('low',),
        'high': ('high', 'intense', 'strong'),
        'medium': ('med', 'moderate', 'mid'),
    })


def _normalize_co2(text):
    raw = (text or '').lower()
    if any(w in raw for w in ('not required', 'none', 'no co2', 'optional')):
        return 'none'
    if 'high' in raw:
        return 'high'
    if any(w in raw for w in ('low', 'minimal')):
        return 'low'
    if any(w in raw for w in ('med', 'moderate', 'recommended')):
        return 'medium'
    return 'none'


def _attach_fallback_images(rows, kind):
    root = FISH_IMAGES if kind == 'fish' else PLANT_IMAGES
    filled = []
    for row in rows:
        item = dict(row)
        folder, filename = _match_folder(root, item.get('name'), None)
        if folder:
            item['folder'] = folder
        if filename:
            item['image_rel'] = filename
        filled.append(item)
    return filled


def load_fish_rows():
    if not FISH_XLSX.is_file():
        return _attach_fallback_images(FALLBACK_FISH, 'fish'), False

    df = pd.read_excel(FISH_XLSX, sheet_name='Complete Dataset')
    rows = []
    for rec in df.to_dict('records'):
        name = _text(rec.get('Common Name'))
        if not name:
            continue
        folder, filename = _match_folder(FISH_IMAGES, name, rec.get('Image_1 Path'))
        rows.append({
            'name': name,
            'scientific_name': _text(rec.get('Scientific Name')),
            'temperament': _text(rec.get('Temperament')),
            'care_level': _text(rec.get('Care Level')),
            'diet': _text(rec.get('Diet Type')),
            'ph_min': _num(rec.get('Min pH'), 6.0),
            'ph_max': _num(rec.get('Max pH'), 8.0),
            'temp_min': _num(rec.get('Min Temp (C)'), 20),
            'temp_max': _num(rec.get('Max Temp (C)'), 30),
            'min_liters': _num(rec.get('Min Tank Size (L)'), 40),
            'max_ammonia': _num(rec.get('Max Safe Ammonia (ppm)'), 0.02),
            'max_nitrite': _num(rec.get('Max Safe Nitrite (ppm)'), 0.02),
            'max_nitrate': _num(rec.get('Max Safe Nitrate (ppm)'), 20),
            'care': _text(rec.get('Diet Details')) or _text(rec.get('Compatible Tank Mates')),
            'detail': _text(rec.get('Compatible Plants')) or _text(rec.get('Family')),
            'image_rel': filename,
            'folder': folder,
            'kind': 'fish',
        })
    return rows or _attach_fallback_images(FALLBACK_FISH, 'fish'), bool(rows)


def load_plant_rows():
    if not PLANT_XLSX.is_file():
        return _attach_fallback_images(FALLBACK_PLANTS, 'plant'), False

    df = pd.read_excel(PLANT_XLSX, sheet_name='Plant Species Data')
    rows = []
    for rec in df.to_dict('records'):
        name = _text(rec.get('Common Name'))
        if not name:
            continue
        folder, filename = _match_folder(PLANT_IMAGES, name)
        rows.append({
            'name': name,
            'scientific_name': _text(rec.get('Scientific Name')),
            'plant_type': _text(rec.get('Plant Type')),
            'placement': _text(rec.get('Placement')),
            'growth_rate': _text(rec.get('Growth Rate')),
            'light': _normalize_light(rec.get('Light Requirement')),
            'co2': _normalize_co2(rec.get('CO2 Requirement')),
            'care_level': _text(rec.get('Care Level')),
            'ph_min': _num(rec.get('Min pH'), 6.0),
            'ph_max': _num(rec.get('Max pH'), 8.0),
            'temp_min': _num(rec.get('Min Temp (C)'), 18),
            'temp_max': _num(rec.get('Max Temp (C)'), 30),
            'care': _text(rec.get('Fertilization Needs')) or _text(rec.get('Substrate Type')),
            'detail': _text(rec.get('Lifespan/Notes')) or _text(rec.get('Placement')),
            'incompatible_fish': _text(rec.get('Incompatible Fish (High Risk - from AquaMind Fish List)')),
            'image_rel': filename,
            'folder': folder,
            'kind': 'plant',
        })
    return rows or _attach_fallback_images(FALLBACK_PLANTS, 'plant'), bool(rows)


@lru_cache(maxsize=1)
def get_catalogs():
    fish, fish_from_xlsx = load_fish_rows()
    plants, plants_from_xlsx = load_plant_rows()
    return {
        'fish': fish,
        'plants': plants,
        'fish_from_xlsx': fish_from_xlsx,
        'plants_from_xlsx': plants_from_xlsx,
    }


def fish_image_root():
    return FISH_IMAGES


def plant_image_root():
    return PLANT_IMAGES
