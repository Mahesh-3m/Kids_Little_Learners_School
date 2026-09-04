import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app

def run_tests():
    app = create_app()
    client = app.test_client()

    print("=================================================================")
    print("      STUDENT ID & STORE DETAILS DATABASE VERIFICATION           ")
    print("=================================================================")

    # 1. Test parent login & linking with student_id 'LL-001'
    res = client.post('/api/parent/login', json={'email': 'parent@littlelearners.com', 'password': 'password123'})
    assert res.status_code == 200, f"Parent login failed: {res.status_code}"
    parent_token = res.get_json()['token']

    # Link child using student_id format 'LL-001'
    link_res = client.post('/api/parents/link-child',
        headers={'Authorization': f'Bearer {parent_token}'},
        json={'student_id': 'LL-001'})
    assert link_res.status_code == 200, f"Link failed: {link_res.get_json()}"
    child_name = link_res.get_json()['child']['name']
    print(f"  ✓ Parent linked child with student_id 'LL-001': {child_name}")

    # Check that parent children includes student_id
    c_res = client.get('/api/parents/children', headers={'Authorization': f'Bearer {parent_token}'})
    children = c_res.get_json()
    assert len(children) > 0
    for c in children:
        assert 'student_id' in c and c['student_id'] is not None
        print(f"  ✓ Parent child in response: {c['name']} (Student ID: {c['student_id']})")

    # 2. Test Store Details Public GET
    sd_res = client.get('/api/store/details')
    assert sd_res.status_code == 200
    store_data = sd_res.get_json()
    print(f"  ✓ GET /api/store/details: {store_data.get('store_name')}")
    assert 'store_name' in store_data and 'operating_hours' in store_data and 'delivery_policy' in store_data

    # 3. Test Store Manager updating store details
    sm_res = client.post('/api/store/login', json={'email': 'manager@littlelearners.com', 'password': 'Manager@123'})
    assert sm_res.status_code == 200, f"Store manager login failed: {sm_res.get_json()}"
    sm_token = sm_res.get_json()['token']

    update_payload = {
        'store_name': 'Little Learners Campus Kids Store',
        'manager_name': 'Alex Store Manager',
        'email': 'store@littlelearners.com',
        'phone': '+1 (555) 019-2834',
        'location': 'Early Learning Wing A - Ground Floor, Room 102',
        'operating_hours': 'Mon - Fri: 8:00 AM - 4:00 PM',
        'delivery_policy': 'All student toys, books, and craft kits are hand-delivered to student homerooms daily by 2:30 PM.',
        'storage_capacity': 'Full 4-Department Warehouse: Books, Stationery, Sensory Toys, and Uniform Dresses',
        'description': 'Official school educational supplies and toy store.',
        'announcement': '🎉 New picture storybooks and wooden puzzles arrived today!',
        'is_open': 1
    }

    update_res = client.put('/api/store/admin/details',
        headers={'Authorization': f'Bearer {sm_token}'},
        json=update_payload)
    assert update_res.status_code == 200, f"Update failed: {update_res.get_json()}"
    print(f"  ✓ Store Manager updated store details: {update_res.get_json()['message']}")

    # Verify updated details returned in GET /api/store/details
    check_res = client.get('/api/store/details')
    details = check_res.get_json()
    assert details['location'] == 'Early Learning Wing A - Ground Floor, Room 102'
    assert 'New picture storybooks' in details['announcement']
    print("  ✓ Verified updated details stored & retrieved from MySQL database!")

    # 4. Teacher search by student_id
    t_res = client.post('/api/teacher/login', json={'email': 'teacher_test@littlelearners.com', 'password': 'password123'})
    assert t_res.status_code == 200
    t_token = t_res.get_json()['token']

    search_res = client.get('/api/students?search=LL-005', headers={'Authorization': f'Bearer {t_token}'})
    assert search_res.status_code == 200
    matching = search_res.get_json()
    assert len(matching) == 1 and matching[0]['name'] == 'Kabir Mehta'
    print(f"  ✓ Teacher search by student_id 'LL-005' returned {matching[0]['name']} (ID: {matching[0]['student_id']})")

    # 5. Teacher store access test (teacher updating store details)
    t_update_res = client.put('/api/store/admin/details',
        headers={'Authorization': f'Bearer {t_token}'},
        json={**update_payload, 'announcement': '✨ Teacher-coordinated store supplies updated!'})
    assert t_update_res.status_code == 200
    print("  ✓ Teacher has store manager privileges and can update store details as requested!")

    print("\n=================================================================")
    print("      🎉 ALL ENHANCEMENT VERIFICATION TESTS PASSED 100%!        ")
    print("=================================================================")

if __name__ == '__main__':
    run_tests()
