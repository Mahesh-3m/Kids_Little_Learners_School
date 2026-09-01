from flask import Blueprint, request, jsonify
from models.student import StudentModel

students_bp = Blueprint('students', __name__, url_prefix='/api/students')

@students_bp.route('', methods=['GET'])
def get_students():
    try:
        class_name = request.args.get('class_name')
        search = request.args.get('search')
        students = StudentModel.get_all(class_name=class_name, search=search)
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve students: {str(e)}"}), 500

@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404
        return jsonify(student), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve student: {str(e)}"}), 500

@students_bp.route('/class/<string:class_name>', methods=['GET'])
def get_students_by_class(class_name):
    try:
        students = StudentModel.get_by_class(class_name)
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve students for class {class_name}: {str(e)}"}), 500

@students_bp.route('', methods=['POST'])
def add_student():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON body provided"}), 400

        # Required fields validation
        required_fields = ['name', 'dob', 'class_name', 'gender', 'parent_name', 'phone', 'address']
        missing_fields = [field for field in required_fields if not data.get(field) or str(data.get(field)).strip() == '']
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Validate class_name
        valid_classes = ['Nursery', 'LKG', 'UKG']
        if data['class_name'] not in valid_classes:
            return jsonify({"error": f"Invalid class_name. Must be one of: {', '.join(valid_classes)}"}), 400

        new_student = StudentModel.create(data)
        return jsonify(new_student), 201
    except Exception as e:
        return jsonify({"error": f"Failed to add student: {str(e)}"}), 500

@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        existing = StudentModel.get_by_id(student_id)
        if not existing:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON body provided"}), 400

        required_fields = ['name', 'dob', 'class_name', 'gender', 'parent_name', 'phone', 'address']
        missing_fields = [field for field in required_fields if not data.get(field) or str(data.get(field)).strip() == '']
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        updated_student = StudentModel.update(student_id, data)
        return jsonify(updated_student), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update student: {str(e)}"}), 500

@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        existing = StudentModel.get_by_id(student_id)
        if not existing:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        success = StudentModel.delete(student_id)
        if success:
            return jsonify({"message": f"Student {existing.get('name', '')} (ID: {student_id}) deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete student"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to delete student: {str(e)}"}), 500
