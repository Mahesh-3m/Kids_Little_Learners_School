from flask import Blueprint, request, jsonify
from models.result import ResultModel
from models.student import StudentModel

results_bp = Blueprint('results', __name__, url_prefix='/api/results')

@results_bp.route('', methods=['GET'], strict_slashes=False)
@results_bp.route('/', methods=['GET'], strict_slashes=False)
def get_results():
    try:
        student_id = request.args.get('student_id')
        quiz_id = request.args.get('quiz_id')
        category = request.args.get('category')
        
        results = ResultModel.get_all(
            student_id=student_id,
            quiz_id=quiz_id,
            category=category
        )
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve results: {str(e)}"}), 500

@results_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_results(student_id):
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        results = ResultModel.get_by_student(student_id)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve results for student {student_id}: {str(e)}"}), 500
