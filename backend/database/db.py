import decimal
import datetime
import mysql.connector
from mysql.connector import pooling
from config import Config

# Initialize Connection Pool
_pool = None

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
            # Try connecting directly if pool failed
            pass
    return _pool

def get_db_connection():
    """Get a connection from the pool, or fallback to single connection."""
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
