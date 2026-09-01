from database.db import fetch_all, fetch_one

class ClassModel:
    @staticmethod
    def get_all():
        query = """
            SELECT c.*, COUNT(s.id) AS student_count
            FROM classes c
            LEFT JOIN students s ON c.class_name = s.class_name
            GROUP BY c.id, c.class_name, c.description, c.created_at
            ORDER BY c.id ASC
        """
        return fetch_all(query)

    @staticmethod
    def get_by_id(class_id):
        query = """
            SELECT c.*, COUNT(s.id) AS student_count
            FROM classes c
            LEFT JOIN students s ON c.class_name = s.class_name
            WHERE c.id = %s
            GROUP BY c.id, c.class_name, c.description, c.created_at
        """
        return fetch_one(query, (class_id,))

    @staticmethod
    def get_students_by_class_id(class_id):
        class_info = ClassModel.get_by_id(class_id)
        if not class_info:
            return None, []
        query = "SELECT * FROM students WHERE class_name = %s ORDER BY name ASC"
        students = fetch_all(query, (class_info['class_name'],))
        return class_info, students
