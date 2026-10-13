import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { DashboardLayout, PublicLayout } from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ROLES } from './utils/constants';

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const EditStudentProfile = lazy(() => import('./pages/student/EditStudentProfile'));
const StudentMentorships = lazy(() => import('./pages/student/StudentMentorships'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));
const SavedJobsPage = lazy(() => import('./pages/student/SavedJobsPage'));
const StudentReferrals = lazy(() => import('./pages/student/StudentReferrals'));

// Alumni pages
const AlumniDashboard = lazy(() => import('./pages/alumni/AlumniDashboard'));
const AlumniProfile = lazy(() => import('./pages/alumni/AlumniProfile'));
const EditAlumniProfile = lazy(() => import('./pages/alumni/EditAlumniProfile'));
const AlumniDirectory = lazy(() => import('./pages/alumni/AlumniDirectory'));
const AlumniDetailPage = lazy(() => import('./pages/alumni/AlumniDetailPage'));
const AlumniMentorships = lazy(() => import('./pages/alumni/AlumniMentorships'));
const AlumniReferrals = lazy(() => import('./pages/alumni/AlumniReferrals'));
const JobApplicationsPage = lazy(() => import('./pages/alumni/JobApplicationsPage'));

// Shared feature pages
const JobListPage = lazy(() => import('./pages/jobs/JobListPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const PostJobPage = lazy(() => import('./pages/jobs/PostJobPage'));
const EventListPage = lazy(() => import('./pages/events/EventListPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/events/CreateEventPage'));
const PostFeedPage = lazy(() => import('./pages/posts/PostFeedPage'));
const PostDetailPage = lazy(() => import('./pages/posts/PostDetailPage'));
const CreatePostPage = lazy(() => import('./pages/posts/CreatePostPage'));
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AlumniVerificationPage = lazy(() => import('./pages/admin/AlumniVerificationPage'));

function AppContent() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal" element={<LegalPage />} />
          </Route>

          {/* Student routes */}
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

          {/* Alumni routes */}
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
            <Route path="/alumni/jobs/post" element={<PostJobPage />} />
            <Route path="/alumni/jobs/:id/applications" element={<JobApplicationsPage />} />
            <Route path="/alumni/referrals" element={<AlumniReferrals />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
          </Route>

          {/* Admin routes */}
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
            <Route path="/admin/verifications" element={<Navigate to="/admin/verification" replace />} />
          </Route>

          {/* Authenticated shared routes — accessible to all logged-in users */}
          <Route
            element={
              <ProtectedRoute roles={[ROLES.STUDENT, ROLES.ALUMNI, ROLES.ADMIN]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/alumni" element={<AlumniDirectory />} />
            <Route path="/alumni/:id" element={<AlumniDetailPage />} />

            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            <Route path="/posts" element={<PostFeedPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />

            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />

            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
