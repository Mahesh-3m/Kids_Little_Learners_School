import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import ParentNavbar from './components/ParentNavbar';
import Footer from './components/Footer';
import ParentProtectedRoute from './components/ParentProtectedRoute';

// Admin / Public Pages
import Home from './pages/Home';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import StudentDetails from './pages/StudentDetails';
import Classes from './pages/Classes';
import Games from './pages/Games';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Progress from './pages/Progress';

// Parent & Auth Pages
import ParentLogin from './pages/ParentLogin';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import ParentChildren from './pages/ParentChildren';
import ParentChildDetails from './pages/ParentChildDetails';
import ParentActivities from './pages/ParentActivities';
import ParentResults from './pages/ParentResults';
import ParentProgress from './pages/ParentProgress';
import ParentAchievements from './pages/ParentAchievements';
import ParentProfile from './pages/ParentProfile';

// Global Styles
import './css/global.css';

function DynamicNavbar() {
  const location = useLocation();
  const authRoutes = ['/parent/login', '/parent/register', '/login', '/register'];
  const isParentSection = location.pathname.startsWith('/parent') && !authRoutes.includes(location.pathname);
  
  if (isParentSection) {
    return <ParentNavbar />;
  }
  return <Navbar />;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <DynamicNavbar />
        <main className="main-content">
          <Routes>
            {/* Public / School Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/:id" element={<StudentDetails />} />

            {/* Classes Routes */}
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<Classes />} />

            {/* Learning Modules */}
            <Route path="/games" element={<Games />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/progress" element={<Progress />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<ParentLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/parent/login" element={<ParentLogin />} />
            <Route path="/parent/register" element={<Register />} />
            <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />

            {/* Parent Protected Routes */}
            <Route element={<ParentProtectedRoute />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/children" element={<ParentChildren />} />
              <Route path="/parent/children/:id" element={<ParentChildDetails />} />
              <Route path="/parent/activities" element={<ParentActivities />} />
              <Route path="/parent/activities/:id" element={<ParentActivities />} />
              <Route path="/parent/results" element={<ParentResults />} />
              <Route path="/parent/results/:id" element={<ParentResults />} />
              <Route path="/parent/progress" element={<ParentProgress />} />
              <Route path="/parent/progress/:id" element={<ParentProgress />} />
              <Route path="/parent/achievements" element={<ParentAchievements />} />
              <Route path="/parent/achievements/:id" element={<ParentAchievements />} />
              <Route path="/parent/profile" element={<ParentProfile />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
