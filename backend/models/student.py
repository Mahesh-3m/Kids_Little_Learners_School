from database.db import fetch_all, fetch_one, execute_query

class StudentModel:
    @staticmethod
    def get_all(class_name=None, search=None):
        query = "SELECT * FROM students WHERE 1=1"
        params = []
        if class_name and class_name.lower() != 'all':
            query += " AND class_name = %s"
            params.append(class_name)
        if search:
            query += " AND (name LIKE %s OR parent_name LIKE %s OR phone LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
        query += " ORDER BY id DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_id(student_id):
        query = "SELECT * FROM students WHERE id = %s"
        return fetch_one(query, (student_id,))

    @staticmethod
    def get_by_class(class_name):
        query = "SELECT * FROM students WHERE class_name = %s ORDER BY name ASC"
        return fetch_all(query, (class_name,))

    @staticmethod
    def create(data):
        query = """
            INSERT INTO students (name, dob, class_name, gender, parent_name, phone, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data.get('name'),
            data.get('dob'),
            data.get('class_name'),
            data.get('gender'),
            data.get('parent_name'),
            data.get('phone'),
            data.get('address')
        )
        new_id = execute_query(query, params, return_lastrowid=True)
        # Initialize default progress categories for new student
        categories = ['Alphabet', 'Numbers', 'Colors', 'Shapes', 'Animals', 'Quiz', 'Games']
        for cat in categories:
            execute_query(
                "INSERT INTO progress (student_id, category, progress_percentage) VALUES (%s, %s, 0) ON DUPLICATE KEY UPDATE progress_percentage=progress_percentage",
                (new_id, cat)
            )
        return StudentModel.get_by_id(new_id)

    @staticmethod
    def update(student_id, data):
        query = """
            UPDATE students
            SET name = %s, dob = %s, class_name = %s, gender = %s,
                parent_name = %s, phone = %s, address = %s
            WHERE id = %s
        """
        params = (
            data.get('name'),
            data.get('dob'),
            data.get('class_name'),
            data.get('gender'),
            data.get('parent_name'),
            data.get('phone'),
            data.get('address'),
            student_id
        )
        execute_query(query, params)
        return StudentModel.get_by_id(student_id)

    @staticmethod
    def delete(student_id):
        student = StudentModel.get_by_id(student_id)
        if not student:
            return False
        execute_query("DELETE FROM students WHERE id = %s", (student_id,))
        return True
