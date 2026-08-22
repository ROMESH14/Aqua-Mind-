"""Tests for feature engineering."""

import pandas as pd
import pytest

from src.features import build_water_features, get_feature_columns, readings_to_feature_row


def test_build_water_features_rolling():
    df = pd.DataFrame({
        'TankID': [1, 1, 1, 1],
        'pH': [7.0, 7.1, 7.0, 7.2],
        'Temperature': [25, 25.5, 26, 25.8],
        'Ammonia': [0, 0, 0.01, 0.01],
        'Nitrite': [0, 0, 0, 0],
        'Nitrate': [10, 12, 14, 15],
        'DissolvedO2': [7, 7, 6.8, 7],
        'RecordedAt': pd.date_range('2025-01-01', periods=4, freq='D'),
    })
    featured = build_water_features(df)
    assert len(featured) == 3  # last row has no target
    assert 'target_Ammonia' in featured.columns
    assert 'pH_roll_mean' in featured.columns


def test_get_feature_columns():
    cols = get_feature_columns()
    assert 'pH' in cols
    assert 'days_since_last' in cols
    assert 'Ammonia_delta' in cols


def test_readings_to_feature_row():
    readings = [
        {'pH': 7.0, 'Temperature': 25, 'Ammonia': 0, 'Nitrite': 0, 'Nitrate': 10, 'DissolvedO2': 7},
        {'pH': 7.1, 'Temperature': 26, 'Ammonia': 0.01, 'Nitrite': 0, 'Nitrate': 12, 'DissolvedO2': 6.8},
    ]
    row = readings_to_feature_row(readings)
    assert row is not None
    assert row['pH'] == 7.1
    assert 'Ammonia_roll_mean' in row
