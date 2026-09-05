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

def _get_mysql_kwargs():
    """Build MySQL connection parameters including optional SSL configuration."""
    kwargs = {
        'host': Config.DB_HOST,
        'user': Config.DB_USER,
        'password': Config.DB_PASSWORD,
        'database': Config.DB_NAME,
        'port': Config.DB_PORT,
    }
    # Optional SSL settings for cloud databases
    if getattr(Config, 'DB_SSL_DISABLED', False):
        kwargs['ssl_disabled'] = True
    else:
        ssl_ca = getattr(Config, 'DB_SSL_CA', None)
        if ssl_ca:
            kwargs['ssl_ca'] = ssl_ca
        ssl_verify_cert = getattr(Config, 'DB_SSL_VERIFY_CERT', None)
        if ssl_verify_cert is not None:
            kwargs['ssl_verify_cert'] = ssl_verify_cert
    return kwargs

def get_active_backend():
    """Determine whether to use MySQL or SQLite without silent fallback in production."""
    global _active_backend
    if _active_backend is not None:
        return _active_backend

    db_type_env = getattr(Config, 'DB_TYPE', os.getenv('DB_TYPE', 'mysql')).strip().lower()
    if db_type_env == 'sqlite':
        print("[DB] DB_TYPE=sqlite explicitly set. Using embedded SQLite database.")
        init_sqlite_db()
        _active_backend = 'sqlite'
        return _active_backend

    # Attempt MySQL connection
    mysql_kwargs = _get_mysql_kwargs()
    try:
        test_conn = mysql.connector.connect(**mysql_kwargs, connection_timeout=5)
        test_conn.close()
        print(f"[DB] Connected to MySQL successfully at {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
        _active_backend = 'mysql'
        return _active_backend
    except Exception as err:
        print(f"[DB Error] Unable to connect to MySQL at {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME} - User: {Config.DB_USER}")
        print(f"           Error detail: {err}")
        if db_type_env == 'mysql':
            print("[DB] DB_TYPE=mysql is configured. Retrying MySQL connection once with 10s timeout...")
            try:
                test_conn = mysql.connector.connect(**mysql_kwargs, connection_timeout=10)
                test_conn.close()
                print(f"[DB] Connected to MySQL successfully on retry at {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
                _active_backend = 'mysql'
                return _active_backend
            except Exception as retry_err:
                error_msg = (
                    f"MySQL connection failed to {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME} (User: {Config.DB_USER}). "
                    f"DB_TYPE=mysql is configured, so SQLite fallback is disabled in production. "
                    f"Please verify that DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME environment variables are set correctly in your Render dashboard and the remote MySQL database is online. "
                    f"Original error: {retry_err}"
                )
                print(f"[DB Error] {error_msg}")
                raise ConnectionError(error_msg)
        else:
            print("[DB] DB_TYPE is not 'mysql'. Activating embedded SQLite database (little_learners.db) for local fallback...")
            init_sqlite_db()
            _active_backend = 'sqlite'
            return _active_backend

def get_connection_pool():
    global _pool
    if _pool is None:
        try:
            pool_kwargs = _get_mysql_kwargs()
            pool_kwargs['pool_name'] = "little_learners_pool"
            pool_kwargs['pool_size'] = 5
            pool_kwargs['pool_reset_session'] = True
            pool_kwargs['autocommit'] = True
            pool_kwargs['connection_timeout'] = 10
            _pool = pooling.MySQLConnectionPool(**pool_kwargs)
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
            conn = pool.get_connection()
            if conn.is_connected():
                return conn
            conn.reconnect(attempts=2, delay=1)
            return conn
        except mysql.connector.Error as pool_err:
            print(f"[DB Warning] Pool get_connection failed ({pool_err}), trying direct connection...")
            pass

    # Direct connection fallback
    direct_kwargs = _get_mysql_kwargs()
    direct_kwargs['autocommit'] = True
    direct_kwargs['connection_timeout'] = 10
    return mysql.connector.connect(**direct_kwargs)

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
