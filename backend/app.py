import os
import sys

# Configure UTF-8 for Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Import blueprints
from routes.students import students_bp
from routes.classes import classes_bp
from routes.games import games_bp
from routes.quiz import quiz_bp
from routes.results import results_bp
from routes.progress import progress_bp
from routes.parents import parents_bp
from routes.teacher import teacher_bp
from routes.store import store_bp, seller_bp
from database.init_app_db import init_required_tables

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize tables if needed
    try:
        init_required_tables()
    except Exception as e:
        print(f"[INIT] Table initialization notice: {e}")

    # Enable CORS for React frontend (support localhost:5173, 127.0.0.1:5173, and configured origins)
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if hasattr(Config, 'CORS_ORIGIN') and Config.CORS_ORIGIN:
        for origin in Config.CORS_ORIGIN.split(','):
            origin_clean = origin.strip()
            if origin_clean and origin_clean not in allowed_origins:
                allowed_origins.append(origin_clean)

    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins if not Config.DEBUG else "*",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }, supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(students_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(results_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(parents_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(store_bp)
    app.register_blueprint(seller_bp)

    @app.route('/api', methods=['GET'])
    @app.route('/api/', methods=['GET'])
    def api_root():
        return jsonify({
            "status": "ok",
            "message": "Little Learners API is running",
            "health": "/api/health",
            "endpoints": {
                "students": "/api/students",
                "classes": "/api/classes",
                "games": "/api/games",
                "quiz": "/api/quiz",
                "results": "/api/results",
                "progress": "/api/progress"
            }
        }), 200

    @app.route('/api/health', methods=['GET'])
    @app.route('/api/health/', methods=['GET'])
    def health_check():
        from database.db import get_active_backend, fetch_one
        try:
            active_db = get_active_backend()
            # Verify live connectivity
            ping = fetch_one("SELECT 1 AS ping")
            db_connected = bool(ping and ping.get('ping') == 1)

            return jsonify({
                "status": "healthy" if db_connected else "degraded",
                "app": "Little Learners API",
                "version": "1.0.0",
                "database": {
                    "connected": db_connected,
                    "type": active_db,
                    "host": Config.DB_HOST if active_db == 'mysql' else 'embedded (sqlite)',
                    "database": Config.DB_NAME if active_db == 'mysql' else 'little_learners.db'
                }
            }), 200 if db_connected else 503
        except Exception as err:
            return jsonify({
                "status": "unhealthy",
                "app": "Little Learners API",
                "version": "1.0.0",
                "database": {
                    "connected": False,
                    "type": getattr(Config, 'DB_TYPE', 'mysql'),
                    "host": Config.DB_HOST,
                    "database": Config.DB_NAME,
                    "error": str(err)
                }
            }), 503

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            "message": "Welcome to Little Learners REST API! 🌈",
            "endpoints": [
                "/api",
                "/api/students",
                "/api/classes",
                "/api/games",
                "/api/quiz",
                "/api/results",
                "/api/progress",
                "/api/health"
            ]
        }), 200

    # Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "The requested resource was not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method Not Allowed", "message": "The method is not allowed for the requested URL"}), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred on the server"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = Config.FLASK_PORT
    print(f"[SERVER] Starting Little Learners Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)

