from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash
from models.product import ProductModel
from models.store_manager import StoreManagerModel
from models.teacher import TeacherModel
from models.toy_selection import ToySelectionModel
from models.parent import ParentModel
from models.student import StudentModel
from models.store_details import StoreDetailsModel
from routes.auth_middleware import (
    parent_required,
    store_manager_required,
    generate_store_manager_token,
    generate_teacher_token
)

store_bp = Blueprint('store', __name__, url_prefix='/api/store')

# ----------------------------------------------------
# STORE MANAGER AUTHENTICATION
# ----------------------------------------------------

@store_bp.route('/login', methods=['POST'])
def store_login():
    """Store Manager authentication endpoint."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            "error": "Bad Request",
            "message": "Email and password are required."
        }), 400

    manager = StoreManagerModel.get_by_email(email)
    if manager and StoreManagerModel.verify_password(manager, password):
        token = generate_store_manager_token(manager['id'], manager['email'])
        return jsonify({
            "status": "success",
            "message": f"Welcome back, {manager['name']}! 🏬",
            "token": token,
            "manager": {
                "id": manager['id'],
                "name": manager['name'],
                "email": manager['email'],
                "role": "store_manager"
            }
        }), 200

    # Allow Teachers to log into Store Admin directly
    teacher = TeacherModel.get_by_email(email)
    if teacher and check_password_hash(teacher['password_hash'], password):
        token = generate_teacher_token(teacher['id'], teacher['email'])
        return jsonify({
            "status": "success",
            "message": f"Welcome, Teacher {teacher['name']}! Store manager access granted. 🏬",
            "token": token,
            "manager": {
                "id": teacher['id'],
                "name": f"Teacher {teacher['name']}",
                "email": teacher['email'],
                "role": "teacher_store_manager"
            }
        }), 200

    return jsonify({
        "error": "Unauthorized",
        "message": "Invalid email or password. Please verify credentials or log in with your educator account."
    }), 401

@store_bp.route('/profile', methods=['GET'])
@store_manager_required
def get_store_profile():
    """Return authenticated Store Manager profile."""
    manager = g.current_store_manager
    return jsonify({
        "status": "success",
        "manager": {
            "id": manager['id'],
            "name": manager['name'],
            "email": manager['email'],
            "role": "store_manager"
        }
    }), 200


# ----------------------------------------------------
# PRODUCT CATALOG (PUBLIC / PARENT / STORE MANAGER)
# ----------------------------------------------------

@store_bp.route('/categories', methods=['GET'])
def get_categories():
    """Fetch distinct product categories available in the store."""
    try:
        categories = ProductModel.get_categories()
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve categories: {str(e)}"
        }), 500

@store_bp.route('/products', methods=['GET'])
@parent_required
def get_products():
    """
    Get active store products. Supports ?category= filter.
    Accessible exclusively by authenticated parents.
    """
    try:
        category = request.args.get('category')
        products = ProductModel.get_all(category=category, active_only=True)
        return jsonify(products), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve store products: {str(e)}"
        }), 500

@store_bp.route('/products/<int:product_id>', methods=['GET'])
@parent_required
def get_product(product_id):
    """Get product details by ID."""
    try:
        product = ProductModel.get_by_id(product_id)
        if not product or not product.get('is_active', 1):
            return jsonify({
                "error": "Not Found",
                "message": f"Product with ID {product_id} not found or unavailable."
            }), 404
        return jsonify(product), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve product details: {str(e)}"
        }), 500


# ----------------------------------------------------
# PARENT TOY SELECTION / ORDERS
# ----------------------------------------------------

@store_bp.route('/select', methods=['POST'])
@parent_required
def select_toy_for_child():
    """
    Parent selects a toy or school item for their child.
    Decrements stock and records selection in toy_selections.
    """
    try:
        data = request.get_json() or {}
        parent = g.current_parent
        parent_id = parent['id']

        student_id = data.get('student_id')
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))

        if not student_id or not product_id:
            return jsonify({
                "error": "Bad Request",
                "message": "Both student_id and product_id are required to select a product."
            }), 400

        if quantity < 1:
            return jsonify({
                "error": "Bad Request",
                "message": "Quantity must be at least 1."
            }), 400

        # Verify child belongs to this parent
        is_owned = ParentModel.verify_child_ownership(parent_id, student_id)
        if not is_owned:
            return jsonify({
                "error": "Forbidden",
                "message": "You can only select store items for your own registered children."
            }), 403

        # Retrieve student details for denormalized storage
        student = StudentModel.get_by_id(student_id)
        if not student:
            return jsonify({
                "error": "Not Found",
                "message": f"Student with ID {student_id} not found."
            }), 404

        student_name = student.get('name', 'Student')
        student_class = student.get('class_name') or student.get('class') or 'Pre-K'

        # Retrieve product details & check stock
        product = ProductModel.get_by_id(product_id)
        if not product or not product.get('is_active', 1):
            return jsonify({
                "error": "Not Found",
                "message": "The selected product is unavailable."
            }), 404

        current_stock = int(product.get('stock', 0))
        if current_stock < quantity:
            return jsonify({
                "error": "Bad Request",
                "message": f"Insufficient stock. Only {current_stock} item(s) currently available."
            }), 400

        # Decrement product inventory
        new_stock = current_stock - quantity
        ProductModel.update_stock(product_id, new_stock)

        # Record child toy selection
        selection_id = ToySelectionModel.create_selection(
            parent_id=parent_id,
            student_id=student_id,
            student_name=student_name,
            student_class=student_class,
            product_id=product['id'],
            product_name=product['name'],
            product_category=product.get('category', 'General'),
            price=product.get('price', 0.0),
            quantity=quantity
        )

        return jsonify({
            "status": "success",
            "message": f"Successfully selected '{product['name']}' for {student_name}! 🎁",
            "selection_id": selection_id,
            "child_name": student_name,
            "product_name": product['name'],
            "remaining_stock": new_stock
        }), 201

    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to complete product selection: {str(e)}"
        }), 500

@store_bp.route('/my-selections', methods=['GET'])
@parent_required
def get_my_toy_selections():
    """Return all store items selected by the authenticated parent for their children."""
    try:
        parent_id = g.current_parent['id']
        selections = ToySelectionModel.get_by_parent(parent_id)
        return jsonify(selections), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve toy selections: {str(e)}"
        }), 500


# ----------------------------------------------------
# STORE DETAILS & LOCATION INFORMATION
# ----------------------------------------------------

@store_bp.route('/details', methods=['GET'])
def get_store_details():
    """Fetch current school store operating details, campus location, and hours."""
    try:
        details = StoreDetailsModel.get()
        return jsonify(details), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve store details: {str(e)}"
        }), 500

@store_bp.route('/admin/details', methods=['PUT', 'POST'])
@store_manager_required
def admin_update_store_details():
    """Store Manager updates store details, campus location, operating hours, dispatch policy, and announcements."""
    try:
        data = request.get_json() or {}
        updated = StoreDetailsModel.update(data)
        return jsonify({
            "status": "success",
            "message": "Store details updated successfully in database! 🏬",
            "details": updated
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to update store details: {str(e)}"
        }), 500


# ----------------------------------------------------
# STORE MANAGER ADMIN ROUTES (STORE MANAGER ONLY)
# ----------------------------------------------------

@store_bp.route('/admin/stats', methods=['GET'])
@store_manager_required
def get_admin_stats():
    """Store Manager dashboard KPI metrics."""
    try:
        inv_stats = ProductModel.get_stats()
        toy_stats = ToySelectionModel.get_stats()
        return jsonify({
            **inv_stats,
            **toy_stats
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve store stats: {str(e)}"
        }), 500

@store_bp.route('/admin/products', methods=['GET'])
@store_manager_required
def admin_get_products():
    """Store Manager gets all products (both active & inactive)."""
    try:
        category = request.args.get('category')
        products = ProductModel.get_all(category=category, active_only=False)
        return jsonify(products), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve admin products: {str(e)}"
        }), 500

@store_bp.route('/admin/products', methods=['POST'])
@store_manager_required
def admin_create_product():
    """Store Manager / Seller adds a new product to the store inventory."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        category = data.get('category', '').strip()
        price = data.get('price')

        if not name:
            return jsonify({"error": "Bad Request", "message": "Product name is required."}), 400
        if not category:
            return jsonify({"error": "Bad Request", "message": "Product category is required."}), 400
        if price is None:
            return jsonify({"error": "Bad Request", "message": "Product price is required."}), 400

        seller_id = g.current_store_manager.get('id', 1)
        data['seller_id'] = seller_id
        new_id = ProductModel.create(data, seller_id=seller_id)
        created = ProductModel.get_by_id(new_id)

        return jsonify({
            "status": "success",
            "message": f"Product '{name}' added successfully! 🎉",
            "product": created
        }), 201
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to create product: {str(e)}"
        }), 500

