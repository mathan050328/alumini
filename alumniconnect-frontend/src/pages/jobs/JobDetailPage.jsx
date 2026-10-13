import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiBookmark, 
  FiExternalLink, FiUser, FiCalendar, FiFileText, FiSend, FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getJobById, applyForJob, saveJob, unsaveJob, requestReferral } from '../../api/jobApi';
import { EMPLOYMENT_TYPES, ROLES } from '../../utils/constants';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, hasRole } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRequestingReferral, setIsRequestingReferral] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const response = await getJobById(id);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details or job not found.');
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      if (job.isSaved) {
        await unsaveJob(job.id);
        setJob({ ...job, isSaved: false });
        toast.success('Job removed from saved list');
      } else {
        await saveJob(job.id);
        setJob({ ...job, isSaved: true });
        toast.success('Job saved successfully');
      }
    } catch (err) {
      toast.error('Failed to update saved status');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!job.applicationUrl && !coverLetter.trim()) {
      toast.error('Cover letter is required');
      return;
    }

    setIsApplying(true);
    try {
      await applyForJob(job.id, { coverLetter });
      toast.success('Application submitted successfully!');
      setJob({ ...job, hasApplied: true });
      setShowApplyModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRequestReferral = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setIsRequestingReferral(true);
    try {
      await requestReferral(job.id, { 
        alumniId: job.alumniId, 
        message: 'I am interested in this role and would appreciate your referral.' 
      });
      toast.success('Referral request sent successfully!');
      setJob({ ...job, hasRequestedReferral: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request referral');
    } finally {
      setIsRequestingReferral(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" color="indigo" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <FiBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const isPoster = isAuthenticated && (user?.id === job.alumniUserId || user?.id === job.alumniId || user?.id === job.postedBy?.userId);
  const isCloseToDeadline = job.applicationDeadline && new Date(job.applicationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <FiArrowLeft className="mr-1 h-4 w-4" />
        Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Job Header */}
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center font-medium text-gray-900 text-lg">
                  <FiBriefcase className="mr-2 h-5 w-5 text-gray-400" />
                  {job.company}
                </span>
                <span className="flex items-center">
                  <FiMapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                  {job.location}
                </span>
                <Badge text={EMPLOYMENT_TYPES[job.employmentType] || job.employmentType} color="indigo" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {(!isAuthenticated || hasRole(ROLES.STUDENT)) && (
                <>
                  <button
                    onClick={handleSaveJob}
                    className={`inline-flex items-center p-2 rounded-full border ${
                      job.isSaved 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                    } transition-colors focus:outline-none`}
                    title={job.isSaved ? "Unsave Job" : "Save Job"}
                  >
                    <FiBookmark className={`h-5 w-5 ${job.isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {job.hasApplied ? (
                    <button className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-100 cursor-not-allowed">
                      <FiSend className="mr-2 -ml-1 h-4 w-4" />
                      Applied
                    </button>
                  ) : job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Apply Externally
                      <FiExternalLink className="ml-2 -mr-1 h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Apply Now
                    </button>
                  )}
                </>
              )}

              {isPoster && (
                <Link
                  to={`/alumni/jobs/${job.id}/applications`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiUser className="mr-2 -ml-1 h-4 w-4" />
                  View Applications
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <span className="block text-sm font-medium text-gray-500">Salary</span>
              <span className="flex items-center mt-1 text-sm text-gray-900">
                <FiDollarSign className="mr-1.5 h-4 w-4 text-gray-400" />
                {job.salaryRange || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Experience</span>
              <span className="flex items-center mt-1 text-sm text-gray-900">
                <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                {job.experienceRequired || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Posted</span>
              <span className="flex items-center mt-1 text-sm text-gray-900">
                <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                {formatTimeAgo(job.createdAt)}
              </span>
            </div>
            {job.applicationDeadline && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Deadline</span>
                <span className={`flex items-center mt-1 text-sm ${isCloseToDeadline ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  <FiCalendar className="mr-1.5 h-4 w-4" />
                  {formatDate(job.applicationDeadline)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="p-6 md:p-8 flex-1 lg:border-r border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {job.description}
            </div>

            {(() => {
              const skillsList = Array.isArray(job.skills) 
                ? job.skills 
                : (job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : []);
              if (skillsList.length === 0) return null;
              return (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="p-6 md:p-8 lg:w-80 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
            {(() => {
              const posterName = job.alumniName || job.postedBy?.fullName || job.postedBy?.name || 'Alumni Member';
              const posterAvatar = job.alumniProfilePictureUrl || job.postedBy?.profilePicture;
              const posterId = job.alumniId || job.postedBy?.id;

              return (
                <div className="flex items-center mb-6">
                  {posterAvatar ? (
                    <img 
                      src={posterAvatar} 
                      alt={posterName} 
                      className="h-12 w-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <span className="text-indigo-600 font-bold text-lg">
                        {posterName.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    {posterId ? (
                      <Link to={`/alumni/${posterId}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        {posterName}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-900">{posterName}</span>
                    )}
                    <p className="text-sm text-gray-500">{job.alumniCompany || 'Alumni'}</p>
                  </div>
                </div>
              );
            })()}

            {job.referralAvailable && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <h4 className="font-medium text-indigo-900 flex items-center mb-2">
                  <FiUser className="mr-2" />
                  Referral Available
                </h4>
                <p className="text-sm text-indigo-700 mb-4">
                  The alumni who posted this job is willing to provide referrals for qualified candidates.
                </p>
                {(!isAuthenticated || hasRole(ROLES.STUDENT)) && !job.hasRequestedReferral && !job.hasApplied && (
                  <button
                    onClick={handleRequestReferral}
                    disabled={isRequestingReferral}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isRequestingReferral ? <LoadingSpinner size="sm" color="indigo" /> : 'Request Referral'}
                  </button>
                )}
                {job.hasRequestedReferral && (
                  <div className="w-full text-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                    Referral Requested
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowApplyModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                  <FiFileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Apply for {job.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Submit your application for this position at {job.company}. Make sure your profile is up to date before applying.
                    </p>
                    <form onSubmit={handleApply}>
                      <div className="mb-4">
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                          Cover Letter / Message to Poster
                        </label>
                        <textarea
                          id="coverLetter"
                          rows={6}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Explain why you are a good fit for this role..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isApplying}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isApplying ? <LoadingSpinner size="sm" color="white" /> : 'Submit Application'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplyModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
