from flask import Blueprint, request, jsonify
from models.quiz import QuizModel
from models.result import ResultModel
from models.student import StudentModel

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')

@quiz_bp.route('', methods=['GET'], strict_slashes=False)
@quiz_bp.route('/', methods=['GET'], strict_slashes=False)
def get_quizzes():
    try:
        quizzes = QuizModel.get_all()
        return jsonify(quizzes), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve quizzes: {str(e)}"}), 500

@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        quiz = QuizModel.get_by_id(quiz_id)
        if not quiz:
            return jsonify({"error": f"Quiz with ID {quiz_id} not found"}), 404
        return jsonify(quiz), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve quiz: {str(e)}"}), 500

@quiz_bp.route('/results', methods=['POST'])
def submit_quiz_result():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON body provided"}), 400

        student_id = data.get('student_id')
        quiz_id = data.get('quiz_id')
        score = data.get('score')
        total_questions = data.get('total_questions')
        percentage = data.get('percentage')

        if student_id is None or quiz_id is None or score is None or total_questions is None:
            return jsonify({"error": "Missing required fields: student_id, quiz_id, score, total_questions"}), 400

        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        quiz = QuizModel.get_by_id(quiz_id)
        if not quiz:
            return jsonify({"error": f"Quiz with ID {quiz_id} not found"}), 404

        result = ResultModel.create(
            student_id=student_id,
            quiz_id=quiz_id,
            score=int(score),
            total_questions=int(total_questions),
            percentage=float(percentage) if percentage is not None else None
        )
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": f"Failed to submit quiz result: {str(e)}"}), 500
