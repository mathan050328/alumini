import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiBell, FiMessageSquare, FiChevronDown, FiLogOut, FiUser, FiSettings, FiPlus, FiBriefcase, FiCalendar, FiEdit, FiLock, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../api/notificationApi';
import { ROLES } from '../../utils/constants';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import ProfilePictureModal from '../common/ProfilePictureModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [createDropdown, setCreateDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const dropdownRef = useRef(null);
  const createDropdownRef = useRef(null);
  const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : !!isAuthenticated;

  useEffect(() => {
    if (isAuth) {
      getUnreadCount()
        .then((res) => setUnreadNotifications(
          typeof res.data === 'number' ? res.data : (res.data?.unreadCount || 0)
        ))
        .catch(() => {});
    }
  }, [location.pathname, isAuth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case ROLES.STUDENT: return '/student/dashboard';
      case ROLES.ALUMNI: return '/alumni/dashboard';
      case ROLES.ADMIN: return '/admin/dashboard';
      default: return '/';
    }
  };

  const getNavLinks = () => {
    if (!user) return [];
    const common = [
      { label: 'Alumni Directory', path: '/alumni-directory' },
      { label: 'Jobs', path: '/jobs' },
      { label: 'Events', path: '/events' },
      { label: 'Posts', path: '/posts' },
    ];

    switch (user.role) {
      case ROLES.STUDENT:
        return [{ label: 'Dashboard', path: '/student/dashboard' }, ...common];
      case ROLES.ALUMNI:
        return [{ label: 'Dashboard', path: '/alumni/dashboard' }, ...common];
      case ROLES.ADMIN:
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Verification', path: '/admin/verification' },
          ...common,
        ];
      default:
        return common;
    }
  };

  const getProfilePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case ROLES.STUDENT: return '/student/profile';
      case ROLES.ALUMNI: return '/alumni/profile';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuth ? getDashboardPath() : '/'} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">AlumniConnect</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {isAuth && (
            <div className="hidden md:flex items-center space-x-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path || location.pathname.startsWith(link.path + '/')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isAuth ? (
              <>
                {/* Messages */}
                <Link to="/messages" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
                  <FiMessageSquare className="h-5 w-5" />
                </Link>

                {/* Alumni Quick Create Button */}
                {(user?.role === ROLES.ALUMNI || user?.role === ROLES.ADMIN) && (
                  <div className="relative" ref={createDropdownRef}>
                    <button
                      onClick={() => setCreateDropdown(!createDropdown)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                      title="Create"
                    >
                      <FiPlus className="h-4 w-4" />
                      <span className="hidden md:inline">Create</span>
                      <FiChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {createDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          to="/posts/create"
                          onClick={() => setCreateDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <FiEdit className="h-4 w-4" /> Write a Post
                        </Link>
                        <Link
                          to="/events/create"
                          onClick={() => setCreateDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <FiCalendar className="h-4 w-4" /> Create Event
                        </Link>
                        <Link
                          to="/jobs/create"
                          onClick={() => setCreateDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <FiBriefcase className="h-4 w-4" /> Post a Job
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications */}
                <Link to="/notifications" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
                  <FiBell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>


                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.fullName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 ring-2 ring-indigo-100"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 rounded-full bg-indigo-100 items-center justify-center ${user?.profilePictureUrl ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-indigo-700 font-medium text-sm">
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user.fullName}</span>
                    <FiChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {profileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        {user.rollNumber && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                            ID: {user.rollNumber}
                          </span>
                        )}
                        {user.email && <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>}
                        <p className="text-xs font-medium text-indigo-600 mt-1">{user.role?.replace('ROLE_', '')}</p>
                      </div>
                      {user.role !== ROLES.ADMIN && (
                        <Link
                          to={getProfilePath()}
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiUser className="h-4 w-4 text-gray-500" />
                          <span>My Profile</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          setShowPictureModal(true);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiCamera className="h-4 w-4 text-gray-500" />
                        <span>Change Profile Picture</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          setShowPasswordModal(true);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiLock className="h-4 w-4 text-gray-500" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <FiLock className="w-3.5 h-3.5" />
                  <span>Institutional Login</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuth && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuth && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Password warning banner for first-time login users */}
        {user && user.passwordChanged === false && (
          <div className="bg-amber-500 text-white text-xs sm:text-sm px-4 py-2 rounded-lg mb-2 flex items-center justify-between font-medium shadow-sm">
            <div className="flex items-center space-x-2">
              <FiLock className="w-4 h-4 shrink-0" />
              <span>You are using a default institutional password. Please change it to secure your account.</span>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="ml-3 bg-white text-amber-800 px-3 py-1 rounded text-xs font-semibold hover:bg-amber-50 transition-colors shrink-0 shadow-sm"
            >
              Change Password Now
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isFirstLogin={user?.passwordChanged === false}
      />

      <ProfilePictureModal
        isOpen={showPictureModal}
        onClose={() => setShowPictureModal(false)}
        currentPictureUrl={user?.profilePictureUrl}
      />
    </nav>
  );
};

export default Navbar;
