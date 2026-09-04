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
            query += " AND (name LIKE %s OR student_id LIKE %s OR parent_name LIKE %s OR phone LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
        query += " ORDER BY id DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_id(student_id):
        query = "SELECT * FROM students WHERE id = %s"
        return fetch_one(query, (student_id,))

    @staticmethod
    def get_by_student_id(code):
        """Lookup student by their official Student ID (e.g. LL-001) or row ID."""
        if not code:
            return None
        code_str = str(code).strip()
        # 1. Exact or case-insensitive match on student_id
        student = fetch_one("SELECT * FROM students WHERE student_id = %s OR LOWER(student_id) = LOWER(%s)", (code_str, code_str))
        if student:
            return student
        # 2. Match without hyphens (e.g. LL001 -> LL-001)
        if code_str.upper().startswith("LL") and "-" not in code_str and len(code_str) > 2:
            formatted = f"LL-{code_str[2:]}"
            student = fetch_one("SELECT * FROM students WHERE student_id = %s", (formatted,))
            if student:
                return student
        # 3. Numeric ID fallback (e.g. "1" -> LL-001 or id=1)
        if code_str.isdigit():
            num = int(code_str)
            formatted_num = f"LL-{num:03d}"
            student = fetch_one("SELECT * FROM students WHERE student_id = %s OR id = %s", (formatted_num, num))
            if student:
                return student
        return None

    @staticmethod
    def get_by_class(class_name):
        query = "SELECT * FROM students WHERE class_name = %s ORDER BY name ASC"
        return fetch_all(query, (class_name,))

    @staticmethod
    def create(data):
        custom_student_id = data.get('student_id', '').strip() or None

        query = """
            INSERT INTO students (student_id, name, dob, class_name, gender, parent_name, phone, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            custom_student_id,
            data.get('name'),
            data.get('dob'),
            data.get('class_name'),
            data.get('gender'),
            data.get('parent_name'),
            data.get('phone'),
            data.get('address')
        )
        new_id = execute_query(query, params, return_lastrowid=True)

        # If student_id was not provided, auto-assign standardized LL-{id:03d}
        if not custom_student_id:
            auto_code = f"LL-{new_id:03d}"
            execute_query("UPDATE students SET student_id = %s WHERE id = %s", (auto_code, new_id))

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
        custom_student_id = data.get('student_id')
        if custom_student_id:
            custom_student_id = str(custom_student_id).strip()

        if custom_student_id is not None:
            query = """
                UPDATE students
                SET student_id = %s, name = %s, dob = %s, class_name = %s, gender = %s,
                    parent_name = %s, phone = %s, address = %s
                WHERE id = %s
            """
            params = (
                custom_student_id,
                data.get('name'),
                data.get('dob'),
                data.get('class_name'),
                data.get('gender'),
                data.get('parent_name'),
                data.get('phone'),
                data.get('address'),
                student_id
            )
        else:
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

