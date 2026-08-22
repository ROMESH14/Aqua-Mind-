"""Data loading and preprocessing for AquaMind ML pipelines."""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

from .features import build_water_features, get_feature_columns

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / 'data'


def load_csv(name, required=True):
    path = DATA_DIR / name
    if not path.exists():
        if required:
            raise FileNotFoundError(f'Missing data file: {path}')
        return None
    return pd.read_csv(path)


def clean_water_readings(df):
    """Clean water readings DataFrame."""
    col_map = {
        'ReadingID': 'ReadingID',
        'TankID': 'TankID',
        'pH': 'pH',
        'Temperature': 'Temperature',
        'Ammonia': 'Ammonia',
        'Nitrite': 'Nitrite',
        'Nitrate': 'Nitrate',
        'DissolvedO2': 'DissolvedO2',
        'RecordedAt': 'RecordedAt',
    }
    df = df.rename(columns={c: c for c in df.columns if c in col_map or c.lower() in [
        'ph', 'temperature', 'ammonia', 'nitrite', 'nitrate', 'dissolvedo2', 'recordedat', 'tankid',
    ]})
    if 'ph' in df.columns and 'pH' not in df.columns:
        df['pH'] = df['ph']
    if 'temperature' in df.columns and 'Temperature' not in df.columns:
        df['Temperature'] = df['temperature']

    numeric_cols = ['pH', 'Temperature', 'Ammonia', 'Nitrite', 'Nitrate', 'DissolvedO2']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    if 'RecordedAt' in df.columns:
        df['RecordedAt'] = pd.to_datetime(df['RecordedAt'], errors='coerce')

    df = df.dropna(subset=['TankID', 'pH', 'Temperature', 'Ammonia'], how='any')
    return df.sort_values(['TankID', 'RecordedAt']).reset_index(drop=True)


def prepare_water_training_data(min_rows=20):
    """Load water CSV and return X, y dict per target, feature names."""
    raw = load_csv('water_readings.csv')
    cleaned = clean_water_readings(raw)
    if len(cleaned) < min_rows:
        raise ValueError(
            f'Need at least {min_rows} water readings in data/water_readings.csv (found {len(cleaned)})'
        )

    featured = build_water_features(cleaned)
    feature_cols = get_feature_columns()
    X = featured[feature_cols].fillna(0).values
    y = {
        'Ammonia': featured['target_Ammonia'].values,
        'pH': featured['target_pH'].values,
        'Temperature': featured['target_Temperature'].values,
    }
    return X, y, feature_cols


def prepare_classifier_data(csv_name, label_col='compatible', min_rows=10):
    """Load fish/plant label CSV for classification training."""
    df = load_csv(csv_name)
    if len(df) < min_rows:
        raise ValueError(f'Need at least {min_rows} rows in data/{csv_name} (found {len(df)})')
    return df.fillna(0)


def fit_encoder(df, categorical_cols):
    """Fit OneHotEncoder on categorical columns."""
    enc = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    enc.fit(df[categorical_cols].astype(str))
    return enc


def encode_species_labels(series):
    """Label-encode species/plant names."""
    le = LabelEncoder()
    return le, le.fit_transform(series.astype(str))


def scale_features(X_train, X_test=None):
    """Standard-scale feature matrices."""
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    if X_test is not None:
        return X_train_scaled, scaler.transform(X_test), scaler
    return X_train_scaled, scaler
