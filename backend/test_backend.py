import sys
import os

# Set UTF-8 encoding for Windows stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
import json

def test_api():
    print("[TEST] Running Backend API Tests...")
    app = create_app()
    client = app.test_client()

    # 1. Health Check
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("[PASS] /api/health passed")

    # 2. Verify Student Security & Obtain Teacher Token
    res = client.get('/api/students')
    assert res.status_code == 401, f"Security check failed: unauthenticated /api/students should return 401, got {res.status_code}"
    print("[PASS] Unauthenticated /api/students securely rejected (401)")

    # Login / Register teacher
    teacher_email = "teacher_test@littlelearners.com"
    t_res = client.post('/api/teacher/login', json={'email': teacher_email, 'password': 'password123'})
    if t_res.status_code != 200:
        t_res = client.post('/api/teacher/register', json={'name': 'Teacher Test', 'email': teacher_email, 'password': 'password123'})
    teacher_token = t_res.get_json()['token']
    teacher_headers = {'Authorization': f'Bearer {teacher_token}'}

    # Get Students with Teacher Token
    res = client.get('/api/students', headers=teacher_headers)
    assert res.status_code == 200, f"Get students failed: {res.status_code}"
    students = json.loads(res.data)
    assert len(students) > 0, "No students returned"
    print(f"[PASS] /api/students passed with teacher auth ({len(students)} students found)")

    # 3. Add Student (POST)
    new_student_data = {
        "name": "Test Little Champ",
        "dob": "2021-01-10",
        "class_name": "Nursery",
        "gender": "Male",
        "parent_name": "Test Parent",
        "phone": "9998887776",
        "address": "123 Rainbow Street"
    }
    res = client.post('/api/students', headers=teacher_headers, json=new_student_data)
    assert res.status_code == 201, f"Create student failed: {res.status_code}, {res.data}"
    created_student = json.loads(res.data)
    created_id = created_student['id']
    print(f"[PASS] POST /api/students passed (Created ID: {created_id})")

    # 4. Get Single Student (GET)
    res = client.get(f'/api/students/{created_id}', headers=teacher_headers)
    assert res.status_code == 200, f"Get student by ID failed: {res.status_code}"
    print(f"[PASS] GET /api/students/{created_id} passed")

    # 5. Update Student (PUT)
    update_data = dict(new_student_data)
    update_data['name'] = "Test Little Champ Updated"
    update_data['class_name'] = "LKG"
    res = client.put(f'/api/students/{created_id}', headers=teacher_headers, json=update_data)
    assert res.status_code == 200, f"Update student failed: {res.status_code}"
    updated = json.loads(res.data)
    assert updated['name'] == "Test Little Champ Updated"
    assert updated['class_name'] == "LKG"
    print(f"[PASS] PUT /api/students/{created_id} passed")

    # 6. Delete Student (DELETE)
    res = client.delete(f'/api/students/{created_id}', headers=teacher_headers)
    assert res.status_code == 200, f"Delete student failed: {res.status_code}"
    print(f"[PASS] DELETE /api/students/{created_id} passed")

    # 7. Get Classes
    res = client.get('/api/classes')
    assert res.status_code == 200, f"Get classes failed: {res.status_code}"
    classes = json.loads(res.data)
    assert len(classes) == 3, f"Expected 3 classes, got {len(classes)}"
    print(f"[PASS] GET /api/classes passed ({len(classes)} classes found)")

    # 8. Get Class Students
    res = client.get(f'/api/classes/1/students')
    assert res.status_code == 200, f"Get class students failed: {res.status_code}"
    print("[PASS] GET /api/classes/1/students passed")

    # 9. Get Games
    res = client.get('/api/games')
    assert res.status_code == 200, f"Get games failed: {res.status_code}"
    games = json.loads(res.data)
    assert len(games) >= 5, f"Expected at least 5 games, got {len(games)}"
    print(f"[PASS] GET /api/games passed ({len(games)} games found)")

    # 10. Complete Game (POST)
    res = client.post('/api/games/1/complete', json={"student_id": 1, "stars_earned": 3})
    assert res.status_code == 200, f"Complete game failed: {res.status_code}"
    print("[PASS] POST /api/games/1/complete passed")

    # 11. Get Quizzes
    res = client.get('/api/quiz')
    assert res.status_code == 200, f"Get quizzes failed: {res.status_code}"
    quizzes = json.loads(res.data)
    assert len(quizzes) >= 6, f"Expected at least 6 quizzes, got {len(quizzes)}"
    print(f"[PASS] GET /api/quiz passed ({len(quizzes)} quizzes found)")

    # 12. Get Single Quiz with Questions
    res = client.get('/api/quiz/1')
    assert res.status_code == 200, f"Get quiz 1 failed: {res.status_code}"
    quiz_detail = json.loads(res.data)
    assert 'questions' in quiz_detail and len(quiz_detail['questions']) > 0, "No questions in quiz"
    print(f"[PASS] GET /api/quiz/1 passed ({len(quiz_detail['questions'])} questions)")

    # 13. Submit Quiz Result (POST)
    result_data = {
        "student_id": 1,
        "quiz_id": 1,
        "score": 5,
        "total_questions": 5,
        "percentage": 100.0
    }
    res = client.post('/api/quiz/results', json=result_data)
    assert res.status_code == 201, f"Submit quiz result failed: {res.status_code}"
    print("[PASS] POST /api/quiz/results passed")

    # 14. Get Results
    res = client.get('/api/results')
    assert res.status_code == 200, f"Get results failed: {res.status_code}"
    results = json.loads(res.data)
    assert len(results) > 0, "No results found"
    print(f"[PASS] GET /api/results passed ({len(results)} results found)")

    # 15. Get Student Progress
    res = client.get('/api/progress/student/1')
    assert res.status_code == 200, f"Get student progress failed: {res.status_code}"
    progress = json.loads(res.data)
    assert 'categories' in progress and 'overall_percentage' in progress
    print(f"[PASS] GET /api/progress/student/1 passed (Overall: {progress['overall_percentage']}%)")

    # 16. Update Student Progress
    res = client.put('/api/progress/student/1', json={"category": "Alphabet", "progress_percentage": 95})
    assert res.status_code == 200, f"Update progress failed: {res.status_code}"
    print("[PASS] PUT /api/progress/student/1 passed")

    print("\n[SUCCESS] ALL 16 BACKEND API TESTS PASSED! Little Learners API is 100% operational.")

if __name__ == '__main__':
    test_api()
