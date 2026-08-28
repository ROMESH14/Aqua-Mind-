"""Run export (optional) and all training scripts sequentially."""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / 'scripts'


def run(script, extra=None):
    cmd = [sys.executable, str(SCRIPTS / script)]
    if extra:
        cmd.extend(extra)
    print(f'\n{"=" * 60}\nRunning {script}...\n{"=" * 60}')
    result = subprocess.run(cmd, cwd=str(ROOT))
    if result.returncode != 0:
        print(f'Warning: {script} exited with code {result.returncode}')
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description='Retrain all AquaMind ML models')
    parser.add_argument('--export', action='store_true', help='Export data from MySQL first')
    args = parser.parse_args()

    if args.export:
        run('export_data.py')

    water_ok = run('train_water.py')
    quality_ok = run('train_water_quality.py')
    fish_ok = run('train_fish.py')
    plants_ok = run('train_plants.py')

    print('\n' + '=' * 60)
    print('Retrain summary:')
    print(f'  Water forecast: {"OK" if water_ok else "SKIPPED/FAILED (need water_readings.csv with 20+ rows)"}')
    print(f'  Water quality:  {"OK" if quality_ok else "SKIPPED/FAILED"}')
    print(f'  Fish:           {"OK" if fish_ok else "SKIPPED/FAILED"}')
    print(f'  Plants:         {"OK" if plants_ok else "SKIPPED/FAILED"}')
    print('=' * 60)
    print('\nRestart ai-engine: python app.py')


if __name__ == '__main__':
    main()
