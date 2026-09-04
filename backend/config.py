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
    DB_USER = os.getenv('DB_USER', 'root').strip()
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Mahi@885')
    DB_NAME = os.getenv('DB_NAME', 'little_learners').strip()
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_TYPE = os.getenv('DB_TYPE', 'mysql').strip().lower()
    
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', 'little-learners-super-secret-key-2026-rainbow')
    
    CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:5173')

