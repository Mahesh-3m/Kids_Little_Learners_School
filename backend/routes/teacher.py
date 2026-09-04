from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash
from models.teacher import TeacherModel
from routes.auth_middleware import generate_teacher_token, teacher_required

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/api/teacher/login', methods=['POST'])
def teacher_login():
    """Teacher authentication endpoint."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            "error": "Bad Request",
            "message": "Email and password are required."
        }), 400

    teacher = TeacherModel.get_by_email(email)
    if not teacher or not check_password_hash(teacher['password_hash'], password):
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid email or password. Please try again."
        }), 401

    token = generate_teacher_token(teacher['id'], teacher['email'])

    teacher_data = {
        "id": teacher['id'],
        "name": teacher['name'],
        "email": teacher['email'],
        "created_at": teacher.get('created_at')
    }

    return jsonify({
        "status": "success",
        "message": f"Welcome back, Teacher {teacher['name']}! 👩‍🏫",
        "token": token,
        "teacher": teacher_data
    }), 200

@teacher_bp.route('/api/teacher/register', methods=['POST'])
def teacher_register():
    """Teacher registration endpoint."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not name:
        return jsonify({
            "error": "Bad Request",
            "message": "Full Name is required."
        }), 400

    if not email or '@' not in email or '.' not in email:
        return jsonify({
            "error": "Bad Request",
            "message": "A valid email address is required."
        }), 400

    if not password or len(password) < 6:
        return jsonify({
            "error": "Bad Request",
            "message": "Password must be at least 6 characters long."
        }), 400

    existing = TeacherModel.get_by_email(email)
    if existing:
        return jsonify({
            "error": "Conflict",
            "message": "A teacher account with this email address already exists. Please log in instead."
        }), 400

    try:
        new_teacher = TeacherModel.create(name, email, password)
        token = generate_teacher_token(new_teacher['id'], email)

        return jsonify({
            "status": "success",
            "message": f"Teacher account created successfully! Welcome, {name}! 👩‍🏫",
            "token": token,
            "teacher": new_teacher
        }), 201
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to register teacher: {str(e)}"
        }), 500

@teacher_bp.route('/api/teacher/profile', methods=['GET'])
@teacher_required
def get_teacher_profile():
    """Get authenticated teacher profile."""
    return jsonify({
        "teacher": g.current_teacher
    }), 200

@teacher_bp.route('/api/teacher/stats', methods=['GET'])
@teacher_required
def get_teacher_stats():
    """Get overview statistics for teacher dashboard."""
    try:
        stats = TeacherModel.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve teacher statistics: {str(e)}"
        }), 500
