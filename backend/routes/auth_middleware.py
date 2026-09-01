import functools
from flask import request, jsonify, g
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature, BadSignature
from config import Config
from models.parent import ParentModel

# Token serializer using configured SECRET_KEY
_serializer = URLSafeTimedSerializer(Config.SECRET_KEY, salt="parent-auth-salt-2026")
TOKEN_MAX_AGE = 7 * 24 * 3600  # 7 days in seconds

def generate_parent_token(parent_id, email):
    """Generate a signed, timed bearer token for a parent."""
    payload = {
        "parent_id": parent_id,
        "email": email
    }
    return _serializer.dumps(payload)

def verify_parent_token(token):
    """Verify signed token and return parent_id if valid."""
    try:
        data = _serializer.loads(token, max_age=TOKEN_MAX_AGE)
        return data
    except (SignatureExpired, BadTimeSignature, BadSignature, Exception):
        return None

def parent_required(f):
    """Decorator to enforce parent authentication on API routes."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract Bearer token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = None

        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        elif "token" in request.args:
            token = request.args.get("token")

        if not token:
            return jsonify({
                "error": "Unauthorized",
                "message": "Parent authentication required. Please provide a valid Authorization token."
            }), 401

        payload = verify_parent_token(token)
        if not payload or "parent_id" not in payload:
            return jsonify({
                "error": "Unauthorized",
                "message": "Invalid or expired session token. Please log in again."
            }), 401

        parent = ParentModel.get_by_id(payload["parent_id"])
        if not parent:
            return jsonify({
                "error": "Unauthorized",
                "message": "Parent account not found or has been deactivated."
            }), 401

        # Store in flask g context
        g.current_parent = parent
        return f(*args, **kwargs)

    return decorated_function
