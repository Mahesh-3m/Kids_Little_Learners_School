import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app
import json

def test_store_admin_and_toy_selection_security():
    app = create_app()
    client = app.test_client()

    print("=================================================================")
    print("   LITTLE LEARNERS - STORE ADMIN & PRIVACY SECURITY TEST SUITE   ")
    print("=================================================================")

    # -------------------------------------------------------------
    # 1. STORE MANAGER AUTHENTICATION
    # -------------------------------------------------------------
    print("\n[TEST 1] Store Manager Login & Authentication:")
    
    # Bad credentials
    res = client.post('/api/store/login', json={
        'email': 'manager@littlelearners.com',
        'password': 'WrongPassword999'
    })
    assert res.status_code == 401, f"Expected 401 for bad password, got {res.status_code}"
    print("  ✓ Invalid password rejected with 401")

    # Valid credentials
    res = client.post('/api/store/login', json={
        'email': 'manager@littlelearners.com',
        'password': 'Manager@123'
    })
    assert res.status_code == 200, f"Expected 200 for valid login, got {res.status_code}"
    data = res.get_json()
    assert 'token' in data, "Token missing in response"
    store_token = data['token']
    store_headers = {'Authorization': f'Bearer {store_token}'}
    print(f"  ✓ Store Manager authenticated successfully (token received)")

    # Profile check
    res = client.get('/api/store/profile', headers=store_headers)
    assert res.status_code == 200, f"Expected 200 for profile, got {res.status_code}"
    profile = res.get_json().get('manager', {})
    assert profile.get('role') == 'store_manager'
    print(f"  ✓ Store Manager profile verified: {profile.get('name')} ({profile.get('email')})")

    # -------------------------------------------------------------
    # 2. STORE MANAGER DASHBOARD & INVENTORY STATS
    # -------------------------------------------------------------
    print("\n[TEST 2] Store Manager Metrics & Dashboard Stats:")
    res = client.get('/api/store/admin/stats', headers=store_headers)
    assert res.status_code == 200, f"Expected 200 for admin stats, got {res.status_code}"
    stats = res.get_json()
    assert 'total_products' in stats, "Missing total_products"
    assert 'total_selections' in stats, "Missing total_selections"
    print(f"  ✓ Admin stats retrieved: {stats['total_products']} products, {stats['total_selections']} total selections")

    # -------------------------------------------------------------
    # 3. PRODUCT INVENTORY CRUD (STORE MANAGER)
    # -------------------------------------------------------------
    print("\n[TEST 3] Product Inventory CRUD by Store Manager:")
    
    # Create product
    new_product_payload = {
        "name": "Montessori Wooden Sorting Stacker",
        "category": "Toys",
        "description": "Premium sensory sorting blocks for motor skills.",
        "price": 24.99,
        "stock": 15,
        "is_active": True
    }
    res = client.post('/api/store/admin/products', json=new_product_payload, headers=store_headers)
    assert res.status_code == 201, f"Expected 201 on product create, got {res.status_code}"
    created_prod = res.get_json().get('product', {})
    prod_id = created_prod['id']
    print(f"  ✓ Product created: ID {prod_id} - '{created_prod['name']}' (${created_prod['price']})")

    # Update stock
    res = client.patch(f'/api/store/admin/products/{prod_id}/stock', json={'stock': 25}, headers=store_headers)
    assert res.status_code == 200, f"Expected 200 on stock update, got {res.status_code}"
    assert res.get_json().get('stock') == 25
    print(f"  ✓ Stock updated to 25 for product {prod_id}")

    # Update price
    res = client.patch(f'/api/store/admin/products/{prod_id}/price', json={'price': 22.50}, headers=store_headers)
    assert res.status_code == 200, f"Expected 200 on price update, got {res.status_code}"
    assert res.get_json().get('price') == 22.50
    print(f"  ✓ Price updated to $22.50 for product {prod_id}")

    # -------------------------------------------------------------
    # 4. PARENT AUTHENTICATION & TOY SELECTION
    # -------------------------------------------------------------
    print("\n[TEST 4] Parent Toy Selection Flow:")
    
    # Login as parent
    res = client.post('/api/parent/login', json={
        'email': 'parent@littlelearners.com',
        'password': 'password123'
    })
    assert res.status_code == 200, f"Expected 200 for parent login, got {res.status_code}"
    parent_data = res.get_json()
    parent_token = parent_data['token']
    parent_headers = {'Authorization': f'Bearer {parent_token}'}
    children = parent_data.get('children', [])
    assert len(children) > 0, "Expected parent to have at least one child"
    child = children[0]
    child_id = child['id']
    child_name = child['name']
    print(f"  ✓ Parent logged in: {parent_data['parent']['name']}, Child: {child_name} (ID {child_id})")

    # Parent selects toy
    res = client.post('/api/store/select', json={
        'student_id': child_id,
        'product_id': prod_id,
        'quantity': 1
    }, headers=parent_headers)
    assert res.status_code == 201, f"Expected 201 on toy selection, got {res.status_code}"
    sel_resp = res.get_json()
    selection_id = sel_resp['selection_id']
    print(f"  ✓ Toy selected: Selection ID {selection_id} for child '{child_name}', remaining stock: {sel_resp['remaining_stock']}")

    # Parent views their selections
    res = client.get('/api/store/my-selections', headers=parent_headers)
    assert res.status_code == 200, f"Expected 200 on parent selections, got {res.status_code}"
    my_selections = res.get_json()
    assert any(s['id'] == selection_id for s in my_selections), "Selection not found in parent's selections"
    print(f"  ✓ Parent successfully fetched their selections (count: {len(my_selections)})")

    # -------------------------------------------------------------
    # 5. STORE MANAGER FULFILLMENT & SELECTIONS TABLE
    # -------------------------------------------------------------
    print("\n[TEST 5] Store Manager Orders & Status Update:")
    res = client.get('/api/store/admin/toy-selections', headers=store_headers)
    assert res.status_code == 200, f"Expected 200 on admin toy selections, got {res.status_code}"
    all_selections = res.get_json()
    assert len(all_selections) > 0, "Expected at least 1 selection in admin view"
    target_sel = next(s for s in all_selections if s['id'] == selection_id)
    print(f"  ✓ Store Manager sees order: {target_sel['student_name']} ({target_sel['student_class']}) - {target_sel['product_name']} [Status: {target_sel['status']}]")

    # Update status to Processing then Delivered
    res = client.patch(f'/api/store/admin/toy-selections/{selection_id}/status', json={'status': 'Delivered'}, headers=store_headers)
    assert res.status_code == 200, f"Expected 200 on status update, got {res.status_code}"
    assert res.get_json().get('new_status') == 'Delivered'
    print(f"  ✓ Status updated to 'Delivered' for selection {selection_id}")

    # Clean up test product
    del_res = client.delete(f'/api/store/admin/products/{prod_id}', headers=store_headers)
    assert del_res.status_code == 200, f"Expected 200 on product delete, got {del_res.status_code}"
    print(f"  ✓ Cleaned up test product {prod_id}")

    # -------------------------------------------------------------
    # 6. CRITICAL PRIVACY & CROSS-ROLE SECURITY CHECKS (403 FORBIDDEN)
    # -------------------------------------------------------------
    print("\n[TEST 6] Strict Role Isolation & Privacy Verification (403 Forbidden):")
    
    # Store Manager ATTEMPTS to view student academic list
    res = client.get('/api/students', headers=store_headers)
    assert res.status_code == 403, f"CRITICAL: Store Manager must get 403 on /api/students, got {res.status_code}"
    print("  ✓ PRIVACY: Store Manager CANNOT access student academic records (/api/students) -> 403 Forbidden")

    # Store Manager ATTEMPTS to view teacher dashboard stats
    res = client.get('/api/teacher/stats', headers=store_headers)
    assert res.status_code == 403, f"CRITICAL: Store Manager must get 403 on /api/teacher/stats, got {res.status_code}"
    print("  ✓ PRIVACY: Store Manager CANNOT access teacher dashboard (/api/teacher/stats) -> 403 Forbidden")

    # Store Manager ATTEMPTS to view parent profile
    res = client.get('/api/parents/profile', headers=store_headers)
    assert res.status_code == 403, f"CRITICAL: Store Manager must get 403 on /api/parents/profile, got {res.status_code}"
    print("  ✓ PRIVACY: Store Manager CANNOT access parent profiles (/api/parents/profile) -> 403 Forbidden")

    # Parent ATTEMPTS to create or modify store products
    res = client.post('/api/store/admin/products', json={'name': 'Hacked Toy'}, headers=parent_headers)
    assert res.status_code == 403, f"CRITICAL: Parent must get 403 on admin product creation, got {res.status_code}"
    print("  ✓ SECURITY: Parent CANNOT add store products (/api/store/admin/products) -> 403 Forbidden")

    # Parent ATTEMPTS to update stock
    res = client.patch('/api/store/admin/products/1/stock', json={'stock': 9999}, headers=parent_headers)
    assert res.status_code == 403, f"CRITICAL: Parent must get 403 on stock updates, got {res.status_code}"
    print("  ✓ SECURITY: Parent CANNOT update product stock -> 403 Forbidden")

    # Parent ATTEMPTS to view all toy selections
    res = client.get('/api/store/admin/toy-selections', headers=parent_headers)
    assert res.status_code == 403, f"CRITICAL: Parent must get 403 on admin toy selections, got {res.status_code}"
    print("  ✓ PRIVACY: Parent CANNOT view all school toy selections -> 403 Forbidden")

    print("\n=================================================================")
    print("  ✨ ALL STORE ADMIN & PRIVACY SECURITY TESTS PASSED (100%)! ✨  ")
    print("=================================================================")

if __name__ == '__main__':
    test_store_admin_and_toy_selection_security()
