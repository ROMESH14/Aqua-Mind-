"""Feature engineering for water quality time-series."""

import numpy as np
import pandas as pd

WATER_COLS = ['pH', 'Temperature', 'Ammonia', 'Nitrite', 'Nitrate', 'DissolvedO2']
ROLLING_WINDOW = 3


def _normalize_columns(df):
    """Map common lowercase API keys to canonical column names."""
    mapping = {
        'ph': 'pH',
        'temperature': 'Temperature',
        'ammonia': 'Ammonia',
        'nitrite': 'Nitrite',
        'nitrate': 'Nitrate',
        'dissolvedO2': 'DissolvedO2',
        'dissolved_o2': 'DissolvedO2',
        'recordedAt': 'RecordedAt',
        'recorded_at': 'RecordedAt',
        'tankId': 'TankID',
        'tank_id': 'TankID',
    }
    return df.rename(columns={k: v for k, v in mapping.items() if k in df.columns})


def build_water_features(df, tank_col='TankID', time_col='RecordedAt'):
    """
    Build per-reading features for water prediction.
    Returns DataFrame with feature columns and next-step targets.
    """
    df = _normalize_columns(df.copy())
    if time_col in df.columns:
        df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    df = df.sort_values([tank_col, time_col]).reset_index(drop=True)

    feature_frames = []
    for tank_id, group in df.groupby(tank_col):
        g = group.copy().reset_index(drop=True)
        feats = pd.DataFrame({tank_col: tank_id}, index=range(len(g)))

        for col in WATER_COLS:
            if col not in g.columns:
                g[col] = np.nan
            feats[col] = g[col]
            feats[f'{col}_roll_mean'] = g[col].rolling(ROLLING_WINDOW, min_periods=1).mean()
            feats[f'{col}_delta'] = g[col].diff().fillna(0)

        if time_col in g.columns:
            days = g[time_col].diff().dt.total_seconds().div(86400).fillna(0)
            feats['days_since_last'] = days
        else:
            feats['days_since_last'] = 0

        for col in ['Ammonia', 'pH', 'Temperature']:
            feats[f'target_{col}'] = g[col].shift(-1)

        feature_frames.append(feats)

    result = pd.concat(feature_frames, ignore_index=True)
    return result.dropna(subset=['target_Ammonia', 'target_pH', 'target_Temperature'], how='any')


def get_feature_columns():
    """Column names used as model inputs (excluding targets)."""
    cols = []
    for c in WATER_COLS:
        cols.extend([c, f'{c}_roll_mean', f'{c}_delta'])
    cols.append('days_since_last')
    return cols


def readings_to_feature_row(readings):
    """
    Build a single feature vector from a list of reading dicts (most recent last).
    Used at inference time.
    """
    df = _normalize_columns(pd.DataFrame(readings))
    if df.empty:
        return None

    if 'RecordedAt' in df.columns:
        df['RecordedAt'] = pd.to_datetime(df['RecordedAt'], errors='coerce')
        df = df.sort_values('RecordedAt')

    row = {}
    for col in WATER_COLS:
        if col not in df.columns:
            df[col] = np.nan
        series = df[col].dropna()
        val = float(series.iloc[-1]) if len(series) else np.nan
        row[col] = val
        window = series.tail(ROLLING_WINDOW)
        row[f'{col}_roll_mean'] = float(window.mean()) if len(window) else val
        row[f'{col}_delta'] = float(series.diff().iloc[-1]) if len(series) > 1 else 0.0

    if 'RecordedAt' in df.columns and len(df) > 1:
        delta = (df['RecordedAt'].iloc[-1] - df['RecordedAt'].iloc[-2]).total_seconds() / 86400
        row['days_since_last'] = max(delta, 0)
    else:
        row['days_since_last'] = 0

    return row
