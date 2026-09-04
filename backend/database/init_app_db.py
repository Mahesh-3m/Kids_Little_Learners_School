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

        conn.commit()
    except Exception as e:
        print(f"[DB Warning] Table verification warning: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_required_tables()
    print("[DB] Tables verified successfully.")
