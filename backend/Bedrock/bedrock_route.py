from flask import Blueprint, request, jsonify
from Bedrock.bedrock import prompt

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data.get("messages", [])
    system = data.get("system", "You are a helpful assistant.")
    reply = prompt(messages, system)
    return jsonify({"reply": reply})
