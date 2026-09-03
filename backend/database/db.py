import os
import decimal
import datetime
import mysql.connector
from mysql.connector import pooling
from config import Config
from database.sqlite_db import (
    init_sqlite_db,
    fetch_all_sqlite,
    fetch_one_sqlite,
    execute_sqlite_query,
    get_sqlite_connection
)

# Active database type: 'mysql' or 'sqlite'
_active_backend = None
_pool = None

def get_active_backend():
    """Determine whether to use MySQL or fall back to SQLite."""
    global _active_backend
    if _active_backend is not None:
        return _active_backend

    db_type_env = os.getenv('DB_TYPE', '').strip().lower()
    if db_type_env == 'sqlite':
        print("[DB] DB_TYPE=sqlite explicitly set. Using embedded SQLite database.")
        init_sqlite_db()
        _active_backend = 'sqlite'
        return _active_backend

    # Try connecting to MySQL with a short timeout
    try:
        test_conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT,
            connection_timeout=2
        )
        test_conn.close()
        print(f"[DB] Connected to MySQL successfully at {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
        _active_backend = 'mysql'
        return _active_backend
    except Exception as err:
        print(f"[DB] MySQL unavailable at {Config.DB_HOST}:{Config.DB_PORT} ({err}).")
        print("[DB] Automatically activating embedded SQLite database (little_learners.db) for full functionality...")
        init_sqlite_db()
        _active_backend = 'sqlite'
        return _active_backend

def get_connection_pool():
    global _pool
    if _pool is None:
        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="little_learners_pool",
                pool_size=10,
                pool_reset_session=True,
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME,
                port=Config.DB_PORT,
                autocommit=True
            )
            print("MySQL Connection Pool initialized successfully.")
        except mysql.connector.Error as err:
            print(f"Error initializing MySQL connection pool: {err}")
            pass
    return _pool

def get_db_connection():
    """Get a connection from MySQL pool/fallback or SQLite connection."""
    if get_active_backend() == 'sqlite':
        return get_sqlite_connection()

    pool = get_connection_pool()
    if pool:
        try:
            return pool.get_connection()
        except mysql.connector.Error:
            pass
            
    # Direct fallback connection
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        autocommit=True
    )

def _serialize_row(row_dict):
    """Convert date, datetime, and decimal fields for JSON compatibility."""
    if not row_dict:
        return row_dict
    serialized = {}
    for key, value in row_dict.items():
        if isinstance(value, (datetime.date, datetime.datetime)):
            serialized[key] = value.isoformat()
        elif isinstance(value, decimal.Decimal):
            serialized[key] = float(value)
        else:
            serialized[key] = value
    return serialized

def fetch_all(query, params=None):
    """Execute a SELECT query and return all rows as list of dicts."""
    if get_active_backend() == 'sqlite':
        rows = fetch_all_sqlite(query, params)
        return [_serialize_row(r) for r in rows]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        rows = cursor.fetchall()
        return [_serialize_row(r) for r in rows]
    finally:
        cursor.close()
        conn.close()

def fetch_one(query, params=None):
    """Execute a SELECT query and return a single row as dict or None."""
    if get_active_backend() == 'sqlite':
        row = fetch_one_sqlite(query, params)
        return _serialize_row(row) if row else None

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        row = cursor.fetchone()
        return _serialize_row(row) if row else None
    finally:
        cursor.close()
        conn.close()

def execute_query(query, params=None, return_lastrowid=False):
    """Execute INSERT/UPDATE/DELETE query and return lastrowid or affected rows."""
    if get_active_backend() == 'sqlite':
        return execute_sqlite_query(query, params, return_lastrowid=return_lastrowid)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        conn.commit()
        if return_lastrowid:
            return cursor.lastrowid
        return cursor.rowcount
    finally:
        cursor.close()
        conn.close()
