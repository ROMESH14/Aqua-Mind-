"""Train plant suitability classifier."""

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.svm import SVC

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.preprocessing import prepare_classifier_data

MODELS_DIR = ROOT / 'models'
REPORTS_DIR = ROOT / 'reports'

PLANT_CATALOG = [
    {'emoji': '🌱', 'name': 'Java Fern', 'detail': 'Low light, hardy'},
    {'emoji': '🎋', 'name': 'Vallisneria', 'detail': 'Fast growing'},
    {'emoji': '🌿', 'name': 'Anubias', 'detail': 'Low maintenance'},
    {'emoji': '🌊', 'name': 'Hornwort', 'detail': 'Natural filter'},
    {'emoji': '🍃', 'name': 'Cryptocoryne', 'detail': 'Mid-light carpeting'},
    {'emoji': '🌺', 'name': 'Rotala', 'detail': 'High light stem'},
    {'emoji': '🪴', 'name': 'Java Moss', 'detail': 'Attach to driftwood'},
    {'emoji': '⚔️', 'name': 'Amazon Sword', 'detail': 'Large centerpiece'},
]

CAT_COLS = ['lighting', 'co2', 'plant_name']
NUM_COLS = ['ph', 'temp']


def build_features(df, enc, le):
    cat = enc.transform(df[CAT_COLS].astype(str))
    num = df[NUM_COLS].astype(float).values
    X = np.hstack([cat, num])
    y = le.transform(df['plant_name'].astype(str))
    return X, y


def main():
    MODELS_DIR.mkdir(exist_ok=True)
    REPORTS_DIR.mkdir(exist_ok=True)

    csv_name = 'plant_labels.csv'
    if not (ROOT / 'data' / csv_name).exists():
        template = ROOT / 'data' / 'plant_labels.csv.template'
        if template.exists():
            import shutil
            shutil.copy(template, ROOT / 'data' / csv_name)
            print(f'Created {csv_name} from template — edit with your data for better accuracy.')

    df = prepare_classifier_data(csv_name, label_col='suitable', min_rows=5)

    enc = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    enc.fit(df[CAT_COLS].astype(str))
    le = LabelEncoder()
    le.fit(df['plant_name'].astype(str))

    X, y = build_features(df, enc, le)

    candidates = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'SVM': SVC(kernel='rbf', probability=True, random_state=42),
    }

    best_name, best_model, best_score = None, None, -1
    results = {}
    for name, model in candidates.items():
        scores = cross_val_score(model, X, y, cv=min(5, len(df)), scoring='accuracy')
        mean_acc = float(scores.mean())
        print(f'  {name}: CV accuracy = {mean_acc:.3f}')
        results[name] = mean_acc
        if mean_acc > best_score:
            best_score, best_name, best_model = mean_acc, name, model

    best_model.fit(X, y)

    bundle = {
        'model': best_model,
        'encoder': enc,
        'label_encoder': le,
        'cat_cols': CAT_COLS,
        'num_cols': NUM_COLS,
        'algorithm': best_name,
        'catalog': PLANT_CATALOG,
    }
    out_path = MODELS_DIR / 'plant_classifier_v1.pkl'
    joblib.dump(bundle, out_path)
    print(f'Saved best ({best_name}) → {out_path}')

    report = {'algorithm': best_name, 'cv_accuracy': best_score, 'comparison': results}
    report_path = REPORTS_DIR / 'plant_eval.json'
    report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
