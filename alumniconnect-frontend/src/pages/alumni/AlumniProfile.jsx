import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiMapPin, FiBriefcase, FiAward, FiBook, FiGithub, FiLinkedin, FiMail, FiCheckCircle } from 'react-icons/fi';
import { getAlumniProfile, updateAlumniProfile } from '../../api/alumniApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
              <img
                src={profile.avatar || 'https://via.placeholder.com/128'}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover"
              />
            </div>
            <Link to="/alumni/profile/edit" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiEdit /> Edit Profile
            </Link>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {profile.name}
              {profile.isVerified && <FiCheckCircle className="text-blue-500 w-5 h-5" title="Verified" />}
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
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="text-gray-500 hover:text-indigo-600"><FiMail className="w-5 h-5" /></a>
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
              <Badge variant={profile.isAvailableForMentorship ? 'success' : 'secondary'}>
                {profile.isAvailableForMentorship ? 'Available' : 'Unavailable'}
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
    </div>
  );
};

export default AlumniProfile;
