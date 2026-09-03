<<<<<<< HEAD
<<<<<<< HEAD
# Little_Learners
The main goal of Little Learners is to provide a simple, colorful, and child-friendly platform where schools can manage student information and learning activities while parents can conveniently track their children's educational activities and progress.
=======
# 🌈 LITTLE LEARNERS — Full-Stack Educational & School Management Platform

**Learn • Play • Grow** ✨

Little Learners is a full-stack web application designed for early childhood education (Nursery, LKG, UKG) and school administration. It combines full CRUD student & classroom management with interactive, colorful educational games, multi-category quizzes, real-time result tracking, and subject mastery analytics.

---

## 🚀 Technology Stack

### Frontend
- **React.js 18** (Functional Components, Hooks)
- **Vite** (Next-generation lightning-fast build tool)
- **React Router 6** (Client-side routing)
- **Custom CSS3** (Child-friendly pastel & vibrant design, bouncy responsive cards, keyframe animations)
- **Web Speech API** (`window.speechSynthesis`) & **Canvas Confetti** for interactive audio pronunciation and celebrations.

### Backend
- **Python 3**
- **Flask 3.0** & **Flask-CORS**
- **RESTful API Architecture** with modular Blueprint routing (`students`, `classes`, `games`, `quiz`, `results`, `progress`)
- **MySQL Connector Python** with thread-safe Connection Pooling (`mysql.connector.pooling.MySQLConnectionPool`)
- **Parameterized SQL Queries** for complete SQL injection prevention

### Database
- **MySQL 8.0**
- Fully normalized relational schema with foreign key constraints, `ON DELETE CASCADE`, and automated table seeding.

---

## 📁 Project Structure

```text
Kids_Little_Learners/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── dashboard_img/       # Child-friendly graphics & icons
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top header navigation
│   │   │   ├── Footer.jsx           # Footer brand & links
│   │   │   ├── StudentCard.jsx      # Card display with View/Edit/Delete
│   │   │   ├── StudentForm.jsx      # Reusable form with live validation
│   │   │   ├── QuizCard.jsx         # Quiz category item
│   │   │   ├── GameCard.jsx         # Game card item
│   │   │   └── ProgressCard.jsx     # Progress bar item
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero dashboard & quick links
│   │   │   ├── Students.jsx         # Student roster & filters
│   │   │   ├── AddStudent.jsx       # Enrollment form
│   │   │   ├── EditStudent.jsx      # Update student profile
│   │   │   ├── StudentDetails.jsx   # Student portfolio & analytics
│   │   │   ├── Classes.jsx          # Nursery, LKG, UKG divisions
│   │   │   ├── Games.jsx            # Interactive educational games
│   │   │   ├── Quiz.jsx             # Step-by-step quiz assessment
│   │   │   ├── Results.jsx          # Leaderboard & quiz history
│   │   │   └── Progress.jsx         # Subject mastery dashboard
│   │   ├── services/
│   │   │   └── api.js               # Centralized REST API client
│   │   ├── css/
│   │   │   ├── global.css
│   │   │   ├── navbar.css
│   │   │   ├── students.css
│   │   │   ├── forms.css
│   │   │   ├── games.css
│   │   │   ├── quiz.css
│   │   │   └── progress.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app.py                      # Main Flask application & CORS
│   ├── config.py                   # Environment configuration loader
│   ├── requirements.txt            # Python dependencies
│   ├── test_backend.py             # Automated API test suite
│   ├── .env                        # Local database credentials
│   ├── .env.example                # Example environment file
│   ├── .gitignore
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py                   # Connection pool & query helpers
│   ├── models/
│   │   ├── student.py              # Student CRUD logic
│   │   ├── class_model.py          # Class queries & counts
│   │   ├── game.py                 # Game & completion logic
│   │   ├── quiz.py                 # Quiz & questions logic
│   │   ├── result.py               # Result submission & retrieval
│   │   └── progress.py             # Category mastery & calculations
│   └── routes/
│       ├── students.py             # /api/students endpoints
│       ├── classes.py              # /api/classes endpoints
│       ├── games.py                # /api/games endpoints
│       ├── quiz.py                 # /api/quiz endpoints
│       ├── results.py              # /api/results endpoints
│       └── progress.py             # /api/progress endpoints
│
├── database/
│   └── little_learners.sql         # DDL Schema & pre-seeded dataset
│
└── README.md
```