@store_bp.route('/admin/products/<int:product_id>', methods=['GET'])
@store_manager_required
def admin_get_single_product(product_id):
    """Store Manager / Seller fetches a single product for editing."""
    try:
        product = ProductModel.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Not Found", "message": f"Product {product_id} not found."}), 404
        return jsonify(product), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to fetch product: {str(e)}"
        }), 500

@store_bp.route('/admin/products/<int:product_id>', methods=['PUT'])
@store_manager_required
def admin_update_product(product_id):
    """Store Manager / Seller updates full product details with backend ownership check."""
    try:
        product = ProductModel.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Not Found", "message": f"Product {product_id} not found."}), 404

        # Strict Backend Ownership Check: Seller A cannot edit Seller B's products
        manager = g.current_store_manager
        prod_seller_id = product.get('seller_id')
        if (prod_seller_id is not None and 
            prod_seller_id != manager.get('id') and 
            manager.get('role') != 'teacher_store_manager' and 
            manager.get('id') != 1):
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. You can only modify products belonging to your seller account."
            }), 403

        data = request.get_json() or {}
        ProductModel.update(product_id, data)
        updated = ProductModel.get_by_id(product_id)

        return jsonify({
            "status": "success",
            "message": f"Product '{updated['name']}' updated successfully.",
            "product": updated
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to update product: {str(e)}"
        }), 500

