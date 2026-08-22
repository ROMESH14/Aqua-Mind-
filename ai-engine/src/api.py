"""Flask API routes for AquaMind ML engine."""

from flask import Flask, jsonify, request
from flask_cors import CORS

from .inference import (
    predict_water_quality,
    recommend_fish,
    recommend_plants,
    store,
)

app = Flask(__name__)
CORS(app)


@app.route('/')
def health():
    store.load()
    return jsonify({
        'message': 'AquaMind AI Engine is running!',
        'models': {
            'water': store.water_ready,
            'fish': store.fish_ready,
            'plants': store.plant_ready,
        },
    })


@app.route('/api/health')
def api_health():
    return health()


# --- POST endpoints (new contract) ---

@app.route('/predict/water-quality', methods=['POST'])
def post_predict_water():
    body = request.get_json(silent=True) or {}
    readings = body.get('readings', [])
    result, status = predict_water_quality(readings)
    return jsonify(result), status


@app.route('/recommend/fish', methods=['POST'])
def post_recommend_fish():
    body = request.get_json(silent=True) or {}
    result, status = recommend_fish(body)
    return jsonify(result), status


@app.route('/recommend/plants', methods=['POST'])
def post_recommend_plants():
    body = request.get_json(silent=True) or {}
    result, status = recommend_plants(body)
    return jsonify(result), status


# --- Legacy GET endpoints (offline fallbacks) ---

@app.route('/api/species')
def legacy_species():
    tank_type = request.args.get('tankType', 'Community')
    body = {
        'tankType': tank_type,
        'volumeLiters': float(request.args.get('volumeLiters', 60)),
        'ph': float(request.args.get('ph', 7.0)),
        'temperature': float(request.args.get('temperature', 25)),
        'ammonia': float(request.args.get('ammonia', 0)),
    }
    result, status = recommend_fish(body)
    return jsonify(result), status


@app.route('/api/plants')
def legacy_plants():
    tank_type = request.args.get('tankType', 'Community')
    body = {'tankType': tank_type}
    result, status = recommend_plants(body)
    return jsonify(result), status
