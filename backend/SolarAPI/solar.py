from flask import Blueprint, request, jsonify
import requests
import os

solar_bp = Blueprint('solar', __name__)
GOOGLE_API_KEY = os.environ.get('GOOGLE_SOLAR_API_KEY')
SOLAR_BASE_URL = 'https://solar.googleapis.com/v1'

@solar_bp.route('/building-insights', methods=['GET'])
def building_insights():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    if not lat or not lng:
        return jsonify({'error': 'lat and lng are required'}), 400

    url = (f"{SOLAR_BASE_URL}/buildingInsights:findClosest"
           f"?location.latitude={lat}&location.longitude={lng}&key={GOOGLE_API_KEY}")

    resp = requests.get(url)
    return jsonify(resp.json()), resp.status_code
