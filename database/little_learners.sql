-- Little Learners Database Schema & Seed Data
-- Database: little_learners

CREATE DATABASE IF NOT EXISTS little_learners CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE little_learners;

-- 1. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    parent_id INT NULL,
    parent_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Parent Students Junction Table (Supports multi-child and flexible relations)
CREATE TABLE IF NOT EXISTS parent_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Parent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_parent_student (parent_id, student_id),
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Games Table
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🎮',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📝',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Results Table
CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Progress Table
CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    progress_percentage INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_category (student_id, category),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Game Completions Table
CREATE TABLE IF NOT EXISTS game_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    game_id INT NOT NULL,
    stars_earned INT DEFAULT 3,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- SEED DATA
-- -------------------------------------------------------------

-- Insert Classes
INSERT INTO classes (class_name, description) VALUES
('Nursery', 'Early childhood playful learning, rhymes, sensory & motor development.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO classes (class_name, description) VALUES
('LKG', 'Lower Kindergarten: Basic alphabets, phonics, counting numbers 1-20, colors & shapes.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO classes (class_name, description) VALUES
('UKG', 'Upper Kindergarten: Word formation, numbers 1-50, basic addition, general awareness.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert Parents
-- Passwords are hashed with Werkzeug pbkdf2/scrypt for 'password123'
INSERT INTO parents (id, name, email, phone, password_hash) VALUES
(1, 'Rohit Sharma', 'parent@littlelearners.com', '9876543210', 'scrypt:32768:8:1$Y2lR3rR9X2k5vP3M$d325785002b8d003b5443c7bfe9e62319ef9108b53df4ff8890ae15df6ee4e3089ef233c70621ee9cf9e6aafe82c5f1a5bb0ef2b77a7b8e1fc16d3f23a6d36e2'),
(2, 'Priya Verma', 'priya@littlelearners.com', '9811223344', 'scrypt:32768:8:1$Y2lR3rR9X2k5vP3M$d325785002b8d003b5443c7bfe9e62319ef9108b53df4ff8890ae15df6ee4e3089ef233c70621ee9cf9e6aafe82c5f1a5bb0ef2b77a7b8e1fc16d3f23a6d36e2'),
(3, 'Suresh Patel', 'suresh@littlelearners.com', '9812345678', 'scrypt:32768:8:1$Y2lR3rR9X2k5vP3M$d325785002b8d003b5443c7bfe9e62319ef9108b53df4ff8890ae15df6ee4e3089ef233c70621ee9cf9e6aafe82c5f1a5bb0ef2b77a7b8e1fc16d3f23a6d36e2'),
(4, 'Kishore Rao', 'kishore@littlelearners.com', '9988776655', 'scrypt:32768:8:1$Y2lR3rR9X2k5vP3M$d325785002b8d003b5443c7bfe9e62319ef9108b53df4ff8890ae15df6ee4e3089ef233c70621ee9cf9e6aafe82c5f1a5bb0ef2b77a7b8e1fc16d3f23a6d36e2')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Students
INSERT INTO students (id, name, dob, class_name, gender, parent_id, parent_name, phone, address) VALUES
(1, 'Aarav Sharma', '2021-04-15', 'Nursery', 'Male', 1, 'Rohit Sharma', '9876543210', 'Plot 12, Jubilee Hills, Hyderabad'),
(2, 'Ananya Patel', '2020-08-22', 'LKG', 'Female', 3, 'Suresh Patel', '9812345678', 'Flat 304, Green Meadows, Bengaluru'),
(3, 'Vivaan Rao', '2019-11-05', 'UKG', 'Male', 4, 'Kishore Rao', '9988776655', 'House 56, Banjara Hills, Hyderabad'),
(4, 'Diya Sen', '2020-02-14', 'LKG', 'Female', 2, 'Priya Verma', '9811223344', 'Apt 12B, Lake View, Pune'),
(5, 'Kabir Mehta', '2021-06-30', 'Nursery', 'Male', 2, 'Priya Verma', '9811223344', 'Villa 8, Sector 14, Gurugram')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Parent-Student Junction Records
INSERT INTO parent_students (parent_id, student_id, relationship) VALUES
(1, 1, 'Parent'),
(2, 4, 'Parent'),
(2, 5, 'Parent'),
(3, 2, 'Parent'),
(4, 3, 'Parent')
ON DUPLICATE KEY UPDATE relationship=VALUES(relationship);

-- Insert Games
INSERT INTO games (id, game_name, category, description, icon) VALUES
(1, 'Alphabet Adventure', 'Alphabet', 'Fun phonics, letter recognition and picture matching for little learners.', '🔤'),
(2, 'Number Safari', 'Numbers', 'Count cheerful animals, balloons and stars to learn numbers 1 to 10.', '🔢'),
(3, 'Rainbow Color Splash', 'Colors', 'Identify vibrant colors and match them to juicy fruits and everyday items.', '🎨'),
(4, 'Shape Detective', 'Shapes', 'Discover Circles, Squares, Triangles, and Rectangles in funny daily objects.', '🔷'),
(5, 'Jungle Friends', 'Animals', 'Meet friendly wild and domestic animals and learn their names and sounds.', '🦁')
ON DUPLICATE KEY UPDATE game_name=VALUES(game_name), description=VALUES(description);

-- Insert Quizzes
INSERT INTO quizzes (id, title, category, description, icon) VALUES
(1, 'Alphabet Fun Quiz', 'Alphabet', 'Test your knowledge of ABCs, vowels, and simple letter sequencing.', '🔤'),
(2, 'Numbers & Counting Quiz', 'Numbers', 'Fun counting challenges and number sequencing questions for kids.', '🔢'),
(3, 'Colors of the Rainbow', 'Colors', 'Identify bright colors and find out which color belongs to what item!', '🎨'),
(4, 'Shapes & Patterns Quiz', 'Shapes', 'Can you spot the circle, square, triangle, and rectangle?', '🔷'),
(5, 'Animal Kingdom Quiz', 'Animals', 'Discover cute animal names, sounds, and their favorite foods.', '🦁'),
(6, 'Smart Little Champ Quiz', 'General Learning', 'A mix of fun general knowledge and sensory questions for little champions.', '🌟')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- Insert Questions for Quizzes
-- Quiz 1: Alphabet Fun Quiz
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(1, 'Which letter comes after A in the alphabet?', 'B', 'C', 'D', 'E', 'B'),
(1, 'Which letter is for "Apple"?', 'B', 'M', 'A', 'Z', 'A'),
(1, 'Which letter comes before D?', 'A', 'B', 'C', 'E', 'C'),
(1, 'What is the last letter of the alphabet?', 'X', 'Y', 'W', 'Z', 'Z'),
(1, 'Which word starts with the letter "C"?', 'Dog', 'Cat', 'Ball', 'Elephant', 'Cat');

-- Quiz 2: Numbers & Counting Quiz
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(2, 'How many suns are there in our sky during the day?', '1', '2', '3', '5', '1'),
(2, 'Which number comes right after 4?', '3', '5', '6', '7', '5'),
(2, 'How many fingers do you have on one hand?', '4', '6', '5', '10', '5'),
(2, 'What is 1 + 1?', '1', '2', '3', '4', '2'),
(2, 'Which number is smaller: 2 or 8?', '8', '2', 'Both same', 'None', '2');

-- Quiz 3: Colors of the Rainbow
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(3, 'What color is a ripe red strawberry?', 'Red', 'Blue', 'Green', 'Yellow', 'Red'),
(3, 'What color is the bright sun in the morning sky?', 'Purple', 'Yellow', 'Black', 'Pink', 'Yellow'),
(3, 'What color are fresh green leaves on trees?', 'Red', 'Green', 'Orange', 'White', 'Green'),
(3, 'What color is the clear sky on a sunny day?', 'Blue', 'Brown', 'Grey', 'Yellow', 'Blue'),
(3, 'Which color do you get by mixing Red and Yellow?', 'Orange', 'Blue', 'Black', 'White', 'Orange');

-- Quiz 4: Shapes & Patterns Quiz
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(4, 'What shape is a round football or a clock?', 'Square', 'Circle', 'Triangle', 'Rectangle', 'Circle'),
(4, 'How many corners does a triangle have?', '2', '3', '4', '5', '3'),
(4, 'What shape has 4 equal straight sides?', 'Square', 'Circle', 'Oval', 'Cylinder', 'Square'),
(4, 'What shape is a slice of pizza?', 'Triangle', 'Square', 'Circle', 'Cube', 'Triangle'),
(4, 'What shape looks like an elongated box or a door?', 'Rectangle', 'Circle', 'Star', 'Diamond', 'Rectangle');

-- Quiz 5: Animal Kingdom Quiz
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(5, 'Who is known as the "King of the Jungle"?', 'Tiger', 'Lion', 'Elephant', 'Monkey', 'Lion'),
(5, 'Which cute animal says "Meow Meow"?', 'Dog', 'Cat', 'Cow', 'Duck', 'Cat'),
(5, 'Which animal has a very long trunk and big ears?', 'Elephant', 'Giraffe', 'Horse', 'Rabbit', 'Elephant'),
(5, 'Which animal gives us fresh healthy milk and says "Moo"?', 'Cow', 'Lion', 'Frog', 'Bear', 'Cow'),
(5, 'Which animal loves to eat sweet yellow bananas and swings on trees?', 'Monkey', 'Fish', 'Penguin', 'Camel', 'Monkey');

-- Quiz 6: General Learning Quiz
INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
(6, 'We see with our...', 'Ears', 'Nose', 'Eyes', 'Hands', 'Eyes'),
(6, 'We use our mouth to...', 'Listen', 'Eat and Speak', 'Walk', 'See', 'Eat and Speak'),
(6, 'What do you say when someone gives you a gift?', 'Sorry', 'Thank You', 'Goodbye', 'No', 'Thank You'),
(6, 'Which is a healthy fruit?', 'Apple', 'Plastic cup', 'Shoe', 'Rock', 'Apple'),
(6, 'When do we see stars and the glowing moon in the sky?', 'Morning', 'Afternoon', 'Night', 'Noon', 'Night');

-- Insert Initial Results
INSERT INTO results (student_id, quiz_id, score, total_questions, percentage) VALUES
(1, 1, 4, 5, 80.00),
(2, 2, 5, 5, 100.00),
(2, 3, 4, 5, 80.00),
(3, 4, 4, 5, 80.00),
(3, 5, 5, 5, 100.00),
(4, 1, 3, 5, 60.00),
(4, 3, 5, 5, 100.00);

-- Insert Initial Progress
INSERT INTO progress (student_id, category, progress_percentage) VALUES
(1, 'Alphabet', 80),
(1, 'Numbers', 60),
(1, 'Colors', 70),
(1, 'Shapes', 50),
(1, 'Animals', 90),
(1, 'Quiz', 80),
(1, 'Games', 75),
(2, 'Alphabet', 90),
(2, 'Numbers', 100),
(2, 'Colors', 85),
(2, 'Shapes', 80),
(2, 'Animals', 95),
(2, 'Quiz', 90),
(2, 'Games', 85),
(3, 'Alphabet', 95),
(3, 'Numbers', 90),
(3, 'Colors', 90),
(3, 'Shapes', 85),
(3, 'Animals', 100),
(3, 'Quiz', 90),
(3, 'Games', 95)
ON DUPLICATE KEY UPDATE progress_percentage=VALUES(progress_percentage);

-- Insert Initial Game Completions
INSERT INTO game_completions (student_id, game_id, stars_earned) VALUES
(1, 1, 3),
(1, 2, 2),
(2, 1, 3),
(2, 2, 3),
(2, 3, 3),
(3, 4, 3),
(3, 5, 3);
