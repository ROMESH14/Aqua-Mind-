"""Water quality thresholds — mirrors backend/src/utils/waterQuality.js."""

PARAM_RULES = {
    'pH': {'min': 6.5, 'max': 7.8, 'ideal': '6.8–7.5'},
    'Temperature': {'min': 22, 'max': 30, 'ideal': '24–28°C'},
    'Ammonia': {'max': 0.01, 'alert_max': 0.05, 'ideal': '<0.01'},
    'Nitrite': {'max': 0.01, 'ideal': '0'},
    'Nitrate': {'max': 20, 'ideal': '<20'},
    'DissolvedO2': {'min': 6, 'ideal': '>6'},
}


def evaluate_reading(reading):
    """Return status, issues list, and risk flags for a single reading dict."""
    issues = []
    status = 'ok'
    risk_flags = []

    ammonia = reading.get('Ammonia') or reading.get('ammonia')
    nitrate = reading.get('Nitrate') or reading.get('nitrate')
    ph = reading.get('pH') or reading.get('ph')
    temp = reading.get('Temperature') or reading.get('temperature')

    if ammonia is not None and ammonia > 0.01:
        issues.append('Ammonia elevated')
        status = 'warn'
        risk_flags.append({
            'param': 'Ammonia',
            'severity': 'warn',
            'message': f'Ammonia at {ammonia:.3f} ppm (ideal <0.01)',
        })
    if ammonia is not None and ammonia > 0.05:
        status = 'alert'
        risk_flags = [f for f in risk_flags if f['param'] != 'Ammonia']
        risk_flags.append({
            'param': 'Ammonia',
            'severity': 'alert',
            'message': f'Ammonia critically high at {ammonia:.3f} ppm',
        })

    if nitrate is not None and nitrate > 20:
        issues.append('Nitrate high')
        if status != 'alert':
            status = 'warn'
        risk_flags.append({
            'param': 'Nitrate',
            'severity': 'warn',
            'message': f'Nitrate at {nitrate:.1f} ppm (ideal <20)',
        })

    if ph is not None and (ph < 6.5 or ph > 7.8):
        issues.append('pH out of range')
        if status != 'alert':
            status = 'warn'
        risk_flags.append({
            'param': 'pH',
            'severity': 'warn',
            'message': f'pH at {ph:.2f} (ideal 6.8–7.5)',
        })

    if temp is not None and (temp < 22 or temp > 30):
        issues.append('Temperature out of range')
        if status != 'alert':
            status = 'warn'
        risk_flags.append({
            'param': 'Temperature',
            'severity': 'warn',
            'message': f'Temperature at {temp:.1f}°C (ideal 24–28°C)',
        })

    return {
        'status': status,
        'statusText': ', '.join(issues) if issues else 'All parameters optimal',
        'issues': issues,
        'riskFlags': risk_flags,
    }


def evaluate_forecast(param, value):
    """Evaluate a predicted value and return severity if out of range."""
    if value is None:
        return None

    rule = PARAM_RULES.get(param)
    if not rule:
        return None

    severity = None
    message = None

    if param == 'Ammonia':
        if value > 0.05:
            severity = 'alert'
            message = f'Forecast: ammonia may reach {value:.3f} ppm'
        elif value > 0.01:
            severity = 'warn'
            message = f'Forecast: ammonia may rise to {value:.3f} ppm'
    elif param == 'pH':
        if value < 6.5 or value > 7.8:
            severity = 'warn'
            message = f'Forecast: pH may drift to {value:.2f}'
    elif param == 'Temperature':
        if value < 22 or value > 30:
            severity = 'warn'
            message = f'Forecast: temperature may reach {value:.1f}°C'
        elif value > 27:
            severity = 'info'
            message = f'Forecast: temperature trending to {value:.1f}°C'

    if severity:
        return {'param': param, 'severity': severity, 'message': message, 'value': value}
    return None
