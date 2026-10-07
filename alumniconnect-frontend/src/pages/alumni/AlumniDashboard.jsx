import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiUsers, FiBriefcase, FiUserPlus, FiMessageSquare, FiPlusCircle } from 'react-icons/fi';
import { getAlumniProfile, updateAlumniProfile } from '../../api/alumniApi';
import { getReceivedMentorships, updateMentorshipStatus } from '../../api/mentorshipApi';
import { useAuth } from '../../context/AuthContext';
import { MENTORSHIP_STATUS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, mentorshipsRes] = await Promise.all([
        getAlumniProfile(),
        getReceivedMentorships()
      ]);
      setProfile(profileRes.data);
      setMentorships(mentorshipsRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      setUpdating(true);
      await updateAlumniProfile({ isAvailableForMentorship: !profile.isAvailableForMentorship });
      setProfile({ ...profile, isAvailableForMentorship: !profile.isAvailableForMentorship });
      toast.success('Mentorship availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateMentorship = async (id, status) => {
    try {
      await updateMentorshipStatus(id, status);
      toast.success(`Mentorship ${status.toLowerCase()} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update mentorship status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <EmptyState title="Profile not found" />;

  const pendingMentorships = mentorships.filter(m => m.status === MENTORSHIP_STATUS.PENDING);
  const activeMentorships = mentorships.filter(m => m.status === MENTORSHIP_STATUS.ACCEPTED);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Welcome, {profile.name || user.name}
            {profile.isVerified && <FiCheckCircle className="text-blue-500" title="Verified Alumni" />}
          </h1>
          <p className="text-gray-600 mt-1">{profile.jobTitle} at {profile.currentCompany}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button
            onClick={handleToggleAvailability}
            disabled={updating}
            className={`px-4 py-2 rounded-md text-white font-medium ${profile.isAvailableForMentorship ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {profile.isAvailableForMentorship ? 'Available for Mentorship' : 'Not Available for Mentorship'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-900">{pendingMentorships.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Mentees</p>
            <p className="text-2xl font-bold text-gray-900">{activeMentorships.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Jobs Posted</p>
            <p className="text-2xl font-bold text-gray-900">{profile.jobsPosted || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <FiUserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Referral Requests</p>
            <p className="text-2xl font-bold text-gray-900">{profile.referralRequests || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Mentorships */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Mentorship Requests</h2>
            {pendingMentorships.length === 0 ? (
              <EmptyState title="No pending requests" description="You have no pending mentorship requests at the moment." />
            ) : (
              <div className="space-y-4">
                {pendingMentorships.map(req => (
                  <div key={req._id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{req.student?.name || 'Unknown Student'}</h3>
                      <p className="text-sm text-gray-600">{req.message}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleUpdateMentorship(req._id, MENTORSHIP_STATUS.ACCEPTED)} className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Accept</button>
                      <button onClick={() => handleUpdateMentorship(req._id, MENTORSHIP_STATUS.REJECTED)} className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Referral Requests */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Referral Requests</h2>
            <EmptyState title="No recent requests" description="You don't have any recent referral requests." />
          </section>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/jobs/create" className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <FiBriefcase /> Post a Job
              </Link>
              <Link to="/events/create" className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <FiPlusCircle /> Create Event
              </Link>
              <Link to="/posts/create" className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <FiMessageSquare /> Write a Post
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
