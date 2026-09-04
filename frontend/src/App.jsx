import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import ParentNavbar from './components/ParentNavbar';
import TeacherNavbar from './components/TeacherNavbar';
import StoreAdminNavbar from './components/StoreAdminNavbar';
import Footer from './components/Footer';
import ParentProtectedRoute from './components/ParentProtectedRoute';
import TeacherProtectedRoute from './components/TeacherProtectedRoute';
import StoreAdminProtectedRoute from './components/StoreAdminProtectedRoute';

// Public & School Learning Pages
import Home from './pages/Home';
import Classes from './pages/Classes';
import Games from './pages/Games';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Progress from './pages/Progress';

// Teacher Pages
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/TeacherStudents';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import StudentDetails from './pages/StudentDetails';

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

// Store Admin Pages (Role 4)
import StoreAdminLogin from './pages/StoreAdminLogin';
import StoreAdminDashboard from './pages/StoreAdminDashboard';
import StoreAdminProducts from './pages/StoreAdminProducts';
import StoreAdminAddProduct from './pages/StoreAdminAddProduct';
import StoreAdminToySelections from './pages/StoreAdminToySelections';

// Kids Store Pages (Parent Only)
import KidsStore from './pages/KidsStore';
import Books from './pages/Books';
import Stationery from './pages/Stationery';
import Toys from './pages/Toys';
import KidsDresses from './pages/KidsDresses';
import ProductDetails from './pages/ProductDetails';

// Global Styles
import './css/global.css';

function DynamicNavbar() {
  const location = useLocation();
  const parentAuthRoutes = ['/parent/login', '/parent/register', '/login', '/register'];
  const teacherAuthRoutes = ['/teacher/login', '/teacher/register'];
  const storeAuthRoutes = ['/store-admin/login'];

  const isTeacherSection = location.pathname.startsWith('/teacher') && !teacherAuthRoutes.includes(location.pathname);
  const isParentSection = location.pathname.startsWith('/parent') && !parentAuthRoutes.includes(location.pathname);
  const isStoreSection = location.pathname.startsWith('/store-admin') && !storeAuthRoutes.includes(location.pathname);

  if (isTeacherSection) {
    return <TeacherNavbar />;
  }
  if (isParentSection) {
    return <ParentNavbar />;
  }
  if (isStoreSection) {
    return <StoreAdminNavbar />;
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

            {/* Public Learning Modules */}
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<Classes />} />
            <Route path="/games" element={<Games />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/progress" element={<Progress />} />

            {/* Teacher Authentication Routes */}
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherLogin />} />
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />

            {/* Teacher Protected Routes */}
            <Route element={<TeacherProtectedRoute />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
              <Route path="/teacher/students/add" element={<AddStudent />} />
              <Route path="/teacher/students/edit/:id" element={<EditStudent />} />
              <Route path="/teacher/students/:id" element={<StudentDetails />} />

              {/* Legacy / Direct student routes protected under Teacher role */}
              <Route path="/students" element={<Navigate to="/teacher/students" replace />} />
              <Route path="/students/add" element={<Navigate to="/teacher/students/add" replace />} />
              <Route path="/students/edit/:id" element={<EditStudent />} />
              <Route path="/students/:id" element={<StudentDetails />} />
            </Route>

            {/* Parent Authentication Routes */}
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

              {/* Parent Exclusive Kids Store */}
              <Route path="/parent/store" element={<KidsStore />} />
              <Route path="/parent/store/books" element={<Books />} />
              <Route path="/parent/store/stationery" element={<Stationery />} />
              <Route path="/parent/store/toys" element={<Toys />} />
              <Route path="/parent/store/dresses" element={<KidsDresses />} />
              <Route path="/parent/store/product/:id" element={<ProductDetails />} />
            </Route>

            {/* Store Admin (Role 4) Authentication Route */}
            <Route path="/store-admin/login" element={<StoreAdminLogin />} />
            <Route path="/store-admin" element={<Navigate to="/store-admin/dashboard" replace />} />

            {/* Store Admin (Role 4) Protected Routes */}
            <Route element={<StoreAdminProtectedRoute />}>
              <Route path="/store-admin/dashboard" element={<StoreAdminDashboard />} />
              <Route path="/store-admin/products" element={<StoreAdminProducts />} />
              <Route path="/store-admin/add-product" element={<StoreAdminAddProduct />} />
              <Route path="/store-admin/toy-selections" element={<StoreAdminToySelections />} />
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
