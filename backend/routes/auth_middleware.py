import functools
from flask import request, jsonify, g
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature, BadSignature
from config import Config
from models.parent import ParentModel
from models.teacher import TeacherModel
from models.store_manager import StoreManagerModel

# Token serializers using configured SECRET_KEY
_parent_serializer = URLSafeTimedSerializer(Config.SECRET_KEY, salt="parent-auth-salt-2026")
_teacher_serializer = URLSafeTimedSerializer(Config.SECRET_KEY, salt="teacher-auth-salt-2026")
_store_serializer = URLSafeTimedSerializer(Config.SECRET_KEY, salt="store-manager-salt-2026")

TOKEN_MAX_AGE = 7 * 24 * 3600  # 7 days in seconds

def generate_parent_token(parent_id, email):
    """Generate a signed, timed bearer token for a parent."""
    payload = {
        "role": "parent",
        "parent_id": parent_id,
        "email": email
    }
    return _parent_serializer.dumps(payload)

def verify_parent_token(token):
    """Verify signed parent token and return payload if valid."""
    try:
        data = _parent_serializer.loads(token, max_age=TOKEN_MAX_AGE)
        if isinstance(data, dict) and "parent_id" in data:
            return data
        return None
    except (SignatureExpired, BadTimeSignature, BadSignature, Exception):
        return None

def generate_teacher_token(teacher_id, email):
    """Generate a signed, timed bearer token for a teacher."""
    payload = {
        "role": "teacher",
        "teacher_id": teacher_id,
        "email": email
    }
    return _teacher_serializer.dumps(payload)

def verify_teacher_token(token):
    """Verify signed teacher token and return payload if valid."""
    try:
        data = _teacher_serializer.loads(token, max_age=TOKEN_MAX_AGE)
        if isinstance(data, dict) and "teacher_id" in data:
            return data
        return None
    except (SignatureExpired, BadTimeSignature, BadSignature, Exception):
        return None

def generate_store_manager_token(manager_id, email):
    """Generate a signed, timed bearer token for a store manager."""
    payload = {
        "role": "store_manager",
        "manager_id": manager_id,
        "email": email
    }
    return _store_serializer.dumps(payload)

def verify_store_manager_token(token):
    """Verify signed store manager token and return payload if valid."""
    try:
        data = _store_serializer.loads(token, max_age=TOKEN_MAX_AGE)
        if isinstance(data, dict) and "manager_id" in data:
            return data
        return None
    except (SignatureExpired, BadTimeSignature, BadSignature, Exception):
        return None

def _extract_token():
    """Helper to extract token from header or query parameter."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    if "token" in request.args:
        return request.args.get("token")
    return None

def teacher_required(f):
    """Decorator to enforce teacher authentication and authorization on API routes."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = _extract_token()

        if not token:
            return jsonify({
                "error": "Unauthorized",
                "message": "Teacher authentication required. Please provide a valid Authorization token."
            }), 401

        # Check if valid teacher token
        teacher_payload = verify_teacher_token(token)
        if teacher_payload and "teacher_id" in teacher_payload:
            teacher = TeacherModel.get_by_id(teacher_payload["teacher_id"])
            if not teacher:
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Teacher account not found or has been deactivated."
                }), 401

            g.current_teacher = teacher
            return f(*args, **kwargs)

        # Cross-role security checks: Reject parents and store managers
        parent_payload = verify_parent_token(token)
        if parent_payload:
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. Parent accounts do not have permission to manage student records."
            }), 403

        store_payload = verify_store_manager_token(token)
        if store_payload:
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. Store managers cannot access student academic files or teacher portals."
            }), 403

        # Invalid or expired token
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid or expired session token. Please log in again."
        }), 401

    return decorated_function

def parent_required(f):
    """Decorator to enforce parent authentication and authorization on API routes."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = _extract_token()

        if not token:
            return jsonify({
                "error": "Unauthorized",
                "message": "Parent authentication required. Please provide a valid Authorization token."
            }), 401

        # Check if valid parent token
        parent_payload = verify_parent_token(token)
        if parent_payload and "parent_id" in parent_payload:
            parent = ParentModel.get_by_id(parent_payload["parent_id"])
            if not parent:
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Parent account not found or has been deactivated."
                }), 401

            g.current_parent = parent
            return f(*args, **kwargs)

        # Cross-role security checks: Reject teachers and store managers
        teacher_payload = verify_teacher_token(token)
        if teacher_payload:
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. Teacher accounts cannot access parent-only resources."
            }), 403

        store_payload = verify_store_manager_token(token)
        if store_payload:
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. Store managers cannot access personal parent child portfolios."
            }), 403

        # Invalid or expired token
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid or expired session token. Please log in again."
        }), 401

    return decorated_function

def store_manager_required(f):
    """Decorator to enforce Store Manager authentication on store admin routes."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = _extract_token()

        if not token:
            return jsonify({
                "error": "Unauthorized",
                "message": "Store Manager authentication required. Please provide a valid Authorization token."
            }), 401

        # Check if valid store manager token
        store_payload = verify_store_manager_token(token)
        if store_payload and "manager_id" in store_payload:
            manager = StoreManagerModel.get_by_id(store_payload["manager_id"])
            if not manager:
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Store Manager account not found or has been deactivated."
                }), 401

            g.current_store_manager = manager
            return f(*args, **kwargs)

        # Cross-role security checks: Reject teachers and parents
        parent_payload = verify_parent_token(token)
        if parent_payload:
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. Parent accounts do not have permission to manage the store catalog."
            }), 403

        # Teacher Access: Store manager access is granted to teachers
        teacher_payload = verify_teacher_token(token)
        if teacher_payload and "teacher_id" in teacher_payload:
            teacher = TeacherModel.get_by_id(teacher_payload["teacher_id"])
            if teacher:
                g.current_store_manager = {
                    "id": teacher["id"],
                    "name": f"Teacher {teacher['name']}",
                    "email": teacher["email"],
                    "role": "teacher_store_manager"
                }
                return f(*args, **kwargs)

        # Invalid or expired token
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid or expired session token. Please log in again."
        }), 401

    return decorated_function