@store_bp.route('/admin/products/<int:product_id>/stock', methods=['PATCH'])
@store_manager_required
def admin_update_stock(product_id):
    """Store Manager / Seller updates inventory stock level with ownership check."""
    try:
        data = request.get_json() or {}
        if 'stock' not in data:
            return jsonify({"error": "Bad Request", "message": "Stock field is required."}), 400

        new_stock = int(data['stock'])
        if new_stock < 0:
            return jsonify({"error": "Bad Request", "message": "Stock cannot be negative."}), 400

        product = ProductModel.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Not Found", "message": f"Product {product_id} not found."}), 404

        # Strict Backend Ownership Check
        manager = g.current_store_manager
        prod_seller_id = product.get('seller_id')
        if (prod_seller_id is not None and 
            prod_seller_id != manager.get('id') and 
            manager.get('role') != 'teacher_store_manager' and 
            manager.get('id') != 1):
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. You can only update stock for your own products."
            }), 403

        ProductModel.update_stock(product_id, new_stock)
        return jsonify({
            "status": "success",
            "message": f"Stock updated to {new_stock} for '{product['name']}'.",
            "stock": new_stock
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to update stock: {str(e)}"
        }), 500

@store_bp.route('/admin/products/<int:product_id>/price', methods=['PATCH'])
@store_manager_required
def admin_update_price(product_id):
    """Store Manager / Seller updates product price with ownership check."""
    try:
        data = request.get_json() or {}
        if 'price' not in data:
            return jsonify({"error": "Bad Request", "message": "Price field is required."}), 400

        new_price = float(data['price'])
        if new_price < 0:
            return jsonify({"error": "Bad Request", "message": "Price cannot be negative."}), 400

        product = ProductModel.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Not Found", "message": f"Product {product_id} not found."}), 404

        # Strict Backend Ownership Check
        manager = g.current_store_manager
        prod_seller_id = product.get('seller_id')
        if (prod_seller_id is not None and 
            prod_seller_id != manager.get('id') and 
            manager.get('role') != 'teacher_store_manager' and 
            manager.get('id') != 1):
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. You can only update price for your own products."
            }), 403

        ProductModel.update_price(product_id, new_price)
        return jsonify({
            "status": "success",
            "message": f"Price updated to ${new_price:.2f} for '{product['name']}'.",
            "price": new_price
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to update price: {str(e)}"
        }), 500

