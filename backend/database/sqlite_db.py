import os
import re
import sqlite3
import datetime
from pathlib import Path
from werkzeug.security import generate_password_hash

DB_PATH = Path(__file__).resolve().parent.parent / "little_learners.db"

def get_sqlite_connection():
    """Create and return a configured SQLite connection."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    
    # Register MySQL compatible helper functions
    conn.create_function("LEAST", -1, lambda *args: min(a for a in args if a is not None))
    conn.create_function("GREATEST", -1, lambda *args: max(a for a in args if a is not None))
    conn.create_function("CONCAT", -1, lambda *args: "".join(str(a) for a in args if a is not None))
    conn.create_function("NOW", 0, lambda: datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    return conn

def translate_query(sql):
    """Translate MySQL-style SQL to SQLite-compatible SQL."""
    # 1. Replace %s placeholder with ?
    sql = sql.replace('%s', '?')
    
    # 2. Translate ON DUPLICATE KEY UPDATE patterns
    if 'ON DUPLICATE KEY UPDATE' in sql:
        table_conflict = "(student_id, category)"
        if "parent_students" in sql:
            table_conflict = "(parent_id, student_id)"
        elif "parents" in sql:
            table_conflict = "(email)"
        elif "classes" in sql:
            table_conflict = "(class_name)"
        elif "students" in sql:
            table_conflict = "(id)"

        match = re.search(r'ON DUPLICATE KEY UPDATE\s+(.*)', sql, flags=re.IGNORECASE | re.DOTALL)
        if match:
            clause = match.group(1).strip()
            normalized = re.sub(r'\s+', '', clause).lower()
            if normalized == 'progress_percentage=progress_percentage':
                sql = sql[:match.start()] + f"ON CONFLICT{table_conflict} DO NOTHING"
            elif 'relationship' in clause and 'parent' in clause.lower():
                sql = sql[:match.start()] + f"ON CONFLICT{table_conflict} DO UPDATE SET relationship = 'Parent'"
            else:
                clause = re.sub(r'VALUES\((\w+)\)', r'excluded.\1', clause, flags=re.IGNORECASE)
                if 'progress' in sql and '=' in clause:
                    target, expr = clause.split('=', 1)
                    expr = re.sub(r'(?<!excluded\.)(?<!progress\.)\bprogress_percentage\b', 'progress.progress_percentage', expr)
                    clause = f"{target.strip()} = {expr.strip()}"
                sql = sql[:match.start()] + f"ON CONFLICT{table_conflict} DO UPDATE SET {clause}"

    return sql

def init_sqlite_db():
    """Create all SQLite tables and seed data if not initialized yet."""
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    try:
        # 1. Classes Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Parents Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Students Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE,
                name TEXT NOT NULL,
                dob DATE NOT NULL,
                class_name TEXT NOT NULL,
                gender TEXT NOT NULL,
                parent_id INTEGER NULL,
                parent_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
            );
        """)

        # 4. Parent Students Junction Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parent_students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                relationship TEXT DEFAULT 'Parent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (parent_id, student_id),
                FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            );
        """)

        # 5. Games Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                icon TEXT DEFAULT '🎮',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 6. Quizzes Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                icon TEXT DEFAULT '📝',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 7. Questions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
            );
        """)

        # 8. Results Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                quiz_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage REAL NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
            );
        """)

        # 9. Progress Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                category TEXT NOT NULL,
                progress_percentage INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (student_id, category),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            );
        """)

        # 10. Game Completions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS game_completions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                game_id INTEGER NOT NULL,
                stars_earned INTEGER DEFAULT 3,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
            );
        """)

        # 11. Teachers Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 12. Products Table (Kids Store)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER DEFAULT 1,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image_url TEXT,
                stock INTEGER NOT NULL DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 13. Store Managers Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_managers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 14. Toy Selections Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS toy_selections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                student_name TEXT NOT NULL,
                student_class TEXT NOT NULL,
                product_name TEXT NOT NULL,
                product_category TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                price REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'Requested',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 15. Store Details Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_details (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                store_name TEXT NOT NULL DEFAULT 'Little Learners Official Kids Store',
                manager_name TEXT DEFAULT 'Store Manager Alex',
                email TEXT DEFAULT 'store@littlelearners.com',
                phone TEXT DEFAULT '+1 (555) 019-2834',
                location TEXT DEFAULT 'Main Campus, Early Learning Wing A - Ground Floor',
                operating_hours TEXT DEFAULT 'Monday – Friday: 8:00 AM – 4:00 PM',
                delivery_policy TEXT,
                storage_capacity TEXT DEFAULT 'Main Storage Warehouse: Books, Stationery, Sensory Toys, and Uniform Dresses',
                description TEXT,
                announcement TEXT DEFAULT '✨ All preschool store supplies & educational toys in stock for immediate classroom dispatch!',
                is_open INTEGER NOT NULL DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()

        # Check if seller_id column exists in products table
        try:
            cursor.execute("SELECT seller_id FROM products LIMIT 1")
        except Exception:
            try:
                cursor.execute("ALTER TABLE products ADD COLUMN seller_id INTEGER DEFAULT 1")
                cursor.execute("UPDATE products SET seller_id = 1 WHERE seller_id IS NULL")
                conn.commit()
            except Exception:
                pass

        # Check if database has been seeded
        cursor.execute("SELECT COUNT(*) AS cnt FROM classes")
        if cursor.fetchone()["cnt"] == 0:
            print("[SQLite] Seeding initial classes, games, quizzes, and sample students...")
            _seed_data(cursor)
            conn.commit()
            print("[SQLite] Database seeded successfully!")

    finally:
        cursor.close()
        conn.close()

def _seed_data(cursor):
    """Seed sample data into SQLite tables."""
    # 1. Classes
    cursor.executemany("""
        INSERT INTO classes (id, class_name, description) VALUES (?, ?, ?)
    """, [
        (1, 'Nursery', 'Early childhood playful learning, rhymes, sensory & motor development.'),
        (2, 'LKG', 'Lower Kindergarten: Basic alphabets, phonics, counting numbers 1-20, colors & shapes.'),
        (3, 'UKG', 'Upper Kindergarten: Word formation, numbers 1-50, basic addition, general awareness.')
    ])

    # 2. Parents (password: password123)
    default_pw_hash = generate_password_hash("password123")
    cursor.executemany("""
        INSERT INTO parents (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 'Rohit Sharma', 'parent@littlelearners.com', '9876543210', default_pw_hash),
        (2, 'Priya Verma', 'priya@littlelearners.com', '9811223344', default_pw_hash),
        (3, 'Suresh Patel', 'suresh@littlelearners.com', '9812345678', default_pw_hash),
        (4, 'Kishore Rao', 'kishore@littlelearners.com', '9988776655', default_pw_hash)
    ])

    # 3. Students
    cursor.executemany("""
        INSERT INTO students (id, name, dob, class_name, gender, parent_id, parent_name, phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, 'Aarav Sharma', '2021-04-15', 'Nursery', 'Male', 1, 'Rohit Sharma', '9876543210', 'Plot 12, Jubilee Hills, Hyderabad'),
        (2, 'Ananya Patel', '2020-08-22', 'LKG', 'Female', 3, 'Suresh Patel', '9812345678', 'Flat 304, Green Meadows, Bengaluru'),
        (3, 'Vivaan Rao', '2019-11-05', 'UKG', 'Male', 4, 'Kishore Rao', '9988776655', 'House 56, Banjara Hills, Hyderabad'),
        (4, 'Diya Sen', '2020-02-14', 'LKG', 'Female', 2, 'Priya Verma', '9811223344', 'Apt 12B, Lake View, Pune'),
        (5, 'Kabir Mehta', '2021-06-30', 'Nursery', 'Male', 2, 'Priya Verma', '9811223344', 'Villa 8, Sector 14, Gurugram')
    ])

    # 4. Parent Students Junction
    cursor.executemany("""
        INSERT INTO parent_students (parent_id, student_id, relationship) VALUES (?, ?, ?)
    """, [
        (1, 1, 'Parent'),
        (2, 4, 'Parent'),
        (2, 5, 'Parent'),
        (3, 2, 'Parent'),
        (4, 3, 'Parent')
    ])

    # 5. Games
    cursor.executemany("""
        INSERT INTO games (id, game_name, category, description, icon) VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 'Alphabet Adventure', 'Alphabet', 'Fun phonics, letter recognition and picture matching for little learners.', '🔤'),
        (2, 'Number Safari', 'Numbers', 'Count cheerful animals, balloons and stars to learn numbers 1 to 10.', '🔢'),
        (3, 'Rainbow Color Splash', 'Colors', 'Identify vibrant colors and match them to juicy fruits and everyday items.', '🎨'),
        (4, 'Shape Detective', 'Shapes', 'Discover Circles, Squares, Triangles, and Rectangles in funny daily objects.', '🔷'),
        (5, 'Jungle Friends', 'Animals', 'Meet friendly wild and domestic animals and learn their names and sounds.', '🦁')
    ])

    # 6. Quizzes
    cursor.executemany("""
        INSERT INTO quizzes (id, title, category, description, icon) VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 'Alphabet Fun Quiz', 'Alphabet', 'Test your knowledge of ABCs, vowels, and simple letter sequencing.', '🔤'),
        (2, 'Numbers & Counting Quiz', 'Numbers', 'Fun counting challenges and number sequencing questions for kids.', '🔢'),
        (3, 'Colors of the Rainbow', 'Colors', 'Identify bright colors and find out which color belongs to what item!', '🎨'),
        (4, 'Shapes & Patterns Quiz', 'Shapes', 'Can you spot the circle, square, triangle, and rectangle?', '🔷'),
        (5, 'Animal Kingdom Quiz', 'Animals', 'Discover cute animal names, sounds, and their favorite foods.', '🦁'),
        (6, 'Smart Little Champ Quiz', 'General Learning', 'A mix of fun general knowledge and sensory questions for little champions.', '🌟')
    ])

    # 7. Questions
    questions = [
        # Quiz 1
        (1, 'Which letter comes after A in the alphabet?', 'B', 'C', 'D', 'E', 'B'),
        (1, 'Which letter is for "Apple"?', 'B', 'M', 'A', 'Z', 'A'),
        (1, 'Which letter comes before D?', 'A', 'B', 'C', 'E', 'C'),
        (1, 'What is the last letter of the alphabet?', 'X', 'Y', 'W', 'Z', 'Z'),
        (1, 'Which word starts with the letter "C"?', 'Dog', 'Cat', 'Ball', 'Elephant', 'Cat'),
        # Quiz 2
        (2, 'How many suns are there in our sky during the day?', '1', '2', '3', '5', '1'),
        (2, 'Which number comes right after 4?', '3', '5', '6', '7', '5'),
        (2, 'How many fingers do you have on one hand?', '4', '6', '5', '10', '5'),
        (2, 'What is 1 + 1?', '1', '2', '3', '4', '2'),
        (2, 'Which number is smaller: 2 or 8?', '8', '2', 'Both same', 'None', '2'),
        # Quiz 3
        (3, 'What color is a ripe red strawberry?', 'Red', 'Blue', 'Green', 'Yellow', 'Red'),
        (3, 'What color is the bright sun in the morning sky?', 'Purple', 'Yellow', 'Black', 'Pink', 'Yellow'),
        (3, 'What color are fresh green leaves on trees?', 'Red', 'Green', 'Orange', 'White', 'Green'),
        (3, 'What color is the clear sky on a sunny day?', 'Blue', 'Brown', 'Grey', 'Yellow', 'Blue'),
        (3, 'Which color do you get by mixing Red and Yellow?', 'Orange', 'Blue', 'Black', 'White', 'Orange'),
        # Quiz 4
        (4, 'What shape is a round football or a clock?', 'Square', 'Circle', 'Triangle', 'Rectangle', 'Circle'),
        (4, 'How many corners does a triangle have?', '2', '3', '4', '5', '3'),
        (4, 'What shape has 4 equal straight sides?', 'Square', 'Circle', 'Oval', 'Cylinder', 'Square'),
        (4, 'What shape is a slice of pizza?', 'Triangle', 'Square', 'Circle', 'Cube', 'Triangle'),
        (4, 'What shape looks like an elongated box or a door?', 'Rectangle', 'Circle', 'Star', 'Diamond', 'Rectangle'),
        # Quiz 5
        (5, 'Who is known as the "King of the Jungle"?', 'Tiger', 'Lion', 'Elephant', 'Monkey', 'Lion'),
        (5, 'Which cute animal says "Meow Meow"?', 'Dog', 'Cat', 'Cow', 'Duck', 'Cat'),
        (5, 'Which animal has a very long trunk and big ears?', 'Elephant', 'Giraffe', 'Horse', 'Rabbit', 'Elephant'),
        (5, 'Which animal gives us fresh healthy milk and says "Moo"?', 'Cow', 'Lion', 'Frog', 'Bear', 'Cow'),
        (5, 'Which animal loves to eat sweet yellow bananas and swings on trees?', 'Monkey', 'Fish', 'Penguin', 'Camel', 'Monkey'),
        # Quiz 6
        (6, 'We see with our...', 'Ears', 'Nose', 'Eyes', 'Hands', 'Eyes'),
        (6, 'We use our mouth to...', 'Listen', 'Eat and Speak', 'Walk', 'See', 'Eat and Speak'),
        (6, 'What do you say when someone gives you a gift?', 'Sorry', 'Thank You', 'Goodbye', 'No', 'Thank You'),
        (6, 'Which is a healthy fruit?', 'Apple', 'Plastic cup', 'Shoe', 'Rock', 'Apple'),
        (6, 'When do we see stars and the glowing moon in the sky?', 'Morning', 'Afternoon', 'Night', 'Noon', 'Night')
    ]
    cursor.executemany("""
        INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, questions)

    # 8. Results
    cursor.executemany("""
        INSERT INTO results (student_id, quiz_id, score, total_questions, percentage)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, 4, 5, 80.0),
        (2, 2, 5, 5, 100.0),
        (2, 3, 4, 5, 80.0),
        (3, 4, 4, 5, 80.0),
        (3, 5, 5, 5, 100.0),
        (4, 1, 3, 5, 60.0),
        (4, 3, 5, 5, 100.0)
    ])

    # 9. Progress
    cursor.executemany("""
        INSERT INTO progress (student_id, category, progress_percentage)
        VALUES (?, ?, ?)
    """, [
        (1, 'Alphabet', 80), (1, 'Numbers', 60), (1, 'Colors', 70),
        (1, 'Shapes', 50), (1, 'Animals', 90), (1, 'Quiz', 80), (1, 'Games', 75),
        (2, 'Alphabet', 90), (2, 'Numbers', 100), (2, 'Colors', 85),
        (2, 'Shapes', 70), (2, 'Animals', 65), (2, 'Quiz', 90), (2, 'Games', 80),
        (3, 'Alphabet', 70), (3, 'Numbers', 75), (3, 'Colors', 80),
        (3, 'Shapes', 85), (3, 'Animals', 95), (3, 'Quiz', 85), (3, 'Games', 85),
        (4, 'Alphabet', 60), (4, 'Numbers', 55), (4, 'Colors', 100),
        (4, 'Shapes', 65), (4, 'Animals', 70), (4, 'Quiz', 75), (4, 'Games', 60),
        (5, 'Alphabet', 85), (5, 'Numbers', 80), (5, 'Colors', 90),
        (5, 'Shapes', 75), (5, 'Animals', 85), (5, 'Quiz', 80), (5, 'Games', 70)
    ])

    # 10. Game Completions
    cursor.executemany("""
        INSERT INTO game_completions (student_id, game_id, stars_earned)
        VALUES (?, ?, ?)
    """, [
        (1, 1, 3), (1, 2, 3), (1, 3, 2),
        (4, 1, 3), (4, 4, 3),
        (5, 2, 3), (5, 3, 2)
    ])

def fetch_all_sqlite(query, params=None):
    """Execute SELECT on SQLite and return list of dicts."""
    sql = translate_query(query)
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        cursor.close()
        conn.close()

def fetch_one_sqlite(query, params=None):
    """Execute SELECT on SQLite and return single dict or None."""
    sql = translate_query(query)
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        cursor.close()
        conn.close()

def execute_sqlite_query(query, params=None, return_lastrowid=False):
    """Execute INSERT/UPDATE/DELETE on SQLite."""
    sql = translate_query(query)
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        conn.commit()
        if return_lastrowid:
            return cursor.lastrowid
        return cursor.rowcount
    finally:
        cursor.close()
        conn.close()
