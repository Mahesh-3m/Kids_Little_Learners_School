from flask import Blueprint, jsonify
from models.class_model import ClassModel

classes_bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@classes_bp.route('', methods=['GET'], strict_slashes=False)
@classes_bp.route('/', methods=['GET'], strict_slashes=False)
def get_classes():
    try:
        classes_data = ClassModel.get_all()
        return jsonify(classes_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve classes: {str(e)}"}), 500

@classes_bp.route('/<int:class_id>', methods=['GET'])
def get_class(class_id):
    try:
        class_data = ClassModel.get_by_id(class_id)
        if not class_data:
            return jsonify({"error": f"Class with ID {class_id} not found"}), 404
        return jsonify(class_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve class: {str(e)}"}), 500

@classes_bp.route('/<int:class_id>/students', methods=['GET'])
def get_class_students(class_id):
    try:
        class_info, students = ClassModel.get_students_by_class_id(class_id)
        if not class_info:
            return jsonify({"error": f"Class with ID {class_id} not found"}), 404
        return jsonify({
            "class": class_info,
            "students": students
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve students for class {class_id}: {str(e)}"}), 500
