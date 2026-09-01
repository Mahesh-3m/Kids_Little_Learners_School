from database.db import fetch_all, fetch_one, execute_query
from models.quiz import QuizModel

class ResultModel:
    @staticmethod
    def get_all(student_id=None, quiz_id=None, category=None):
        query = """
            SELECT r.*, s.name AS student_name, s.class_name, q.title AS quiz_title, q.category
            FROM results r
            JOIN students s ON r.student_id = s.id
            JOIN quizzes q ON r.quiz_id = q.id
            WHERE 1=1
        """
        params = []
        if student_id:
            query += " AND r.student_id = %s"
            params.append(student_id)
        if quiz_id:
            query += " AND r.quiz_id = %s"
            params.append(quiz_id)
        if category:
            query += " AND q.category = %s"
            params.append(category)
            
        query += " ORDER BY r.completed_at DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_student(student_id):
        return ResultModel.get_all(student_id=student_id)

    @staticmethod
    def create(student_id, quiz_id, score, total_questions, percentage=None):
        if percentage is None and total_questions > 0:
            percentage = round((score / total_questions) * 100, 2)

        insert_query = """
            INSERT INTO results (student_id, quiz_id, score, total_questions, percentage)
            VALUES (%s, %s, %s, %s, %s)
        """
        result_id = execute_query(insert_query, (student_id, quiz_id, score, total_questions, percentage), return_lastrowid=True)

        # Update category progress and Quiz progress
        quiz = QuizModel.get_by_id(quiz_id)
        if quiz:
            category = quiz.get('category')
            # Update specific category progress (take max or weighted average)
            cat_query = """
                INSERT INTO progress (student_id, category, progress_percentage)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                progress_percentage = GREATEST(progress_percentage, VALUES(progress_percentage))
            """
            execute_query(cat_query, (student_id, category, int(percentage)))

            # Update 'Quiz' category progress
            quiz_cat_query = """
                INSERT INTO progress (student_id, category, progress_percentage)
                VALUES (%s, 'Quiz', %s)
                ON DUPLICATE KEY UPDATE 
                progress_percentage = GREATEST(progress_percentage, VALUES(progress_percentage))
            """
            execute_query(quiz_cat_query, (student_id, int(percentage)))

        return {
            "id": result_id,
            "student_id": student_id,
            "quiz_id": quiz_id,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage
        }
