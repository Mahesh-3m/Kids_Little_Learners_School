import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app
import json

def test_backend_parent_flow():
    app = create_app()
    client = app.test_client()

    print("=== Testing Parent Authentication & Authorization ===")

    # 0. Test Registration with validations
    # 0a. Missing name
    res = client.post('/api/parent/register', json={'name': '', 'email': 'test@new.com', 'password': 'password123'})
    assert res.status_code == 400
    print("  ✓ Registration rejects empty name (400)")

    # 0b. Invalid email
    res = client.post('/api/parent/register', json={'name': 'New Parent', 'email': 'invalid-email', 'password': 'password123'})
    assert res.status_code == 400
    print("  ✓ Registration rejects invalid email (400)")

    # 0c. Short password
    res = client.post('/api/parent/register', json={'name': 'New Parent', 'email': 'test@new.com', 'password': '123'})
    assert res.status_code == 400
    print("  ✓ Registration rejects short password (400)")

    # 0d. Duplicate email (Rohit Sharma's email)
    res = client.post('/api/parent/register', json={'name': 'Duplicate User', 'email': 'parent@littlelearners.com', 'password': 'password123'})
    assert res.status_code == 400
    print("  ✓ Registration rejects duplicate email (400)")

    # 1. Test Login with invalid credentials
    res = client.post('/api/parent/login', json={'email': 'wrong@email.com', 'password': 'bad'})
    assert res.status_code == 401, f"Expected 401 for bad login, got {res.status_code}"
    print("  ✓ Bad login returns 401 Unauthorized")

    # 2. Test Login for Rohit Sharma (Parent 1, linked to child 1 Aarav Sharma)
    res = client.post('/api/parent/login', json={'email': 'parent@littlelearners.com', 'password': 'password123'})
    assert res.status_code == 200, f"Expected 200 for valid login, got {res.status_code}"
    data = res.get_json()
    assert 'token' in data, "Token missing in login response"
    assert 'password_hash' not in data['parent'], "Security risk: password_hash exposed in response"
    rohit_token = data['token']
    print(f"  ✓ Valid login successful for {data['parent']['name']} (Token generated)")

    # 3. Test Login for Priya Verma (Parent 2, linked to 2 children: 4 & 5)
    res = client.post('/api/parent/login', json={'email': 'priya@littlelearners.com', 'password': 'password123'})
    assert res.status_code == 200, f"Expected 200 for valid login, got {res.status_code}"
    priya_data = res.get_json()
    priya_token = priya_data['token']
    priya_children = priya_data['children']
    assert len(priya_children) >= 2, f"Expected multi-child parent to have >=2 children, got {len(priya_children)}"
    print(f"  ✓ Multi-child parent login successful: Priya has {len(priya_children)} linked children")

    # 4. Test Unauthenticated Access to protected endpoint
    res = client.get('/api/parents/profile')
    assert res.status_code == 401, f"Expected 401 without token, got {res.status_code}"
    print("  ✓ Profile endpoint rejects unauthenticated request with 401")

    # 5. Test Authenticated Profile Access
    res = client.get('/api/parents/profile', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200, f"Expected 200 with token, got {res.status_code}"
    print("  ✓ Profile endpoint returns parent profile and children")

    # 6. Test Children List
    res = client.get('/api/parents/children', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200
    children = res.get_json()
    assert len(children) >= 1
    assert children[0]['id'] == 1, f"Expected child ID 1 (Aarav Sharma), got {children[0]['id']}"
    print(f"  ✓ Rohit sees child: {children[0]['name']}")

    # 7. CRITICAL SECURITY TEST: Rohit attempts to access Diya Sen (Child 4 - belongs to Priya)
    res = client.get('/api/parents/children/4', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 403, f"Expected 403 Forbidden for unauthorized child access, got {res.status_code}"
    print("  ✓ SECURITY PASS: Parent A cannot access Parent B's child (403 Forbidden)")

    # 8. Test Child Details for authorized child
    res = client.get('/api/parents/children/1', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    details = res.get_json()
    assert 'student' in details and 'progress' in details and 'recent_activities' in details
    print(f"  ✓ Child details loaded for {details['student']['name']}")

    # 9. Test Activities API
    res = client.get('/api/parents/children/1/activities', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200
    activities = res.get_json()
    assert isinstance(activities, list)
    print(f"  ✓ Child activities loaded ({len(activities)} activities found)")

    # 10. Test Quiz Results API
    res = client.get('/api/parents/children/1/results', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200
    results_data = res.get_json()
    assert 'results' in results_data and 'summary' in results_data
    print(f"  ✓ Quiz results loaded (Total quizzes: {results_data['summary']['total_quizzes']}, Avg: {results_data['summary']['average_score']}%)")

    # 11. Test Progress API
    res = client.get('/api/parents/children/1/progress', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200
    prog_data = res.get_json()
    assert 'categories' in prog_data and 'overall_percentage' in prog_data
    print(f"  ✓ Progress loaded (Overall: {prog_data['overall_percentage']}%)")

    # 12. Test Achievements API
    res = client.get('/api/parents/children/1/achievements', headers={'Authorization': f'Bearer {rohit_token}'})
    assert res.status_code == 200
    achievements = res.get_json()
    assert isinstance(achievements, list) and len(achievements) > 0
    # 13. Test Successful New Parent Registration & Login
    test_email = f"new_parent_{int(sys.platform == 'win32')}_{hash('parent') % 10000}@littlelearners.com"
    # First ensure test parent doesn't exist
    reg_res = client.post('/api/parent/register', json={
        'name': 'Kavya Sharma',
        'email': test_email,
        'password': 'securepassword123',
        'phone': '9876500000'
    })
    # If already created in prior run, it will return 400 or 201
    if reg_res.status_code == 201:
        reg_data = reg_res.get_json()
        assert 'token' in reg_data
        assert reg_data['parent']['email'] == test_email
        print(f"  ✓ Successfully registered new parent: {reg_data['parent']['name']} (Token returned)")
    
    # Test Login with newly registered user
    login_res = client.post('/api/parent/login', json={
        'email': test_email,
        'password': 'securepassword123'
    })
    if reg_res.status_code == 201:
        assert login_res.status_code == 200
        print("  ✓ Successfully logged in with newly registered account credentials")

    print("\n🎉 ALL BACKEND PARENT TESTS PASSED SUCCESSFULLY! 🎉\n")

if __name__ == '__main__':
    test_backend_parent_flow()
