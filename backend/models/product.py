from database.db import fetch_all, fetch_one, execute_query

class ProductModel:
    @staticmethod
    def get_all(category=None, active_only=True, seller_id=None):
        """Fetch products from database with optional category and seller filter."""
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        if active_only:
            query += " AND is_active = 1"
        if seller_id is not None:
            query += " AND seller_id = %s"
            params.append(seller_id)
        if category and category.lower() != 'all':
            cat_clean = category.lower().strip()
            if 'dress' in cat_clean:
                query += " AND LOWER(category) LIKE '%dress%'"
            elif 'book' in cat_clean:
                query += " AND LOWER(category) LIKE '%book%'"
            elif 'station' in cat_clean:
                query += " AND LOWER(category) LIKE '%station%'"
            elif 'toy' in cat_clean:
                query += " AND LOWER(category) LIKE '%toy%'"
            else:
                query += " AND LOWER(category) = LOWER(%s)"
                params.append(category)
        query += " ORDER BY id DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_id(product_id):
        """Fetch single product by ID."""
        query = "SELECT * FROM products WHERE id = %s"
        return fetch_one(query, (product_id,))

    @staticmethod
    def create(data, seller_id=1):
        """Create a new product in the Kids Store associated with a seller."""
        actual_seller_id = data.get('seller_id', seller_id) or 1
        query = """
            INSERT INTO products (seller_id, name, category, description, price, image_url, stock, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            actual_seller_id,
            data.get('name', '').strip(),
            data.get('category', 'General').strip(),
            data.get('description', '').strip(),
            float(data.get('price', 0.0)),
            data.get('image_url', '').strip() or None,
            int(data.get('stock', 0)),
            1 if data.get('is_active', True) else 0
        )
        return execute_query(query, params, return_lastrowid=True)

    @staticmethod
    def update(product_id, data):
        """Update existing product details."""
        query = """
            UPDATE products 
            SET name = %s, category = %s, description = %s, price = %s, image_url = %s, stock = %s, is_active = %s
            WHERE id = %s
        """
        params = (
            data.get('name', '').strip(),
            data.get('category', 'General').strip(),
            data.get('description', '').strip(),
            float(data.get('price', 0.0)),
            data.get('image_url', '').strip() or None,
            int(data.get('stock', 0)),
            1 if data.get('is_active', True) else 0,
            product_id
        )
        return execute_query(query, params)

    @staticmethod
    def update_stock(product_id, new_stock):
        """Update product inventory stock level."""
        query = "UPDATE products SET stock = %s WHERE id = %s"
        return execute_query(query, (int(new_stock), product_id))

    @staticmethod
    def update_price(product_id, new_price):
        """Update product price."""
        query = "UPDATE products SET price = %s WHERE id = %s"
        return execute_query(query, (float(new_price), product_id))

    @staticmethod
    def delete(product_id):
        """Delete product from store."""
        query = "DELETE FROM products WHERE id = %s"
        return execute_query(query, (product_id,))

    @staticmethod
    def get_categories():
        """Fetch distinct categories in store."""
        query = "SELECT DISTINCT category FROM products ORDER BY category ASC"
        rows = fetch_all(query)
        return [r['category'] for r in rows if r.get('category')]

    @staticmethod
    def get_stats():
        """Fetch inventory metrics for store admin dashboard."""
        total_prod = fetch_one("SELECT COUNT(*) AS total FROM products")
        total_toys = fetch_one("SELECT COUNT(*) AS total, COALESCE(SUM(stock), 0) AS stock FROM products WHERE LOWER(category) = 'toys'")
        total_books = fetch_one("SELECT COUNT(*) AS total, COALESCE(SUM(stock), 0) AS stock FROM products WHERE LOWER(category) = 'books'")
        total_stationery = fetch_one("SELECT COUNT(*) AS total, COALESCE(SUM(stock), 0) AS stock FROM products WHERE LOWER(category) = 'stationery'")
        total_dresses = fetch_one("SELECT COUNT(*) AS total, COALESCE(SUM(stock), 0) AS stock FROM products WHERE LOWER(category) LIKE '%dress%'")
        low_stock = fetch_one("SELECT COUNT(*) AS total FROM products WHERE stock <= 5 AND is_active = 1")
        total_stock = fetch_one("SELECT COALESCE(SUM(stock), 0) AS total FROM products")

        return {
            "total_products": total_prod.get('total', 0) if total_prod else 0,
            "total_toys": total_toys.get('total', 0) if total_toys else 0,
            "toys_stock": int(total_toys.get('stock', 0) if total_toys else 0),
            "total_books": total_books.get('total', 0) if total_books else 0,
            "books_stock": int(total_books.get('stock', 0) if total_books else 0),
            "total_stationery": total_stationery.get('total', 0) if total_stationery else 0,
            "stationery_stock": int(total_stationery.get('stock', 0) if total_stationery else 0),
            "total_dresses": total_dresses.get('total', 0) if total_dresses else 0,
            "dresses_stock": int(total_dresses.get('stock', 0) if total_dresses else 0),
            "low_stock_alerts": low_stock.get('total', 0) if low_stock else 0,
            "total_inventory_items": int(total_stock.get('total', 0) if total_stock else 0)
        }

