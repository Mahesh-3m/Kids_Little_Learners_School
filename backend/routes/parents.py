from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash
from models.parent import ParentModel
from models.student import StudentModel
from routes.auth_middleware import generate_parent_token, parent_required

parents_bp = Blueprint('parents', __name__)

# ----------------------------------------------------
# AUTHENTICATION
# ----------------------------------------------------

@parents_bp.route('/api/parent/login', methods=['POST'])
@parents_bp.route('/api/parents/login', methods=['POST'])
@parents_bp.route('/api/auth/login', methods=['POST'])
def parent_login():
    """Parent authentication endpoint."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            "error": "Bad Request",
            "message": "Email and password are required."
        }), 400

    parent = ParentModel.get_by_email(email)
    if not parent or not check_password_hash(parent['password_hash'], password):
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid email or password. Please try again."
        }), 401

    token = generate_parent_token(parent['id'], parent['email'])
    
    # Remove sensitive password hash
    parent_data = {
        "id": parent['id'],
        "name": parent['name'],
        "email": parent['email'],
        "phone": parent.get('phone', ''),
        "created_at": parent.get('created_at')
    }

    # Fetch initial children list
    children = ParentModel.get_children(parent['id'])

    return jsonify({
        "status": "success",
        "message": f"Welcome back, {parent['name']}! 🌈",
        "token": token,
        "parent": parent_data,
        "children": children
    }), 200

@parents_bp.route('/api/parent/register', methods=['POST'])
@parents_bp.route('/api/parents/register', methods=['POST'])
@parents_bp.route('/api/auth/register', methods=['POST'])
def parent_register():
    """Parent / Learner registration endpoint."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip()
    student_id = data.get('student_id')
    child_name = data.get('child_name', '').strip()

    # Validations
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

    # Check if email is already taken
    existing_parent = ParentModel.get_by_email(email)
    if existing_parent:
        return jsonify({
            "error": "Conflict",
            "message": "An account with this email address already exists. Please log in instead."
        }), 400

    try:
        # Create new parent record
        new_parent = ParentModel.create(name, email, password, phone if phone else None)
        parent_id = new_parent['id']

        # Link child if student_id or matching child info provided
        if student_id:
            try:
                ParentModel.link_student(parent_id, int(student_id))
            except Exception:
                pass
        elif phone or child_name:
            # Auto-link students if phone number matches or child name matches
            matches = ParentModel.find_matching_students(phone=phone, student_name=child_name)
            for s in matches:
                ParentModel.link_student(parent_id, s['id'])

        # Generate authentication token
        token = generate_parent_token(parent_id, email)
        children = ParentModel.get_children(parent_id)

        return jsonify({
            "status": "success",
            "message": f"Welcome to Little Learners, {name}! 🎉 Your account was created successfully.",
            "token": token,
            "parent": new_parent,
            "children": children
        }), 201

    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Registration failed: {str(e)}"
        }), 500

# ----------------------------------------------------
# PARENT PROFILE
# ----------------------------------------------------

@parents_bp.route('/api/parents/profile', methods=['GET'])
@parent_required
def get_profile():
    """Get authenticated parent's profile and linked children."""
    parent = g.current_parent
    children = ParentModel.get_children(parent['id'])
    return jsonify({
        "parent": parent,
        "children": children
    }), 200

