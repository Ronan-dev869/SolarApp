import os

import requests
from flask import Blueprint, jsonify, request

solar_bp = Blueprint('solar', __name__)
SOLAR_BASE_URL = 'https://solar.googleapis.com/v1'


@solar_bp.route('/building-insights', methods=['GET'])
def building_insights():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    if not lat or not lng:
        return jsonify({'error': 'lat and lng are required'}), 400

    api_key = os.environ.get('GOOGLE_SOLAR_API_KEY')
    if not api_key:
        return jsonify({
            'error': 'GOOGLE_SOLAR_API_KEY is not set on the backend. '
                     'Create backend/.env from .env.example.'
        }), 500

    url = (
        f"{SOLAR_BASE_URL}/buildingInsights:findClosest"
        f"?location.latitude={lat}&location.longitude={lng}&key={api_key}"
    )

    try:
        resp = requests.get(url, timeout=10)
    except requests.RequestException as exc:
        return jsonify({'error': f'Solar API request failed: {exc}'}), 502

    try:
        body = resp.json()
    except ValueError:
        return jsonify({
            'error': 'Solar API returned non-JSON response',
            'status': resp.status_code,
            'body': resp.text[:500],
        }), 502

    return jsonify(body), resp.status_code
