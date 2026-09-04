import os
import sys
from pathlib import Path

# Configure UTF-8 for Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import mysql.connector
from config import Config

def run_sql_file(cursor, filepath):
    """Parse and execute multi-statement SQL script file safely."""
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_commands = f.read()

    # Split by semicolon and execute non-empty commands
    statements = sql_commands.split(';')
    for statement in statements:
        stmt = statement.strip()
        if stmt:
            try:
                cursor.execute(stmt)
            except mysql.connector.Error as err:
                # Ignore harmless warnings like table already exists or duplicate entries
                if err.errno not in (1050, 1062, 1060):
                    print(f"  [SQL Notice] {err.msg}")

def setup_database():
    print("=" * 60)
    print("  Kids Little Learners - Database Setup & Initialization")
    print("=" * 60)
    print(f"Connecting to MySQL Host: {Config.DB_HOST}:{Config.DB_PORT}")
    print(f"User: {Config.DB_USER}")
    print(f"Target Database: {Config.DB_NAME}")
    print("-" * 60)

    try:
        # Step 1: Connect to MySQL Server (without selecting database first)
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            port=Config.DB_PORT,
            autocommit=True
        )
        cursor = conn.cursor()
        print("[✓] Connected to MySQL server successfully.")

        # Step 2: Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.execute(f"USE `{Config.DB_NAME}`;")
        print(f"[✓] Database `{Config.DB_NAME}` is ready.")

        # Step 3: Run little_learners.sql schema & seed data
        sql_path = backend_dir.parent / "database" / "little_learners.sql"
        if sql_path.exists():
            print(f"[i] Executing schema & initial seeds from: {sql_path.name}...")
            run_sql_file(cursor, sql_path)
            print("[✓] Base tables & sample data initialized successfully.")
        else:
            print(f"[!] Warning: SQL file not found at {sql_path}")

        cursor.close()
        conn.close()

        # Step 4: Run Parent Dashboard initialization
        from database.init_parent_db import init_parent_tables
        print("[i] Verifying Parent dashboard tables and demo accounts...")
        init_parent_tables()
        print("[✓] Parent module tables and demo accounts initialized successfully.")

        print("=" * 60)
        print("🎉 Database setup completed successfully! Your database is ready to use.")
        print("=" * 60)
        return True

    except mysql.connector.Error as err:
        print(f"\n❌ MySQL Connection / Execution Error: {err}")
        print("\nPlease check your credentials in `backend/.env`:")
        print(f"  DB_HOST={Config.DB_HOST}")
        print(f"  DB_PORT={Config.DB_PORT}")
        print(f"  DB_USER={Config.DB_USER}")
        print(f"  DB_PASSWORD=********")
        print(f"  DB_NAME={Config.DB_NAME}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        return False

if __name__ == '__main__':
    setup_database()
