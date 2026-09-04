from flask import Blueprint, request, jsonify
from models.product import ProductModel
from routes.auth_middleware import parent_required

store_bp = Blueprint('store', __name__, url_prefix='/api/store')

@store_bp.route('/products', methods=['GET'])
@parent_required
def get_products():
    """Get active store products (Parent only). Supports ?category= filter."""
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
    """Get product details by ID (Parent only)."""
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
