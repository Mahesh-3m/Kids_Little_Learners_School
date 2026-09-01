from werkzeug.security import generate_password_hash, check_password_hash
from database.db import fetch_all, fetch_one, execute_query
from models.student import StudentModel
from models.progress import ProgressModel, ALL_CATEGORIES, CATEGORY_ICONS
from models.result import ResultModel
from models.game import GameModel
import datetime

class ParentModel:
    @staticmethod
    def get_by_id(parent_id):
        """Fetch parent profile without password hash."""
        query = "SELECT id, name, email, phone, created_at FROM parents WHERE id = %s"
        return fetch_one(query, (parent_id,))

    @staticmethod
    def get_by_email(email):
        """Fetch parent record including password hash for auth."""
        query = "SELECT * FROM parents WHERE email = %s"
        return fetch_one(query, (email,))

    @staticmethod
    def create(name, email, password, phone=None):
        """Register a new parent."""
        hashed = generate_password_hash(password)
        query = """
            INSERT INTO parents (name, email, phone, password_hash)
            VALUES (%s, %s, %s, %s)
        """
        new_id = execute_query(query, (name, email, phone, hashed), return_lastrowid=True)
        return ParentModel.get_by_id(new_id)

    @staticmethod
    def link_student(parent_id, student_id, relationship='Parent'):
        """Link a student to a parent in students and parent_students table."""
        # Update students table
        execute_query("UPDATE students SET parent_id = %s WHERE id = %s", (parent_id, student_id))
        # Update parent_students junction table
        junction_q = """
            INSERT INTO parent_students (parent_id, student_id, relationship)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE relationship = VALUES(relationship)
        """
        execute_query(junction_q, (parent_id, student_id, relationship))
        return True

    @staticmethod
    def find_matching_students(phone=None, student_name=None):
        """Find registered students by matching phone or student name for quick linkage."""
        conditions = []
        params = []
        if phone:
            conditions.append("phone = %s")
            params.append(phone)
        if student_name:
            conditions.append("name LIKE %s")
            params.append(f"%{student_name}%")
        
        if not conditions:
            return []
        
        query = f"SELECT id, name, class_name, parent_name, phone FROM students WHERE {' OR '.join(conditions)}"
        return fetch_all(query, tuple(params))

    @staticmethod
    def update_profile(parent_id, data):
        """Update parent profile."""
        query = "UPDATE parents SET name = %s, phone = %s WHERE id = %s"
        execute_query(query, (data.get('name'), data.get('phone'), parent_id))
        return ParentModel.get_by_id(parent_id)

    @staticmethod
    def verify_child_ownership(parent_id, child_id):
        """Verify if a child belongs to the parent."""
        query = """
            SELECT s.id 
            FROM students s 
            WHERE s.id = %s 
              AND (s.parent_id = %s OR s.id IN (
                  SELECT student_id FROM parent_students WHERE parent_id = %s
              ))
        """
        res = fetch_one(query, (child_id, parent_id, parent_id))
        return bool(res)

    @staticmethod
    def get_children(parent_id):
        """Fetch all children linked to parent with quick stats."""
        query = """
            SELECT s.* 
            FROM students s
            WHERE s.parent_id = %s 
               OR s.id IN (SELECT student_id FROM parent_students WHERE parent_id = %s)
            ORDER BY s.name ASC
        """
        children = fetch_all(query, (parent_id, parent_id))
        
        # Enrich each child with stats
        for child in children:
            child_id = child['id']
            # Fetch progress summary
            prog = ProgressModel.get_by_student(child_id)
            if prog:
                child['overall_percentage'] = prog.get('overall_percentage', 0)
                child['quizzes_completed'] = prog.get('quizzes_completed', 0)
                child['games_completed'] = prog.get('games_completed', 0)
                child['stars_earned'] = prog.get('stars_earned', 0)
                child['average_quiz_score'] = prog.get('average_quiz_score', 0)
            else:
                child['overall_percentage'] = 0
                child['quizzes_completed'] = 0
                child['games_completed'] = 0
                child['stars_earned'] = 0
                child['average_quiz_score'] = 0
        return children

    @staticmethod
    def get_child_details(parent_id, child_id):
        """Get full child profile if owned by parent."""
        if not ParentModel.verify_child_ownership(parent_id, child_id):
            return None
        
        student = StudentModel.get_by_id(child_id)
        if not student:
            return None
            
        prog = ProgressModel.get_by_student(child_id)
        recent_activities = ParentModel.get_child_activities(parent_id, child_id, limit=5)
        achievements = ParentModel.get_child_achievements(parent_id, child_id)
        unlocked_achievements_count = sum(1 for a in achievements if a.get('is_unlocked'))

        return {
            'student': student,
            'progress': prog,
            'recent_activities': recent_activities,
            'achievements_count': unlocked_achievements_count,
            'total_achievements': len(achievements)
        }

    @staticmethod
    def get_child_activities(parent_id, child_id, limit=30):
        """Get chronologically aggregated activities (games & quizzes) for child."""
        if not ParentModel.verify_child_ownership(parent_id, child_id):
            return None

        # 1. Fetch game completions
        game_q = """
            SELECT gc.id, gc.stars_earned, gc.completed_at,
                   g.id AS game_id, g.game_name, g.category, g.icon
            FROM game_completions gc
            JOIN games g ON gc.game_id = g.id
            WHERE gc.student_id = %s
            ORDER BY gc.completed_at DESC
            LIMIT %s
        """
        games = fetch_all(game_q, (child_id, limit))

        # 2. Fetch quiz results
        quiz_q = """
            SELECT r.id, r.score, r.total_questions, r.percentage, r.completed_at,
                   q.id AS quiz_id, q.title AS quiz_title, q.category, q.icon
            FROM results r
            JOIN quizzes q ON r.quiz_id = q.id
            WHERE r.student_id = %s
            ORDER BY r.completed_at DESC
            LIMIT %s
        """
        quizzes = fetch_all(quiz_q, (child_id, limit))

        activities = []
        for g in games:
            activities.append({
                'id': f"game-{g['id']}",
                'type': 'game',
                'title': f"Completed {g['game_name']}",
                'subtitle': f"Earned {g.get('stars_earned', 3)} Stars ⭐",
                'category': g.get('category', 'Games'),
                'icon': g.get('icon', '🎮'),
                'stars_earned': g.get('stars_earned', 3),
                'score_text': f"{g.get('stars_earned', 3)}/3 Stars",
                'completed_at': g['completed_at']
            })

        for q in quizzes:
            activities.append({
                'id': f"quiz-{q['id']}",
                'type': 'quiz',
                'title': f"Completed {q['quiz_title']}",
                'subtitle': f"Score: {q['score']}/{q['total_questions']} ({int(round(q['percentage']))}%)",
                'category': q.get('category', 'Quiz'),
                'icon': q.get('icon', '📝'),
                'score': q['score'],
                'total_questions': q['total_questions'],
                'percentage': float(q['percentage']),
                'score_text': f"{q['score']}/{q['total_questions']}",
                'completed_at': q['completed_at']
            })

        # Sort all activities by completed_at descending
        activities.sort(key=lambda x: str(x['completed_at']), reverse=True)
        return activities[:limit]

    @staticmethod
    def get_child_results(parent_id, child_id):
        """Get all quiz results and statistics for child."""
        if not ParentModel.verify_child_ownership(parent_id, child_id):
            return None

        results = ResultModel.get_by_student(child_id)
        student = StudentModel.get_by_id(child_id)
        
        total_quizzes = len(results)
        avg_score = round(sum(float(r['percentage']) for r in results) / total_quizzes, 1) if total_quizzes > 0 else 0
        highest_score = max((float(r['percentage']) for r in results), default=0)
        passed_count = sum(1 for r in results if float(r['percentage']) >= 60.0)

        return {
            'student': student,
            'results': results,
            'summary': {
                'total_quizzes': total_quizzes,
                'average_score': avg_score,
                'highest_score': highest_score,
                'passed_count': passed_count
            }
        }

    @staticmethod
    def get_child_progress(parent_id, child_id):
        """Get detailed 7-category progress for child."""
        if not ParentModel.verify_child_ownership(parent_id, child_id):
            return None
        return ProgressModel.get_by_student(child_id)

    @staticmethod
    def get_child_achievements(parent_id, child_id):
        """Compute and return achievements for child based on real activity and results."""
        if not ParentModel.verify_child_ownership(parent_id, child_id):
            return None

        # Gather student performance data
        prog = ProgressModel.get_by_student(child_id) or {}
        categories_map = {c['category']: c['progress_percentage'] for c in prog.get('categories', [])}
        results = ResultModel.get_by_student(child_id) or []
        games = GameModel.get_student_completions(child_id) or []

        overall_pct = prog.get('overall_percentage', 0)
        quizzes_count = len(results)
        games_count = len(games)
        
        # Check specific category quiz scores
        has_perfect_score = any(float(r['percentage']) >= 100 for r in results)
        has_high_numbers = any(r.get('category') == 'Numbers' and float(r['percentage']) >= 80 for r in results) or categories_map.get('Numbers', 0) >= 50
        has_alphabet_activity = any(r.get('category') == 'Alphabet' for r in results) or any(g.get('category') == 'Alphabet' for g in games) or categories_map.get('Alphabet', 0) >= 50
        has_colors_activity = any(r.get('category') == 'Colors' for r in results) or any(g.get('category') == 'Colors' for g in games) or categories_map.get('Colors', 0) >= 50
        has_shapes_activity = any(r.get('category') == 'Shapes' for r in results) or any(g.get('category') == 'Shapes' for g in games) or categories_map.get('Shapes', 0) >= 50
        has_animals_activity = any(r.get('category') == 'Animals' for r in results) or any(g.get('category') == 'Animals' for g in games) or categories_map.get('Animals', 0) >= 50

        achievements = [
            {
                "id": "alphabet-explorer",
                "title": "Alphabet Explorer",
                "category": "Alphabet",
                "icon": "🔤",
                "badge_emoji": "🏆",
                "description": "Completed Alphabet learning activities and quizzes.",
                "criteria": "Complete alphabet game or quiz",
                "is_unlocked": has_alphabet_activity,
                "progress_pct": categories_map.get('Alphabet', 0)
            },
            {
                "id": "number-star",
                "title": "Number Star",
                "category": "Numbers",
                "icon": "🔢",
                "badge_emoji": "🌟",
                "description": "Scored highly in Numbers counting challenges & quizzes.",
                "criteria": "Score 80%+ in Numbers quiz or 50%+ progress",
                "is_unlocked": has_high_numbers,
                "progress_pct": categories_map.get('Numbers', 0)
            },
            {
                "id": "color-champion",
                "title": "Color Champion",
                "category": "Colors",
                "icon": "🎨",
                "badge_emoji": "🎨",
                "description": "Completed rainbow colors exploration and quizzes.",
                "criteria": "Complete color splash activities",
                "is_unlocked": has_colors_activity,
                "progress_pct": categories_map.get('Colors', 0)
            },
            {
                "id": "shape-master",
                "title": "Shape Master",
                "category": "Shapes",
                "icon": "🔷",
                "badge_emoji": "🔷",
                "description": "Spotted and mastered geometric shapes and patterns.",
                "criteria": "Complete shape detective game or quiz",
                "is_unlocked": has_shapes_activity,
                "progress_pct": categories_map.get('Shapes', 0)
            },
            {
                "id": "jungle-adventurer",
                "title": "Jungle Adventurer",
                "category": "Animals",
                "icon": "🦁",
                "badge_emoji": "🦁",
                "description": "Explored animal kingdom sounds, habitats, and quizzes.",
                "criteria": "Complete animal kingdom activities",
                "is_unlocked": has_animals_activity,
                "progress_pct": categories_map.get('Animals', 0)
            },
            {
                "id": "game-explorer",
                "title": "Game Explorer",
                "category": "Games",
                "icon": "🎮",
                "badge_emoji": "🎮",
                "description": "Completed multiple interactive learning games.",
                "criteria": "Play and complete at least 2 educational games",
                "is_unlocked": games_count >= 2,
                "progress_pct": min(100, int((games_count / 2) * 100))
            },
            {
                "id": "quiz-champion",
                "title": "Super Quizzer",
                "category": "Quiz",
                "icon": "📝",
                "badge_emoji": "📝",
                "description": "Completed 2 or more fun quizzes successfully.",
                "criteria": "Complete at least 2 quizzes",
                "is_unlocked": quizzes_count >= 2,
                "progress_pct": min(100, int((quizzes_count / 2) * 100))
            },
            {
                "id": "perfect-score",
                "title": "Perfect Score Hero",
                "category": "General",
                "icon": "💯",
                "badge_emoji": "⭐",
                "description": "Achieved a full 100% score on any quiz challenge.",
                "criteria": "Get 100% on any quiz",
                "is_unlocked": has_perfect_score,
                "progress_pct": 100 if has_perfect_score else 80
            },
            {
                "id": "all-round-scholar",
                "title": "Rainbow Scholar",
                "category": "Overall",
                "icon": "🌈",
                "badge_emoji": "👑",
                "description": "Reached 75% or higher in overall learning progress.",
                "criteria": "Attain 75%+ overall curriculum progress",
                "is_unlocked": overall_pct >= 75,
                "progress_pct": min(100, int(overall_pct))
            }
        ]

        return achievements
