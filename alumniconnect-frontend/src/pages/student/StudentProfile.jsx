import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiMail, FiPhone, FiGithub, FiLinkedin, FiDownload, FiMapPin, FiBriefcase, FiAward, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getStudentProfile } from '../../api/studentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getStudentProfile();
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg inline-block">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Student';
  const displayAvatar = profile.profilePictureUrl || profile.profilePicture;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('') || 'ST';

  const skillsList = Array.isArray(profile.skills) 
    ? profile.skills 
    : (profile.skills ? Array.from(profile.skills) : []);

  const careerInterestsList = Array.isArray(profile.careerInterests)
    ? profile.careerInterests
    : (typeof profile.careerInterests === 'string' && profile.careerInterests.trim()
        ? profile.careerInterests.split(',').map(s => s.trim()).filter(Boolean)
        : []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-4">
            <div className="flex items-end">
              {displayAvatar ? (
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                  {initials}
                </div>
              )}
              <div className="ml-6 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                  {profile.rollNumber && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      Roll No: {profile.rollNumber}
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 font-medium">{profile.department} • {profile.degree}</p>
                <p className="text-gray-500">Class of {profile.graduationYear}</p>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <Link 
                to="/student/profile/edit" 
                className="flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors border border-indigo-200 shadow-sm"
              >
                <FiEdit2 className="mr-2" /> Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-8">
          
          {/* About / Bio */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiBook className="mr-2 text-indigo-600" /> About
            </h2>
            {profile.bio ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic">No bio provided yet.</p>
            )}
          </section>

          {/* Experience / Projects */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FiBriefcase className="mr-2 text-indigo-600" /> Projects & Experience
            </h2>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="space-y-6">
                {profile.projects.map((project, idx) => (
                  <div key={project.id || idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No projects added yet.</p>
            )}
          </section>

          {/* Certifications */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FiAward className="mr-2 text-indigo-600" /> Certifications
            </h2>
            {profile.certifications && profile.certifications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cert.issuer}</p>
                    {cert.issueDate && <p className="text-xs text-gray-400 mt-2">{new Date(cert.issueDate).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No certifications added yet.</p>
            )}
          </section>

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Contact Info */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-indigo-600 hover:underline text-sm break-all">{profile.email}</a>
                </div>
              </div>
              
              {profile.phone && (
                <div className="flex items-start">
                  <FiPhone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600 text-sm">{profile.phone}</p>
                  </div>
                </div>
              )}
              
              {profile.linkedinUrl && (
                <div className="flex items-start">
                  <FiLinkedin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm break-all">
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              
              {profile.githubUrl && (
                <div className="flex items-start">
                  <FiGithub className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">GitHub</p>
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm break-all">
                      View Profile
                    </a>
                  </div>
                </div>
              )}
            </div>

            {profile.resumeUrl && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <a 
                  href={profile.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <FiDownload className="mr-2" /> Download Resume
                </a>
              </div>
            )}
          </section>

          {/* Skills */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
            {skillsList && skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, idx) => (
                  <Badge key={idx} variant="info">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No skills added yet.</p>
            )}
          </section>

          {/* Career Interests */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Career Interests</h2>
            {careerInterestsList && careerInterestsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {careerInterestsList.map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">{interest}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No career interests specified.</p>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
