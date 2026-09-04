from database.db import fetch_one, execute_query

class StoreDetailsModel:
    @staticmethod
    def get():
        """Retrieve current store details from database."""
        query = "SELECT * FROM store_details ORDER BY id ASC LIMIT 1"
        res = fetch_one(query)
        if not res:
            # Fallback default if not yet inserted
            return {
                "id": 1,
                "store_name": "Little Learners Official Kids Store",
                "manager_name": "Store Manager Alex",
                "email": "store@littlelearners.com",
                "phone": "+1 (555) 019-2834",
                "location": "Main Campus, Early Learning Wing A - Ground Floor",
                "operating_hours": "Monday – Friday: 8:00 AM – 4:00 PM",
                "delivery_policy": "Student toy and stationery selections are packaged and dispatched directly to child classrooms every weekday by 2:30 PM.",
                "storage_capacity": "Dedicated 4-Department Storage: Books, Stationery, Sensory Toys, and Uniform Dresses",
                "description": "Official school educational supplies store providing storybooks, art materials, tactile play toys, and uniforms for Little Learners preschool and kindergarten.",
                "announcement": "✨ All preschool store supplies & educational toys in stock for immediate classroom dispatch!",
                "is_open": 1
            }
        return res

    @staticmethod
    def update(data):
        """Update existing store details or insert if none exists."""
        existing = fetch_one("SELECT id FROM store_details ORDER BY id ASC LIMIT 1")

        store_name = data.get('store_name', 'Little Learners Official Kids Store')
        manager_name = data.get('manager_name', 'Store Manager Alex')
        email = data.get('email', 'store@littlelearners.com')
        phone = data.get('phone', '+1 (555) 019-2834')
        location = data.get('location', 'Main Campus, Early Learning Wing A - Ground Floor')
        operating_hours = data.get('operating_hours', 'Monday – Friday: 8:00 AM – 4:00 PM')
        delivery_policy = data.get('delivery_policy', '')
        storage_capacity = data.get('storage_capacity', '')
        description = data.get('description', '')
        announcement = data.get('announcement', '')
        is_open = 1 if data.get('is_open', True) else 0

        if not existing:
            query = """
                INSERT INTO store_details (
                    store_name, manager_name, email, phone, location,
                    operating_hours, delivery_policy, storage_capacity,
                    description, announcement, is_open
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                store_name, manager_name, email, phone, location,
                operating_hours, delivery_policy, storage_capacity,
                description, announcement, is_open
            )
            execute_query(query, params)
        else:
            query = """
                UPDATE store_details SET
                    store_name = %s,
                    manager_name = %s,
                    email = %s,
                    phone = %s,
                    location = %s,
                    operating_hours = %s,
                    delivery_policy = %s,
                    storage_capacity = %s,
                    description = %s,
                    announcement = %s,
                    is_open = %s
                WHERE id = %s
            """
            params = (
                store_name, manager_name, email, phone, location,
                operating_hours, delivery_policy, storage_capacity,
                description, announcement, is_open,
                existing['id']
            )
            execute_query(query, params)

        return StoreDetailsModel.get()
