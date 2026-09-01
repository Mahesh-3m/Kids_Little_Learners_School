import os
from pathlib import Path

# Load .env manually or via dotenv if installed
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

class Config:
    """Backend Application Configuration."""
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Mahi@885')
    DB_NAME = os.getenv('DB_NAME', 'little_learners')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    SECRET_KEY = os.getenv('SECRET_KEY', 'little-learners-super-secret-key-2026-rainbow')
    
    CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:5173')
