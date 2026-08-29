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
    assert data.get('source') == 'rules'
    assert 'recommendations' in data
    assert len(data['recommendations']) > 0
    first = data['recommendations'][0]
    assert 'name' in first
    assert 'compat' in first
    assert 'image' in first


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
    assert data.get('source') == 'rules'
    assert 'plants' in data
    assert len(data['plants']) > 0
    first = data['plants'][0]
    assert 'name' in first
    assert 'image' in first


def test_assess_water_quality(client):
    res = client.post('/assess/water-quality', json={
        'tankName': 'Plant Tank 01',
        'fishNames': [{'name': 'Neon Tetra'}],
        'plantNames': [{'name': 'Java Fern'}],
        'reading': {
            'pH': 7.0,
            'Temperature': 25,
            'Ammonia': 0,
            'Nitrite': 0,
            'Nitrate': 8,
            'DissolvedO2': 7.5,
        },
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] in ('excellent', 'good', 'watch', 'critical')
    assert 'actions' in data
    assert 'model' in data


def test_water_quality_model_info(client):
    res = client.get('/model/water-quality')
    assert res.status_code == 200
    data = res.get_json()
    assert 'ready' in data
    assert 'rounds' in data


def test_media_from_recommendation(client):
    res = client.post('/recommend/fish', json={
        'tankType': 'Community',
        'volumeLiters': 60,
        'ph': 7.0,
        'temperature': 25,
        'ammonia': 0,
    })
    image = res.get_json()['recommendations'][0].get('image') or ''
    if not image:
        return
    path = image.replace('http://localhost:5001', '')
    media = client.get(path)
    assert media.status_code == 200
    assert 'image' in (media.content_type or '')


def test_parse_thermometer_text():
    from src.water_quality_ml import parse_thermometer_text
    assert parse_thermometer_text('25.4°C') == 25.4
    assert parse_thermometer_text('Temp 77 F') == 25.0
    assert parse_thermometer_text('93.5 °F') == 34.2
    assert parse_thermometer_text('reading 26') == 26.0
    assert parse_thermometer_text('') is None
