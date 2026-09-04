from database.db import fetch_one, fetch_all, execute_query
from werkzeug.security import generate_password_hash, check_password_hash

class StoreManagerModel:
    @staticmethod
    def get_by_email(email):
        """Fetch store manager by email."""
        if not email:
            return None
        query = "SELECT * FROM store_managers WHERE LOWER(email) = LOWER(%s)"
        return fetch_one(query, (email.strip(),))

    @staticmethod
    def get_by_id(manager_id):
        """Fetch store manager by ID."""
        if not manager_id:
            return None
        query = "SELECT id, name, email, created_at FROM store_managers WHERE id = %s"
        return fetch_one(query, (manager_id,))

    @staticmethod
    def verify_password(manager_or_hash, password):
        """Verify password against stored hash or manager dict."""
        if not manager_or_hash or not password:
            return False
        if isinstance(manager_or_hash, dict):
            stored_hash = manager_or_hash.get('password_hash')
        else:
            stored_hash = manager_or_hash
        if not stored_hash:
            return False
        return check_password_hash(stored_hash, password)

    @staticmethod
    def create(name, email, password):
        """Create new store manager account."""
        password_hash = generate_password_hash(password)
        query = """
            INSERT INTO store_managers (name, email, password_hash)
            VALUES (%s, %s, %s)
        """
        return execute_query(query, (name.strip(), email.strip().lower(), password_hash))
