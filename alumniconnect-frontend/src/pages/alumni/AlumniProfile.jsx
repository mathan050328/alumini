import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiMapPin, FiBriefcase, FiAward, FiBook, FiGithub, FiLinkedin, FiMail, FiCamera } from 'react-icons/fi';
import { getAlumniProfile, updateAlumniProfile } from '../../api/alumniApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import ProfilePictureModal from '../../components/common/ProfilePictureModal';

const AlumniProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getAlumniProfile();
      setProfile(res.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const isAvailable = profile?.mentorshipAvailability === 'AVAILABLE' || profile?.isAvailableForMentorship;

  const handleToggleAvailability = async () => {
    try {
      setUpdating(true);
      const newAvailability = isAvailable ? 'NOT_AVAILABLE' : 'AVAILABLE';
      await updateAlumniProfile({ 
        mentorshipAvailability: newAvailability,
        isAvailableForMentorship: !isAvailable 
      });
      setProfile({ 
        ...profile, 
        mentorshipAvailability: newAvailability,
        isAvailableForMentorship: !isAvailable 
      });
      toast.success('Mentorship availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <EmptyState title="Profile not found" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end mb-4">
            <div className="-mt-16 flex items-center">
              <div className="relative group">
                {profile.profilePictureUrl || profile.avatar ? (
                  <img
                    src={profile.profilePictureUrl || profile.avatar}
                    alt={profile.fullName || profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 rounded-full border-4 border-white bg-indigo-600 text-white font-bold text-3xl items-center justify-center shadow-md ${
                    profile.profilePictureUrl || profile.avatar ? 'hidden' : 'flex'
                  }`}
                >
                  {(profile.fullName || profile.name || 'Alumni')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(n => n.charAt(0).toUpperCase())
                    .join('') || 'AL'}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPictureModal(true)}
                  className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white transition-all hover:scale-110"
                  title="Change Profile Picture"
                >
                  <FiCamera className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Link to="/alumni/profile/edit" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
              <FiEdit /> Edit Profile
            </Link>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
              {profile.fullName || profile.name}
              {(profile.verificationStatus === 'VERIFIED' || profile.isVerified) && (
                <FiCheckCircle className="text-blue-500 w-5 h-5" title="Verified Alumni" />
              )}
              {profile.rollNumber && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono" title="Institutional User ID">
                  User ID: {profile.rollNumber}
                </span>
              )}
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
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {profile.email ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                  <FiMail className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium text-slate-800">{profile.email}</span>
                  <span className="text-[10px] text-slate-400">(Recovery Email)</span>
                </div>
              ) : (
                <span className="text-xs text-amber-600">No recovery email set</span>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600"><FiLinkedin className="w-5 h-5" /></a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900"><FiGithub className="w-5 h-5" /></a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><FiAward /> Professional Bio</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.professionalBio || 'No bio provided.'}</p>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FiBriefcase /> Experience</h2>
            {(!profile.experiences || profile.experiences.length === 0) ? (
              <p className="text-gray-500 italic">No experience added yet.</p>
            ) : (
              <div className="space-y-6">
                {profile.experiences.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-indigo-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Mentorship Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Mentorship</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Status</span>
              <Badge variant={isAvailable ? 'success' : 'secondary'}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={updating}
              className="mt-4 w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition-colors"
            >
              Toggle Availability
            </button>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Skills</h2>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-gray-500 italic">No skills added.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfilePictureModal
        isOpen={showPictureModal}
        onClose={() => setShowPictureModal(false)}
        currentPictureUrl={profile?.profilePictureUrl || profile?.avatar}
        onUpdated={(newUrl) => {
          setProfile(prev => ({ ...prev, profilePictureUrl: newUrl }));
        }}
      />
    </div>
  );
};

export default AlumniProfile;
