from database.db import fetch_all, fetch_one, execute_query

class ToySelectionModel:
    @staticmethod
    def create_selection(parent_id, student_id, student_name, student_class, product_id, product_name, product_category, price, quantity=1):
        """Record a parent selecting a toy or store item for their child."""
        query = """
            INSERT INTO toy_selections 
            (parent_id, student_id, student_name, student_class, product_id, product_name, product_category, price, quantity, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            parent_id,
            student_id,
            student_name.strip(),
            student_class.strip(),
            product_id,
            product_name.strip(),
            product_category.strip(),
            float(price),
            int(quantity),
            'Requested'
        )
        return execute_query(query, params, return_lastrowid=True)

    @staticmethod
    def get_all(category=None):
        """
        Fetch all kid toy/product selections for the Store Manager.
        NOTE: This strictly returns ONLY product selection data (child name, class, toy, price, status, date).
        Academic grades, test scores, private parent records, and teacher data are completely excluded.
        """
        query = """
            SELECT 
                id, parent_id, student_id, student_name, student_class, 
                product_id, product_name, product_category, quantity, price, 
                status, created_at
            FROM toy_selections
            WHERE 1=1
        """
        params = []
        if category and category.lower() != 'all':
            query += " AND LOWER(product_category) = LOWER(%s)"
            params.append(category)
        query += " ORDER BY id DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def get_by_parent(parent_id):
        """Fetch toy selections made by a specific parent for their kids."""
        query = """
            SELECT 
                id, student_id, student_name, student_class, 
                product_id, product_name, product_category, quantity, price, 
                status, created_at
            FROM toy_selections
            WHERE parent_id = %s
            ORDER BY id DESC
        """
        return fetch_all(query, (parent_id,))

    @staticmethod
    def get_by_id(selection_id):
        """Fetch single selection record."""
        query = "SELECT * FROM toy_selections WHERE id = %s"
        return fetch_one(query, (selection_id,))

    @staticmethod
    def update_status(selection_id, status):
        """Update fulfillment status of a child toy selection."""
        query = "UPDATE toy_selections SET status = %s WHERE id = %s"
        return execute_query(query, (status.strip(), selection_id))

    @staticmethod
    def get_stats():
        """Aggregated stats for the Store Manager dashboard."""
        total = fetch_one("SELECT COUNT(*) AS total FROM toy_selections")
        toys_only = fetch_one("SELECT COUNT(*) AS total FROM toy_selections WHERE LOWER(product_category) = 'toys'")
        pending = fetch_one("SELECT COUNT(*) AS total FROM toy_selections WHERE status = 'Requested'")
        delivered = fetch_one("SELECT COUNT(*) AS total FROM toy_selections WHERE status = 'Delivered'")

        return {
            "total_selections": total.get('total', 0) if total else 0,
            "total_toy_requests": toys_only.get('total', 0) if toys_only else 0,
            "pending_requests": pending.get('total', 0) if pending else 0,
            "delivered_requests": delivered.get('total', 0) if delivered else 0
        }
