import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { DashboardLayout, PublicLayout } from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ROLES } from './utils/constants';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Student Pages (Lazy Loaded)
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const EditStudentProfile = lazy(() => import('./pages/student/EditStudentProfile'));
const StudentMentorships = lazy(() => import('./pages/student/StudentMentorships'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));
const SavedJobsPage = lazy(() => import('./pages/student/SavedJobsPage'));
const StudentReferrals = lazy(() => import('./pages/student/StudentReferrals'));

// Alumni Pages (Lazy Loaded)
const AlumniDashboard = lazy(() => import('./pages/alumni/AlumniDashboard'));
const AlumniProfile = lazy(() => import('./pages/alumni/AlumniProfile'));
const EditAlumniProfile = lazy(() => import('./pages/alumni/EditAlumniProfile'));
const AlumniDirectory = lazy(() => import('./pages/alumni/AlumniDirectory'));
const AlumniDetailPage = lazy(() => import('./pages/alumni/AlumniDetailPage'));
const AlumniMentorships = lazy(() => import('./pages/alumni/AlumniMentorships'));
const AlumniReferrals = lazy(() => import('./pages/alumni/AlumniReferrals'));

// Job Pages (Lazy Loaded)
const JobListPage = lazy(() => import('./pages/jobs/JobListPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const PostJobPage = lazy(() => import('./pages/jobs/PostJobPage'));

// Event Pages (Lazy Loaded)
const EventListPage = lazy(() => import('./pages/events/EventListPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/events/CreateEventPage'));

// Post Pages (Lazy Loaded)
const PostFeedPage = lazy(() => import('./pages/posts/PostFeedPage'));
const PostDetailPage = lazy(() => import('./pages/posts/PostDetailPage'));
const CreatePostPage = lazy(() => import('./pages/posts/CreatePostPage'));

// Messaging & Notifications (Lazy Loaded)
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AlumniVerificationPage = lazy(() => import('./pages/admin/AlumniVerificationPage'));

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

        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
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
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
