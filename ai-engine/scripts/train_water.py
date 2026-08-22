"""Train water quality prediction models (RF vs LinearRegression per target)."""

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.preprocessing import prepare_water_training_data, scale_features

MODELS_DIR = ROOT / 'models'
REPORTS_DIR = ROOT / 'reports'
TARGETS = ['Ammonia', 'pH', 'Temperature']


def train_target(X_train, X_test, y_train, y_test, target):
    models = {
        'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42),
        'LinearRegression': LinearRegression(),
    }
    best_name, best_model, best_rmse = None, None, float('inf')

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        print(f'  {target} / {name}: RMSE = {rmse:.4f}')
        if rmse < best_rmse:
            best_rmse, best_name, best_model = rmse, name, model

    return best_name, best_model, best_rmse


def main():
    MODELS_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)

    print('Loading water training data...')
    X, y_dict, feature_names = prepare_water_training_data(min_rows=20)

    X_train, X_test, idx_train, idx_test = train_test_split(
        X, np.arange(len(X)), test_size=0.2, random_state=42
    )
    X_train_s, X_test_s, scaler = scale_features(X_train, X_test)

    meta = {'feature_names': feature_names, 'targets': {}}

    for target in TARGETS:
        print(f'\nTraining {target}...')
        y = y_dict[target]
        y_train, y_test = y[idx_train], y[idx_test]

        best_name, best_model, best_rmse = train_target(
            X_train_s, X_test_s, y_train, y_test, target
        )

        bundle = {
            'model': best_model,
            'scaler': scaler,
            'feature_names': feature_names,
            'target': target,
            'algorithm': best_name,
        }
        out_path = MODELS_DIR / f'water_{target.lower()}_v1.pkl'
        joblib.dump(bundle, out_path)
        print(f'  Saved best ({best_name}) → {out_path}')

        meta['targets'][target] = {
            'algorithm': best_name,
            'rmse': best_rmse,
            'model_file': out_path.name,
        }

    meta_path = MODELS_DIR / 'water_meta.json'
    meta_path.write_text(json.dumps(meta, indent=2), encoding='utf-8')
    report_path = REPORTS_DIR / 'water_eval.json'
    report_path.write_text(json.dumps(meta, indent=2), encoding='utf-8')
    print(f'\nMetrics saved to {report_path}')


if __name__ == '__main__':
    main()
