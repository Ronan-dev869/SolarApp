import os

from dotenv import load_dotenv
from flask import Flask

# Must load .env BEFORE importing blueprints — any module that reads
# os.environ at import time (e.g. SolarAPI.solar) needs the values in place.
load_dotenv()

from SolarAPI.solar import solar_bp  # noqa: E402


def create_app() -> Flask:
    app = Flask(__name__)
    # Mount the Google Solar proxy under /api/solar so the Vite dev proxy
    # (/api/* -> http://localhost:5000) routes it cleanly.
    app.register_blueprint(solar_bp, url_prefix="/api/solar")
    return app


app = create_app()


if __name__ == "__main__":
    if not os.environ.get("GOOGLE_SOLAR_API_KEY"):
        raise SystemExit(
            "GOOGLE_SOLAR_API_KEY is not set. Copy backend/.env.example to "
            "backend/.env and fill in your Google Cloud key before starting."
        )
    app.run(host="127.0.0.1", port=5000, debug=True)
