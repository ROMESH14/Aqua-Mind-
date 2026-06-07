from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SPECIES_DB = {
    'Monster Fish': [
        {'emoji': '🐟', 'name': 'Silver Dollar', 'compat': 92},
        {'emoji': '🐡', 'name': 'Bichir', 'compat': 85},
        {'emoji': '🦈', 'name': 'Bala Shark', 'compat': 78},
    ],
    'Community': [
        {'emoji': '🐠', 'name': 'Neon Tetra', 'compat': 95},
        {'emoji': '🐟', 'name': 'Corydoras', 'compat': 90},
        {'emoji': '🐡', 'name': 'Guppy', 'compat': 88},
    ],
    'Planted': [
        {'emoji': '🐠', 'name': 'Cherry Barb', 'compat': 93},
        {'emoji': '🐟', 'name': 'Otocinclus', 'compat': 91},
        {'emoji': '🐡', 'name': 'Dwarf Gourami', 'compat': 84},
    ],
}

PLANTS_DB = [
    {'emoji': '🌱', 'name': 'Java Fern', 'match': '95% match', 'detail': 'Low light, hardy'},
    {'emoji': '🎋', 'name': 'Vallisneria', 'match': '90% match', 'detail': 'Fast growing'},
    {'emoji': '🌿', 'name': 'Anubias', 'match': '82% match', 'detail': 'Low maintenance'},
    {'emoji': '🌊', 'name': 'Hornwort', 'match': '78% match', 'detail': 'Natural filter'},
]


@app.route('/')
def health():
    return jsonify({'message': 'AquaMind AI Engine is running!'})


@app.route('/api/species')
def species():
    tank_type = request.args.get('tankType', 'Community')
    recommendations = SPECIES_DB.get(tank_type, SPECIES_DB['Community'])
    warning = 'Research species compatibility before adding new fish' if tank_type == 'Monster Fish' else None
    return jsonify({'recommendations': recommendations, 'warning': warning})


@app.route('/api/predict')
def predict():
    return jsonify({
        'predictions': [
            {'icon': '✅', 'title': 'pH will remain stable', 'sub': 'Expected 7.0–7.3 range next 7 days', 'variant': 'success'},
            {'icon': '🌡️', 'title': 'Monitor temperature', 'sub': 'Keep between 24–28°C for optimal health', 'variant': 'info'},
        ]
    })


@app.route('/api/plants')
def plants():
    return jsonify({'plants': PLANTS_DB})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
