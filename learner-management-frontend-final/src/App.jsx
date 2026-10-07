import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import Watch from "./pages/Watch.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import StudentDetails from "./pages/StudentDetails.jsx";
import Enrollments from "./pages/Enrollments.jsx";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/dashboard" : "/courses"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Shared */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />

        {/* Student */}
        <Route path="/my-courses" element={<ProtectedRoute role="STUDENT"><MyCourses /></ProtectedRoute>} />
        <Route path="/watch/:courseId" element={<ProtectedRoute role="STUDENT"><Watch /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/dashboard" element={<ProtectedRoute role="ADMIN"><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute role="ADMIN"><Students /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute role="ADMIN"><StudentDetails /></ProtectedRoute>} />
        <Route path="/enrollments" element={<ProtectedRoute role="ADMIN"><Enrollments /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
