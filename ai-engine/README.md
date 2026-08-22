# AquaMind AI/ML Engine

Python ML layer for water quality forecasting, fish recommendations, and plant suggestions.

## Prerequisites

- Python 3.10+
- MySQL database `myaqua` with water readings (or exported CSVs)
- Dependencies: `pip install -r requirements.txt`

## Folder structure

```
ai-engine/
├── data/              # Exported CSVs (gitignored — your local data)
├── models/            # Trained .pkl files (gitignored)
├── reports/           # Training evaluation JSON
├── scripts/           # Export and training scripts
├── src/               # Preprocessing, inference, Flask API
├── tests/
└── app.py             # Start server on port 5001
```

## Workflow (real data only)

### 1. Log readings in the app

Use AquaMind to add tanks and log water readings. Data is stored in `myaqua.WaterReadings`.

### 2. Export data from MySQL

**Option A — script** (reads `backend/.env` automatically):

```bash
cd ai-engine
pip install -r requirements.txt
python scripts/export_data.py
```

**Option B — phpMyAdmin**

1. Open phpMyAdmin → database `myaqua`
2. Select table `WaterReadings` → Export → CSV
3. Save as `ai-engine/data/water_readings.csv`

Required columns: `ReadingID, TankID, pH, Temperature, Ammonia, Nitrite, Nitrate, DissolvedO2, RecordedAt`

### 3. Prepare label files

Copy templates and edit with your species/plant knowledge:

```bash
copy data\fish_labels.csv.template data\fish_labels.csv
copy data\plant_labels.csv.template data\plant_labels.csv
```

| File | Columns |
|------|---------|
| `fish_labels.csv` | species, tank_type, volume_liters, ph, temp, ammonia, compatible |
| `plant_labels.csv` | lighting, co2, ph, temp, plant_name, suitable |

### 4. Train models

```bash
# Water quality (needs 20+ readings)
python scripts/train_water.py

# Fish and plants (need label CSVs with 5+ rows)
python scripts/train_fish.py
python scripts/train_plants.py

# Or all at once (optional --export to pull from MySQL first)
python scripts/retrain_all.py --export
```

Models are saved to `models/*.pkl`. Metrics go to `reports/`.

### 5. Start the AI engine

```bash
python app.py
```

Verify: http://localhost:5001/api/health

## API endpoints

| Method | Path | Body |
|--------|------|------|
| POST | `/predict/water-quality` | `{ "readings": [...] }` |
| POST | `/recommend/fish` | `{ volumeLiters, tankType, ph, temperature, ammonia, ... }` |
| POST | `/recommend/plants` | `{ tankType, lighting, co2, ph, temperature }` |
| GET | `/api/health` | Model load status |

Legacy GET routes (`/api/species`, `/api/plants`) remain for offline fallbacks.

## Response shapes (frontend-compatible)

**Predictions:**
```json
{ "predictions": [{ "icon": "✅", "title": "...", "sub": "...", "variant": "success" }] }
```

**Fish:**
```json
{ "recommendations": [{ "name": "Neon Tetra", "compat": 95, "emoji": "🐠" }] }
```

**Plants:**
```json
{ "plants": [{ "name": "Java Fern", "match": "95% match", "detail": "...", "emoji": "🌱" }] }
```

## Tests

```bash
cd ai-engine
pytest tests/ -v
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Model not trained` (503) | Export data and run training scripts |
| `Need at least 20 water readings` | Log more readings or export again |
| AI Advisor shows rule-based fallback | Ensure ai-engine is running on port 5001 |
| Export script fails | Check MySQL credentials in `backend/.env` |
