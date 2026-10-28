import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiCheck, FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
  getStudentProfile, 
  updateStudentProfile, 
  addStudentSkills, 
  removeStudentSkill,
  addStudentProject,
  removeStudentProject,
  uploadProfilePicture,
  uploadResume
} from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';

const POPULAR_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express.js',
  'Java', 'Spring Boot', 'Python', 'Django', 'C++', 'C#',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux',
  'GraphQL', 'REST API', 'Tailwind CSS', 'Next.js',
  'Machine Learning', 'Data Analysis', 'Cybersecurity'
];

const POPULAR_ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Software Engineer', 'Mobile App Developer', 'DevOps Engineer',
  'Cloud Engineer', 'Data Scientist', 'Machine Learning Engineer',
  'Data Analyst', 'Product Manager', 'UI/UX Designer',
  'Cybersecurity Analyst', 'QA Engineer', 'System Architect'
];

const EditStudentProfile = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    department: '',
    degree: '',
    graduationYear: new Date().getFullYear(),
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    careerInterests: []
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', projectUrl: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [careerInterestInput, setCareerInterestInput] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getStudentProfile();
      const profile = res.data;
      
      let parsedInterests = [];
      if (Array.isArray(profile.careerInterests)) {
        parsedInterests = profile.careerInterests;
      } else if (typeof profile.careerInterests === 'string' && profile.careerInterests.trim()) {
        parsedInterests = profile.careerInterests.split(',').map(s => s.trim()).filter(Boolean);
      }

      setFormData({
        email: profile.email || profile.user?.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        degree: profile.degree || '',
        graduationYear: profile.graduationYear ?? new Date().getFullYear(),
        bio: profile.bio || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        careerInterests: parsedInterests
      });
      
      const skillsList = Array.isArray(profile.skills) 
        ? profile.skills 
        : Array.from(profile.skills || []);
      setSkills(skillsList);
      setProjects(profile.projects || []);
      setProfilePictureUrl(profile.profilePictureUrl || profile.profilePicture || '');
      setResumeUrl(profile.resumeUrl || '');
      
    } catch (err) {
      toast.error('Failed to load profile data');
      navigate('/student/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || null,
        degree: formData.degree?.trim() || null,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        bio: formData.bio?.trim() || null,
        githubUrl: formData.githubUrl?.trim() || null,
        linkedinUrl: formData.linkedinUrl?.trim() || null,
        careerInterests: formData.careerInterests.length > 0 
          ? formData.careerInterests.join(', ') 
          : '',
        skills: skills
      };

      await updateStudentProfile(payload);
      if (formData.email?.trim()) {
        updateUser({ email: formData.email.trim() });
      }
      toast.success('Profile updated successfully');
      navigate('/student/profile');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // --- Skills Management ---
  const toggleSkill = async (skill) => {
    if (skills.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      try {
        await addStudentSkills([skill]);
        setSkills(prev => [...prev, skill]);
        toast.success(`Added ${skill}`);
      } catch (err) {
        // Still update local state for bulk save fallback
        setSkills(prev => [...prev, skill]);
      }
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    const skillsToAdd = newSkill.split(',').map(s => s.trim()).filter(Boolean);
    const uniqueToAdd = skillsToAdd.filter(s => !skills.includes(s));
    if (uniqueToAdd.length === 0) {
      setNewSkill('');
      return;
    }
    
    try {
      await addStudentSkills(uniqueToAdd);
      setSkills(prev => [...new Set([...prev, ...uniqueToAdd])]);
      setNewSkill('');
      toast.success('Skills added');
    } catch (err) {
      setSkills(prev => [...new Set([...prev, ...uniqueToAdd])]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await removeStudentSkill(skillToRemove);
      setSkills(prev => prev.filter(skill => skill !== skillToRemove));
      toast.success('Skill removed');
    } catch (err) {
      // Local removal so user is never blocked
      setSkills(prev => prev.filter(skill => skill !== skillToRemove));
    }
  };

  // --- Career Interests Management ---
  const toggleCareerInterest = (role) => {
    setFormData(prev => {
      const exists = prev.careerInterests.includes(role);
      const updated = exists 
        ? prev.careerInterests.filter(r => r !== role)
        : [...prev.careerInterests, role];
      return { ...prev, careerInterests: updated };
    });
  };

  const handleAddCareerInterest = () => {
    if (!careerInterestInput.trim()) return;
    
    const interestsToAdd = careerInterestInput.split(',').map(s => s.trim()).filter(Boolean);
    const updatedInterests = [...new Set([...formData.careerInterests, ...interestsToAdd])];
    
    setFormData(prev => ({ ...prev, careerInterests: updatedInterests }));
    setCareerInterestInput('');
  };

  const handleRemoveCareerInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      careerInterests: prev.careerInterests.filter(i => i !== interestToRemove)
    }));
  };

  // --- Project Management ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      toast.warning('Title and description are required for projects');
      return;
    }
    
    try {
      const res = await addStudentProject(newProject);
      setProjects(prev => [...prev, res.data]);
      setNewProject({ title: '', description: '', projectUrl: '' });
      setShowProjectForm(false);
      toast.success('Project added');
    } catch (err) {
      toast.error('Failed to add project');
    }
  };

  const handleRemoveProject = async (projectId) => {
    try {
      await removeStudentProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project removed');
    } catch (err) {
      toast.error('Failed to remove project');
    }
  };

  // --- File Uploads ---
  const handleProfilePictureUpload = async (file) => {
    try {
      const res = await uploadProfilePicture(file);
      const newUrl = res.data?.profilePictureUrl;
      if (newUrl) {
        setProfilePictureUrl(newUrl);
        updateUser({ profilePictureUrl: newUrl });
      }
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
      throw err;
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const res = await uploadResume(file);
      const newUrl = res.data?.resumeUrl;
      if (newUrl) {
        setResumeUrl(newUrl);
      }
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
      throw err;
    }
  };

  if (loading) return <LoadingSpinner text="Loading your profile..." />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            type="button"
            onClick={() => navigate('/student/profile')} 
            className="mr-4 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors font-medium shadow-sm cursor-pointer"
        >
          {saving ? <LoadingSpinner size="small" /> : <><FiSave className="mr-2" /> Save Profile</>}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Basic Info Form */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Basic Information</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recovery Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="e.g. rahul.verma@example.com"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for password recovery (Forgot Password). Sign-in uses your Roll Number.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                placeholder="e.g. +1 555-0123"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input 
                type="text" 
                name="department" 
                value={formData.department} 
                onChange={handleInputChange} 
                placeholder="e.g. Computer Science"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input 
                type="text" 
                name="degree" 
                value={formData.degree} 
                onChange={handleInputChange} 
                placeholder="e.g. B.Tech / B.S."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input 
                type="number" 
                name="graduationYear" 
                value={formData.graduationYear} 
                onChange={handleInputChange} 
                placeholder="e.g. 2026"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                name="bio" 
                rows="4" 
                value={formData.bio} 
                onChange={handleInputChange} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400" 
                placeholder="Tell us a bit about yourself..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input 
                type="url" 
                name="linkedinUrl" 
                value={formData.linkedinUrl} 
                onChange={handleInputChange} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="https://linkedin.com/in/..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input 
                type="url" 
                name="githubUrl" 
                value={formData.githubUrl} 
                onChange={handleInputChange} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="https://github.com/..." 
              />
            </div>
          </form>
        </section>

        {/* Career Interests / Roles */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Career Interests & Target Roles</h2>
              <p className="text-sm text-gray-500">Select roles you are interested in or enter custom ones</p>
            </div>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
              {formData.careerInterests.length} selected
            </span>
          </div>

          {/* Currently Selected */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Roles:</p>
            {formData.careerInterests.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No career interests selected yet. Pick from the options below or add your own.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.careerInterests.map((interest, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                    {interest}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCareerInterest(interest)} 
                      className="ml-2 text-purple-500 hover:text-purple-900 focus:outline-none cursor-pointer"
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
          <div className="mb-5 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider mb-2.5">
              Click to select or unselect options:
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => {
                const isSelected = formData.careerInterests.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleCareerInterest(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                    }`}
                  >
                    {isSelected ? <FiCheck className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Add Input */}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={careerInterestInput} 
              onChange={(e) => setCareerInterestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCareerInterest())}
              placeholder="Add other role or interest (e.g. AI Researcher)..." 
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
            <button 
              type="button" 
              onClick={handleAddCareerInterest} 
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
            >
              <FiPlus /> Add Custom
            </button>
          </div>
        </section>

        {/* Skills */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Skills</h2>
              <p className="text-sm text-gray-500">Select skills you have mastered or want to highlight</p>
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
              {skills.length} selected
            </span>
          </div>

          {/* Currently Selected */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Skills:</p>
            {skills.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No skills selected yet. Click skills below or add your own.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)} 
                      className="ml-2 text-indigo-500 hover:text-indigo-900 focus:outline-none cursor-pointer"
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
                const isSelected = skills.includes(skill);
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

          {/* Custom Add Input */}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add other skills (e.g. Rust, Figma)..." 
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <button 
              type="button" 
              onClick={handleAddSkill} 
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
            >
              <FiPlus /> Add Custom
            </button>
          </div>
        </section>

        {/* Projects */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Projects</h2>
              <p className="text-sm text-gray-500">Showcase your portfolio and technical projects</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowProjectForm(!showProjectForm)} 
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center transition-colors cursor-pointer"
            >
              <FiPlus className="mr-1" /> Add Project
            </button>
          </div>
          
          {showProjectForm && (
            <div className="bg-gray-50 p-5 rounded-xl mb-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Add New Project</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input 
                    type="text" 
                    value={newProject.title} 
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})} 
                    placeholder="e.g. E-Commerce Platform"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                  <input 
                    type="url" 
                    value={newProject.projectUrl} 
                    onChange={(e) => setNewProject({...newProject, projectUrl: e.target.value})} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" 
                    placeholder="https://github.com/... or live demo" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea 
                    value={newProject.description} 
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                    rows="3" 
                    placeholder="Describe technologies used, architecture, and features..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowProjectForm(false)} 
                    className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleAddProject} 
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No projects added yet.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-xl p-4 relative group hover:border-indigo-200 transition-colors">
                  <button 
                    type="button"
                    onClick={() => handleRemoveProject(project.id)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                    title="Delete project"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  {project.projectUrl && (
                    <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
                      View Project
                    </a>
                  )}
                  <p className="text-sm text-gray-700 mt-2">{project.description}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* File Uploads */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Documents & Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Profile Picture</h3>
              <div className="flex items-center gap-4 mb-4">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Current Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                    {formData.department ? formData.department.charAt(0) : 'S'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {profilePictureUrl ? 'Current Photo Set' : 'No Photo Uploaded'}
                  </p>
                  <p className="text-xs text-gray-500">Drag or select a new photo below</p>
                </div>
              </div>
              <FileUpload 
                accept="image/jpeg, image/png, image/webp" 
                maxSize={5 * 1024 * 1024}
                onUpload={handleProfilePictureUpload}
                label="Upload or Drop New Photo"
              />
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Resume</h3>
              {resumeUrl && (
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-medium text-indigo-800 truncate">Current Resume on file</span>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    View
                  </a>
                </div>
              )}
              <FileUpload 
                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                maxSize={10 * 1024 * 1024}
                onUpload={handleResumeUpload}
                label="Upload or Drop New Resume"
              />
              <p className="text-xs text-gray-500 mt-2">PDF, DOC or DOCX. Max 10MB.</p>
            </div>
          </div>
        </section>
        
        {/* Actions Bottom Bar */}
        <div className="flex justify-end pt-4 pb-8">
          <button 
            type="button" 
            onClick={() => navigate('/student/profile')} 
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg mr-4 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSaveProfile} 
            disabled={saving} 
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors font-medium shadow-sm flex items-center cursor-pointer"
          >
            {saving ? <LoadingSpinner size="small" /> : <><FiSave className="mr-2" /> Save Changes</>}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default EditStudentProfile;
