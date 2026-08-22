"""
Export water readings and tank metadata from MySQL myaqua to CSV.

Uses the same env vars as the Node backend:
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE (default: myaqua)
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'data'
DATA_DIR.mkdir(exist_ok=True)

WATER_QUERY = """
SELECT
  wr.ReadingID,
  wr.TankID,
  wr.pH,
  wr.Temperature,
  wr.Ammonia,
  wr.Nitrite,
  wr.Nitrate,
  wr.DissolvedO2,
  wr.RecordedAt
FROM WaterReadings wr
ORDER BY wr.TankID, wr.RecordedAt
"""

TANKS_QUERY = """
SELECT
  t.TankID,
  t.Name,
  t.TankType,
  t.VolumeLiters,
  t.FishCount,
  wr.pH,
  wr.Temperature,
  wr.Ammonia,
  wr.Nitrite,
  wr.Nitrate,
  wr.DissolvedO2,
  wr.RecordedAt AS LatestReadingAt
FROM Tanks t
LEFT JOIN (
  SELECT wr1.*
  FROM WaterReadings wr1
  INNER JOIN (
    SELECT TankID, MAX(RecordedAt) AS MaxAt
    FROM WaterReadings
    GROUP BY TankID
  ) latest ON wr1.TankID = latest.TankID AND wr1.RecordedAt = latest.MaxAt
) wr ON wr.TankID = t.TankID
ORDER BY t.TankID
"""


def get_connection():
    try:
        import pymysql
    except ImportError:
        print('Install pymysql: pip install pymysql', file=sys.stderr)
        sys.exit(1)

    return pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', '3306')),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_DATABASE', 'myaqua'),
        cursorclass=pymysql.cursors.DictCursor,
    )


def export_to_csv(query, filename):
    import pandas as pd

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        print(f'Warning: no rows for {filename}')
        return 0

    df = pd.DataFrame(rows)
    out = DATA_DIR / filename
    df.to_csv(out, index=False)
    print(f'Exported {len(df)} rows → {out}')
    return len(df)


def main():
    # Load backend .env if present
    env_path = ROOT.parent / 'backend' / '.env'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, val = line.partition('=')
                os.environ.setdefault(key.strip(), val.strip())

    water_count = export_to_csv(WATER_QUERY, 'water_readings.csv')
    tank_count = export_to_csv(TANKS_QUERY, 'tanks_export.csv')

    print(f'\nDone. Water readings: {water_count}, Tanks: {tank_count}')
    if water_count < 20:
        print('Note: train_water.py requires at least 20 readings.')
    print('\nNext steps:')
    print('  1. Copy fish_labels.csv.template → fish_labels.csv and edit')
    print('  2. Copy plant_labels.csv.template → plant_labels.csv and edit')
    print('  3. python scripts/train_water.py')


if __name__ == '__main__':
    main()