@parents_bp.route('/api/parents/profile', methods=['PUT'])
@parent_required
def update_profile():
    """Update parent profile."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()

    if not name:
        return jsonify({
            "error": "Bad Request",
            "message": "Name cannot be empty."
        }), 400

    updated = ParentModel.update_profile(g.current_parent['id'], {
        "name": name,
        "phone": phone
    })

    return jsonify({
        "status": "success",
        "message": "Profile updated successfully!",
        "parent": updated
    }), 200

# ----------------------------------------------------
# CHILDREN ENDPOINTS (OWNERSHIP PROTECTED)
# ----------------------------------------------------

@parents_bp.route('/api/parents/children', methods=['GET'])
@parent_required
def get_children():
    """Get all children linked to authenticated parent."""
    children = ParentModel.get_children(g.current_parent['id'])
    return jsonify(children), 200

@parents_bp.route('/api/parents/children/<int:child_id>', methods=['GET'])
@parent_required
def get_child_details(child_id):
    """Get detailed information for a specific linked child."""
    parent_id = g.current_parent['id']
    
    # Ownership authorization check
    if not ParentModel.verify_child_ownership(parent_id, child_id):
        return jsonify({
            "error": "Forbidden",
            "message": "Access denied. You do not have permission to view this child's records."
        }), 403

    details = ParentModel.get_child_details(parent_id, child_id)
    if not details:
        return jsonify({
            "error": "Not Found",
            "message": "Child record not found."
        }), 404

    return jsonify(details), 200

@parents_bp.route('/api/parents/children/<int:child_id>/activities', methods=['GET'])
@parent_required
def get_child_activities(child_id):
    """Get recent activities for child (games completed & quizzes taken)."""
    parent_id = g.current_parent['id']
    
    if not ParentModel.verify_child_ownership(parent_id, child_id):
        return jsonify({
            "error": "Forbidden",
            "message": "Access denied. You do not have permission to view this child's activities."
        }), 403

    limit = request.args.get('limit', default=30, type=int)
    activities = ParentModel.get_child_activities(parent_id, child_id, limit=limit)
    return jsonify(activities), 200

@parents_bp.route('/api/parents/children/<int:child_id>/results', methods=['GET'])
@parent_required
def get_child_results(child_id):
    """Get quiz results for child."""
    parent_id = g.current_parent['id']
    
    if not ParentModel.verify_child_ownership(parent_id, child_id):
        return jsonify({
            "error": "Forbidden",
            "message": "Access denied. You do not have permission to view this child's quiz results."
        }), 403

    data = ParentModel.get_child_results(parent_id, child_id)
    return jsonify(data), 200

@parents_bp.route('/api/parents/children/<int:child_id>/progress', methods=['GET'])
@parent_required
def get_child_progress(child_id):
    """Get 7-category learning progress for child."""
    parent_id = g.current_parent['id']
    
    if not ParentModel.verify_child_ownership(parent_id, child_id):
        return jsonify({
            "error": "Forbidden",
            "message": "Access denied. You do not have permission to view this child's progress."
        }), 403

    data = ParentModel.get_child_progress(parent_id, child_id)
    return jsonify(data), 200

@parents_bp.route('/api/parents/children/<int:child_id>/achievements', methods=['GET'])
@parent_required
def get_child_achievements(child_id):
    """Get achievements and reward badges for child."""
    parent_id = g.current_parent['id']
    
    if not ParentModel.verify_child_ownership(parent_id, child_id):
        return jsonify({
            "error": "Forbidden",
            "message": "Access denied. You do not have permission to view this child's achievements."
        }), 403

    achievements = ParentModel.get_child_achievements(parent_id, child_id)
    return jsonify(achievements), 200

@parents_bp.route('/api/parents/link-child', methods=['POST'])
@parents_bp.route('/api/parent/link-child', methods=['POST'])
@parent_required
def link_child():
    """Connect an enrolled child to the authenticated parent."""
    try:
        data = request.get_json() or {}
        student_id = data.get('student_id')
        child_name = data.get('child_name', '').strip()
        parent_id = g.current_parent['id']

        target_student = None

        if student_id:
            try:
                target_student = StudentModel.get_by_id(int(student_id))
            except (ValueError, TypeError):
                pass
        elif child_name:
            matches = ParentModel.find_matching_students(student_name=child_name)
            if matches:
                target_student = StudentModel.get_by_id(matches[0]['id'])

        if not target_student:
            return jsonify({
                "error": "Not Found",
                "message": "No student found matching the provided student ID or name. Please verify with the school office."
            }), 404

        # Link student to parent
        ParentModel.link_student(parent_id, target_student['id'])
        updated_children = ParentModel.get_children(parent_id)

        return jsonify({
            "status": "success",
            "message": f"Successfully connected to your child, {target_student['name']}! 🌈",
            "child": target_student,
            "children": updated_children
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to connect child: {str(e)}"
        }), 500

