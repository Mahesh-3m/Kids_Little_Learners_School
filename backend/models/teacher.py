from werkzeug.security import generate_password_hash
from database.db import fetch_all, fetch_one, execute_query

class TeacherModel:
    @staticmethod
    def get_by_id(teacher_id):
        """Fetch teacher profile without password hash."""
        query = "SELECT id, name, email, created_at FROM teachers WHERE id = %s"
        return fetch_one(query, (teacher_id,))

    @staticmethod
    def get_by_email(email):
        """Fetch teacher record including password hash for authentication."""
        query = "SELECT * FROM teachers WHERE email = %s"
        return fetch_one(query, (email,))

    @staticmethod
    def create(name, email, password):
        """Register a new teacher."""
        hashed = generate_password_hash(password)
        query = """
            INSERT INTO teachers (name, email, password_hash)
            VALUES (%s, %s, %s)
        """
        new_id = execute_query(query, (name, email, hashed), return_lastrowid=True)
        return TeacherModel.get_by_id(new_id)

    @staticmethod
    def get_stats():
        """Get school & student statistics for Teacher Dashboard."""
        # Total students
        total_students_res = fetch_one("SELECT COUNT(*) AS cnt FROM students")
        total_students = total_students_res["cnt"] if total_students_res else 0

        # Class breakdown
        class_counts = fetch_all("""
            SELECT class_name, COUNT(*) AS count
            FROM students
            GROUP BY class_name
        """)
        classes_map = {"Nursery": 0, "LKG": 0, "UKG": 0}
        for item in class_counts:
            if item.get("class_name") in classes_map:
                classes_map[item["class_name"]] = item.get("count", 0)

        # Total quizzes taken
        quiz_res = fetch_one("SELECT COUNT(*) AS cnt FROM results")
        total_quizzes = quiz_res["cnt"] if quiz_res else 0

        # Total games completed
        game_res = fetch_one("SELECT COUNT(*) AS cnt FROM game_completions")
        total_games = game_res["cnt"] if game_res else 0

        # Average score across all results
        avg_res = fetch_one("SELECT AVG(percentage) AS avg_score FROM results")
        avg_score = round(float(avg_res["avg_score"]), 1) if avg_res and avg_res.get("avg_score") is not None else 0.0

        return {
            "total_students": total_students,
            "classes": classes_map,
            "total_quizzes_taken": total_quizzes,
            "total_games_completed": total_games,
            "average_quiz_score": avg_score
        }
