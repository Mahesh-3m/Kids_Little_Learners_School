from database.db import fetch_all, fetch_one, execute_query

class GameModel:
    @staticmethod
    def get_all():
        query = "SELECT * FROM games ORDER BY id ASC"
        return fetch_all(query)

    @staticmethod
    def get_by_id(game_id):
        query = "SELECT * FROM games WHERE id = %s"
        return fetch_one(query, (game_id,))

    @staticmethod
    def record_completion(student_id, game_id, stars_earned=3):
        # Record completion
        insert_query = """
            INSERT INTO game_completions (student_id, game_id, stars_earned)
            VALUES (%s, %s, %s)
        """
        execute_query(insert_query, (student_id, game_id, stars_earned))
        
        # Get game details to know category
        game = GameModel.get_by_id(game_id)
        if game:
            category = game.get('category')
            # Increase category progress by 20% (up to 100%)
            cat_progress_query = """
                INSERT INTO progress (student_id, category, progress_percentage)
                VALUES (%s, %s, 40)
                ON DUPLICATE KEY UPDATE 
                progress_percentage = LEAST(100, progress_percentage + 20)
            """
            execute_query(cat_progress_query, (student_id, category))
            
            # Also increase 'Games' overall progress
            games_progress_query = """
                INSERT INTO progress (student_id, category, progress_percentage)
                VALUES (%s, 'Games', 40)
                ON DUPLICATE KEY UPDATE 
                progress_percentage = LEAST(100, progress_percentage + 15)
            """
            execute_query(games_progress_query, (student_id,))

        return {
            "student_id": student_id,
            "game_id": game_id,
            "stars_earned": stars_earned,
            "message": "Game completion saved successfully!"
        }

    @staticmethod
    def get_student_completions(student_id):
        query = """
            SELECT gc.*, g.game_name, g.category, g.icon
            FROM game_completions gc
            JOIN games g ON gc.game_id = g.id
            WHERE gc.student_id = %s
            ORDER BY gc.completed_at DESC
        """
        return fetch_all(query, (student_id,))
