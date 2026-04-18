import requests
import os

AWS_REGION = "us-east-2"
PLACE_INDEX_NAME = "SolarApp-PlaceIndex"

# الأفضل: use environment variable instead of hardcoding
API_KEY = os.getenv("AWS_LOCATION_API_KEY")


def get_lat_lng(address: str):
    if not API_KEY:
        raise ValueError("Missing AWS_LOCATION_API_KEY environment variable")

    url = (
        f"https://places.geo.{AWS_REGION}.amazonaws.com"
        f"/places/v0/indexes/{PLACE_INDEX_NAME}/search/text"
    )

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY  # ✅ FIXED HERE
    }

    payload = {
        "Text": address
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None

    data = response.json()

    results = data.get("Results", [])
    if not results:
        return None

    point = results[0]["Place"]["Geometry"]["Point"]
    longitude, latitude = point  # AWS returns [lng, lat]

    return {
        "latitude": latitude,
        "longitude": longitude
    }


if __name__ == "__main__":
    address = "1600 Amphitheatre Parkway, Mountain View, CA"
    result = get_lat_lng(address)

    if result:
        print("Latitude:", result["latitude"])
        print("Longitude:", result["longitude"])
    else:
        print("No location found.")