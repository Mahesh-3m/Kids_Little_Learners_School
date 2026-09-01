from database.db import fetch_all, fetch_one, execute_query
from models.student import StudentModel

ALL_CATEGORIES = ['Alphabet', 'Numbers', 'Colors', 'Shapes', 'Animals', 'Quiz', 'Games']

CATEGORY_ICONS = {
    'Alphabet': '🔤',
    'Numbers': '🔢',
    'Colors': '🎨',
    'Shapes': '🔷',
    'Animals': '🦁',
    'Quiz': '📝',
    'Games': '🎮'
}

class ProgressModel:
    @staticmethod
    def get_by_student(student_id):
        student = StudentModel.get_by_id(student_id)
        if not student:
            return None

        # Fetch existing progress records
        query = "SELECT category, progress_percentage, updated_at FROM progress WHERE student_id = %s"
        db_records = fetch_all(query, (student_id,))
        progress_map = {r['category']: r['progress_percentage'] for r in db_records}

        # Build full category list with defaults
        categories_data = []
        total_percentage = 0
        for cat in ALL_CATEGORIES:
            pct = progress_map.get(cat, 0)
            total_percentage += pct
            categories_data.append({
                'category': cat,
                'progress_percentage': pct,
                'icon': CATEGORY_ICONS.get(cat, '⭐')
            })

        overall_percentage = round(total_percentage / len(ALL_CATEGORIES), 1) if ALL_CATEGORIES else 0

        # Also get summary counts
        results_count_q = "SELECT COUNT(*) AS total_quizzes, COALESCE(AVG(percentage), 0) AS avg_score FROM results WHERE student_id = %s"
        results_stats = fetch_one(results_count_q, (student_id,))
        
        games_count_q = "SELECT COUNT(*) AS total_games, COALESCE(SUM(stars_earned), 0) AS total_stars FROM game_completions WHERE student_id = %s"
        games_stats = fetch_one(games_count_q, (student_id,))

        return {
            'student': student,
            'categories': categories_data,
            'overall_percentage': overall_percentage,
            'quizzes_completed': results_stats['total_quizzes'] if results_stats else 0,
            'average_quiz_score': round(results_stats['avg_score'], 1) if results_stats else 0,
            'games_completed': games_stats['total_games'] if games_stats else 0,
            'stars_earned': int(games_stats['total_stars']) if games_stats and games_stats['total_stars'] else 0
        }

    @staticmethod
    def upsert(student_id, category, progress_percentage):
        progress_percentage = max(0, min(100, int(progress_percentage)))
        query = """
            INSERT INTO progress (student_id, category, progress_percentage)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage)
        """
        execute_query(query, (student_id, category, progress_percentage))
        return ProgressModel.get_by_student(student_id)

    @staticmethod
    def get_all_summary():
        students = StudentModel.get_all()
        summaries = []
        for s in students:
            prog = ProgressModel.get_by_student(s['id'])
            if prog:
                summaries.append(prog)
        return summaries
