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

# Load .env manually or via dotenv if installed
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

class Config:
    """Backend Application Configuration."""
    # Sanitize DB_HOST (handles 'local host' or extra spaces gracefully)
    raw_host = os.getenv('DB_HOST', 'localhost')
    DB_HOST = raw_host.strip().replace(' ', '') if raw_host else 'localhost'
    
    DB_USER = os.getenv('DB_USER', 'root').strip() if os.getenv('DB_USER') else 'root'
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Mahi@885')
    DB_NAME = os.getenv('DB_NAME', 'little_learners').strip() if os.getenv('DB_NAME') else 'little_learners'
    
    raw_port = str(os.getenv('DB_PORT', '3306')).strip()
    DB_PORT = int(raw_port) if raw_port.isdigit() else 3306
    
    DB_TYPE = os.getenv('DB_TYPE', 'mysql').strip().lower() if os.getenv('DB_TYPE') else 'mysql'
    
    # Optional SSL configuration for remote cloud MySQL (e.g. TiDB Serverless, Aiven)
    DB_SSL_DISABLED = os.getenv('DB_SSL_DISABLED', 'false').strip().lower() in ('true', '1', 'yes')
    DB_SSL_CA = os.getenv('DB_SSL_CA', '').strip() or None
    DB_SSL_VERIFY_CERT = os.getenv('DB_SSL_VERIFY_CERT', '').strip().lower() in ('true', '1', 'yes') if os.getenv('DB_SSL_VERIFY_CERT') is not None else None
    
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', 'little-learners-super-secret-key-2026-rainbow')
    
    CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:5173')

