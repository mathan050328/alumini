import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { DashboardLayout, PublicLayout } from './components/layout/Layout';
import { ROLES } from './utils/constants';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import EditStudentProfile from './pages/student/EditStudentProfile';
import StudentMentorships from './pages/student/StudentMentorships';
import StudentApplications from './pages/student/StudentApplications';
import SavedJobsPage from './pages/student/SavedJobsPage';
import StudentReferrals from './pages/student/StudentReferrals';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import EditAlumniProfile from './pages/alumni/EditAlumniProfile';
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import AlumniDetailPage from './pages/alumni/AlumniDetailPage';
import AlumniMentorships from './pages/alumni/AlumniMentorships';
import AlumniReferrals from './pages/alumni/AlumniReferrals';

// Job Pages
import JobListPage from './pages/jobs/JobListPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import PostJobPage from './pages/jobs/PostJobPage';

// Event Pages
import EventListPage from './pages/events/EventListPage';
import EventDetailPage from './pages/events/EventDetailPage';
import CreateEventPage from './pages/events/CreateEventPage';

// Post Pages
import PostFeedPage from './pages/posts/PostFeedPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import CreatePostPage from './pages/posts/CreatePostPage';

// Messaging & Notifications
import MessagesPage from './pages/messages/MessagesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AlumniVerificationPage from './pages/admin/AlumniVerificationPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ========== STUDENT ROUTES ========== */}
          <Route
            element={
              <ProtectedRoute roles={[ROLES.STUDENT]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/profile/edit" element={<EditStudentProfile />} />
            <Route path="/student/mentorships" element={<StudentMentorships />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/student/referrals" element={<StudentReferrals />} />
          </Route>

          {/* ========== ALUMNI ROUTES ========== */}
          <Route
            element={
              <ProtectedRoute roles={[ROLES.ALUMNI]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
            <Route path="/alumni/profile" element={<AlumniProfile />} />
            <Route path="/alumni/profile/edit" element={<EditAlumniProfile />} />
            <Route path="/alumni/mentorships" element={<AlumniMentorships />} />
            <Route path="/alumni/jobs" element={<JobListPage />} />
            <Route path="/alumni/jobs/new" element={<PostJobPage />} />
            <Route path="/alumni/referrals" element={<AlumniReferrals />} />
            <Route path="/posts/new" element={<CreatePostPage />} />
          </Route>

          {/* ========== ADMIN ROUTES ========== */}
          <Route
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/verification" element={<AlumniVerificationPage />} />
          </Route>

          {/* ========== SHARED AUTHENTICATED ROUTES ========== */}
          <Route
            element={
              <ProtectedRoute roles={[ROLES.STUDENT, ROLES.ALUMNI, ROLES.ADMIN]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Alumni Directory & Detail */}
            <Route path="/alumni-directory" element={<AlumniDirectory />} />
            <Route path="/alumni/:id" element={<AlumniDetailPage />} />

            {/* Jobs */}
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Events */}
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Posts */}
            <Route path="/posts" element={<PostFeedPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />

            {/* Messages */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* ========== CATCH ALL ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
