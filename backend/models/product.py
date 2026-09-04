from database.db import fetch_all, fetch_one

class ProductModel:
    @staticmethod
    def get_all(category=None, active_only=True):
        """Fetch products from database with optional category filter."""
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        if active_only:
            query += " AND is_active = 1"
        if category and category.lower() != 'all':
            query += " AND LOWER(category) = LOWER(%s)"
            params.append(category)
        query += " ORDER BY id DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_id(product_id):
        """Fetch single product by ID."""
        query = "SELECT * FROM products WHERE id = %s"
        return fetch_one(query, (product_id,))