@store_bp.route('/admin/products/<int:product_id>', methods=['DELETE'])
@store_manager_required
def admin_delete_product(product_id):
    """Store Manager / Seller deletes a product from the catalog with ownership check."""
    try:
        product = ProductModel.get_by_id(product_id)
        if not product:
            return jsonify({"error": "Not Found", "message": f"Product {product_id} not found."}), 404

        # Strict Backend Ownership Check
        manager = g.current_store_manager
        prod_seller_id = product.get('seller_id')
        if (prod_seller_id is not None and 
            prod_seller_id != manager.get('id') and 
            manager.get('role') != 'teacher_store_manager' and 
            manager.get('id') != 1):
            return jsonify({
                "error": "Forbidden",
                "message": "Access denied. You can only delete products belonging to your seller account."
            }), 403

        ProductModel.delete(product_id)
        return jsonify({
            "status": "success",
            "message": f"Product '{product['name']}' was successfully deleted."
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to delete product: {str(e)}"
        }), 500

@store_bp.route('/admin/toy-selections', methods=['GET'])
@store_manager_required
def admin_get_toy_selections():
    """
    Store Manager views all toy and item selections made for kids.
    PRIVACY GUARANTEE: Returns child name, class, product, price, status, date.
    Zero academic files, test grades, or teacher logs are exposed.
    """
    try:
        category = request.args.get('category')
        selections = ToySelectionModel.get_all(category=category)
        return jsonify(selections), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve toy selections: {str(e)}"
        }), 500

@store_bp.route('/admin/toy-selections/<int:selection_id>/status', methods=['PATCH'])
@store_manager_required
def admin_update_selection_status(selection_id):
    """Store Manager updates fulfillment status (Requested, Processing, Delivered, Cancelled)."""
    try:
        data = request.get_json() or {}
        status = data.get('status', '').strip()
        valid_statuses = ['Requested', 'Processing', 'Delivered', 'Cancelled']

        if not status or status not in valid_statuses:
            return jsonify({
                "error": "Bad Request",
                "message": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }), 400

        selection = ToySelectionModel.get_by_id(selection_id)
        if not selection:
            return jsonify({"error": "Not Found", "message": f"Selection record {selection_id} not found."}), 404

        ToySelectionModel.update_status(selection_id, status)
        return jsonify({
            "status": "success",
            "message": f"Status updated to '{status}' for {selection.get('student_name', 'Student')}'s order.",
            "selection_id": selection_id,
            "new_status": status
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to update selection status: {str(e)}"
        }), 500


# ----------------------------------------------------
# DEDICATED SELLER BLUEPRINT & ROUTE ALIASES (Role 4)
# ----------------------------------------------------

seller_bp = Blueprint('seller', __name__, url_prefix='/api/seller')

@seller_bp.route('/login', methods=['POST'])
def seller_login_endpoint():
    return store_login()

@seller_bp.route('/profile', methods=['GET'])
@store_manager_required
def seller_profile_endpoint():
    return get_store_profile()

@seller_bp.route('/stats', methods=['GET'])
@store_manager_required
def seller_stats_endpoint():
    return get_admin_stats()

@seller_bp.route('/products', methods=['GET'])
@store_manager_required
def seller_products_get_endpoint():
    return admin_get_products()

@seller_bp.route('/products', methods=['POST'])
@store_manager_required
def seller_products_post_endpoint():
    return admin_create_product()

@seller_bp.route('/products/<int:product_id>', methods=['GET'])
@store_manager_required
def seller_single_product_endpoint(product_id):
    return admin_get_single_product(product_id)

@seller_bp.route('/products/<int:product_id>', methods=['PUT'])
@store_manager_required
def seller_update_product_endpoint(product_id):
    return admin_update_product(product_id)

@seller_bp.route('/products/<int:product_id>/stock', methods=['PATCH'])
@store_manager_required
def seller_update_stock_endpoint(product_id):
    return admin_update_stock(product_id)

@seller_bp.route('/products/<int:product_id>/price', methods=['PATCH'])
@store_manager_required
def seller_update_price_endpoint(product_id):
    return admin_update_price(product_id)

@seller_bp.route('/products/<int:product_id>', methods=['DELETE'])
@store_manager_required
def seller_delete_product_endpoint(product_id):
    return admin_delete_product(product_id)

