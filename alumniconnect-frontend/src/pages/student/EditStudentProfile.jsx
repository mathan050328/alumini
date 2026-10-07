import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';

const EditStudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getStudentProfile();
      const profile = res.data;
      
      setFormData({
        phone: profile.phone || '',
        department: profile.department || '',
        degree: profile.degree || '',
        graduationYear: profile.graduationYear || new Date().getFullYear(),
        bio: profile.bio || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        careerInterests: profile.careerInterests || []
      });
      
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);
      
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
    e.preventDefault();
    try {
      setSaving(true);
      await updateStudentProfile(formData);
      toast.success('Profile updated successfully');
      navigate('/student/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // --- Skills Management ---
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    const skillsToAdd = newSkill.split(',').map(s => s.trim()).filter(s => s);
    
    try {
      await addStudentSkills(skillsToAdd);
      setSkills(prev => [...new Set([...prev, ...skillsToAdd])]);
      setNewSkill('');
      toast.success('Skills added');
    } catch (err) {
      toast.error('Failed to add skills');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await removeStudentSkill(skillToRemove);
      setSkills(prev => prev.filter(skill => skill !== skillToRemove));
      toast.success('Skill removed');
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  // --- Career Interests Management ---
  const handleAddCareerInterest = () => {
    if (!careerInterestInput.trim()) return;
    
    const interestsToAdd = careerInterestInput.split(',').map(s => s.trim()).filter(s => s);
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
      await uploadProfilePicture(file);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Failed to upload profile picture');
      throw err;
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      await uploadResume(file);
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload resume');
      throw err;
    }
  };

  if (loading) return <LoadingSpinner text="Loading your profile..." />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/student/profile')} 
            className="mr-4 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors font-medium shadow-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" rows="4" value={formData.bio} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400" placeholder="Tell us a bit about yourself..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://github.com/..." />
            </div>
          </form>
        </section>

        {/* Career Interests */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Career Interests</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {formData.careerInterests.map((interest, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                {interest}
                <button type="button" onClick={() => handleRemoveCareerInterest(interest)} className="ml-2 text-purple-500 hover:text-purple-800 focus:outline-none">
                  <FiX />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={careerInterestInput} 
              onChange={(e) => setCareerInterestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCareerInterest())}
              placeholder="E.g. Frontend Development, Data Science (comma separated)" 
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={handleAddCareerInterest} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Add</button>
          </div>
        </section>

        {/* Skills */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Skills</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-500 hover:text-indigo-800 focus:outline-none">
                  <FiX />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add skills (comma separated)" 
              className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Add</button>
          </div>
        </section>

        {/* Projects */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">Projects</h2>
            <button type="button" onClick={() => setShowProjectForm(!showProjectForm)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
              <FiPlus className="mr-1" /> Add Project
            </button>
          </div>
          
          {showProjectForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input type="text" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                  <input type="url" value={newProject.projectUrl} onChange={(e) => setNewProject({...newProject, projectUrl: e.target.value})} className="w-full p-2 border border-gray-300 rounded" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} rows="3" className="w-full p-2 border border-gray-300 rounded"></textarea>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowProjectForm(false)} className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded">Cancel</button>
                  <button type="button" onClick={handleAddProject} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded">Save Project</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No projects added yet.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 relative group">
                  <button onClick={() => handleRemoveProject(project.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiTrash2 />
                  </button>
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">View Project</a>}
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
              <FileUpload 
                accept="image/jpeg, image/png, image/webp" 
                maxSize={5 * 1024 * 1024} // 5MB
                onUpload={handleProfilePictureUpload}
                buttonText="Upload Photo"
              />
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Resume</h3>
              <FileUpload 
                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                maxSize={10 * 1024 * 1024} // 10MB
                onUpload={handleResumeUpload}
                buttonText="Upload Resume"
              />
              <p className="text-xs text-gray-500 mt-2">PDF, DOC or DOCX. Max 10MB.</p>
            </div>
          </div>
        </section>
        
        <div className="flex justify-end pt-4 pb-8">
          <button type="button" onClick={() => navigate('/student/profile')} className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg mr-4 font-medium transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors font-medium shadow-sm flex items-center">
            {saving ? <LoadingSpinner size="small" /> : <><FiSave className="mr-2" /> Save Changes</>}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default EditStudentProfile;