---

## 🛠️ Installation & Setup Guide

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running (default port `3306`).
2. Execute the database script `database/little_learners.sql`:
   ```bash
   mysql -u root -p < database/little_learners.sql
   ```
   *This automatically creates the `little_learners` database and populates initial classrooms, sample students, 5 games, 6 quizzes with 30 questions, results, and progress records.*

### 2. Backend Setup (Flask)
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your database connection in `backend/.env`:
   ```ini
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=little_learners
   DB_PORT=3306
   FLASK_PORT=5000
   FLASK_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```
4. Run automated test suite to verify backend & DB:
   ```bash
   python test_backend.py
   ```
5. Start the Flask backend server:
   ```bash
   python app.py
   ```
   *The API will be live at `http://127.0.0.1:5000`.*

### 3. Frontend Setup (React + Vite)
1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Reference

### 👩‍🏫 Students (`/api/students`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (supports `?class_name=` and `?search=`) |
| `GET` | `/api/students/<id>` | Get student profile by ID |
| `GET` | `/api/students/class/<class_name>` | Get students in a specific class (Nursery, LKG, UKG) |
| `POST` | `/api/students` | Add new student (validates all required fields) |
| `PUT` | `/api/students/<id>` | Update student profile |
| `DELETE` | `/api/students/<id>` | Delete student and cascade associated records |

### 🏫 Classes (`/api/classes`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/classes` | Get all classes with student counts |
| `GET` | `/api/classes/<id>` | Get class details by ID |
| `GET` | `/api/classes/<id>/students` | Get class details and list of enrolled students |

### 🎮 Games (`/api/games`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/games` | Get all educational games |
| `GET` | `/api/games/<id>` | Get game details |
| `POST` | `/api/games/<id>/complete` | Record game completion & boost category progress |
| `GET` | `/api/games/student/<student_id>` | Get completed games for a student |

### 📝 Quizzes (`/api/quiz`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quiz` | Get list of all quizzes |
| `GET` | `/api/quiz/<id>` | Get quiz with full questions and multiple choice options |
| `POST` | `/api/quiz/results` | Submit quiz score & update student category progress |

### 🏆 Results (`/api/results`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/results` | Get all quiz results (supports `?student_id=`, `?category=`) |
| `GET` | `/api/results/student/<student_id>` | Get all quiz results for a specific student |

### 📊 Progress (`/api/progress`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/progress/student/<student_id>` | Get student mastery percentage across 7 categories |
| `PUT` | `/api/progress/student/<student_id>` | Manually adjust/update category progress |
| `GET` | `/api/progress/summary` | Get summary of all students' overall learning scores |

---

## 🎮 Interactive Features

1. **🔤 Alphabet Game**: Phonics letter recognition with speech synthesizer audio (`window.speechSynthesis`) and picture matching.
2. **🔢 Number Game**: Object counting with balloons, stars, and apples.
3. **🎨 Colors Game**: Rainbow color splash identification.
4. **🔷 Shapes Game**: Geometric shape recognition (Circle, Square, Triangle, Rectangle, Star).
5. **🦁 Animals Game**: Friendly wildlife sound & animal matching.
6. **📝 Quiz Engine**: Real-time scoring, cheerful confetti animations, grade badges, and automatic progress synchronization.

---

## 🧩 Troubleshooting

- **Backend Connection Error**: Ensure the Flask server is running on `http://127.0.0.1:5000` and MySQL service is active.
- **MySQL Access Denied**: Verify credentials in `backend/.env` match your MySQL root user password.
- **CORS Issue**: Flask is pre-configured with Flask-CORS to accept requests from `http://localhost:5173`.
>>>>>>> 6315d93 (Initial commit: Little Learners - Full-stack educational platform)
=======
# Kids_Little_Learners
The main goal of Little Learners is to provide a simple, colorful, and child-friendly platform where schools can manage student information and learning activities while parents can conveniently track their children's educational activities and progress.
>>>>>>> f54329e52769043b6dde5022914ae1b0f61b00ac
