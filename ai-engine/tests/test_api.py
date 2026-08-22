"""Flask API tests."""

import pytest

from src.api import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


def test_health(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert 'models' in data


def test_predict_water_quality_insufficient_readings(client):
    res = client.post('/predict/water-quality', json={'readings': [{'pH': 7}]})
    assert res.status_code == 200
    data = res.get_json()
    assert data['predictions'] == []


def test_predict_water_quality_model_missing(client):
    readings = [
        {'pH': 7.0, 'Temperature': 25, 'Ammonia': 0, 'Nitrite': 0, 'Nitrate': 10, 'DissolvedO2': 7},
        {'pH': 7.1, 'Temperature': 25.5, 'Ammonia': 0, 'Nitrite': 0, 'Nitrate': 11, 'DissolvedO2': 7},
        {'pH': 7.0, 'Temperature': 26, 'Ammonia': 0.01, 'Nitrite': 0, 'Nitrate': 12, 'DissolvedO2': 6.8},
    ]
    res = client.post('/predict/water-quality', json={'readings': readings})
    # 503 when models not trained, 200 if models exist
    assert res.status_code in (200, 503)
    data = res.get_json()
    if res.status_code == 503:
        assert 'not trained' in data.get('message', '').lower()


def test_recommend_fish(client):
    res = client.post('/recommend/fish', json={
        'tankType': 'Community',
        'volumeLiters': 60,
        'ph': 7.0,
        'temperature': 25,
        'ammonia': 0,
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'recommendations' in data
    assert len(data['recommendations']) > 0


def test_recommend_plants(client):
    res = client.post('/recommend/plants', json={
        'tankType': 'Planted',
        'lighting': 'high',
        'co2': 'medium',
        'ph': 6.9,
        'temperature': 25,
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'plants' in data
