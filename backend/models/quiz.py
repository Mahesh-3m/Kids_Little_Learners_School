from database.db import fetch_all, fetch_one

class QuizModel:
    @staticmethod
    def get_all():
        query = """
            SELECT q.*, COUNT(ques.id) AS question_count
            FROM quizzes q
            LEFT JOIN questions ques ON q.id = ques.quiz_id
            GROUP BY q.id, q.title, q.category, q.description, q.icon, q.created_at
            ORDER BY q.id ASC
        """
        return fetch_all(query)

    @staticmethod
    def get_by_id(quiz_id):
        query = "SELECT * FROM quizzes WHERE id = %s"
        quiz = fetch_one(query, (quiz_id,))
        if not quiz:
            return None
        questions_query = "SELECT * FROM questions WHERE quiz_id = %s ORDER BY id ASC"
        quiz['questions'] = fetch_all(questions_query, (quiz_id,))
        return quiz

    @staticmethod
    def get_questions_by_quiz_id(quiz_id):
        query = "SELECT * FROM questions WHERE quiz_id = %s ORDER BY id ASC"
        return fetch_all(query, (quiz_id,))
