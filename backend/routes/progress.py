from flask import Blueprint, request, jsonify
from models.progress import ProgressModel
from models.student import StudentModel

progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')

@progress_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_progress(student_id):
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        progress = ProgressModel.get_by_student(student_id)
        return jsonify(progress), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve progress for student {student_id}: {str(e)}"}), 500

@progress_bp.route('/student/<int:student_id>', methods=['PUT'])
def update_student_progress(student_id):
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        data = request.get_json() or {}
        category = data.get('category')
        progress_percentage = data.get('progress_percentage')

        if not category or progress_percentage is None:
            return jsonify({"error": "Missing required fields: category, progress_percentage"}), 400

        updated_progress = ProgressModel.upsert(student_id, category, progress_percentage)
        return jsonify(updated_progress), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update progress: {str(e)}"}), 500

@progress_bp.route('/summary', methods=['GET'])
@progress_bp.route('', methods=['GET'])
def get_progress_summary():
    try:
        summaries = ProgressModel.get_all_summary()
        return jsonify(summaries), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve progress summaries: {str(e)}"}), 500
