from flask import Blueprint, request, jsonify
from models.game import GameModel
from models.student import StudentModel

games_bp = Blueprint('games', __name__, url_prefix='/api/games')

@games_bp.route('', methods=['GET'])
def get_games():
    try:
        games = GameModel.get_all()
        return jsonify(games), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve games: {str(e)}"}), 500

@games_bp.route('/<int:game_id>', methods=['GET'])
def get_game(game_id):
    try:
        game = GameModel.get_by_id(game_id)
        if not game:
            return jsonify({"error": f"Game with ID {game_id} not found"}), 404
        return jsonify(game), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve game: {str(e)}"}), 500

@games_bp.route('/<int:game_id>/complete', methods=['POST'])
def complete_game(game_id):
    try:
        game = GameModel.get_by_id(game_id)
        if not game:
            return jsonify({"error": f"Game with ID {game_id} not found"}), 404

        data = request.get_json() or {}
        student_id = data.get('student_id')
        stars_earned = data.get('stars_earned', 3)

        if not student_id:
            return jsonify({"error": "student_id is required"}), 400

        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404

        result = GameModel.record_completion(student_id, game_id, stars_earned)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Failed to record game completion: {str(e)}"}), 500

@games_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_games(student_id):
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404
            
        completions = GameModel.get_student_completions(student_id)
        return jsonify(completions), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve student games: {str(e)}"}), 500
