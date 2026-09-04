import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app
import json

def test_full_security():
    app = create_app()
    client = app.test_client()

    print("=================================================================")
    print("      LITTLE LEARNERS - FULL SECURITY & AUTHORIZATION TESTS      ")
    print("=================================================================")

    # -------------------------------------------------------------
    # 1. PUBLIC TESTS: Public endpoints remain accessible
    # -------------------------------------------------------------
    print("\n[TEST 1] Public Learning Content Access:")
    res = client.get('/api/games')
    assert res.status_code == 200, f"Expected 200 for public games, got {res.status_code}"
    print("  ✓ Public user can access games (200)")

    res = client.get('/api/quiz')
    assert res.status_code == 200, f"Expected 200 for public quiz, got {res.status_code}"
    print("  ✓ Public user can access quizzes (200)")

    res = client.get('/api/classes')
    assert res.status_code == 200, f"Expected 200 for public classes, got {res.status_code}"
    print("  ✓ Public user can access classes (200)")

    res = client.get('/api/results')
    assert res.status_code == 200, f"Expected 200 for public results, got {res.status_code}"
    print("  ✓ Public user can access results (200)")

    # -------------------------------------------------------------
    # 2. UNAUTHENTICATED PROTECTION TESTS: Cannot modify or view student data
    # -------------------------------------------------------------
    print("\n[TEST 2] Unauthenticated Protection on Student Management APIs:")
    res = client.get('/api/students')
    assert res.status_code == 401, f"Expected 401 for unauthenticated GET /api/students, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot view students (401)")

    res = client.get('/api/students/1')
    assert res.status_code == 401, f"Expected 401 for unauthenticated GET /api/students/1, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot view student profile (401)")

    res = client.post('/api/students', json={'name': 'Hacker', 'class_name': 'Nursery'})
    assert res.status_code == 401, f"Expected 401 for unauthenticated POST /api/students, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot add student (401)")

    res = client.put('/api/students/1', json={'name': 'Hacker'})
    assert res.status_code == 401, f"Expected 401 for unauthenticated PUT /api/students/1, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot edit student (401)")

    res = client.delete('/api/students/1')
    assert res.status_code == 401, f"Expected 401 for unauthenticated DELETE /api/students/1, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot delete student (401)")

    res = client.get('/api/store/products')
    assert res.status_code == 401, f"Expected 401 for unauthenticated GET /api/store/products, got {res.status_code}"
    print("  ✓ Unauthenticated user cannot access kids store (401)")

    # Invalid token test
    res = client.get('/api/students', headers={'Authorization': 'Bearer invalid-token-xyz'})
    assert res.status_code == 401, f"Expected 401 for bad token, got {res.status_code}"
    print("  ✓ Bad / malformed token returns 401 Unauthorized")

    # -------------------------------------------------------------
    # 3. TEACHER AUTHENTICATION & STUDENT MANAGEMENT
    # -------------------------------------------------------------
    print("\n[TEST 3] Teacher Authentication & Management Capabilities:")
    # Register a teacher for testing
    teacher_email = "teacher_test@littlelearners.com"
    res = client.post('/api/teacher/register', json={
        'name': 'Primary Teacher Sunita',
        'email': teacher_email,
        'password': 'password123'
    })
    # If already exists from prior run, login instead
    if res.status_code == 400 and 'already exists' in res.get_json().get('message', ''):
        res = client.post('/api/teacher/login', json={
            'email': teacher_email,
            'password': 'password123'
        })
    assert res.status_code in (200, 201), f"Teacher auth failed: {res.status_code}, {res.data}"
    teacher_token = res.get_json()['token']
    print(f"  ✓ Teacher authenticated successfully (Token generated)")

    # Teacher gets students list
    res = client.get('/api/students', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 200, f"Expected 200 for teacher GET /api/students, got {res.status_code}"
    students = res.get_json()
    assert len(students) > 0
    print(f"  ✓ Teacher can view student roster ({len(students)} students)")

    # Teacher gets stats
    res = client.get('/api/teacher/stats', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 200
    stats = res.get_json()
    assert 'total_students' in stats and 'classes' in stats
    print(f"  ✓ Teacher can view dashboard stats (Total: {stats['total_students']}, Nursery: {stats['classes']['Nursery']})")

    # Teacher creates a student
    new_stud = {
        'name': 'Security Test Child',
        'dob': '2021-05-10',
        'class_name': 'Nursery',
        'gender': 'Female',
        'parent_name': 'Test Parent',
        'phone': '9876500000',
        'address': 'School Lane'
    }
    res = client.post('/api/students', headers={'Authorization': f'Bearer {teacher_token}'}, json=new_stud)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    created_id = res.get_json()['id']
    print(f"  ✓ Teacher successfully created student (ID: {created_id})")

    # Teacher updates student
    res = client.put(f'/api/students/{created_id}', headers={'Authorization': f'Bearer {teacher_token}'}, json={
        'name': 'Security Test Child Updated',
        'dob': '2021-05-10',
        'class_name': 'LKG',
        'gender': 'Female',
        'parent_name': 'Test Parent',
        'phone': '9876500000',
        'address': 'School Lane'
    })
    assert res.status_code == 200
    print(f"  ✓ Teacher successfully updated student (Class updated to LKG)")

    # Teacher views full student academic details
    res = client.get(f'/api/students/{created_id}/details', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 200
    details = res.get_json()
    assert 'student' in details and 'progress' in details
    print("  ✓ Teacher can view full student academic portfolio (progress, results, achievements)")

    # Teacher deletes test student
    res = client.delete(f'/api/students/{created_id}', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 200
    print("  ✓ Teacher successfully deleted student")

    # -------------------------------------------------------------
    # 4. CROSS-ROLE AUTHORIZATION RESTRICTIONS (PARENT VS TEACHER)
    # -------------------------------------------------------------
    print("\n[TEST 4] Cross-Role Authorization Restrictions:")
    # Login as Parent Rohit
    res = client.post('/api/parent/login', json={'email': 'parent@littlelearners.com', 'password': 'password123'})
    assert res.status_code == 200
    parent_token = res.get_json()['token']

    # Parent attempts to add student -> MUST RETURN 403 FORBIDDEN
    res = client.post('/api/students', headers={'Authorization': f'Bearer {parent_token}'}, json=new_stud)
    assert res.status_code == 403, f"Expected 403 when parent attempts POST /api/students, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent attempting POST /api/students returns 403 Forbidden")

    # Parent attempts to update student -> MUST RETURN 403 FORBIDDEN
    res = client.put('/api/students/1', headers={'Authorization': f'Bearer {parent_token}'}, json=new_stud)
    assert res.status_code == 403, f"Expected 403 when parent attempts PUT /api/students/1, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent attempting PUT /api/students returns 403 Forbidden")

    # Parent attempts to delete student -> MUST RETURN 403 FORBIDDEN
    res = client.delete('/api/students/1', headers={'Authorization': f'Bearer {parent_token}'})
    assert res.status_code == 403, f"Expected 403 when parent attempts DELETE /api/students/1, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent attempting DELETE /api/students returns 403 Forbidden")

    # Parent attempts to view all students -> MUST RETURN 403 FORBIDDEN
    res = client.get('/api/students', headers={'Authorization': f'Bearer {parent_token}'})
    assert res.status_code == 403, f"Expected 403 when parent attempts GET /api/students, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent attempting GET /api/students returns 403 Forbidden")

    # Parent A attempts to access Parent B's child -> MUST RETURN 403 FORBIDDEN
    res = client.get('/api/parents/children/4', headers={'Authorization': f'Bearer {parent_token}'})
    assert res.status_code == 403, f"Expected 403 for unauthorized child access, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent A attempting to access Parent B's child returns 403 Forbidden")

    # Teacher attempts to access parent-only store -> MUST RETURN 403 FORBIDDEN
    res = client.get('/api/store/products', headers={'Authorization': f'Bearer {teacher_token}'})
    assert res.status_code == 403, f"Expected 403 when teacher attempts to access store, got {res.status_code}"
    print("  ✓ SECURITY PASS: Teacher attempting to access Kids Store returns 403 Forbidden")

    # -------------------------------------------------------------
    # 5. PARENT KIDS STORE ACCESS
    # -------------------------------------------------------------
    print("\n[TEST 5] Parent Access to Kids Store:")
    res = client.get('/api/store/products', headers={'Authorization': f'Bearer {parent_token}'})
    assert res.status_code == 200, f"Expected 200 for parent GET /api/store/products, got {res.status_code}"
    products = res.get_json()
    assert isinstance(products, list)
    print(f"  ✓ Authenticated parent can access Kids Store ({len(products)} products found from DB)")

    res = client.get('/api/store/products?category=books', headers={'Authorization': f'Bearer {parent_token}'})
    assert res.status_code == 200
    print("  ✓ Authenticated parent can filter store products by category (books)")

    print("\n=================================================================")
    print("    🎉 ALL SECURITY, ROLE-BASED & API TESTS PASSED 100%! 🎉     ")
    print("=================================================================\n")

if __name__ == '__main__':
    test_full_security()
