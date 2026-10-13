import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUser, FiUsers, FiBriefcase, FiCalendar,
  FiMessageSquare, FiBell, FiFileText, FiStar, FiBookmark,
  FiUserCheck, FiSend
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case ROLES.STUDENT:
        return [
          { icon: FiHome, label: 'Dashboard', path: '/student/dashboard' },
          { icon: FiUser, label: 'My Profile', path: '/student/profile' },
          { icon: FiUsers, label: 'Alumni Directory', path: '/alumni-directory' },
          { icon: FiStar, label: 'Mentorships', path: '/student/mentorships' },
          { icon: FiBriefcase, label: 'Jobs', path: '/jobs' },
          { icon: FiBookmark, label: 'Saved Jobs', path: '/student/saved-jobs' },
          { icon: FiFileText, label: 'Applications', path: '/student/applications' },
          { icon: FiSend, label: 'Referrals', path: '/student/referrals' },
          { icon: FiCalendar, label: 'Events', path: '/events' },
          { icon: FiFileText, label: 'Posts', path: '/posts' },
          { icon: FiMessageSquare, label: 'Messages', path: '/messages' },
          { icon: FiBell, label: 'Notifications', path: '/notifications' },
        ];
      case ROLES.ALUMNI:
        return [
          { icon: FiHome, label: 'Dashboard', path: '/alumni/dashboard' },
          { icon: FiUser, label: 'My Profile', path: '/alumni/profile' },
          { icon: FiUsers, label: 'Alumni Directory', path: '/alumni-directory' },
          { icon: FiStar, label: 'Mentorships', path: '/alumni/mentorships' },
          { icon: FiBriefcase, label: 'Jobs & My Postings', path: '/alumni/jobs' },
          { icon: FiSend, label: 'Referrals', path: '/alumni/referrals' },
          { icon: FiCalendar, label: 'Events', path: '/events' },
          { icon: FiFileText, label: 'Posts', path: '/posts' },
          { icon: FiMessageSquare, label: 'Messages', path: '/messages' },
          { icon: FiBell, label: 'Notifications', path: '/notifications' },
        ];
      case ROLES.ADMIN:
        return [
          { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: FiUsers, label: 'Users', path: '/admin/users' },
          { icon: FiUserCheck, label: 'Verification', path: '/admin/verification' },
          { icon: FiUsers, label: 'Alumni Directory', path: '/alumni-directory' },
          { icon: FiBriefcase, label: 'Jobs', path: '/jobs' },
          { icon: FiCalendar, label: 'Events', path: '/events' },
          { icon: FiFileText, label: 'Posts', path: '/posts' },
          { icon: FiBell, label: 'Notifications', path: '/notifications' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
