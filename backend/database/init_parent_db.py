import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from werkzeug.security import generate_password_hash
from database.db import get_db_connection, execute_query, fetch_all, fetch_one

def init_parent_tables():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        print("[DB] Initializing Parent Dashboard tables...")

        # 1. Create parents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        """)
        print("  - Table 'parents' verified/created.")

        # 2. Add parent_id column to students table if not present
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'students' 
              AND COLUMN_NAME = 'parent_id';
        """)
        col = cursor.fetchone()
        if not col:
            cursor.execute("""
                ALTER TABLE students 
                ADD COLUMN parent_id INT NULL AFTER gender;
            """)
            print("  - Added 'parent_id' column to 'students' table.")
        else:
            print("  - Column 'parent_id' already exists in 'students' table.")

        # 3. Create parent_students junction table for multi-parent / multi-child support
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS parent_students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parent_id INT NOT NULL,
                student_id INT NOT NULL,
                relationship VARCHAR(50) DEFAULT 'Parent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_parent_student (parent_id, student_id),
                FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        """)
        print("  - Table 'parent_students' verified/created.")

        # 4. Seed sample parent accounts
        sample_parents = [
            {
                "id": 1,
                "name": "Rohit Sharma",
                "email": "parent@littlelearners.com",
                "phone": "9876543210",
                "password": "password123",
                "children_ids": [1] # Aarav Sharma
            },
            {
                "id": 2,
                "name": "Priya Verma",
                "email": "priya@littlelearners.com",
                "phone": "9811223344",
                "password": "password123",
                "children_ids": [4, 5] # Diya Sen, Kabir Mehta (Multi-child parent demo)
            },
            {
                "id": 3,
                "name": "Suresh Patel",
                "email": "suresh@littlelearners.com",
                "phone": "9812345678",
                "password": "password123",
                "children_ids": [2] # Ananya Patel
            },
            {
                "id": 4,
                "name": "Kishore Rao",
                "email": "kishore@littlelearners.com",
                "phone": "9988776655",
                "password": "password123",
                "children_ids": [3] # Vivaan Rao
            }
        ]

        for p in sample_parents:
            hashed_pw = generate_password_hash(p["password"])
            
            # Check if parent exists by email
            cursor.execute("SELECT id FROM parents WHERE email = %s", (p["email"],))
            existing = cursor.fetchone()
            if existing:
                parent_id = existing["id"]
                cursor.execute(
                    "UPDATE parents SET name = %s, phone = %s, password_hash = %s WHERE id = %s",
                    (p["name"], p["phone"], hashed_pw, parent_id)
                )
            else:
                cursor.execute(
                    "INSERT INTO parents (name, email, phone, password_hash) VALUES (%s, %s, %s, %s)",
                    (p["name"], p["email"], p["phone"], hashed_pw)
                )
                parent_id = cursor.lastrowid

            # Link children
            for child_id in p["children_ids"]:
                # Check student exists
                cursor.execute("SELECT id FROM students WHERE id = %s", (child_id,))
                student = cursor.fetchone()
                if student:
                    # Update students.parent_id
                    cursor.execute("UPDATE students SET parent_id = %s WHERE id = %s", (parent_id, child_id))
                    # Insert into parent_students
                    cursor.execute("""
                        INSERT INTO parent_students (parent_id, student_id, relationship)
                        VALUES (%s, %s, 'Parent')
                        ON DUPLICATE KEY UPDATE relationship = 'Parent'
                    """, (parent_id, child_id))

        conn.commit()
        print("[DB] Parent accounts and relationships seeded successfully!")

        # 5. Ensure sample activities exist for linked children
        cursor.execute("SELECT COUNT(*) AS cnt FROM game_completions WHERE student_id = 1")
        if cursor.fetchone()["cnt"] < 2:
            cursor.execute("INSERT INTO game_completions (student_id, game_id, stars_earned) VALUES (1, 1, 3), (1, 2, 3), (1, 3, 2)")
        
        cursor.execute("SELECT COUNT(*) AS cnt FROM game_completions WHERE student_id = 4")
        if cursor.fetchone()["cnt"] < 2:
            cursor.execute("INSERT INTO game_completions (student_id, game_id, stars_earned) VALUES (4, 1, 3), (4, 4, 3)")

        cursor.execute("SELECT COUNT(*) AS cnt FROM game_completions WHERE student_id = 5")
        if cursor.fetchone()["cnt"] < 2:
            cursor.execute("INSERT INTO game_completions (student_id, game_id, stars_earned) VALUES (5, 2, 3), (5, 3, 2)")

        cursor.execute("SELECT COUNT(*) AS cnt FROM results WHERE student_id = 5")
        if cursor.fetchone()["cnt"] == 0:
            cursor.execute("INSERT INTO results (student_id, quiz_id, score, total_questions, percentage) VALUES (5, 1, 5, 5, 100.00), (5, 2, 4, 5, 80.00)")

        cursor.execute("SELECT COUNT(*) AS cnt FROM results WHERE student_id = 4")
        if cursor.fetchone()["cnt"] < 2:
            cursor.execute("INSERT INTO results (student_id, quiz_id, score, total_questions, percentage) VALUES (4, 2, 4, 5, 80.00), (4, 4, 5, 5, 100.00)")

        conn.commit()
        print("[DB] Sample child activities and results verified.")

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_parent_tables()
