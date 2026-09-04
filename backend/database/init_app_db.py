import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database.db import get_active_backend, get_db_connection
from database.sqlite_db import init_sqlite_db

def init_required_tables():
    """Ensure teachers and products tables exist without modifying existing records."""
    active_backend = get_active_backend()
    if active_backend == 'sqlite':
        init_sqlite_db()
        return

    # MySQL initialization
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Teachers Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 2. Products Table (Kids Store)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image_url VARCHAR(500),
                stock INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 3. Store Managers Table (Store Admin)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_managers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 4. Toy & Product Selections Table (Kids Toy Selections)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS toy_selections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parent_id INT NOT NULL,
                student_id INT NOT NULL,
                product_id INT NOT NULL,
                student_name VARCHAR(100) NOT NULL,
                student_class VARCHAR(50) NOT NULL,
                product_name VARCHAR(150) NOT NULL,
                product_category VARCHAR(50) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Requested',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # Seed default Store Manager if none exists
        cursor.execute("SELECT COUNT(*) AS cnt FROM store_managers")
        res = cursor.fetchone()
        cnt = res['cnt'] if isinstance(res, dict) else res[0]
        if cnt == 0:
            from werkzeug.security import generate_password_hash
            default_pw = generate_password_hash("Manager@123")
            cursor.execute("""
                INSERT INTO store_managers (name, email, password_hash)
                VALUES (%s, %s, %s)
            """, ("Store Manager Alex", "manager@littlelearners.com", default_pw))
            print("[DB] Default store manager seeded: manager@littlelearners.com / Manager@123")

        # Seed sample store products if none exist
        cursor.execute("SELECT COUNT(*) AS cnt FROM products")
        res_prod = cursor.fetchone()
        prod_cnt = res_prod['cnt'] if isinstance(res_prod, dict) else res_prod[0]
        if prod_cnt == 0:
            sample_products = [
                ("Wooden Phonics Puzzle Board", "Toys", "Eco-friendly wooden alphabet peg puzzle for tactile letter learning and hand-eye coordination.", 18.99, "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=80", 25),
                ("Counting Bear Balance Scale Toy", "Toys", "Interactive educational math game with colorful miniature bears and balance weights.", 24.50, "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=80", 18),
                ("Sensory Building Blocks Set", "Toys", "Soft BPA-free textured sensory blocks that squeak and stack safely for nursery toddlers.", 21.00, "https://images.unsplash.com/photo-1575364289437-fb1479d52732?w=500&auto=format&fit=crop&q=80", 30),
                ("Early Explorers Picture Dictionary", "Books", "Richly illustrated 500-word picture book covering daily vocabulary, animals, and colors.", 14.95, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80", 40),
                ("My First Bedtime Nursery Rhymes", "Books", "Hardcover classic illustrated collection of soothing nursery rhymes and bedtime tales.", 12.50, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80", 35),
                ("Jumbo Triangular Toddler Crayons (24 Pack)", "Stationery", "Non-toxic easy-grip ergonomic crayons designed specifically for small preschool hands.", 8.99, "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=80", 60),
                ("Washable Finger Paint Studio (6 Tubs)", "Stationery", "Vibrant, ultra-washable skin-safe tempera paints for creative sensory art sessions.", 15.75, "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=500&auto=format&fit=crop&q=80", 28),
                ("Little Learners Cheerful School Smock", "Dresses", "Waterproof long-sleeve protective painting smock with front pockets for messy play.", 16.99, "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop&q=80", 22),
                ("Preschool Graduation Cap & Gown Set", "Dresses", "Premium royal blue graduation set with golden tassel for nursery & UKG milestones.", 29.99, "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80", 15)
            ]
            cursor.executemany("""
                INSERT INTO products (name, category, description, price, image_url, stock)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, sample_products)
        # 5. Store Details Table (Store Manager Profile & Settings)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                store_name VARCHAR(150) NOT NULL DEFAULT 'Little Learners Official Kids Store',
                manager_name VARCHAR(100) DEFAULT 'Store Manager Alex',
                email VARCHAR(100) DEFAULT 'store@littlelearners.com',
                phone VARCHAR(50) DEFAULT '+1 (555) 019-2834',
                location VARCHAR(250) DEFAULT 'Main Campus, Early Learning Wing A - Ground Floor',
                operating_hours VARCHAR(150) DEFAULT 'Monday – Friday: 8:00 AM – 4:00 PM',
                delivery_policy TEXT,
                storage_capacity VARCHAR(200) DEFAULT 'Main Storage Warehouse: Books, Stationery, Sensory Toys, and Uniform Dresses',
                description TEXT,
                announcement VARCHAR(300) DEFAULT '✨ All preschool store supplies & educational toys in stock for immediate classroom dispatch!',
                is_open TINYINT(1) NOT NULL DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # Check and populate default store details
        cursor.execute("SELECT COUNT(*) AS cnt FROM store_details")
        res_sd = cursor.fetchone()
        sd_cnt = res_sd['cnt'] if isinstance(res_sd, dict) else res_sd[0]
        if sd_cnt == 0:
            cursor.execute("""
                INSERT INTO store_details (
                    store_name, manager_name, email, phone, location,
                    operating_hours, delivery_policy, storage_capacity,
                    description, announcement, is_open
                ) VALUES (
                    'Little Learners Official Kids Store',
                    'Store Manager Alex',
                    'store@littlelearners.com',
                    '+1 (555) 019-2834',
                    'Main Campus, Early Learning Wing A - Ground Floor',
                    'Monday – Friday: 8:00 AM – 4:00 PM',
                    'Student toy and stationery selections are packaged and dispatched directly to child classrooms every weekday by 2:30 PM.',
                    'Dedicated 4-Department Storage: Books, Stationery, Sensory Toys, and Uniform Dresses',
                    'Official school educational supplies store providing storybooks, art materials, tactile play toys, and uniforms for Little Learners preschool and kindergarten.',
                    '✨ All preschool store supplies & educational toys in stock for immediate classroom dispatch!',
                    1
                )
            """)
            print("[DB] Initialized default store_details record in database.")

        # 6. Student ID Column Migration in students table
        cursor.execute("""
            SELECT COUNT(*) AS cnt 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'students' 
              AND COLUMN_NAME = 'student_id'
        """)
        col_res = cursor.fetchone()
        has_student_id = (col_res['cnt'] if isinstance(col_res, dict) else col_res[0]) > 0

        if not has_student_id:
            cursor.execute("ALTER TABLE students ADD COLUMN student_id VARCHAR(50) UNIQUE AFTER id")
            cursor.execute("SELECT id FROM students ORDER BY id ASC")
            students_list = cursor.fetchall()
            for s in students_list:
                s_id = s['id'] if isinstance(s, dict) else s[0]
                code = f"LL-{s_id:03d}"
                cursor.execute("UPDATE students SET student_id = %s WHERE id = %s", (code, s_id))
            print(f"[DB Migration] Added student_id column and populated standardized IDs for {len(students_list)} students.")
        else:
            # Ensure any null student_id gets populated
            cursor.execute("SELECT id FROM students WHERE student_id IS NULL OR student_id = ''")
            empty_students = cursor.fetchall()
            for s in empty_students:
                s_id = s['id'] if isinstance(s, dict) else s[0]
                code = f"LL-{s_id:03d}"
                cursor.execute("UPDATE students SET student_id = %s WHERE id = %s", (code, s_id))
            if empty_students:
                print(f"[DB Migration] Populated missing student_id for {len(empty_students)} students.")

        conn.commit()
    except Exception as e:
        print(f"[DB Warning] Table verification warning: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_required_tables()
    print("[DB] Tables verified successfully.")
