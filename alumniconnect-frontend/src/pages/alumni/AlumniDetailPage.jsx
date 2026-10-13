import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMapPin, FiBriefcase, FiAward, FiBook, FiGithub, FiLinkedin, FiMail, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { getAlumniById } from '../../api/alumniApi';
import { requestMentorship } from '../../api/mentorshipApi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const AlumniDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getAlumniById(id);
      setProfile(res.data);
    } catch (error) {
      toast.error('Failed to load alumni profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    if (!mentorshipMessage.trim()) {
      toast.error('Please include a message for the mentor');
      return;
    }
    
    try {
      setSubmitting(true);
      await requestMentorship({
        alumniId: id,
        message: mentorshipMessage
      });
      toast.success('Mentorship request sent successfully!');
      setShowMentorshipModal(false);
      setMentorshipMessage('');
      fetchProfile(); // Refresh to update mentorship status if backend provides it
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send mentorship request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      toast.info('Please login to send messages');
      navigate('/login');
      return;
    }
    // Logic to start conversation or redirect to messages
    const targetId = profile.userId || id;
    navigate(`/messages?userId=${targetId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <EmptyState title="Profile not found" description="The requested alumni profile could not be found." />;

  const isStudent = user?.role === ROLES.STUDENT || user?.role === 'ROLE_STUDENT';
  const profileId = profile?.id || id;
  const profileName = profile?.fullName || profile?.name || 'Alumni Profile';
  const profileAvatar = profile?.profilePictureUrl || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const isMentor = profile?.mentorshipAvailability === 'AVAILABLE' || profile?.isAvailableForMentorship;
  const isVerified = profile?.verificationStatus === 'VERIFIED' || profile?.isVerified;
  const isOwnProfile = user && (String(user.id) === String(profile?.userId) || String(user.id) === String(profile?.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end mb-4">
            <div className="-mt-16 flex items-center">
              <img
                src={profileAvatar}
                alt={profileName}
                className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover shadow-sm"
              />
            </div>
            
            <div className="flex gap-3">
              {isAuthenticated && !isOwnProfile && (
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  <FiMessageSquare /> Message
                </button>
              )}
              {isStudent && isMentor && (
                <button
                  onClick={() => setShowMentorshipModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
                >
                  <FiAward /> Request Mentorship
                </button>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {profileName}
              {isVerified && <FiCheckCircle className="text-blue-500 w-5 h-5" title="Verified Alumni" />}
            </h1>
            <p className="text-lg text-gray-600 font-medium mt-1">
              {profile.jobTitle} {profile.currentCompany && `at ${profile.currentCompany}`}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <FiMapPin /> {profile.location}
                </div>
              )}
              {profile.department && (
                <div className="flex items-center gap-1">
                  <FiBook /> {profile.department} (Class of {profile.graduationYear})
                </div>
              )}
              {profile.isAvailableForMentorship && (
                <Badge variant="success">Available for Mentorship</Badge>
              )}
            </div>
            
            <div className="mt-5 flex gap-4">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm">
                  <FiLinkedin /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm">
                  <FiGithub /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.professionalBio || 'No bio provided.'}</p>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2"><FiBriefcase /> Experience</h2>
            {(!profile.experiences || profile.experiences.length === 0) ? (
              <p className="text-gray-500 italic">No experience information available.</p>
            ) : (
              <div className="space-y-6">
                {profile.experiences.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-indigo-100">
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5"></div>
                    <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-indigo-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    </p>
                    {exp.description && <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Skills & Expertise</h2>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-gray-500 italic">No skills listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Alumni Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Graduation Year</span>
                <span className="font-medium text-gray-900">{profile.graduationYear || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Years of Experience</span>
                <span className="font-medium text-gray-900">{profile.yearsOfExperience || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mentorship Modal */}
      {showMentorshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Mentorship</h3>
            <p className="text-sm text-gray-500 mb-4">Send a message to {profile.name} explaining why you'd like them to be your mentor and what you hope to learn.</p>
            
            <form onSubmit={handleRequestMentorship}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows="5"
                  value={mentorshipMessage}
                  onChange={(e) => setMentorshipMessage(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-3"
                  placeholder="Hello, I'm a student looking to learn more about..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMentorshipModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDetailPage;
