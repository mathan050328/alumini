import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiX, FiCheck, FiArrowLeft, FiSave, FiCamera, FiUploadCloud } from 'react-icons/fi';
import { getAlumniProfile, updateAlumniProfile, uploadAlumniPicture } from '../../api/alumniApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const POPULAR_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express.js',
  'Java', 'Spring Boot', 'Python', 'Django', 'C++', 'C#',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux',
  'GraphQL', 'REST API', 'Tailwind CSS', 'Next.js',
  'System Design', 'Microservices', 'Machine Learning', 'Data Science'
];

const EditAlumniProfile = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    graduationYear: '',
    currentCompany: '',
    jobTitle: '',
    yearsOfExperience: '',
    location: '',
    professionalBio: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: []
  });
  
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getAlumniProfile();
      const profile = res.data;
      
      const skillsList = Array.isArray(profile.skills) 
        ? profile.skills 
        : Array.from(profile.skills || []);

      setProfilePictureUrl(profile.profilePictureUrl || profile.avatar || '');

      setFormData({
        phone: profile.phone || '',
        department: profile.department || '',
        graduationYear: profile.graduationYear ?? '',
        currentCompany: profile.currentCompany || '',
        jobTitle: profile.jobTitle || '',
        yearsOfExperience: profile.yearsOfExperience ?? '',
        location: profile.location || '',
        professionalBio: profile.professionalBio || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        skills: skillsList
      });
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/alumni/profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPicture(true);
      const res = await uploadAlumniPicture(file);
      const newUrl = res.data?.profilePictureUrl;
      if (newUrl) {
        setProfilePictureUrl(newUrl);
        updateUser({ profilePictureUrl: newUrl });
        toast.success('Profile picture updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      const updated = exists
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const skillsToAdd = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const uniqueSkills = [...new Set([...formData.skills, ...skillsToAdd])];
    
    setFormData(prev => ({
      ...prev,
      skills: uniqueSkills
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const payload = {
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || null,
        graduationYear: formData.graduationYear !== '' && formData.graduationYear != null 
          ? parseInt(formData.graduationYear, 10) 
          : null,
        currentCompany: formData.currentCompany?.trim() || null,
        jobTitle: formData.jobTitle?.trim() || null,
        yearsOfExperience: formData.yearsOfExperience !== '' && formData.yearsOfExperience != null 
          ? parseInt(formData.yearsOfExperience, 10) 
          : null,
        location: formData.location?.trim() || null,
        professionalBio: formData.professionalBio?.trim() || null,
        githubUrl: formData.githubUrl?.trim() || null,
        linkedinUrl: formData.linkedinUrl?.trim() || null,
        skills: formData.skills
      };

      await updateAlumniProfile(payload);
      toast.success('Profile updated successfully');
      navigate('/alumni/profile');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => navigate('/alumni/profile')} 
              className="mr-3 p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors font-medium shadow-sm text-sm cursor-pointer"
          >
            {saving ? <LoadingSpinner size="small" /> : <><FiSave className="mr-2" /> Save Changes</>}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative group">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md">
                  {formData.jobTitle ? formData.jobTitle.charAt(0) : 'A'}
                </div>
              )}
              {uploadingPicture && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-gray-900">Profile Picture</h3>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">
                Upload a professional headshot. Recommended size 400x400px (JPG, PNG, or WEBP, max 5MB).
              </p>

              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePictureChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FiCamera className="text-indigo-600" />
                  {uploadingPicture ? 'Uploading...' : 'Change Photo'}
                </button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="e.g. +1 555-0123"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="City, Country"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input 
                  type="number" 
                  name="graduationYear" 
                  value={formData.graduationYear} 
                  onChange={handleChange} 
                  placeholder="e.g. 2020"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                <input 
                  type="text" 
                  name="currentCompany" 
                  value={formData.currentCompany} 
                  onChange={handleChange} 
                  placeholder="e.g. Google, Microsoft, Startup"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text" 
                  name="jobTitle" 
                  value={formData.jobTitle} 
                  onChange={handleChange} 
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input 
                  type="number" 
                  name="yearsOfExperience" 
                  value={formData.yearsOfExperience} 
                  onChange={handleChange} 
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
              <textarea 
                name="professionalBio" 
                rows="4" 
                value={formData.professionalBio} 
                onChange={handleChange} 
                placeholder="Write a short bio about your professional journey..."
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm"
              ></textarea>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Skills & Expertise</h2>
                <p className="text-sm text-gray-500">Highlight technologies and domains you specialize in</p>
              </div>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                {formData.skills.length} selected
              </span>
            </div>

            {/* Selected Skills */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Skills:</p>
              {formData.skills.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No skills selected yet. Click skills below or add custom ones.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200 shadow-sm">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)} 
                        className="text-indigo-500 hover:text-indigo-900 focus:outline-none cursor-pointer"
                        title="Remove"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Clickable Preset Options */}
            <div className="mb-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-2.5">
                Click to select or unselect options:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
                      }`}
                    >
                      {isSelected ? <FiCheck className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} 
                placeholder="Add other skill (e.g. Terraform, Scala)..." 
                className="flex-1 rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
              />
              <button 
                type="button" 
                onClick={handleAddSkill} 
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
              >
                <FiPlus /> Add Custom
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Social & Professional Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  name="linkedinUrl" 
                  value={formData.linkedinUrl} 
                  onChange={handleChange} 
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input 
                  type="url" 
                  name="githubUrl" 
                  value={formData.githubUrl} 
                  onChange={handleChange} 
                  placeholder="https://github.com/username"
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => navigate('/alumni/profile')} 
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors cursor-pointer flex items-center"
            >
              {saving ? <LoadingSpinner size="small" /> : <><FiSave className="mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlumniProfile;
