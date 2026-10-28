import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FiUsers, FiUserCheck, FiUserPlus, FiBriefcase,
  FiFileText, FiCalendar, FiActivity, FiShield, FiCamera
} from 'react-icons/fi';
import { getDashboardStats } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProfilePictureModal from '../../components/common/ProfilePictureModal';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPictureModal, setShowPictureModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Fallback data if API doesn't return exact expected format yet
  const defaultStats = {
    totalUsers: 0,
    totalStudents: 0,
    totalAlumni: 0,
    verifiedAlumni: 0,
    pendingVerifications: 0,
    activeJobs: stats?.totalJobs ?? stats?.activeJobs ?? 0,
    totalApplications: 0,
    upcomingEvents: 0,
    ...stats,
    activeJobs: stats?.totalJobs ?? stats?.activeJobs ?? 0,
  };

  const roleData = [
    { name: 'Students', count: defaultStats.totalStudents },
    { name: 'Alumni', count: defaultStats.totalAlumni }
  ];

  const verificationData = [
    { name: 'Verified', value: defaultStats.verifiedAlumni },
    { name: 'Pending', value: defaultStats.pendingVerifications },
    { name: 'Rejected', value: Math.max(0, defaultStats.totalAlumni - defaultStats.verifiedAlumni - defaultStats.pendingVerifications) }
  ];

  const COLORS = ['#4f46e5', '#10b981', '#ef4444'];

  const statCards = [
    { title: 'Total Users', value: defaultStats.totalUsers, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Students', value: defaultStats.totalStudents, icon: FiUserPlus, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Total Alumni', value: defaultStats.totalAlumni, icon: FiShield, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Verified Alumni', value: defaultStats.verifiedAlumni, icon: FiUserCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending Verifications', value: defaultStats.pendingVerifications, icon: FiActivity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: 'Active Jobs', value: defaultStats.activeJobs, icon: FiBriefcase, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Total Applications', value: defaultStats.totalApplications, icon: FiFileText, color: 'text-teal-600', bg: 'bg-teal-100' },
    { title: 'Upcoming Events', value: defaultStats.upcomingEvents, icon: FiCalendar, color: 'text-pink-600', bg: 'bg-pink-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName || 'Admin'}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPictureModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow border-2 border-white transition-transform hover:scale-110"
              title="Change Profile Picture"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || 'Administrator'}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                System Admin
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setShowPictureModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
        >
          <FiCamera className="w-4 h-4 text-gray-500" />
          <span>Change Avatar</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Users by Role</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4f46e5" name="Total Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Alumni Verification Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUsers className="mr-2 -ml-1 h-5 w-5" />
            Manage Users
          </Link>
          <Link
            to="/admin/verification"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiShield className="mr-2 -ml-1 h-5 w-5" />
            Verify Alumni
            {defaultStats.pendingVerifications > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
                {defaultStats.pendingVerifications}
              </span>
            )}
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiBriefcase className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
            Job Board
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiCalendar className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
            Events & Workshops
          </Link>
        </div>
      </div>

      <ProfilePictureModal
        isOpen={showPictureModal}
        onClose={() => setShowPictureModal(false)}
        currentPictureUrl={user?.profilePictureUrl}
      />
    </div>
  );
};

export default AdminDashboard;
