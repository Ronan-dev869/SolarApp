"""Amazon Location Service geocoding (v2 Geocode API).

Uses the new standalone Places/Geocode API (``places.geo.<region>.api.aws``)
which does not require a Place Index resource. Auth is via API key passed
as a query parameter. Exposes a Flask blueprint ``geocode_bp`` and a
reusable ``get_lat_lng`` function.
"""

from __future__ import annotations

import logging
import os
from typing import TypedDict

import requests
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)

AWS_REGION = os.getenv("AWS_LOCATION_REGION", "us-west-2")
REQUEST_TIMEOUT_S = 10


class GeocodeResult(TypedDict):
    lat: float
    lon: float
    county: str
    formattedAddress: str


geocode_bp = Blueprint("geocode", __name__)


def _extract_county(address: dict) -> str:
    """New v2 API returns structured fields under ``Address``.

    US county sits on ``SubRegion.Name``. Fall through sensibly when a
    provider omits it (common for apartments, PO boxes, etc.).
    """
    sub_region = address.get("SubRegion") or {}
    locality = address.get("Locality")
    region = address.get("Region") or {}
    return (
        sub_region.get("Name")
        or locality
        or region.get("Name")
        or "Unknown"
    )


def get_lat_lng(address: str) -> GeocodeResult | None:
    """Geocode ``address`` via Amazon Location Places v2.

    Returns ``None`` when no results are found. Raises ``RuntimeError`` if
    the API key is missing — that's a config error, not a bad address.
    """
    api_key = os.getenv("AWS_LOCATION_API_KEY")
    if not api_key:
        raise RuntimeError("Missing AWS_LOCATION_API_KEY environment variable")

    url = f"https://places.geo.{AWS_REGION}.api.aws/v2/geocode"
    params = {"key": api_key}
    payload = {"QueryText": address, "MaxResults": 1}

    response = requests.post(
        url,
        params=params,
        json=payload,
        timeout=REQUEST_TIMEOUT_S,
    )
    response.raise_for_status()

    data = response.json()
    results = data.get("ResultItems", [])
    if not results:
        return None

    item = results[0]
    position = item.get("Position")
    if not position or len(position) != 2:
        return None

    longitude, latitude = position  # AWS returns [lng, lat]
    addr = item.get("Address", {})
    return {
        "lat": float(latitude),
        "lon": float(longitude),
        "county": _extract_county(addr),
        "formattedAddress": item.get("Title") or addr.get("Label", address),
    }


@geocode_bp.route("/geocode", methods=["GET"])
def geocode_route():
    address = request.args.get("address", "").strip()
    if not address:
        return jsonify({"error": "address query param is required"}), 400

    try:
        result = get_lat_lng(address)
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 500
    except requests.RequestException as exc:
        logger.exception("Amazon Location Service request failed")
        return jsonify({"error": f"Geocoding request failed: {exc}"}), 502

    if result is None:
        return jsonify({"error": f"No location found for '{address}'"}), 404

    return jsonify(result)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    demo = "1600 Amphitheatre Parkway, Mountain View, CA"
    logger.info("Geocoding: %s", demo)
    logger.info("Result: %s", get_lat_lng(demo))
